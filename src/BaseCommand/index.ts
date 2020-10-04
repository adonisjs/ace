/*
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ParsedOptions } from 'getopts'
import { Prompt, FakePrompt } from '@poppinss/prompts'
import { instantiate } from '@poppinss/cliui/build/api'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { lodash, defineStaticProperty, Exception } from '@poppinss/utils'

import { Generator } from '../Generator'
import {
	CommandArg,
	CommandFlag,
	KernelContract,
	CommandContract,
	GeneratorContract,
} from '../Contracts'

/**
 * Abstract base class other classes must extend
 */
export abstract class BaseCommand implements CommandContract {
	/**
	 * Accepting AdonisJs application instance and kernel instance
	 */
	constructor(public application: ApplicationContract, public kernel: KernelContract) {}

	/**
	 * Command arguments
	 */
	public static args: CommandArg[]

	/**
	 * Command flags
	 */
	public static flags: CommandFlag<any>[]

	/**
	 * Command name. The command will be registered using this name only. Make
	 * sure their aren't any spaces inside the command name.
	 */
	public static commandName: string

	/**
	 * The description of the command displayed on the help screen.
	 * A good command will always have some description.
	 */
	public static description: string

	/**
	 * Any settings a command wants to have. Helpful for third party
	 * tools to read the settings in lifecycle hooks and make
	 * certain decisions
	 */
	public static settings: any

	/**
	 * Whether or not the command has been booted
	 */
	public static booted: boolean

	/**
	 * Boots the command by defining required static properties
	 */
	public static boot() {
		if (this.booted) {
			return
		}

		this.booted = true

		defineStaticProperty(this, BaseCommand, {
			propertyName: 'args',
			defaultValue: [],
			strategy: 'inherit',
		})

		defineStaticProperty(this, BaseCommand, {
			propertyName: 'flags',
			defaultValue: [],
			strategy: 'inherit',
		})

		defineStaticProperty(this, BaseCommand, {
			propertyName: 'settings',
			defaultValue: {},
			strategy: 'inherit',
		})

		defineStaticProperty(this, BaseCommand, {
			propertyName: 'commandName',
			defaultValue: '',
			strategy: 'define',
		})

		defineStaticProperty(this, BaseCommand, {
			propertyName: 'description',
			defaultValue: '',
			strategy: 'define',
		})
	}

	/**
	 * Define an argument directly on the command without using the decorator
	 */
	public static $addArgument(options: Partial<CommandArg>) {
		if (!options.propertyName) {
			throw new Exception(
				'"propertyName" is required to register a command argument',
				500,
				'E_MISSING_ARGUMENT_NAME'
			)
		}

		const arg: CommandArg = Object.assign(
			{
				type: options.type || 'string',
				propertyName: options.propertyName,
				name: options.name || options.propertyName,
				required: options.required === false ? false : true,
			},
			options
		)

		this.args.push(arg)
	}

	/**
	 * Define a flag directly on the command without using the decorator
	 */
	public static $addFlag(options: Partial<CommandFlag<any>>) {
		if (!options.propertyName) {
			throw new Exception(
				'"propertyName" is required to register command flag',
				500,
				'E_MISSING_FLAG_NAME'
			)
		}

		const flag: CommandFlag<any> = Object.assign(
			{
				name: options.name || lodash.snakeCase(options.propertyName).replace(/_/g, '-'),
				propertyName: options.propertyName,
				type: options.type || 'boolean',
			},
			options
		)

		this.flags.push(flag)
	}

	/**
	 * Reference to cli ui
	 */
	public ui = instantiate(this.application.environment === 'test')

	/**
	 * Parsed options on the command. They only exist when the command
	 * is executed via kernel.
	 */
	public parsed?: ParsedOptions

	/**
	 * The prompt for the command
	 */
	public prompt: Prompt | FakePrompt =
		this.application.environment === 'test' ? new FakePrompt() : new Prompt()

	/**
	 * Returns the instance of logger to log messages
	 */
	public logger = this.ui.logger

	/**
	 * Reference to the colors
	 */
	public colors = this.logger.colors

	/**
	 * Generator instance to generate entity files
	 */
	public generator: GeneratorContract = new Generator(this)

	/**
	 * Error raised by the command
	 */
	public error?: any

	public async run?(...args: any[]): Promise<any>
	public async prepare?(...args: any[]): Promise<any>
	public async completed?(...args: any[]): Promise<any>

	/**
	 * Execute the command
	 */
	public async exec() {
		const hasRun = typeof this.run === 'function'
		const hasHandle = typeof this.handle === 'function'
		let commandResult: any

		/**
		 * Print depreciation warning
		 */
		if (hasHandle) {
			process.emitWarning(
				'DeprecationWarning',
				`${this.constructor.name}.handle() is deprecated. Define run() method instead`
			)
		}

		/**
		 * Run command and catch any raised exceptions
		 */
		try {
			/**
			 * Run prepare method when exists on the command instance
			 */
			if (typeof this.prepare === 'function') {
				await this.application.container.call(this, 'prepare' as any, [])
			}

			/**
			 * Execute the command handle or run method
			 */
			commandResult = await this.application.container.call(
				this,
				hasRun ? 'run' : ('handle' as any),
				[]
			)
		} catch (error) {
			this.error = error
		}

		let errorHandled = false

		/**
		 * Run completed method when exists
		 */
		if (typeof this.completed === 'function') {
			errorHandled = await this.application.container.call(this, 'completed' as any, [])
		}

		/**
		 * Throw error when error exists and the completed method didn't
		 * handled it
		 */
		if (this.error && !errorHandled) {
			throw this.error
		}

		return commandResult
	}

	/**
	 * Must be defined by the parent class
	 */
	// @depreciated
	public async handle?(...args: any[]): Promise<any>
}
