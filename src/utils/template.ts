import { readFileSync } from 'fs'

export function template (tpl, data) {
  return tpl.replace(/\$\{([a-zA-Z0-9_-]*)}/g, (_, p1: string) => {
    if (!(p1 in data)) {
      throw new Error(`Missing value for "${p1}"`)
    }
    return String(data[p1])
  })
}

export function templateFromFile (file: string, data: object): string {
  const contents = readFileSync(file, 'utf8')
  return template(contents, data)
}
