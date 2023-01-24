/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import fs from 'fs-extra'
import { join } from 'node:path'
import { test } from '@japa/runner'
import { fileURLToPath } from 'node:url'
import { ModulesLoader } from '../../src/loaders/modules_loader.js'

const BASE_URL = new URL('./tmp/', import.meta.url)
const BASE_PATH = fileURLToPath(BASE_URL)

test.group('Loaders | modules', (group) => {
  group.each.setup(() => {
    return () => fs.remove(BASE_PATH)
  })

  test('raise error when unable to import loaders', async ({ assert }) => {
    const loader = new ModulesLoader(BASE_URL, ['./loader_one.js'])
    await assert.rejects(() => loader.getMetaData(), /Cannot find module/)
  })

  test('raise error when loader does not implement the list method', async ({ assert }) => {
    await fs.outputFile(
      join(BASE_PATH, './loader_one.js'),
      `
      `
    )

    const loader = new ModulesLoader(BASE_URL, ['./loader_one.js'])
    await assert.rejects(
      () => loader.getMetaData(),
      'Invalid command loader "./loader_one.js". Missing "list" method export'
    )
  })

  test('raise error when loader does not implement the load method', async ({ assert }) => {
    await fs.outputFile(
      join(BASE_PATH, './loader_one.js'),
      `
      export async function list() {}
      `
    )

    const loader = new ModulesLoader(BASE_URL, ['./loader_one.js?v=1'])
    await assert.rejects(
      () => loader.getMetaData(),
      'Invalid command loader "./loader_one.js?v=1". Missing "load" method export'
    )
  })

  test('raise error when list method does not return an array', async ({ assert }) => {
    await fs.outputFile(
      join(BASE_PATH, './loader_one.js'),
      `
      export async function list() {}
      export async function load() {}
      `
    )

    const loader = new ModulesLoader(BASE_URL, ['./loader_one.js?v=2'])
    await assert.rejects(
      () => loader.getMetaData(),
      'Invalid commands list. The "./loader_one.js?v=2.list" method must return an array of commands'
    )
  })

  test('raise error when list array does not have objects', async ({ assert }) => {
    await fs.outputFile(
      join(BASE_PATH, './loader_one.js'),
      `
      export async function list() {
        return ['foo']
      }
      export async function load() {}
      `
    )

    const loader = new ModulesLoader(BASE_URL, ['./loader_one.js?v=3'])
    await assert.rejects(
      () => loader.getMetaData(),
      `Invalid command exported from "./loader_one.js?v=3.list" method. Expected object, received "'foo'"`
    )
  })

  test('raise error when list array items are not valid metadata objects', async ({ assert }) => {
    await fs.outputFile(
      join(BASE_PATH, './loader_one.js'),
      `
      export async function list() {
        return [{}]
      }
      export async function load() {}
      `
    )

    const loader = new ModulesLoader(BASE_URL, ['./loader_one.js?v=4'])
    await assert.rejects(
      () => loader.getMetaData(),
      `Invalid command exported from "./loader_one.js?v=4.list" method. Missing property "commandName"`
    )
  })

  test('load commands from multiple module loaders', async ({ assert }) => {
    await fs.outputFile(
      join(BASE_PATH, './loader_two.js'),
      `
      export async function list() {
        return [
          {
            commandName: 'make:controller',
            args: [],
            flags: [],
            aliases: [],
            options: {},
          }
        ]
      }
      export async function load() {}
      `
    )

    await fs.outputFile(
      join(BASE_PATH, './loader_three.js'),
      `
      export async function list() {
        return [
          {
            commandName: 'make:model',
            args: [],
            flags: [],
            aliases: [],
            options: {},
          }
        ]
      }
      export async function load() {}
      `
    )

    const loader = new ModulesLoader(BASE_URL, ['./loader_two.js', './loader_three.js'])
    const commands = await loader.getMetaData()

    assert.deepEqual(commands, [
      {
        commandName: 'make:controller',
        args: [],
        flags: [],
        aliases: [],
        options: {},
      },
      {
        commandName: 'make:model',
        args: [],
        flags: [],
        aliases: [],
        options: {},
      },
    ])
  })

  test('return null when load method returns undefined', async ({ assert }) => {
    await fs.outputFile(
      join(BASE_PATH, './loader_two.js'),
      `
      export async function list() {
        return [
          {
            commandName: 'make:controller',
            args: [],
            flags: [],
            aliases: [],
            options: {},
          }
        ]
      }
      export async function load() {}
      `
    )

    const loader = new ModulesLoader(BASE_URL, ['./loader_two.js?v=1'])
    const command = await loader.getCommand({ commandName: 'make:controller' } as any)
    assert.isNull(command)
  })

  test('return null when command is unknown', async ({ assert }) => {
    const loader = new ModulesLoader(BASE_URL, [])
    const command = await loader.getCommand({ commandName: 'make:controller' } as any)
    assert.isNull(command)
  })

  test('return null when load method returns null', async ({ assert }) => {
    await fs.outputFile(
      join(BASE_PATH, './loader_two.js'),
      `
      export async function list() {
        return [
          {
            commandName: 'make:controller',
            args: [],
            flags: [],
            aliases: [],
            options: {},
          }
        ]
      }
      export async function load() {
        return null
      }
      `
    )

    const loader = new ModulesLoader(BASE_URL, ['./loader_two.js?v=2'])
    const command = await loader.getCommand({ commandName: 'make:controller' } as any)
    assert.isNull(command)
  })

  test('raise error when load method does not return command class', async ({ assert }) => {
    await fs.outputFile(
      join(BASE_PATH, './loader_two.js'),
      `
      export async function list() {
        return [
          {
            commandName: 'make:controller',
            args: [],
            flags: [],
            aliases: [],
            options: {},
          }
        ]
      }
      export async function load() {
        return {
          commandName: 'make:controller',
          args: [],
          flags: [],
          aliases: [],
          options: {},
        }
      }
      `
    )

    const loader = new ModulesLoader(BASE_URL, ['./loader_two.js?v=3'])
    await assert.rejects(
      () => loader.getCommand({ commandName: 'make:controller' } as any),
      'Invalid command exported from "./loader_two.js?v=3.load" method. Expected command to be a class'
    )
  })

  test('get command constructor returned by the load method', async ({ assert }) => {
    await fs.outputFile(
      join(BASE_PATH, './loader_two.js'),
      `
      export async function list() {
        return [
          {
            commandName: 'make:controller',
            args: [],
            flags: [],
            aliases: [],
            options: {},
          }
        ]
      }
      export async function load() {
        return class Command {
          static commandName = 'make:controller'
          static args = []
          static flags = []
          static aliases = []
          static options = {}
        }
      }
      `
    )

    const loader = new ModulesLoader(BASE_URL, ['./loader_two.js?v=4'])
    const command = await loader.getCommand({ commandName: 'make:controller' } as any)
    assert.isFunction(command)
  })
})
