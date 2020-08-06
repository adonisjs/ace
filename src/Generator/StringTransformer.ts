/*
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { extname } from 'path'
import pluralize from 'pluralize'
import { lodash } from '@poppinss/utils'

/**
 * Exposes the API to transform a string
 */
export class StringTransformer {
	constructor(private input: string) {}

	/**
	 * Cleans suffix from the input.
	 */
	public cleanSuffix(suffix?: string): this {
		if (!suffix) {
			return this
		}

		this.input = this.input.replace(new RegExp(`[-_]?${suffix}$`, 'i'), '')
		return this
	}

	/**
	 * Cleans prefix from the input.
	 */
	public cleanPrefix(prefix?: string): this {
		if (!prefix) {
			return this
		}

		this.input = this.input.replace(new RegExp(`^${prefix}[-_]?`, 'i'), '')
		return this
	}

	/**
	 * Add suffix to the file name
	 */
	public addSuffix(suffix?: string): this {
		if (!suffix) {
			return this
		}

		this.input = `${this.input}_${suffix}`
		return this
	}

	/**
	 * Add prefix to the file name
	 */
	public addPrefix(prefix?: string): this {
		if (!prefix) {
			return this
		}

		this.input = `${prefix}_${this.input}`
		return this
	}

	/**
	 * Changes the name form by converting it to singular
	 * or plural case
	 */
	public changeForm(form?: 'singular' | 'plural', ignoreList?: string[]): this {
		if (!form) {
			return this
		}

		/**
		 * Do not change form when word is in ignore list
		 */
		if ((ignoreList || []).find((word) => word.toLowerCase() === this.input.toLowerCase())) {
			return this
		}

		this.input = pluralize[form](this.input)
		return this
	}

	/**
	 * Changes the input case
	 */
	public changeCase(pattern?: 'pascalcase' | 'camelcase' | 'snakecase'): this {
		switch (pattern) {
			case 'camelcase':
				this.input = lodash.camelCase(this.input)
				return this
			case 'pascalcase':
				const camelCase = lodash.camelCase(this.input)
				this.input = `${camelCase.charAt(0).toUpperCase()}${camelCase.slice(1)}`
				return this
			case 'snakecase':
				this.input = lodash.snakeCase(this.input)
				return this
			default:
				return this
		}
	}

	/**
	 * Drops the extension from the input
	 */
	public dropExtension(): this {
		this.input = this.input.replace(new RegExp(`${extname(this.input)}$`), '')
		return this
	}

	/**
	 * Returns the transformed value
	 */
	public toValue() {
		return this.input
	}
}
