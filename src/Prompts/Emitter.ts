/**
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Prompt } from './Base'

/**
 * Use event emitter to emit different prompt events, which can be
 * used to answer the prompts programmatically.
 */
export class Emitter extends Prompt {
  protected $prompt (options: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const self = this

      options = Object.assign({ name: 'prompt' }, options, {
        /**
         * Accept the confirmation prompt
         */
        async accept () {
          return this.answer(true)
        },

        /**
         * Decline the confirmation prompt
         */
        async decline () {
          return this.answer(false)
        },

        /**
         * Select the choice at a given index
         */
        async select (index: number) {
          if (!Array.isArray(this.choices)) {
            reject(
              new Error('[prompt select]: method can only be used with choices'),
            )
            return
          }

          if (this.choices.length <= index) {
            reject(
              new Error(`[prompt select]: out of bounds index ${index}`),
            )
            return
          }

          const answer = this.choices[index].name
          return this.answer(this.type === 'multiselect' ? [answer] : answer)
        },

        /**
         * Select multiple options
         */
        async multiSelect (indexes: number[]) {
          if (this.type !== 'multiselect') {
            reject(
              new Error('[prompt multiselect]: method can only be with multiple choices prompt'),
            )
            return
          }

          const maxIndex = Math.max(...indexes)
          if (this.choices.length <= maxIndex) {
            reject(
              new Error(`[prompt multiselect]: out of bounds index ${maxIndex}`),
            )
            return
          }

          return this.answer(indexes.map((index) => this.choices[index].name))
        },

        /**
         * This function must be called in order for prompts
         * to advance.
         */
        async answer (answer) {
          /**
           * Format the user input
           */
          if (typeof (this.format) === 'function') {
            answer = this.format(answer)
          }

          /**
           * If their is no `validate` method, then resolve the prompt
           * right away
           */
          if (typeof (this.validate) !== 'function') {
            return resolve(answer)
          }

          /**
           * Attempt to mimic the crucially required state
           * properties from enquirer.
           */
          const state: any = {
            value: answer,
            type: this.type,
            name: this.name,
            message: this.message,
            choices: this.choices,
            initial: this.initial,
            format: this.format,
            submitted: true,
            cancelled: false,
          }

          /**
           * Extra properties for the choices and multiselect
           * prompts
           */
          if (state.choices) {
            state.size = state.choices.size
            state.multiple = state.type === 'multieselect'
          }

          /**
           * Invoke the validation handler
           */
          const passes = await this.validate(answer, state)

          /**
           * We emit `prompt:answer` and `prompt:error` events, so that we
           * can test the validation behavior as well.
           */
          if (passes === true) {
            self.emit('prompt:answer', answer)
            resolve(answer)
          } else {
            self.emit('prompt:error', passes === false ? 'Enter the value' : passes)
            resolve(answer)
          }
        },
      })

      this.emit('prompt', options)
    })
  }
}
