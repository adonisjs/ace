/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Hooks from '@poppinss/hooks'
import { cliui } from '@poppinss/cliui'
import { Prompt } from '@poppinss/prompts'
import { distance } from 'fastest-levenshtein'
import { RuntimeException } from '@poppinss/utils/exception'

import debug from './debug.ts'
import { Parser } from './parser.ts'
import * as errors from './errors.ts'
import { ListCommand } from './commands/list.ts'
import { BaseCommand } from './commands/base.ts'
import { sortAlphabetically } from './utils.ts'
import { ListLoader } from './loaders/list_loader.ts'
import { ExceptionHandler } from './exception_handler.ts'

import type {
  Flag,
  UIPrimitives,
  FlagListener,
  LoadedHookArgs,
  CommandMetaData,
  LoadersContract,
  LoadingHookArgs,
  FindingHookArgs,
  ExecutedHookArgs,
  ExecutorContract,
  LoadedHookHandler,
  AllowedInfoValues,
  ExecutingHookArgs,
  LoadingHookHandler,
  FindingHookHandler,
  AbstractBaseCommand,
  ExecutedHookHandler,
  ExecutingHookHandler,
} from './types.ts'
import { commandExec } from './tracing_channels.ts'

/**
 * The Ace kernel manages the registration and execution of commands.
 *
 * The kernel is the main entry point of a console application, and
 * is tailored for a standard CLI environment.
 *
 * @example
 * ```ts
 * const kernel = Kernel.create()
 *
 * kernel.defineFlag('help', {
 *  type: 'boolean',
 *  alias: 'h',
 *  description: 'Display help for the given command. When no command is given display help for the list command'
 * })
 * kernel.on('help', async (command, $kernel, options) => {
 *   options.args.unshift(command.commandName)
 *   await new HelpCommand($kernel, options, kernel.ui, kernel.prompt).exec()
 *   return true
 * })
 *
 * kernel.addLoader(new FsLoader('./commands'))
 *
 * kernel.info.set('binary', 'node ace')
 * kernel.info.set('Framework version', '9.1')
 * kernel.info.set('App version', '1.1.1')
 *
 * await kernel.handle(process.argv.slice(2))
 * ```
 */
export class Kernel<Command extends AbstractBaseCommand> {
  /**
   * The error handler for rendering exceptions
   */
  errorHandler: {
    render(error: unknown, kernel: Kernel<any>): Promise<any>
  } = new ExceptionHandler()

  /**
   * The default executor for creating command instances and running them
   */
  static commandExecutor: ExecutorContract<typeof BaseCommand> = {
    create(command, parsedArgs, kernel) {
      return new command(kernel, parsedArgs, kernel.ui, kernel.prompt)
    },
    run(command) {
      return command.exec()
    },
  }

  /**
   * The default command to use when creating kernel instance via static create method
   */
  static defaultCommand: typeof BaseCommand = ListCommand

  /**
   * Creates an instance of kernel with the default executor and default command
   *
   * @example
   * ```ts
   * const kernel = Kernel.create()
   * ```
   */
  static create() {
    return new Kernel<typeof BaseCommand>(this.defaultCommand, this.commandExecutor)
  }

  /**
   * Listeners for CLI options. Executed for the main command
   * only
   */
  #optionListeners: Map<string, FlagListener<Command>> = new Map()

  /**
   * The global command is used to register global flags applicable
   * on all the commands
   */
  #globalCommand: typeof BaseCommand = class extends BaseCommand {
    static options = {
      allowUnknownFlags: true,
    }
  }

  /**
   * The default command to run when no command is mentioned. The default
   * command will also run when only flags are mentioned.
   */
  #defaultCommand: Command

  /**
   * Available hooks
   */
  #hooks: Hooks<{
    finding: FindingHookArgs
    loading: LoadingHookArgs
    loaded: LoadedHookArgs<Command>
    executing: ExecutingHookArgs<InstanceType<Command>>
    executed: ExecutedHookArgs<InstanceType<Command>>
  }> = new Hooks()

  /**
   * Executors are used to instantiate a command and execute
   * the run method.
   */
  #executor: ExecutorContract<Command>

  /**
   * Keeping track of the main command. There are some action (like termination)
   * that only the main command can perform
   */
  #mainCommand?: InstanceType<Command>

  /**
   * The current state of kernel. The `running` and `terminated`
   * states are only set when kernel takes over the process.
   */
  #state: 'idle' | 'booted' | 'running' | 'completed' = 'idle'

  /**
   * Collection of loaders to use for loading commands
   */
  #loaders: (LoadersContract<Command> | (() => Promise<LoadersContract<Command>>))[] = []

  /**
   * An array of registered namespaces. Sorted alphabetically
   */
  #namespaces: string[] = []

  /**
   * A collection of aliases for the commands. The key is the alias name
   * and the value contains the command name and expansion arguments.
   *
   * In case of duplicate aliases, the most recent alias will override
   * the previous existing alias.
   */
  #aliases: Map<string, { commandName: string; argv: string[] }> = new Map()

  /**
   * A collection of commands by the command name. This allows us to keep only
   * the unique commands and also keep the loader reference to know which
   * loader to ask for loading the command.
   */
  #commands: Map<string, { metaData: CommandMetaData; loader: LoadersContract<Command> }> =
    new Map()

  /**
   * The exit code for the kernel. The exit code is inferred
   * from the main command when not set explicitly
   */
  exitCode?: number

  /**
   * The UI primitives to use within commands
   */
  ui: UIPrimitives = cliui()

  /**
   * Instance of prompt to display CLI prompts. We share
   * a single instance with all the commands. This
   * allows trapping prompts for commands executed internally
   */
  prompt = new Prompt()

  /**
   * CLI info map containing metadata about the application
   */
  info: Map<string, AllowedInfoValues> = new Map()

  /**
   * List of global flags available across all commands
   *
   * @example
   * ```ts
   * kernel.flags // [{ name: 'help', type: 'boolean', ... }]
   * ```
   */
  get flags(): ({ name: string } & Flag)[] {
    return this.#globalCommand.flags
  }

  /**
   * Create a new Kernel instance
   *
   * @param defaultCommand - The default command to run when no command is specified
   * @param executor - The executor for creating and running command instances
   */
  constructor(defaultCommand: Command, executor: ExecutorContract<Command>) {
    this.#defaultCommand = defaultCommand
    this.#executor = executor
  }

  /**
   * Process command line arguments. All flags before the command
   * name are considered as Node.js argv and all flags after
   * the command name are considered as command argv.
   *
   * The behavior is same as Node.js CLI, where all flags before the
   * script file name are Node.js argv.
   */
  #processArgv(argv: string[]) {
    const commandNameIndex = argv.findIndex((value) => !value.startsWith('-'))
    if (commandNameIndex === -1) {
      return {
        nodeArgv: [],
        commandName: null,
        commandArgv: argv,
      }
    }

    return {
      nodeArgv: argv.slice(0, commandNameIndex),
      commandName: argv[commandNameIndex],
      commandArgv: argv.slice(commandNameIndex + 1),
    }
  }

  /**
   * Creates an instance of a command by parsing and validating
   * the command line arguments.
   */
  async #create<T extends Command>(Command: T, argv: string | string[]): Promise<InstanceType<T>> {
    /**
     * Parse CLI argv without global flags. When running commands directly, we
     * should not be using global flags anyways
     */
    const parsed = new Parser(Command.getParserOptions()).parse(argv)

    /**
     * Validate the parsed output
     */
    Command.validate(parsed)

    /**
     * Construct command instance using the executor
     */
    const commandInstance = await this.#executor.create(Command, parsed, this)
    commandInstance.hydrate()

    return commandInstance as InstanceType<T>
  }

  /**
   * Executes a given command. The main commands are executed using the
   * "execMain" method.
   */
  async #exec<T extends Command>(
    commandName: string,
    argv: string[],
    options?: { ui?: UIPrimitives }
  ): Promise<InstanceType<T>> {
    const Command = await this.find<T>(commandName)

    /**
     * Expand aliases
     */
    const alias = this.#aliases.get(commandName)
    if (alias?.argv.length) {
      argv = alias.argv.concat(argv)
      debug('expanding alias %O, cli args %O', commandName, argv)
    }

    const commandInstance = await this.#create<T>(Command, argv)

    /**
     * Override the UI primitives when a custom instance is provided.
     * This allows callers to silence command output by passing a
     * UI backed by a memory renderer.
     */
    if (options?.ui && 'ui' in commandInstance) {
      commandInstance.ui = options.ui
    }

    /**
     * Execute the command using the executor
     */
    await this.#hooks.runner('executing').run(commandInstance, false)
    await commandExec.tracePromise(
      this.#executor.run,
      commandExec.hasSubscribers
        ? {
            command: Command,
            commandInstance,
            argv,
          }
        : undefined,
      this.#executor,
      commandInstance,
      this
    )
    await this.#hooks.runner('executed').run(commandInstance, false)
    return commandInstance
  }

  /**
   * Executes the main command and handles the exceptions by
   * reporting them
   */
  async #execMain(commandName: string, nodeArgv: string[], argv: string[]) {
    try {
      const Command = await this.find(commandName)

      /**
       * Expand aliases
       */
      const alias = this.#aliases.get(commandName)
      if (alias?.argv.length) {
        argv = alias.argv.concat(argv)
        debug('expanding alias %O, cli args %O', commandName, argv)
      }

      /**
       * Parse CLI argv and also merge global flags parser options.
       */
      const parsed = new Parser(
        Command.getParserOptions(this.#globalCommand.getParserOptions().flagsParserOptions)
      ).parse(argv)

      /**
       * Defined only for the main command
       */
      parsed.nodeArgs = nodeArgv

      /**
       * Validate the flags against the global list as well
       */
      this.#globalCommand.validate(parsed)

      /**
       * Run options listeners. Option listeners can terminate
       * the process early
       */
      let shortcircuit = false
      for (let [option, listener] of this.#optionListeners) {
        if (parsed.flags[option] !== undefined) {
          debug('running listener for "%s" flag', option)
          shortcircuit = await listener(Command, this, parsed)
          if (shortcircuit) {
            break
          }
        }
      }

      /**
       * Validate the parsed output
       */
      Command.validate(parsed)

      /**
       * Return early if a flag listener shortcircuits
       */
      if (shortcircuit) {
        debug('short circuiting from flag listener')
        this.exitCode = this.exitCode ?? 0
        this.#state = 'completed'
        return
      }

      /**
       * Keep a note of the main command
       */
      this.#mainCommand = await this.#executor.create(Command, parsed, this)
      this.#mainCommand.hydrate()

      /**
       * Execute the command using the executor
       */
      await this.#hooks.runner('executing').run(this.#mainCommand!, true)
      await commandExec.tracePromise(
        this.#executor.run,
        commandExec.hasSubscribers
          ? {
              command: Command,
              commandInstance: this.#mainCommand!,
              argv,
            }
          : undefined,
        this.#executor,
        this.#mainCommand!,
        this
      )
      await this.#hooks.runner('executed').run(this.#mainCommand!, true)
      this.exitCode = this.exitCode ?? this.#mainCommand!.exitCode
      this.#state = 'completed'
    } catch (error) {
      this.exitCode = 1
      this.#state = 'completed'
      await this.errorHandler.render(error, this)
    }
  }

  /**
   * Listen for CLI options and execute an action. Only one listener
   * can be defined per option.
   *
   * The callbacks are only executed for the main command
   */
  on(option: string, callback: FlagListener<Command>): this {
    debug('registering flag listener for "%s" flag', option)
    this.#optionListeners.set(option, callback)
    return this
  }

  /**
   * Define a global flag that is applicable for all commands
   *
   * @param name - The flag name
   * @param options - Flag configuration options
   *
   * @example
   * ```ts
   * kernel.defineFlag('verbose', { type: 'boolean', description: 'Enable verbose output' })
   * ```
   */
  defineFlag(
    name: string,
    options: Partial<Flag> & { type: 'string' | 'boolean' | 'array' | 'number' }
  ) {
    if (this.#state !== 'idle') {
      throw new RuntimeException(`Cannot register global flag in "${this.#state}" state`)
    }

    this.#globalCommand.defineFlag(name, options)
  }

  /**
   * Register a commands loader. The commands will be collected by all loaders.
   *
   * In case multiple loaders return a single command, the command from the
   * most recent loader will be used.
   *
   * @param loader - The loader instance or a function that returns a loader
   *
   * @example
   * ```ts
   * kernel.addLoader(new FsLoader('./commands'))
   * kernel.addLoader(() => import('./lazy-loader').then(m => new m.LazyLoader()))
   * ```
   */
  addLoader(loader: LoadersContract<Command> | (() => Promise<LoadersContract<Command>>)): this {
    if (this.#state !== 'idle') {
      throw new RuntimeException(`Cannot add loader in "${this.#state}" state`)
    }

    this.#loaders.push(loader)
    return this
  }

  /**
   * Register alias for a command name
   *
   * @param alias - The alias name
   * @param command - The command name (can include arguments)
   *
   * @example
   * ```ts
   * kernel.addAlias('m', 'make:model')
   * kernel.addAlias('migrate:fresh', 'migration:rollback --to=0 && migration:run')
   * ```
   */
  addAlias(alias: string, command: string): this {
    const [commandName, ...expansions] = command.split(' ')
    this.#aliases.set(alias, { commandName, argv: expansions })

    if (expansions.length) {
      debug('registering alias %O for command %O with options %O', alias, commandName, expansions)
    } else {
      debug('registering alias %O for command %O', alias, commandName)
    }

    return this
  }

  /**
   * Check if a command or an alias is registered with kernel
   */
  hasCommand(commandName: string): boolean {
    commandName = this.#aliases.get(commandName)?.commandName || commandName
    return this.#commands.has(commandName)
  }

  /**
   * Get the current state of the kernel.
   */
  getState() {
    return this.#state
  }

  /**
   * Returns a flat list of commands metadata registered with the kernel.
   * The list is sorted alphabetically by the command name.
   */
  getCommands(): CommandMetaData[] {
    return [...this.#commands.keys()]
      .sort(sortAlphabetically)
      .map((name) => this.#commands.get(name)!.metaData)
  }

  /**
   * Get a list of commands for a specific namespace. All non-namespaces
   * commands will be returned if no namespace is defined.
   */
  getNamespaceCommands(namespace?: string) {
    let commandNames = [...this.#commands.keys()]

    /**
     * Filter a list of commands by the namespace
     */
    if (namespace) {
      commandNames = commandNames.filter(
        (name) => this.#commands.get(name)!.metaData.namespace === namespace
      )
    } else {
      commandNames = commandNames.filter((name) => !this.#commands.get(name)!.metaData.namespace)
    }

    return commandNames.sort(sortAlphabetically).map((name) => this.#commands.get(name)!.metaData)
  }

  /**
   * Returns the command metadata by its name. Returns null when the
   * command is missing.
   */
  getCommand(commandName: string): CommandMetaData | null {
    return this.#commands.get(commandName)?.metaData || null
  }

  /**
   * Returns a reference for the default command. The return value
   * is the default command constructor
   */
  getDefaultCommand() {
    return this.#defaultCommand
  }

  /**
   * Returns reference to the main command
   */
  getMainCommand() {
    return this.#mainCommand
  }

  /**
   * Returns an array of aliases registered.
   *
   * - Call `getCommandAliases` method to get aliases for a given command
   * - Call `getAliasCommand` to get the command or a given alias
   */
  getAliases() {
    return [...this.#aliases.keys()]
  }

  /**
   * Returns the command metata for a given alias. Returns null
   * if alias is not recognized.
   */
  getAliasCommand(alias: string): CommandMetaData | null {
    const aliasCommand = this.#aliases.get(alias)
    if (!aliasCommand) {
      return null
    }

    return this.#commands.get(aliasCommand.commandName)?.metaData || null
  }

  /**
   * Returns an array of aliases for a given command
   */
  getCommandAliases(commandName: string) {
    return [...this.#aliases.entries()]
      .filter(([, alias]) => {
        return alias.commandName === commandName
      })
      .map(([alias]) => alias)
  }

  /**
   * Returns a list of namespaces. The list is sorted alphabetically
   * by the namespace name
   */
  getNamespaces(): string[] {
    return this.#namespaces
  }

  /**
   * Returns an array of command and aliases name suggestions for
   * a given keyword.
   */
  getCommandSuggestions(keyword: string): string[] {
    /**
     * Priortize namespace commands when the keyword matches the
     * namespace
     */
    if (this.#namespaces.includes(keyword)) {
      return this.getNamespaceCommands(keyword).map((command) => command.commandName)
    }

    const commandsAndAliases = [...this.#commands.keys()].concat([...this.#aliases.keys()])

    return commandsAndAliases
      .map((value) => {
        return {
          value,
          distance: distance(keyword, value),
        }
      })
      .sort((current, next) => next.distance - current.distance)
      .filter((rating) => {
        return rating.distance <= 3
      })
      .map((rating) => rating.value)
  }

  /**
   * Returns an array of namespaces suggestions for a given keyword.
   */
  getNamespaceSuggestions(keyword: string): string[] {
    return this.#namespaces
      .map((value) => {
        return {
          value,
          distance: distance(keyword, value),
        }
      })
      .sort((current, next) => next.distance - current.distance)
      .filter((rating) => {
        return rating.distance <= 3
      })
      .map((rating) => rating.value)
  }

  /**
   * Listen for the event before we begin the process of finding
   * the command.
   */
  finding(callback: FindingHookHandler) {
    this.#hooks.add('finding', callback)
    return this
  }

  /**
   * Listen for the event when importing the command
   */
  loading(callback: LoadingHookHandler) {
    this.#hooks.add('loading', callback)
    return this
  }

  /**
   * Listen for the event when the command has been imported
   */
  loaded(callback: LoadedHookHandler<Command>) {
    this.#hooks.add('loaded', callback)
    return this
  }

  /**
   * Listen for the event before we start to execute the command.
   */
  executing(callback: ExecutingHookHandler<InstanceType<Command>>) {
    this.#hooks.add('executing', callback)
    return this
  }

  /**
   * Listen for the event after the command has been executed
   */
  executed(callback: ExecutedHookHandler<InstanceType<Command>>) {
    this.#hooks.add('executed', callback)
    return this
  }

  /**
   * Loads commands from all the registered loaders. The "addLoader" method
   * must be called before calling the "load" method.
   */
  async boot() {
    if (this.#state !== 'idle') {
      return
    }

    /**
     * Boot global command is not already booted
     */
    this.#globalCommand.boot()

    /**
     * Registering the default command
     */
    this.addLoader(new ListLoader([this.#defaultCommand]))

    /**
     * Set state to booted
     */
    this.#state = 'booted'

    /**
     * A set of unique namespaces. Later, we will store them on kernel
     * directly as an alphabetically sorted array.
     */
    const namespaces: Set<string> = new Set()

    /**
     * Load metadata for all commands using the loaders
     */
    for (let loader of this.#loaders) {
      let loaderInstance: LoadersContract<Command>

      /**
       * A loader can be a function that lazily imports and instantiates
       * a loader
       */
      if (typeof loader === 'function') {
        loaderInstance = await loader()
      } else {
        loaderInstance = loader
      }

      const commands = await loaderInstance.getMetaData()

      commands.forEach((command) => {
        this.#commands.set(command.commandName, { metaData: command, loader: loaderInstance })
        command.aliases.forEach((alias) => this.addAlias(alias, command.commandName))
        command.namespace && namespaces.add(command.namespace)
      })
    }

    this.#namespaces = [...namespaces].sort(sortAlphabetically)
  }

  /**
   * Find a command by its name
   */
  async find<T extends Command>(commandName: string): Promise<T> {
    /**
     * Get command name from the alias (if one exists)
     */
    commandName = this.#aliases.get(commandName)?.commandName || commandName
    await this.#hooks.runner('finding').run(commandName)

    /**
     * Find if we have a command registered
     */
    const command = this.#commands.get(commandName)
    if (!command) {
      throw new errors.E_COMMAND_NOT_FOUND([commandName])
    }

    await this.#hooks.runner('loading').run(command.metaData)

    /**
     * Find if the loader is able to load the command
     */
    const commandConstructor = await command.loader.getCommand(command.metaData)
    if (!commandConstructor) {
      throw new errors.E_COMMAND_NOT_FOUND([commandName])
    }

    await this.#hooks.runner('loaded').run(commandConstructor)
    return commandConstructor as T
  }

  /**
   * Execute a command. The second argument is an array of command-line
   * arguments (without the command name)
   *
   * @param commandName - The name of the command to execute
   * @param argv - Array of command-line arguments
   *
   * @example
   * ```ts
   * await kernel.exec('make:model', ['User', '--migration'])
   * ```
   */
  async exec<T extends Command>(
    commandName: string,
    argv: string[],
    options?: { ui?: UIPrimitives }
  ) {
    /**
     * Boot if not already booted
     */
    if (this.#state === 'idle') {
      await this.boot()
    }

    /**
     * Cannot execute commands after the main command has exited
     */
    if (this.#state === 'completed') {
      throw new RuntimeException(
        'The kernel has been terminated. Create a fresh instance to execute commands'
      )
    }

    return this.#exec<T>(commandName, argv, options)
  }

  /**
   * Creates a command instance by parsing and validating the command-line arguments
   *
   * @param command - The command class to instantiate
   * @param argv - Command-line arguments as string or array
   *
   * @example
   * ```ts
   * const commandInstance = await kernel.create(MyCommand, ['--verbose', 'arg1'])
   * ```
   */
  async create<T extends Command>(command: T, argv: string | string[]): Promise<InstanceType<T>> {
    /**
     * Boot if not already booted
     */
    if (this.#state === 'idle') {
      await this.boot()
    }

    return this.#create(command, argv)
  }

  /**
   * Handle process argv and execute the command. Calling this method
   * makes kernel own the process and register SIGNAL listeners
   *
   * @param argv - Array of command-line arguments from process.argv
   *
   * @example
   * ```ts
   * await kernel.handle(process.argv.slice(2))
   * ```
   */
  async handle(argv: string[]) {
    /**
     * Cannot run multiple main commands from a single process
     */
    if (this.#state === 'running') {
      throw new RuntimeException('Cannot run multiple main commands from a single process')
    }

    /**
     * Cannot run multiple main commands from the same instance
     */
    if (this.#state === 'completed') {
      throw new RuntimeException(
        'The kernel has been terminated. Create a fresh instance to execute commands'
      )
    }

    /**
     * Boot kernel
     */
    if (this.#state === 'idle') {
      await this.boot()
    }

    this.#state = 'running'
    const { commandName, nodeArgv, commandArgv } = this.#processArgv(argv)

    /**
     * Run the default command
     */
    if (!commandName) {
      debug('running default command "%s"', this.#defaultCommand.commandName)
      return this.#execMain(this.#defaultCommand.commandName, nodeArgv, commandArgv)
    }

    /**
     * Run the mentioned command as the main command
     */
    debug('running main command "%s"', commandName)
    return this.#execMain(commandName, nodeArgv, commandArgv)
  }

  /**
   * A named function that returns true. To be used
   * by flag listeners
   */
  shortcircuit() {
    return true
  }
}
