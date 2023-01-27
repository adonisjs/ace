#!/usr/bin/env node

/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Kernel, ListLoader } from '../index.js'
import IndexCommand from './index_command.js'

const kernel = Kernel.create()
kernel.addLoader(new ListLoader([IndexCommand]))
await kernel.handle(process.argv.splice(2))
