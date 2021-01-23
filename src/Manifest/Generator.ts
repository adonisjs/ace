/*
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { outputJSON } from 'fs-extra'
import { isAbsolute, extname, join } from 'path'
import { esmRequire, Exception, resolveFrom } from '@poppinss/utils'

import { validateCommand } from '../utils/validateCommand'
import { CommandConstructorContract, ManifestNode } from '../Contracts'
import { pathToFileURL } from 'url'

async function esmImport(path: string) {
	const module = await import(pathToFileURL(path).href)
	if (module.__esModule) {
		return module.default.default
	}
	return module.default
}

/**
 * Exposes the API to generate the ace manifest file. The manifest file
 * contains the meta data of all the registered commands. This speeds
 * up the boot cycle of ace
 */
export class ManifestGenerator {
	constructor(private basePath: string, private commands: string[], private isESM = false) {}

	/**
	 * Loads a given command from the disk. A command line can recursively
	 * exposed sub command paths. But they should be resolvable using
	 * the base path
	 */
	private async loadCommand(
		commandPath: string
	): Promise<{ command: CommandConstructorContract; commandPath: string }[]> {
		if (isAbsolute(commandPath)) {
			throw new Exception(
				'Absolute path to a command is not allowed when generating the manifest file'
			)
		}

		const resolved = resolveFrom(this.basePath, commandPath)
		const commandOrSubCommandsPaths = this.isESM ? await esmImport(resolved) : esmRequire(resolved)
		if (Array.isArray(commandOrSubCommandsPaths)) {
			return this.loadCommands(commandOrSubCommandsPaths)
		}

		/**
		 * File export has command constructor
		 */
		validateCommand(commandOrSubCommandsPaths, commandPath)

		return [
			{
				command: commandOrSubCommandsPaths,
				commandPath,
			},
		]
	}

	/**
	 * Loads all the commands from the disk recursively.
	 */
	private async loadCommands(
		commandPaths: string[]
	): Promise<{ command: CommandConstructorContract; commandPath: string }[]> {
		const result: { command: CommandConstructorContract; commandPath: string }[] = []
		for (const commandPath of commandPaths) {
			const command = await this.loadCommand(commandPath)
			result.push(...command)
		}
		return result
	}

	/**
	 * Generates and writes the ace manifest file to the base path
	 */
	public async generate() {
		const commands = await this.loadCommands(this.commands)

		const manifest = commands.reduce<ManifestNode>((result, { command, commandPath }) => {
			result[command.commandName] = {
				settings: command.settings || {},
				commandPath: commandPath.replace(new RegExp(`${extname(commandPath)}$`), ''),
				commandName: command.commandName,
				description: command.description,
				args: command.args,
				flags: command.flags,
			}
			return result
		}, {})

		await outputJSON(join(this.basePath, 'ace-manifest.json'), manifest)
	}
}
