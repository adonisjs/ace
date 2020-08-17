/*
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { lodash } from '@poppinss/utils'
import { ParsedOptions } from 'getopts'
import { Logger } from '@poppinss/fancy-logs'
import { Colors, FakeColors } from '@poppinss/colors'
import { Prompt, FakePrompt } from '@poppinss/prompts'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'

import { Generator } from '../Generator'
import { CommandArg, CommandFlag, KernelContract, CommandContract } from '../Contracts'

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
	public static flags: CommandFlag[]

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
	 * Defines if the command should never end by itself.
	 */
	public static stayAlive: boolean

	/**
	 * Boots the command by defining required static properties
	 */
	public static boot() {
		if (this.booted) {
			return
		}

		this.booted = true
		Object.defineProperty(this, 'args', { value: [] })
		Object.defineProperty(this, 'flags', { value: [] })

		if (!this.hasOwnProperty('settings')) {
			Object.defineProperty(this, 'settings', { value: {} })
		}

		if (!this.hasOwnProperty('commandName')) {
			Object.defineProperty(this, 'commandName', { value: '' })
		}

		if (!this.hasOwnProperty('description')) {
			Object.defineProperty(this, 'description', { value: '' })
		}

		if (!this.hasOwnProperty('stayAlive')) {
			Object.defineProperty(this, 'stayAlive', { value: false })
		}
	}

	/**
	 * Define an argument directly on the command without using the decorator
	 */
	public static $addArgument(options: Partial<CommandArg>) {
		if (!options.propertyName) {
			throw new Error('"propertyName" is required to register command argument')
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
	public static $addFlag(options: Partial<CommandFlag>) {
		if (!options.propertyName) {
			throw new Error('"propertyName" is required to register command flag')
		}

		const flag: CommandFlag = Object.assign(
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
	public logger = new Logger({ fake: this.application.environment === 'test' })

	/**
	 * Generator instance to generate entity files
	 */
	public generator = new Generator(this.logger)

	/**
	 * Returns a new instance of colors class. If application is in test mode
	 * hen it will return an instance of [[Stringify]] which has consistent
	 * output tailored for testing, otherwise an instance of [[Kleur]] is
	 * returned.
	 */
	public get colors(): Colors {
		return (this.application.environment === 'test' ? new FakeColors() : new Colors()) as Colors
	}

	/**
	 * Must be defined by the parent class
	 */
	public abstract async handle(...args: any[]): Promise<void>
}
