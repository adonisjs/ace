/*
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import 'reflect-metadata'
import test from 'japa'
import { join } from 'path'

import { Kernel } from '../src/Kernel'
import { Manifest } from '../src/Manifest'
import { fs, setupApp } from '../test-helpers'

test.group('Manifest', (group) => {
	group.before(async () => {
		await fs.ensureRoot()
	})

	group.afterEach(async () => {
		await fs.cleanup()
	})

	test('generated manifest from command paths', async (assert) => {
		await fs.add(
			'Commands/Make.ts',
			`
    import { args, flags } from '../../../index'
    import { BaseCommand } from '../../../src/BaseCommand'

    export default class Greet extends BaseCommand {
      public static commandName = 'greet'
      public static description = 'Greet a user'

      @args.string()
      public name: string

      @flags.boolean()
      public adult: boolean

      public async handle () {}
    }`
		)

		const manifest = new Manifest(fs.basePath)
		await manifest.generate(['./Commands/Make.ts'])

		const manifestJSON = await fs.fsExtra.readJSON(join(fs.basePath, 'ace-manifest.json'))
		assert.deepEqual(manifestJSON, {
			greet: {
				settings: {},
				commandPath: './Commands/Make',
				commandName: 'greet',
				description: 'Greet a user',
				args: [
					{
						name: 'name',
						type: 'string',
						propertyName: 'name',
						required: true,
					},
				],
				flags: [
					{
						name: 'adult',
						propertyName: 'adult',
						type: 'boolean',
					},
				],
			},
		})
	})

	test('raise exception when commandPath doesnt exports a command', async (assert) => {
		assert.plan(1)

		await fs.add(
			'Commands/Make.ts',
			`
    import { args, flags } from '../../../index'
    import { BaseCommand } from '../../../src/BaseCommand'

    export class Greet extends BaseCommand {
      public static commandName = 'greet'
      public static description = 'Greet a user'

      @args.string()
      public name: string

      @flags.boolean()
      public adult: boolean

      public async handle () {}
    }`
		)

		const manifest = new Manifest(fs.basePath)

		try {
			await manifest.generate(['./Commands/Make.ts'])
		} catch ({ message }) {
			assert.equal(message, 'make sure to have a default export from {./Commands/Make.ts} command')
		}
	})

	test('read manifest file', async (assert) => {
		await fs.add(
			'./Commands/Make.ts',
			`
    import { args, flags } from '../../../index'
    import { BaseCommand } from '../../../src/BaseCommand'

    export default class Greet extends BaseCommand {
      public static commandName = 'greet'
      public static description = 'Greet a user'

      @args.string()
      public name: string

      @flags.boolean()
      public adult: boolean

      public async handle () {}
    }`
		)

		const manifest = new Manifest(fs.basePath)
		await manifest.generate(['./Commands/Make.ts'])

		const manifestJSON = await manifest.load()
		assert.deepEqual(manifestJSON, {
			greet: {
				settings: {},
				commandPath: './Commands/Make',
				commandName: 'greet',
				description: 'Greet a user',
				args: [
					{
						name: 'name',
						propertyName: 'name',
						type: 'string',
						required: true,
					},
				],
				flags: [
					{
						name: 'adult',
						type: 'boolean',
						propertyName: 'adult',
					},
				],
			},
		})
	})

	test('inject dependencies to manifest commands loaded via manifest file', async (assert) => {
		await fs.add(
			'Commands/Make.ts',
			`
    import { inject } from '@adonisjs/fold'
    import { BaseCommand } from '../../../src/BaseCommand'

    @inject([null, null, 'App/Foo'])
    export default class Greet extends BaseCommand {
      public static commandName = 'greet'
      public static description = 'Greet a user'

      constructor (public app, public kernel, public foo) {
        super(app, kernel)
      }

      public async handle () {
        global['foo'] = this.foo.constructor.name
      }
    }`
		)

		const app = setupApp()
		const kernel = new Kernel(app)
		const manifest = new Manifest(fs.basePath)

		kernel.useManifest(manifest)

		await manifest.generate(['./Commands/Make.ts'])

		app.container.bind('App/Foo', () => {
			class Foo {}
			return new Foo()
		})

		await kernel.handle(['greet'])
		assert.equal(global['foo'], 'Foo')

		delete global['foo']
	})

	test('raise exception when manifest file is missing', async (assert) => {
		assert.plan(1)
		const manifest = new Manifest(fs.basePath)

		try {
			await manifest.load()
		} catch ({ message }) {
			assert.equal(message, 'Unable to locate ace-manifest.json file')
		}
	})

	test('generated manifest from command subpaths', async (assert) => {
		await fs.add(
			'Commands/Make.ts',
			`
    import { args, flags } from '../../../index'
    import { BaseCommand } from '../../../src/BaseCommand'

    export default class Greet extends BaseCommand {
      public static commandName = 'greet'
      public static description = 'Greet a user'

      @args.string()
      public name: string

      @flags.boolean()
      public adult: boolean

      public async handle () {}
    }`
		)

		await fs.add(
			'Commands/index.ts',
			`
      export default [
        './Commands/Make',
      ]
    `
		)

		const manifest = new Manifest(fs.basePath)
		await manifest.generate(['./Commands/index.ts'])

		const manifestJSON = await fs.fsExtra.readJSON(join(fs.basePath, 'ace-manifest.json'))
		assert.deepEqual(manifestJSON, {
			greet: {
				settings: {},
				commandPath: './Commands/Make',
				commandName: 'greet',
				description: 'Greet a user',
				args: [
					{
						name: 'name',
						type: 'string',
						propertyName: 'name',
						required: true,
					},
				],
				flags: [
					{
						name: 'adult',
						propertyName: 'adult',
						type: 'boolean',
					},
				],
			},
		})
	})
})
