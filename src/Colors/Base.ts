/**
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Base class extended by [[Kleur]] and [[Stringify]] classes to have
 * common interface. The API is kept similar to `kleur` package.
 */
export abstract class Colors {
  protected abstract $transform (transformation: string, text?: string | number): this | string

  public black (): this
  public black (text: string): string
  public black (text?: string | number): this | string {
    return this.$transform('black', text)
  }

  public red (): this
  public red (text: string): string
  public red (text?: string | number): this | string {
    return this.$transform('red', text)
  }

  public green (): this
  public green (text: string): string
  public green (text?: string | number): this | string {
    return this.$transform('green', text)
  }

  public yellow (): this
  public yellow (text: string): string
  public yellow (text?: string | number): this | string {
    return this.$transform('yellow', text)
  }

  public blue (): this
  public blue (text: string): string
  public blue (text?: string | number): this | string {
    return this.$transform('blue', text)
  }

  public magenta (): this
  public magenta (text: string): string
  public magenta (text?: string | number): this | string {
    return this.$transform('magenta', text)
  }

  public cyan (): this
  public cyan (text: string): string
  public cyan (text?: string | number): this | string {
    return this.$transform('cyan', text)
  }

  public white (): this
  public white (text: string): string
  public white (text?: string | number): this | string {
    return this.$transform('white', text)
  }

  public gray (): this
  public gray (text: string): string
  public gray (text?: string | number): this | string {
    return this.$transform('gray', text)
  }

  public grey (): this
  public grey (text: string): string
  public grey (text?: string | number): this | string {
    return this.$transform('grey', text)
  }

  public bgBlack (): this
  public bgBlack (text: string): string
  public bgBlack (text?: string | number): this | string {
    return this.$transform('bgBlack', text)
  }

  public bgRed (): this
  public bgRed (text: string): string
  public bgRed (text?: string | number): this | string {
    return this.$transform('bgRed', text)
  }

  public bgGreen (): this
  public bgGreen (text: string): string
  public bgGreen (text?: string | number): this | string {
    return this.$transform('bgGreen', text)
  }

  public bgYellow (): this
  public bgYellow (text: string): string
  public bgYellow (text?: string | number): this | string {
    return this.$transform('bgYellow', text)
  }

  public bgBlue (): this
  public bgBlue (text: string): string
  public bgBlue (text?: string | number): this | string {
    return this.$transform('bgBlue', text)
  }

  public bgMagenta (): this
  public bgMagenta (text: string): string
  public bgMagenta (text?: string | number): this | string {
    return this.$transform('bgMagenta', text)
  }

  public bgCyan (): this
  public bgCyan (text: string): string
  public bgCyan (text?: string | number): this | string {
    return this.$transform('bgCyan', text)
  }

  public bgWhite (): this
  public bgWhite (text: string): string
  public bgWhite (text?: string | number): this | string {
    return this.$transform('bgWhite', text)
  }

  public reset (): this
  public reset (text: string): string
  public reset (text?: string | number): this | string {
    return this.$transform('reset', text)
  }

  public bold (): this
  public bold (text: string): string
  public bold (text?: string | number): this | string {
    return this.$transform('bold', text)
  }

  public dim (): this
  public dim (text: string): string
  public dim (text?: string | number): this | string {
    return this.$transform('dim', text)
  }

  public italic (): this
  public italic (text: string): string
  public italic (text?: string | number): this | string {
    return this.$transform('italic', text)
  }

  public underline (): this
  public underline (text: string): string
  public underline (text?: string | number): this | string {
    return this.$transform('underline', text)
  }

  public inverse (): this
  public inverse (text: string): string
  public inverse (text?: string | number): this | string {
    return this.$transform('inverse', text)
  }

  public hidden (): this
  public hidden (text: string): string
  public hidden (text?: string | number): this | string {
    return this.$transform('hidden', text)
  }

  public strikethrough (): this
  public strikethrough (text: string): string
  public strikethrough (text?: string | number): this | string {
    return this.$transform('strikethrough', text)
  }
}
