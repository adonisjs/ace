/*
* @adonisjs/ace
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import padRight from 'pad-right'
import { green, bold, yellow, dim } from 'kleur'
import { sortAndGroupCommands } from './sortAndGroupCommands'
import { CommandArg, CommandFlag, SerializedCommandContract } from '../Contracts'

/**
 * Wraps the command arg inside `<>` or `[]` brackets based upon if it's
 * required or not.
 */
function wrapArg (arg: CommandArg): string {
  const displayName = arg.type === 'spread' ? `${arg.name}...` : arg.name
  return arg.required ? `<${displayName}>` : `[${displayName}]`
}

/**
 * Returns an array of flags for displaying the help screen
 */
function getFlagsForDisplay (flags: CommandFlag[]) {
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
function getArgsForDisplay (args: CommandArg[]) {
  return args.map(({ name, description }) => {
    return {
      displayName: name,
      description: description,
      width: name.length,
    }
  })
}

function getCommandsForDisplay (commands: SerializedCommandContract[]) {
  return commands.map(({ commandName, description }) => {
    return { displayName: commandName, description, width: commandName.length }
  })
}

/**
 * Prints help for all the commands by sorting them in alphabetical order
 * and grouping them as per their namespace.
 */
export function printHelp (commands: SerializedCommandContract[], flags: CommandFlag[]): void {
  const flagsList = getFlagsForDisplay(flags)
  const commandsList = getCommandsForDisplay(commands)

  /**
   * Get width of longest command name.
   */
  const maxWidth = Math.max.apply(Math, flagsList.concat(commandsList as any).map(({ width }) => width))

  /**
   * Sort commands and group them, so that we can print them as per
   * the namespace they belongs to
   */
  sortAndGroupCommands(commands).forEach(({ group, commands: groupCommands }) => {
    console.log('')
    if (group === 'root') {
      console.log(bold(yellow('Available commands')))
    } else {
      console.log(bold(yellow(group)))
    }

    groupCommands.forEach(({ commandName, description }) => {
      console.log(`  ${green(padRight(commandName, maxWidth, ' '))}  ${dim(description)}`)
    })
  })

  if (flagsList.length) {
    console.log('')
    console.log(bold(yellow('Global Flags')))

    flagsList.forEach(({ displayName, displayType, description = '', width }) => {
      const whiteSpace = padRight('', maxWidth - width, ' ')
      console.log(`  ${green(displayName)} ${dim(displayType)} ${whiteSpace}  ${dim(description)}`)
    })
  }
}

/**
 * Prints help for a single command
 */
export function printHelpFor (command: SerializedCommandContract): void {
  if (command.description) {
    console.log('')
    console.log(command.description)
  }

  console.log('')
  console.log(`${yellow('Usage:')} ${command.commandName} ${dim(command.args.map(wrapArg).join(' '))}`)

  const flags = getFlagsForDisplay(command.flags)
  const args = getArgsForDisplay(command.args)

  /**
   * Getting max width to keep flags and args symmetric
   */
  const maxWidth = Math.max.apply(Math, flags.concat(args as any).map(({ width }) => width))

  if (args.length) {
    console.log('')
    console.log(bold(yellow('Arguments')))

    args.forEach(({ displayName, description = '', width }) => {
      const whiteSpace = padRight('', maxWidth - width, ' ')
      console.log(`  ${green(displayName)} ${whiteSpace}   ${dim(description)}`)
    })
  }

  if (flags.length) {
    console.log('')
    console.log(bold(yellow('Flags')))

    flags.forEach(({ displayName, displayType, description = '', width }) => {
      const whiteSpace = padRight('', maxWidth - width, ' ')
      console.log(`  ${green(displayName)} ${dim(displayType)} ${whiteSpace}  ${dim(description)}`)
    })
  }
}
