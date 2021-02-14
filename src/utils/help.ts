/*
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { logger } from '@poppinss/cliui'
import { sortAndGroupCommands } from './sortAndGroupCommands'
import { Aliases, CommandArg, CommandFlag, SerializedCommand } from '../Contracts'

/**
 * Wraps the command arg inside `<>` or `[]` brackets based upon if it's
 * required or not.
 */
function wrapArg(arg: CommandArg): string {
  const displayName = arg.type === 'spread' ? `...${arg.name}` : arg.name
  return arg.required ? `<${displayName}>` : `[${displayName}]`
}

/**
 * Returns an array of flags for displaying the help screen
 */
function getFlagsForDisplay(flags: CommandFlag<any>[]) {
  return flags.map(({ name, type, alias, description }) => {
    /**
     * Display name is the way we want to display a single flag in the
     * list of flags
     */
    const displayName = alias ? `-${alias}, --${name}` : `--${name}`

    /**
     * The type hints the user about the expectation on the flag type. We only
     * print the type, when flag is not a boolean.
     */
    let displayType = ''
    switch (type) {
      case 'array':
        displayType = 'string[]'
        break
      case 'numArray':
        displayType = 'number[]'
        break
      case 'string':
        displayType = 'string'
        break
      case 'boolean':
        displayType = 'boolean'
        break
      case 'number':
        displayType = 'number'
        break
    }

    return {
      displayName,
      displayType,
      description,
      width: displayName.length + displayType.length,
    }
  })
}

/**
 * Returns an array of args for displaying the help screen
 */
function getArgsForDisplay(args: CommandArg[]) {
  return args.map(({ name, description }) => {
    return {
      displayName: name,
      description: description,
      width: name.length,
    }
  })
}

/**
 * Returns an array of commands for display
 */
function getCommandsForDisplay(commands: SerializedCommand[], aliases: Aliases) {
  return commands.map(({ commandName, description }) => {
    const commandAliases = getCommandAliases(commandName, aliases)
    const aliasesString = commandAliases.length ? ` [${commandAliases.join(', ')}]` : ''
    return {
      displayName: `${commandName}${aliasesString}`,
      description,
      width: commandName.length + aliasesString.length,
    }
  })
}

/**
 * Returns the aliases for a given command
 */
function getCommandAliases(commandName: string, aliases: Aliases) {
  return Object.keys(aliases).reduce<string[]>((commandAliases, alias) => {
    if (aliases[alias] === commandName) {
      commandAliases.push(alias)
    }
    return commandAliases
  }, [])
}

/**
 * Prints help for all the commands by sorting them in alphabetical order
 * and grouping them as per their namespace.
 */
export function printHelp(
  commands: SerializedCommand[],
  flags: CommandFlag<any>[],
  aliases: Aliases
): void {
  const flagsList = getFlagsForDisplay(flags)
  const commandsList = getCommandsForDisplay(commands, aliases)

  /**
   * Get width of longest command name.
   */
  const maxWidth = Math.max.apply(
    Math,
    flagsList.concat(commandsList as any).map(({ width }) => width)
  )

  /**
   * Sort commands and group them, so that we can print them as per
   * the namespace they belongs to
   */
  sortAndGroupCommands(commands).forEach(({ group, commands: groupCommands }) => {
    console.log('')

    if (group === 'root') {
      console.log(logger.colors.bold(logger.colors.yellow('Available commands')))
    } else {
      console.log(logger.colors.bold(logger.colors.yellow(group)))
    }

    groupCommands.forEach(({ commandName, description }) => {
      const commandAliases = getCommandAliases(commandName, aliases)
      const aliasesString = commandAliases.length ? ` [${commandAliases.join(', ')}]` : ''
      const displayName = `${commandName}${aliasesString}`

      console.log(
        `  ${logger.colors.green(displayName.padEnd(maxWidth, ' '))}  ${logger.colors.dim(
          description
        )}`
      )
    })
  })

  if (flagsList.length) {
    console.log('')
    console.log(logger.colors.bold(logger.colors.yellow('Global Flags')))

    flagsList.forEach(({ displayName, displayType, description = '', width }) => {
      const whiteSpace = ''.padEnd(maxWidth - width, ' ')
      console.log(
        `  ${logger.colors.green(displayName)} ${logger.colors.dim(
          displayType
        )} ${whiteSpace}  ${logger.colors.dim(description)}`
      )
    })
  }
}

/**
 * Prints help for a single command
 */
export function printHelpFor(command: SerializedCommand, aliases: Aliases): void {
  if (command.description) {
    console.log('')
    console.log(command.description)
  }

  console.log('')
  console.log(
    `${logger.colors.yellow('Usage:')} ${command.commandName} ${logger.colors.dim(
      command.args.map(wrapArg).join(' ')
    )}`
  )

  const flags = getFlagsForDisplay(command.flags)
  const args = getArgsForDisplay(command.args)

  /**
   * Getting max width to keep flags and args symmetric
   */
  const maxWidth = Math.max.apply(
    Math,
    flags.concat(args as any).map(({ width }) => width)
  )

  const commandAliases = getCommandAliases(command.commandName, aliases)
  if (commandAliases.length) {
    console.log('')
    console.log(
      `${logger.colors.yellow('Aliases:')} ${logger.colors.green(commandAliases.join(', '))}`
    )
  }

  if (args.length) {
    console.log('')
    console.log(logger.colors.bold(logger.colors.yellow('Arguments')))

    args.forEach(({ displayName, description = '', width }) => {
      const whiteSpace = ''.padEnd(maxWidth - width, ' ')
      console.log(
        `  ${logger.colors.green(displayName)} ${whiteSpace}   ${logger.colors.dim(description)}`
      )
    })
  }

  if (flags.length) {
    console.log('')
    console.log(logger.colors.bold(logger.colors.yellow('Flags')))

    flags.forEach(({ displayName, displayType, description = '', width }) => {
      const whiteSpace = ''.padEnd(maxWidth - width, ' ')
      console.log(
        `  ${logger.colors.green(displayName)} ${logger.colors.dim(
          displayType
        )} ${whiteSpace}  ${logger.colors.dim(description)}`
      )
    })
  }
}
