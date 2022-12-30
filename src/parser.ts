/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import yargsParser from 'yargs-parser'
import { yarsConfig } from './yars_config.js'

import type {
  YargsOutput,
  ParsedOutput,
  FlagsParserOptions,
  ArgumentsParserOptions,
} from './types.js'

/**
 * Parses the command line arguments. The flags are parsed
 * using yargs-parser
 */
export class Parser {
  /**
   * Parser options
   */
  #options: {
    flagsParserOptions: FlagsParserOptions
    argumentsParserOptions: ArgumentsParserOptions[]
  }

  constructor(options: {
    flagsParserOptions: FlagsParserOptions
    argumentsParserOptions: ArgumentsParserOptions[]
  }) {
    this.#options = options
  }

  /**
   * Parsers flags using yargs
   */
  #parseFlags(argv: string | string[]) {
    return yargsParser(argv, { ...this.#options.flagsParserOptions, configuration: yarsConfig })
  }

  /**
   * Scans for unknown flags in yargs output.
   */
  #scanUnknownFlags(parsed: { [key: string]: any }): string[] {
    const unknownFlags: string[] = []

    for (let key of Object.keys(parsed)) {
      if (!this.#options.flagsParserOptions.all.includes(key)) {
        unknownFlags.push(key)
      }
    }

    return unknownFlags
  }

  /**
   * Parsers arguments by mimicking the yargs behavior
   */
  #parseArguments(parsedOutput: YargsOutput): ParsedOutput {
    let lastParsedIndex = -1

    const output = this.#options.argumentsParserOptions.map((option, index) => {
      if (option.type === 'spread') {
        let value: any[] | undefined = parsedOutput._.slice(index)
        lastParsedIndex = parsedOutput._.length

        /**
         * Step 1
         *
         * Use default value when original value is not defined.
         */
        if (!value.length) {
          value = Array.isArray(option.default)
            ? option.default
            : option.default === undefined
            ? undefined
            : [option.default]
        }

        /**
         * Step 2
         *
         * Call parse method when value is not undefined
         */
        if (value !== undefined && option.parse) {
          value = option.parse(value)
        }

        return value
      }

      let value = parsedOutput._[index]
      lastParsedIndex = index + 1

      /**
       * Step 1:
       *
       * Use default value when original value is undefined
       * Original value set to empty string will be used
       * as real value. The behavior is same as yargs
       * flags parser `--connection=`
       */
      if (value === undefined) {
        value = option.default
      }

      /**
       * Step 2
       *
       * Call parse method when value is not undefined
       */
      if (value !== undefined && option.parse) {
        value = option.parse(value)
      }

      return value
    })

    const { '_': args, '--': o, ...rest } = parsedOutput

    return {
      args: output,
      _: args.slice(lastParsedIndex === -1 ? 0 : lastParsedIndex),
      unknownFlags: this.#scanUnknownFlags(rest),
      flags: rest,
    }
  }

  /**
   * Parse commandline arguments
   */
  parse(argv: string | string[]) {
    return this.#parseArguments(this.#parseFlags(argv))
  }
}
