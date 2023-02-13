/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'node:path'
import { test } from '@japa/runner'
import { fileURLToPath } from 'node:url'
import { IndexGenerator } from '../index.js'
import { validateCommand, validateCommandMetaData } from '../src/helpers.js'

const BASE_URL = new URL('./tmp/', import.meta.url)
const BASE_PATH = fileURLToPath(BASE_URL)

test.group('Index generator', (group) => {
  group.each.setup(({ context }) => {
    context.fs.baseUrl = BASE_URL
    context.fs.basePath = BASE_PATH
  })

  test('generate loader and commands index by scanning commands directory', async ({
    assert,
    fs,
  }) => {
    await fs.create(
      'commands/make_controller_v_2.ts',
      `
      export default class MakeController {
        static commandName = 'make:controller'
        static args = []
        static flags = []
        static aliases = []
        static options = {}
        static description = ''
        static namespace = 'make'

        static serialize() {
          return {
            commandName: this.commandName,
            description: this.description,
            namespace: this.namespace,
            args: this.args,
            flags: this.flags,
            options: this.options,
            aliases: this.aliases,
          }
        }
      }
    `
    )

    const generator = new IndexGenerator(join(fs.basePath, 'commands'))
    await generator.generate()

    /**
     * Validate index
     */
    const indexJSON = await fs.contents('commands/commands.json')
    const commandsIndex = JSON.parse(indexJSON)

    assert.properties(commandsIndex, ['commands', 'version'])
    assert.equal(commandsIndex.version, 1)
    assert.isArray(commandsIndex.commands)
    commandsIndex.commands.forEach((command: any) =>
      validateCommandMetaData(command, './commands.json')
    )

    /**
     * Validate loader
     */
    const loader = await import(new URL('./commands/main.js', BASE_URL).href)
    const metaData = await loader.getMetaData()
    metaData.forEach((command: any) => validateCommandMetaData(command, './commands.json'))

    const command = await loader.getCommand(metaData[0])
    validateCommand(command, './main.ts')
  })

  test('index directories starting with _', async ({ assert, fs }) => {
    await fs.create(
      'commands/_make/controller_v_3.ts',
      `
      export default class MakeController {
        static commandName = 'make:controller'
        static args = []
        static flags = []
        static aliases = []
        static options = {}
        static description = ''
        static namespace = 'make'

        static serialize() {
          return {
            commandName: this.commandName,
            description: this.description,
            namespace: this.namespace,
            args: this.args,
            flags: this.flags,
            options: this.options,
            aliases: this.aliases,
          }
        }
      }
    `
    )

    const generator = new IndexGenerator(join(fs.basePath, 'commands'))
    await generator.generate()

    /**
     * Validate index
     */
    const indexJSON = await fs.contents('commands/commands.json')
    const commandsIndex = JSON.parse(indexJSON)

    assert.properties(commandsIndex, ['commands', 'version'])
    assert.equal(commandsIndex.version, 1)
    assert.isArray(commandsIndex.commands)
    commandsIndex.commands.forEach((command: any) =>
      validateCommandMetaData(command, './commands.json')
    )

    /**
     * Validate loader
     */
    const loader = await import(new URL('./commands/main.js?v=1', BASE_URL).href)
    const metaData = await loader.getMetaData()
    metaData.forEach((command: any) => validateCommandMetaData(command, './commands.json'))

    const command = await loader.getCommand(metaData[0])
    validateCommand(command, './controller_v_3.ts')
  })

  test('ignore files starting with _', async ({ assert, fs }) => {
    await fs.create(
      'commands/make/_make_controller_v_2.ts',
      `
      export default class MakeController {
        static commandName = 'make:controller'
        static args = []
        static flags = []
        static aliases = []
        static options = {}
        static description = ''
        static namespace = 'make'

        static serialize() {
          return {
            commandName: this.commandName,
            description: this.description,
            namespace: this.namespace,
            args: this.args,
            flags: this.flags,
            options: this.options,
            aliases: this.aliases,
          }
        }
      }
    `
    )

    const generator = new IndexGenerator(join(fs.basePath, 'commands'))
    await generator.generate()

    /**
     * Validate index
     */
    const indexJSON = await fs.contents('commands/commands.json')
    const commandsIndex = JSON.parse(indexJSON)

    assert.properties(commandsIndex, ['commands', 'version'])
    assert.equal(commandsIndex.version, 1)
    assert.isArray(commandsIndex.commands)
    assert.lengthOf(commandsIndex.commands, 0)

    /**
     * Validate loader
     */
    const loader = await import(new URL('./commands/main.js?v=2', BASE_URL).href)
    const metaData = await loader.getMetaData()
    assert.lengthOf(metaData, 0)
  })
})
