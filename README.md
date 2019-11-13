<div align="center">
  <img src="https://res.cloudinary.com/adonisjs/image/upload/q_100/v1558612869/adonis-readme_zscycu.jpg" width="600px">
</div>

# Ace
> Node.js framework for creating command line applications. Used by AdonisJs

[![circleci-image]][circleci-url] [![npm-image]][npm-url] ![](https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of contents

- [Usage](#usage)
- [Displaying help](#displaying-help)
- [Decorators](#decorators)
    - [args.string](#argsstring)
    - [args.spread](#argsspread)
    - [flags.boolean](#flagsboolean)
    - [flags.string](#flagsstring)
    - [flags.array](#flagsarray)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Usage
Install the package from npm registry as follows:

```sh
npm i @adonisjs/ace

# yarn
yarn add @adonisjs/ace
```

And then use it as follows:

```ts
import {
  Kernel,
  BaseCommand,
  args,
  flags
} from '@adonisjs/ace'

import { Ioc } from '@adonisjs/fold'
import { Application } from '@adonisjs/application/build/standalone'

class Make extends BaseCommand {
  @args.string()
  public resource: string

  @args.string()
  public name: string

  @flags.boolean()
  public overwrite: boolean
  
  public static commandName = 'make'
  public static description = 'Make a new resource'
  
  // called when the command is executed
  async handle () {
    console.log(this.name)
    console.log(this.resource)
    console.log(this.overwrite)
  }  
}

const application = new Application(__dirname, new Ioc(), {}, {})
const kernel = new Kernel(app)
kernel.register([Make]) 

kernel.handle(process.argv.splice(2))
```

## Displaying help
Ace doesn't hijack any flags or commands to display the help. You are free to decide when and how to show the help screen.

```ts
import { Kernel, BaseCommand } from '@adonisjs/ace'

import { Ioc } from '@adonisjs/fold'
import { Application } from '@adonisjs/application/build/standalone'

const application = new Application(__dirname, new Ioc(), {}, {})
const kernel = new Kernel(app)

kernel.flag('help', (value, options, command) => {
  if (!value) {
    return
  }

  /**
   * When a command is not defined, then it will show
   * help for all the commands
   */
  Kernel.printHelp(command)
  process.exit(0)
})

kernel.handle(process.argv.splice(2))
```

## Decorators
The module comes with ES6 decorators to define arguments and flags for a given command.

#### args.string
Define an argument. To make the argument optional, you can set the `required` property to false

```ts
args.string({ required: false })
```

You can also define the argument description as follows:

```ts
args.string({ description: 'The resource type to create' })
```

#### args.spread
Argument that receives all of the remaining values passed as arguments to a given command. Think of it as a spread operator in Javascript.

```ts
class Make extends BaseCommand {
  @args.spread({ description: 'One or more files' })
  public files: string[]
}
```
 
#### flags.boolean

Define a flag that accepts a `boolean` value.

#### flags.string

Define a flag that accepts a `string` value.

#### flags.array

Define a flag that accepts an array of values.

You can also define description for a flag, similar to the arg. Also, a flag can define aliases and the default values.

```ts
class Make extends BaseCommand {

  flags.string({
    alias: 'r',
    description: 'The resource name',
    default: 'controller',
  })
  resource: string
}
```


MIT License, see the included [MIT](LICENSE.md) file.

[circleci-image]: https://img.shields.io/circleci/project/github/adonisjs/ace/master.svg?style=for-the-badge&logo=circleci
[circleci-url]: https://circleci.com/gh/adonisjs/ace "circleci"

[npm-image]: https://img.shields.io/npm/v/@adonisjs/ace.svg?style=for-the-badge&logo=npm
[npm-url]: https://npmjs.org/package/@adonisjs/ace "npm"
