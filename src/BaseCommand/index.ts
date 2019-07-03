/*
* @adonisjs/ace
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import * as figures from 'figures'
import { format } from 'util'
import { ParsedOptions } from 'getopts'
import { CommandContract, CommandArg, CommandFlag, LabelsList } from '../Contracts'

/**
 * Colors modules. We switch between `kleur` and `stringify`
 * based upon the raw mode.
 */
import { Colors } from '../Colors/Base'
import { Kleur } from '../Colors/Kleur'
import { Stringify } from '../Colors/Stringify'

import { Enquirer } from '../Prompts/Enquirer'
import { Emitter } from '../Prompts/Emitter'
import { Prompt } from '../Prompts/Base'

/**
 * Returns the distance between two labels. We consider the `complete`
 * label to the longest and distance is calculated from the longest
 * label.
 */
function getLabelDistance (label: LabelsList) {
  return label === 'complete' ? 3 : 'complete'.length - label.length + 3
}

/**
 * Returns the badge for a given label
 */
function getLabelBadge (label: LabelsList) {
  switch (label) {
    case 'success':
      return figures.tick
    case 'error':
      return figures.cross
    case 'note':
      return figures.circlePipe
    case 'warning':
      return figures.warning
    case 'await':
      return figures.ellipsis
    case 'complete':
      return figures.circleFilled
    case 'info':
      return figures.info
  }
}

/**
 * Abstract base class other classes must extend
 */
export abstract class BaseCommand implements CommandContract {
  /**
   * When set to true, the command will collect the output of [[this.colors]]
   * and [[this.log]] in memory, instead of printing them to the console.
   */
  constructor (public rawMode: boolean = false) {
  }

  /**
   * Command arguments
   */
  public static args: CommandArg[] = []

  /**
   * Command flags
   */
  public static flags: CommandFlag[] = []

  /**
   * Command name
   */
  public static commandName: string = ''

  /**
   * The description of the command displayed on the help screen.
   * Please do not create commands without description
   */
  public static description: string = ''

  /**
   * Parsed options on the command. They only exist when the command
   * is executed via kernel
   */
  public parsed?: ParsedOptions

  /**
   * An array of collected logs
   */
  public logs: string[] = []

  /**
   * The prompt for the command
   */
  public prompt: Prompt = this.rawMode ? new Emitter() : new Enquirer()

  /**
   * Prints a fancy log for a pre-defined label
   */
  private _printFancy (label: LabelsList, color: keyof Colors, text: string, ...optionalParams: any[]) {
    /**
     * Keep the log normalized when `rawMode` is true, otherwise
     * it will be hard to test the output with all fancy icons and
     * extra whitespace
     */
    if (this.rawMode) {
      this.$log(`${this.colors[color]().underline(label)} ${text}`, ...optionalParams)
      return
    }

    /**
     * Get the icon for the label
     */
    const badge = this.colors[color](getLabelBadge(label))

    /**
     * Make the label colorful
     */
    const coloredLabel = this.colors[color]().underline(label)

    /**
     * Get whitespace to keep the logs formatted
     */
    const whiteSpace = new Array(getLabelDistance(label)).join(' ')

    /**
     * Print the log
     */
    if (label === 'error') {
      this.$logError(`${badge} ${coloredLabel}${whiteSpace}${text}`, ...optionalParams)
    } else {
      this.$log(`${badge} ${coloredLabel}${whiteSpace}${text}`, ...optionalParams)
    }
  }

  /**
   * Returns a new instance of colors class. if `[[this.rawMode]]`
   * is set to true, then it will return an instance of [[Stringify]]
   * which has consistent output tailored for testing, otherwise
   * an instance of [[Kleur]] is returned
   */
  public get colors (): Colors {
    return this.rawMode ? new Stringify() : new Kleur()
  }

  /**
   * Log message to stdout using `console.log`. If [[this.rawMode]]
   * is set to `true`, then it will collect logs in memory vs spitting
   * them to stdout.
   *
   * You can access in-memory logs by accessing [[this.logs]] property.
   */
  protected $log (text: string, ...optionalParams: any[]): void {
    if (this.rawMode) {
      /**
       * Define `logs` on the children class if it's missing
       */
      if (!this.constructor.hasOwnProperty('logs')) {
        Object.defineProperty(this.constructor, 'logs', { value: [] })
      }

      this.logs.push(format(text, ...optionalParams))
      return
    }

    console.log(text, ...optionalParams)
  }

  /**
   * Similar to [[this.log]] but instead logs to `stderr`
   */
  protected $logError (text: string, ...optionalParams: any[]): void {
    if (this.rawMode) {
      /**
       * Define `logs` on the children class if it's missing
       */
      if (!this.constructor.hasOwnProperty('logs')) {
        Object.defineProperty(this.constructor, 'logs', { value: [] })
      }

      this.logs.push(format(text, ...optionalParams))
      return
    }

    console.error(text, ...optionalParams)
  }

  /**
   * Log a success message
   */
  protected $success (text: string, ...optionalParams: any[]) {
    this._printFancy('success', 'green', text, ...optionalParams)
  }

  /**
   * Log info success message
   */
  public $info (text: string, ...optionalParams: any[]) {
    this._printFancy('info', 'cyan', text, ...optionalParams)
  }

  /**
   * Log error message. It will go to `stderr`.
   */
  public $error (text: string, ...optionalParams: any[]) {
    this._printFancy('error', 'red', text, ...optionalParams)
  }

  /**
   * Log warning message
   */
  public $warning (text: string, ...optionalParams: any[]) {
    this._printFancy('warning', 'yellow', text, ...optionalParams)
  }

  /**
   * Log a completion message
   */
  public $complete (text: string, ...optionalParams: any[]) {
    this._printFancy('complete', 'green', text, ...optionalParams)
  }

  /**
   * Log some note
   */
  public $note (text: string, ...optionalParams: any[]) {
    this._printFancy('note', 'blue', text, ...optionalParams)
  }

  /**
   * Log awaiting message
   */
  public $await (text: string, ...optionalParams: any[]) {
    this._printFancy('await', 'magenta', text, ...optionalParams)
  }

  /**
   * Must be defined by the parent class
   */
  public async abstract handle ()
}
