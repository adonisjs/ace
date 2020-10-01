/*
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import getopts from 'getopts'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'

import { Hooks } from '../Hooks'
import { Parser } from '../Parser'
import { HelpCommand } from '../HelpCommand'
import { ManifestLoader } from '../Manifest/Loader'
import { InvalidCommandException } from '../Exceptions'
import { printHelp, printHelpFor } from '../utils/help'
import { validateCommand } from '../utils/validateCommand'

import {
	CommandFlag,
	KernelContract,
	CommandContract,
	ManifestCommand,
	RunHookCallback,
	FindHookCallback,
	GlobalFlagHandler,
	SerializedCommand,
	CommandConstructorContract,
} from '../Contracts'

/**
 * Ace kernel class is used to register, find and invoke commands by
 * parsing `process.argv.splice(2)` value.
 */
export class Kernel implements KernelContract {
	/**
	 * List of registered commands
	 */
	public commands: { [name: string]: CommandConstructorContract } = {}

	/**
	 * List of registered flags
	 */
	public flags: { [name: string]: CommandFlag<any> & { handler: GlobalFlagHandler } } = {}

	/**
	 * Reference to hooks class to execute lifecycle
	 * hooks
	 */
	private hooks = new Hooks()

	/**
	 * Reference to the manifest loader. If defined, we will give preference
	 * to the manifest files.
	 */
	private manifestLoader: ManifestLoader

	/**
	 * The default command that will be invoked when no command is
	 * defined
	 */
	public defaultCommand: CommandConstructorContract = HelpCommand

	constructor(public application: ApplicationContract) {}

	/**
	 * Executing global flag handlers. The global flag handlers are
	 * not async as of now, but later we can look into making them
	 * async.
	 */
	private executeGlobalFlagsHandlers(
		options: getopts.ParsedOptions,
		command?: CommandConstructorContract
	) {
		const globalFlags = Object.keys(this.flags)

		globalFlags.forEach((name) => {
			const value = options[name]

			/**
			 * Flag was not specified
			 */
			if (value === undefined) {
				return
			}

			/**
			 * Flag was not specified, but `getops` will return empty array or
			 * empty string, when we coerce flag to be a string or array
			 */
			if ((typeof value === 'string' || Array.isArray(value)) && !value.length) {
				return
			}

			/**
			 * Calling the handler
			 */
			this.flags[name].handler(options[name], options, command)
		})
	}

	/**
	 * Returns an array of all registered commands
	 */
	private getAllCommands() {
		let commands: (ManifestCommand | CommandConstructorContract)[] = Object.keys(this.commands).map(
			(name) => this.commands[name]
		)

		/**
		 * Concat manifest commands when they exists
		 */
		if (this.manifestLoader && this.manifestLoader.booted) {
			commands = commands.concat(this.manifestLoader.getCommands())
		}

		return commands
	}

	/**
	 * Register a before hook
	 */
	public before(action: 'run', callback: RunHookCallback): this
	public before(action: 'find', callback: FindHookCallback): this
	public before(action: 'run' | 'find', callback: RunHookCallback | FindHookCallback): this {
		this.hooks.add('before', action, callback)
		return this
	}

	/**
	 * Register an after hook
	 */
	public after(action: 'run', callback: RunHookCallback): this
	public after(action: 'find', callback: FindHookCallback): this
	public after(action: 'run' | 'find', callback: RunHookCallback | FindHookCallback): this {
		this.hooks.add('after', action, callback)
		return this
	}

	/**
	 * Register an array of command constructors
	 */
	public register(commands: CommandConstructorContract[]): this {
		commands.forEach((command) => {
			command.boot()
			validateCommand(command)
			this.commands[command.commandName] = command
		})

		return this
	}

	/**
	 * Returns an array of command names suggestions for a given name.
	 */
	public getSuggestions(name: string, distance = 3): SerializedCommand[] {
		const leven = require('leven')
		return this.getAllCommands().filter(({ commandName }) => {
			return leven(name, commandName) <= distance
		})
	}

	/**
	 * Register a global flag. It can be defined in combination with
	 * any command.
	 */
	public flag(
		name: string,
		handler: GlobalFlagHandler,
		options: Partial<Exclude<CommandFlag<any>, 'name' | 'propertyName'>>
	): this {
		this.flags[name] = Object.assign(
			{
				name,
				propertyName: name,
				handler,
				type: 'boolean',
			},
			options
		)

		return this
	}

	/**
	 * Finds the command from the command line argv array. If command for
	 * the given name doesn't exists, then it will return `null`.
	 */
	public async find(argv: string[]): Promise<CommandConstructorContract | null> {
		/**
		 * ----------------------------------------------------------------------------
		 * Even though in `Unix` the command name may appear in between or at last, with
		 * ace we always want the command name to be the first argument. However, the
		 * arguments to the command itself can appear in any sequence. For example:
		 *
		 * Works
		 *    - node ace make:controller foo
		 *    - node ace make:controller --http foo
		 *
		 * Doesn't work
		 *    - node ace foo make:controller
		 * ----------------------------------------------------------------------------
		 */
		const [commandName] = argv

		/**
		 * Manifest commands gets preference over manually registered commands.
		 */
		if (this.manifestLoader && this.manifestLoader.hasCommand(commandName)) {
			const commandNode = this.manifestLoader.getCommand(commandName)!
			await this.hooks.excute('before', 'find', commandNode.command)
			const command = this.manifestLoader.loadCommand(commandName)
			await this.hooks.excute('after', 'find', command)
			return command
		}

		/**
		 * Try to find command inside manually registered command or fallback
		 * to null
		 */
		const command = this.commands[commandName] || null

		/**
		 * Executing before and after together to be compatible
		 * with the manifest find before and after hooks
		 */
		await this.hooks.excute('before', 'find', command)
		await this.hooks.excute('after', 'find', command)

		return command
	}

	/**
	 * Run a given command by parsing the command line arguments
	 */
	public async runCommand(commandInstance: CommandContract, argv: string[]) {
		/**
		 * The first value in the `argv` array is the command name. Now since
		 * we know the command already, we remove the first value.
		 */
		argv = argv.splice(1)

		const parser = new Parser(this.flags)
		const command = commandInstance.constructor as CommandConstructorContract

		/**
		 * Parse argv and execute the `handle` method.
		 */
		const parsedOptions = parser.parse(argv, command)
		this.executeGlobalFlagsHandlers(parsedOptions, command)

		await this.hooks.excute('before', 'run', commandInstance)

		/**
		 * We validate the command arguments after the global flags have been
		 * executed. It is required, since flags may have nothing to do
		 * with the validaty of command itself
		 */
		command.args.forEach((arg, index) => {
			parser.validateArg(arg, index, parsedOptions, command)
		})

		/**
		 * Creating a new command instance and setting
		 * parsed options on it.
		 */
		commandInstance.parsed = parsedOptions

		/**
		 * Setup command instance argument and flag
		 * properties.
		 */
		for (let i = 0; i < command.args.length; i++) {
			const arg = command.args[i]
			if (arg.type === 'spread') {
				commandInstance[arg.propertyName] = parsedOptions._.slice(i)
				break
			} else {
				commandInstance[arg.propertyName] = parsedOptions._[i]
			}
		}

		/**
		 * Set flag value on the command instance
		 */
		for (let flag of command.flags) {
			const flagValue = parsedOptions[flag.name]

			if (flag.type === 'boolean') {
				commandInstance[flag.propertyName] = flagValue
			} else if (!flagValue && typeof flag.defaultValue === 'function') {
				commandInstance[flag.propertyName] = await flag.defaultValue(commandInstance)
			} else if (flagValue || commandInstance[flag.propertyName] === undefined) {
				commandInstance[flag.propertyName] = flagValue
			}
		}

		/**
		 * Command response/error
		 */
		let commandResponse: any
		let commandError: any

		/**
		 * Wrap command inside try/catch so that we always run
		 * the after run hook
		 */
		try {
			commandResponse = await commandInstance.exec()
		} catch (error) {
			commandError = error
		}

		await this.hooks.excute('after', 'run', commandInstance)

		/**
		 * Re-throw exception after running the after run hook
		 */
		if (commandError) {
			throw commandError
		}

		return commandResponse
	}

	/**
	 * Running default command
	 */
	public async runDefaultCommand() {
		this.defaultCommand.boot()
		validateCommand(this.defaultCommand)

		const commandInstance = this.application.container.make(this.defaultCommand as any, [
			this.application as any,
			this as any,
		])

		return this.runCommand(commandInstance, [])
	}

	/**
	 * Preload the manifest file. Re-running this method twice will
	 * result in a noop
	 */
	public async preloadManifest() {
		/**
		 * Load manifest commands when instance of manifest exists. From here the
		 * kernel will give preference to the `manifest` file vs manually
		 * registered commands.
		 */
		if (this.manifestLoader) {
			await this.manifestLoader.boot()
		}
	}

	/**
	 * Makes instance of a given command by processing command line arguments
	 * and setting them on the command instance
	 */
	public async handle(argv: string[]) {
		await this.preloadManifest()

		/**
		 * Execute the default command when no command is mentioned
		 */
		if (!argv.length) {
			return this.runDefaultCommand()
		}

		const hasMentionedCommand = !argv[0].startsWith('-')

		/**
		 * Parse flags when no command is defined
		 */
		if (!hasMentionedCommand) {
			const parsedOptions = new Parser(this.flags).parse(argv)
			this.executeGlobalFlagsHandlers(parsedOptions)
			return
		}

		/**
		 * Execute command
		 */
		return this.exec(argv[0], argv.slice(1, argv.length))
	}

	/**
	 * Execute a given command. The `args` must be an array of arguments including
	 * flags to be parsed and passed to the command. For exmaple:
	 *
	 * ```js
	 * kernel.exec('make:controller', ['User', '--resource=true'])
	 * ```
	 */
	public async exec(commandName: string, args: string[]) {
		let command = await this.find([commandName])
		if (!command) {
			throw InvalidCommandException.invoke(commandName, this.getSuggestions(commandName))
		}

		const commandInstance = this.application.container.make(command, [this.application, this])
		return this.runCommand(commandInstance, [commandName].concat(args))
	}

	/**
	 * Use manifest instance to lazy load commands
	 */
	public useManifest(manifestLoader: ManifestLoader): this {
		this.manifestLoader = manifestLoader
		return this
	}

	/**
	 * Print the help screen for a given command or all commands/flags
	 */
	public printHelp(command?: CommandConstructorContract) {
		if (command) {
			printHelpFor(command)
		} else {
			const flags = Object.keys(this.flags).map((name) => this.flags[name])
			printHelp(this.getAllCommands(), flags)
		}
	}
}
