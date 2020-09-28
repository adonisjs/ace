/*
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as ui from '@poppinss/cliui'
import { ParsedOptions } from 'getopts'
import { PromptContract } from '@poppinss/prompts'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'

/**
 * The types of flags can be defined on a command.
 */
export type FlagTypes = 'string' | 'number' | 'boolean' | 'array' | 'numArray'

/**
 * The types of arguments can be defined on a command.
 */
export type ArgTypes = 'string' | 'spread'

/**
 * The shape of command argument
 */
export type CommandArg = {
	propertyName: string
	name: string
	type: ArgTypes
	required: boolean
	description?: string
}

/**
 * The shape of a command flag
 */
export type CommandFlag = {
	propertyName: string
	name: string
	type: FlagTypes
	description?: string
	alias?: string
	default?: any
}

/**
 * The handler that handles the global
 * flags
 */
export type GlobalFlagHandler = (
	value: any,
	parsed: ParsedOptions,
	command?: CommandConstructorContract
) => void

/**
 * Shape of grouped commands. Required when displaying
 * help
 */
export type CommandsGroup = {
	group: string
	commands: SerializedCommand[]
}[]

/**
 * The shared properties that exists on the command implementation
 * as well as it's serialized version
 */
export type SerializedCommand = {
	args: CommandArg[]
	settings: any
	flags: CommandFlag[]
	commandName: string
	description: string
}

/**
 * Command constructor shape with it's static properties
 */
export interface CommandConstructorContract extends SerializedCommand {
	new (application: ApplicationContract, kernel: KernelContract, ...args: any[]): CommandContract
	/**
	 * A boolean to know if the command has been booted or not. We initialize some
	 * static properties to the class during the boot process.
	 */
	booted: boolean

	/**
	 * Boot the command. You won't have to run this method by yourself. Ace will internally
	 * boot the commands by itself.
	 */
	boot(): void

	/**
	 * Add an argument directly on the command without using the decorator
	 */
	$addArgument(options: Partial<CommandArg>): void

	/**
	 * Add a flag directly on the command without using the decorator
	 */
	$addFlag(options: Partial<CommandFlag>): void
}

/**
 * The shape of command class
 */
export interface CommandContract {
	parsed?: ParsedOptions
	error?: any
	logger: typeof ui.logger
	prompt: PromptContract
	colors: typeof ui.logger.colors
	ui: typeof ui
	generator: GeneratorContract
	kernel: KernelContract
	exec(): Promise<any>
	handle?(...args: any[]): Promise<any>
	run?(...args: any[]): Promise<any>
	prepare?(...args: any[]): Promise<any>
	completed?(...args: any[]): Promise<any>
}

/**
 * Shape of the serialized command inside the manifest JSON file.
 */
export type ManifestCommand = SerializedCommand & { commandPath: string }

/**
 * Shape of the manifest JSON file
 */
export type ManifestNode = {
	[command: string]: ManifestCommand
}

/**
 * Manifest loader interface
 */
export interface ManifestLoaderContract {
	booted: boolean
	boot(): Promise<void>
	getCommandBasePath(commandName: string): string | undefined

	/**
	 * Returns manifest command node. One must load the command
	 * in order to use it
	 */
	getCommand(commandName: string): { basePath: string; command: ManifestCommand } | undefined

	/**
	 * Find if a command exists or not
	 */
	hasCommand(commandName: string): boolean

	/**
	 * Load command from the disk. Make sure to use [[hasCommand]] before
	 * calling this method
	 */
	loadCommand(commandName: string): CommandConstructorContract

	/**
	 * Returns an array of manifest commands
	 */
	getCommands(): ManifestCommand[]
}

/**
 * Callbacks for different style of hooks
 */
export type FindHookCallback = (command: SerializedCommand | null) => Promise<void> | void
export type RunHookCallback = (command: CommandContract) => Promise<void> | void

/**
 * Shape of ace kernel
 */
export interface KernelContract {
	manifestCommands?: {
		[basePath: string]: ManifestNode
	}
	defaultCommand: CommandConstructorContract
	commands: { [name: string]: CommandConstructorContract }
	flags: { [name: string]: CommandFlag & { handler: GlobalFlagHandler } }

	before(action: 'run', callback: RunHookCallback): this
	before(action: 'find', callback: FindHookCallback): this
	before(action: 'run' | 'find', callback: RunHookCallback | FindHookCallback): this

	after(action: 'run', callback: RunHookCallback): this
	after(action: 'find', callback: FindHookCallback): this
	after(action: 'run' | 'find', callback: RunHookCallback | FindHookCallback): this

	register(commands: CommandConstructorContract[]): this
	getSuggestions(name: string, distance?: number): SerializedCommand[]

	flag(
		name: string,
		handler: GlobalFlagHandler,
		options: Partial<Exclude<CommandFlag, 'name' | 'propertyName'>>
	): this

	find(argv: string[]): Promise<CommandConstructorContract | null>
	runCommand(commandInstance: CommandContract, argv: string[]): Promise<any>
	runDefaultCommand(): Promise<any>
	handle(argv: string[]): Promise<any>
	exec(commandName: string, args: string[]): Promise<any>

	preloadManifest(): void
	useManifest(manifestLoacder: ManifestLoaderContract): this
	printHelp(command?: CommandConstructorContract): void
}

/**
 * Template generator options
 */
export type GeneratorFileOptions = {
	pattern?: 'pascalcase' | 'camelcase' | 'snakecase'
	form?: 'singular' | 'plural'
	formIgnoreList?: string[]
	suffix?: string
	prefix?: string
	extname?: string
}

/**
 * Shape of the individual generator file
 */
export interface GeneratorFileContract {
	/**
	 * Define path to the stub template. You can also define inline text instead
	 * of relying on a template file, but do make sure to set `raw=true` inside
	 * the options when using inline text.
	 */
	stub(fileOrContents: string, options?: { raw: boolean }): this

	/**
	 * Instruct to use mustache templating syntax, instead of template literals
	 */
	useMustache(): this

	/**
	 * The relative path to the destination directory.
	 */
	destinationDir(directory: string): this

	/**
	 * Define a custom application root. Otherwise `process.cwd()` is used.
	 */
	appRoot(directory: string): this

	/**
	 * Apply data to the stub
	 */
	apply(contents: any): this

	/**
	 * Get file properties as a JSON object
	 */
	toJSON(): {
		filename: string
		filepath: string
		extension: string
		contents: string
		relativepath: string
	}
}

/**
 * Shape of the files generator
 */
export interface GeneratorContract {
	/**
	 * Add a new file to the files generator. You can add multiple files
	 * together and they will be created when `run` is invoked.
	 */
	addFile(name: string, options?: GeneratorFileOptions): GeneratorFileContract

	/**
	 * Run the generator and create all files registered using `addFiles`
	 */
	run(): Promise<void>

	/**
	 * Clear the registered files from the generator
	 */
	clear(): void
}

/**
 * Filter function for filtering files during the `readdir` scan
 */
export type CommandsListFilterFn = ((name: string) => boolean) | string[]
