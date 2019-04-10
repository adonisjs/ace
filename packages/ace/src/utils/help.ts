/*
* @adonisjs/ace
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import * as padRight from 'pad-right'
import { green, bold, yellow, dim } from 'kleur'
import { CommandConstructorContract, CommandArg } from '../Contracts'
import { sortAndGroupCommands } from './sortAndGroupCommands'

/**
 * Prints help for all the commands by sorting them in alphabetical order
 * and grouping them as per their namespace.
 */
export function printHelp (commands: CommandConstructorContract[]): void {
  /**
   * Get width of longest command name.
   */
  const maxWidth = Math.max.apply(Math, commands.map(({ commandName }) => commandName.length))

  /**
   * Sort commands and group them, so that we can print them as per
   * the namespace they belongs to
   */
  sortAndGroupCommands(commands).forEach(({ group, commands }) => {
    console.log('')
    if (group === 'root') {
      console.log(bold(yellow('Available commands')))
    } else {
      console.log(bold(yellow(group)))
    }

    commands.forEach(({ commandName, description }) => {
      console.log(`  ${green(padRight(commandName, maxWidth, ' '))}  ${dim(description)}`)
    })
  })
}

/**
 * Wraps the command arg inside `<>` or `[]` brackets based upon if it's
 * required or not.
 */
function wrapArg (arg: CommandArg): string {
  return arg.required ? `<${arg.name}>` : `[${arg.name}]`
}

/**
 * Prints help for a single command
 */
export function printHelpFor (command: CommandConstructorContract): void {
  if (command.description) {
    console.log('')
    console.log(command.description)
  }

  console.log('')
  console.log(`${yellow('Usage:')} ${command.commandName} ${dim(command.args.map(wrapArg).join(' '))}`)

  const flags = command.flags.map(({ name, type, alias, description }) => {
    /**
     * Display name is the way we want to display a single flag in the
     * list of flags
     */
    const displayName = alias ? `-${alias}, --${name}` : `--${name}`

    /**
     * The type hints the user about the expectation on the flag type. We only
     * print the type, when flag is not a boolean.
     */
    const displayType = type === 'array' ? 'string[]' : type === 'string' ? 'string' : ''

    return {
      displayName,
      displayType,
      description,
      width: displayName.length + displayType.length,
    }
  })

  const args = command.args.map(({ name, description }) => {
    return {
      displayName: name,
      description: description,
      width: name.length,
    }
  })

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
