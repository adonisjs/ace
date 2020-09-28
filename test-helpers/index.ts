/*
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'path'
import { Filesystem } from '@poppinss/dev-utils'
import { Application } from '@adonisjs/application'
import { Kernel } from '../src/Kernel'

export const fs = new Filesystem(join(__dirname, 'app'))

export function setupApp() {
	const app = new Application(fs.basePath, 'test', {})
	return app
}

export function getKernel(app: Application) {
	return new Kernel(app)
}
