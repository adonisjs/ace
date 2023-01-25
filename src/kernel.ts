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
import { findBestMatch } from 'string-similarity'
import { RuntimeException } from '@poppinss/utils'

import debug from './debug.js'
import { Parser } from './parser.js'
import * as errors from './errors.js'
import { ListCommand } from './commands/list.js'
import { BaseCommand } from './commands/base.js'
import { ListLoader } from './loaders/list_loader.js'
import { sortAlphabetically, renderErrorWithSuggestions } from './helpers.js'

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
} from './types.js'

const knowErrorCodes = Object.keys(errors)

/**
 * The Ace kernel manages the registration and execution of commands.
 *
 * The kernel is the main entry point of a console application, and
 * is tailored for a standard CLI environment.
 */
export class Kernel<Command extends AbstractBaseCommand> {
  /**
   * The default executor for creating command's instance
   * and running them
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
   * The default command to use when creating kernel instance
   * via "static create" method.
   */
  static defaultCommand: typeof BaseCommand = ListCommand

  /**
   * Creates an instance of kernel with the default executor
   * and default command
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
  #loaders: LoadersContract<Command>[] = []

  /**
   * An array of registered namespaces. Sorted alphabetically
   */
  #namespaces: string[] = []

  /**
   * A collection of aliases for the commands. The key is the alias name
   * and the value is the command name.
   *
   * In case of duplicate aliases, the most recent alias will override
   * the previous existing alias.
   */
  #aliases: Map<string, string> = new Map()

  /**
   * A collection of commands by the command name. This allows us to keep only
   * the unique commands and also keep the loader reference to know which
   * loader to ask for loading the command.
   */
  #commands: Map<string, { metaData: CommandMetaData; loader: LoadersContract<Command> }> =
    new Map()

  /**
   * The exit code for the kernel. The exit code is inferred
   * from the main code when not set explicitly.
   */
  exitCode?: number

  /**
   * The UI primitives to use within commands
   */
  ui: UIPrimitives = cliui()

  /**
   * Instance of prompt to display CLI prompts. We share
   * a single instance with all the commands. This
   * allows trapping prompts for commands executed
   * internally.
   */
  prompt = new Prompt()

  /**
   * CLI info map
   */
  info: Map<string, AllowedInfoValues> = new Map()

  /**
   * List of global flags
   */
  get flags(): ({ name: string } & Flag)[] {
    return this.#globalCommand.flags
  }

  constructor(defaultCommand: Command, executor: ExecutorContract<Command>) {
    this.#defaultCommand = defaultCommand
    this.#executor = executor
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
    return commandInstance as InstanceType<T>
  }

  /**
   * Executes a given command. The main commands are executed using the
   * "execMain" method.
   */
  async #exec<T extends Command>(commandName: string, argv: string[]): Promise<InstanceType<T>> {
    const Command = await this.find<T>(commandName)
    const commandInstance = await this.#create<T>(Command, argv)

    /**
     * Execute the command using the executor
     */
    await this.#hooks.runner('executing').run(commandInstance, false)
    await this.#executor.run(commandInstance, this)
    await this.#hooks.runner('executed').run(commandInstance, false)

    return commandInstance
  }

  /**
   * Executes the main command and handles the exceptions by
   * reporting them
   */
  async #execMain(commandName: string, argv: string[]) {
    try {
      const Command = await this.find(commandName)

      /**
       * Parse CLI argv and also merge global flags parser options.
       */
      const parsed = new Parser(
        Command.getParserOptions(this.#globalCommand.getParserOptions().flagsParserOptions)
      ).parse(argv)

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

      /**
       * Execute the command using the executor
       */
      await this.#hooks.runner('executing').run(this.#mainCommand!, true)
      await this.#executor.run(this.#mainCommand!, this)
      await this.#hooks.runner('executed').run(this.#mainCommand!, true)
      this.exitCode = this.exitCode ?? this.#mainCommand!.exitCode ?? 0
      this.#state = 'completed'
    } catch (error) {
      this.exitCode = 1
      this.#state = 'completed'
      await this.#handleError(error)
    }
  }

  /**
   * Handles the error raised during the main command execution.
   *
   * @note: Do not use this error handler for anything other than
   * handling errors of the main command
   */
  async #handleError(error: any) {
    /**
     * Reporting errors with the best UI possible based upon the error
     * type
     */
    if (error instanceof errors.E_COMMAND_NOT_FOUND) {
      renderErrorWithSuggestions(
        this.ui,
        error.message,
        this.getCommandSuggestions(error.commandName)
      )
    } else if (knowErrorCodes.includes(error.code)) {
      this.ui.logger.logError(`${this.ui.colors.bgRed().white('  ERROR  ')} ${error.message}`)
    } else {
      console.log(error.stack)
    }
  }

  /**
   * Listen for CLI options and execute an action. Only one listener
   * can be defined per aption.
   *
   * The callbacks are only executed for the main command
   */
  on(option: string, callback: FlagListener<Command>): this {
    debug('registering flag listener for "%s" flag', option)
    this.#optionListeners.set(option, callback)
    return this
  }

  /**
   * Define a global flag that is applicable for all the
   * commands.
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
   * Register a commands loader. The commands will be collected by
   * all the loaders.
   *
   * Incase multiple loaders returns a single command, the command from the
   * most recent loader will be used.
   */
  addLoader(loader: LoadersContract<Command>): this {
    if (this.#state !== 'idle') {
      throw new RuntimeException(`Cannot add loader in "${this.#state}" state`)
    }

    this.#loaders.push(loader)
    return this
  }

  /**
   * Register alias for a comamnd name.
   */
  addAlias(alias: string, commandName: string): this {
    this.#aliases.set(alias, commandName)
    return this
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

    return this.#commands.get(aliasCommand)?.metaData || null
  }

  /**
   * Returns an array of aliases for a given command
   */
  getCommandAliases(commandName: string) {
    return [...this.#aliases.entries()]
      .filter(([, command]) => {
        return command === commandName
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

    return findBestMatch(keyword, commandsAndAliases)
      .ratings.sort((current, next) => next.rating - current.rating)
      .filter((rating) => rating.rating > 0.4)
      .map((rating) => rating.target)
  }

  /**
   * Returns an array of namespaces suggestions for a given keyword.
   */
  getNamespaceSuggestions(keyword: string): string[] {
    return findBestMatch(keyword, this.#namespaces)
      .ratings.sort((current, next) => next.rating - current.rating)
      .filter((rating) => rating.rating > 0.4)
      .map((rating) => rating.target)
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
      const commands = await loader.getMetaData()

      commands.forEach((command) => {
        this.#commands.set(command.commandName, { metaData: command, loader })
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
    commandName = this.#aliases.get(commandName) || commandName
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
   * Execute a command. The second argument is an array of commandline
   * arguments (without the command name)
   */
  async exec<T extends Command>(commandName: string, argv: string[]) {
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

    return this.#exec<T>(commandName, argv)
  }

  /**
   * Creates a command instance by parsing and validating
   * the command-line arguments.
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

    /**
     * Run the default command when no argv are defined
     * or if only flags are mentioned
     */
    if (!argv.length || argv[0].startsWith('-')) {
      debug('running default command "%s"', this.#defaultCommand.commandName)
      return this.#execMain(this.#defaultCommand.commandName, argv)
    }

    /**
     * Run the mentioned command as the main command
     */
    const [commandName, ...args] = argv
    debug('running main command "%s"', commandName)
    return this.#execMain(commandName, args)
  }
}
