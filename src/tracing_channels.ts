/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import diagnostics_channel from 'node:diagnostics_channel'
import { type CommandExecTracingData } from './types.ts'

/**
 * Traces every command execution handled by the {@link Kernel} class.
 */
export const commandExec = diagnostics_channel.tracingChannel<
  'adonisjs.command.exec',
  CommandExecTracingData
>('adonisjs.command.exec')
