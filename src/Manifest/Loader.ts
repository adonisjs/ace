/*
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { readJSON } from 'fs-extra'
import { esmRequire, resolveFrom } from '@poppinss/utils'
import {
	ManifestNode,
	ManifestCommand,
	ManifestLoaderContract,
	CommandConstructorContract,
} from '../Contracts'
import { validateCommand } from '../utils/validateCommand'
import { pathToFileURL } from 'url'

async function esmImport(path: string) {
	const module = await import(pathToFileURL(path).href)
	if (module.__esModule) {
		return module.default.default
	}
	return module.default
}

/**
 * The manifest loader exposes the API to load ace commands from one
 * or more manifest files.
 */
export class ManifestLoader implements ManifestLoaderContract {
	private manifestFiles: { commands: ManifestNode; basePath: string }[] = []

	public booted: boolean = false

	/**
	 * Loads the manifest file from the disk
	 */
	private async loadManifestFile(file: { basePath: string; manifestAbsPath: string }) {
		const manifestCommands = await readJSON(file.manifestAbsPath)
		return { basePath: file.basePath, commands: manifestCommands }
	}

	constructor(
		private files: { basePath: string; manifestAbsPath: string }[],
		private isESM = false
	) {}

	/**
	 * Boot manifest loader to read all manifest files from the disk
	 */
	public async boot() {
		if (this.booted) {
			return
		}

		this.booted = true
		this.manifestFiles = await Promise.all(this.files.map((file) => this.loadManifestFile(file)))
	}

	/**
	 * Returns base path for a given command
	 */
	public getCommandBasePath(commandName: string): string | undefined {
		return this.manifestFiles.find(({ commands }) => {
			return commands[commandName]
		})?.basePath
	}

	/**
	 * Returns manifest command node. One must load the command
	 * in order to use it
	 */
	public getCommand(
		commandName: string
	): { basePath: string; command: ManifestCommand } | undefined {
		const manifestCommands = this.manifestFiles.find(({ commands }) => {
			return commands[commandName]
		})

		if (!manifestCommands) {
			return
		}

		return {
			basePath: manifestCommands.basePath,
			command: manifestCommands.commands[commandName],
		}
	}

	/**
	 * Find if a command exists or not
	 */
	public hasCommand(commandName: string): boolean {
		return !!this.getCommandBasePath(commandName)
	}

	/**
	 * Load command from the disk. Make sure to use [[hasCommand]] before
	 * calling this method
	 */
	public async loadCommand(commandName: string): Promise<CommandConstructorContract> {
		const { basePath, command } = this.getCommand(commandName)!
		const resolved = resolveFrom(basePath, command.commandPath)
		const commandConstructor = this.isESM ? await esmImport(resolved) : esmRequire(resolved)
		validateCommand(commandConstructor)
		return commandConstructor
	}

	/**
	 * Returns an array of manifest commands
	 */
	public getCommands(): ManifestCommand[] {
		return this.manifestFiles.reduce<ManifestCommand[]>((result, { commands }) => {
			Object.keys(commands).forEach((commandName) => {
				result = result.concat(commands[commandName])
			})

			return result
		}, [])
	}
}
