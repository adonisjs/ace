# Adonis Ace :triangular_ruler:

Ace is powerful command line to create command line applications in Node.js and extensively used by Adonis framework.

This repo contains the code to use and build ace commands.

[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Appveyor][appveyor-image]][appveyor-url]
[![Coveralls][coveralls-image]][coveralls-url]

<img src="http://res.cloudinary.com/adonisjs/image/upload/q_100/v1497112678/adonis-purple_pzkmzt.svg" width="200px" align="right" hspace="30px" vspace="140px">

## What's in the box?

1. Colorful help screen.
2. Manage and register commands via `Es6 classes`.
3. Lean and simple API.
4. Inbuilt prompts.
5. Namespaced commands
6. Colorful messages via [chalk](https://npmjs.org/package/chalk).


![](http://res.cloudinary.com/adonisjs/image/upload/q_100/v1501173605/adonis-cli-help_qiqdsq.png)

## Setup

```bash
npm i --save @adonisjs/ace
```

Next create `index.js` file.

```js
const ace = require('@adonisjs/ace')
ace.command(
  'greet {name: Name of the user to greet}',
  'Command description',
  function ({ name }) {
   console.log(`Hello ${name}`)
 }
)

// Boot ace to execute commands
ace.wireUpWithCommander()
ace.invoke()
```

The command method expects three arguments as follows.

1. **signature**: The command signature to define the command name and the expected/required inputs.
2. **description**: The command description
3. **callback** Callback to run when command is executed. The callback will receive an object of `inputs` and `options`.

## Command as classes

Ace has first-class support for registering commands by passing `Es6 classes`.

Let's create a new command inside `Greet.js` file.

```js
const { Command } = require('@adonisjs/ace')

class Greet extends Command {

  static get signature () {
     return 'greet {name: Name of the user to greet}'
  }
  
  static get description () {
    return 'Command description'
  }
  
  async handle ({ name }) {
    console.log(`Hello ${name}`)
  }

}

module.exports = Greet 
```

Next is to register the command.

```js
const ace = require('@adonisjs/ace')

// register commands
ace.addCommand(require('./Greet'))

// Boot ace to execute commands
ace.wireUpWithCommander()
ace.invoke()
```

## Error handling
You can also listen for errors thrown by commands and display them the way you want.

```js
const ace = require('@adonisjs/ace')

ace.addCommand(require('./Greet'))

ace.onError(function (error, commandName) {
  console.log(`${commandName} reported ${error.message}`)
  process.exit(1)
})

// Boot ace to execute commands
ace.wireUpWithCommander()
ace.invoke()
```

## Node/OS Target

This repo/branch is supposed to run fine on all major OS platforms and targets `Node.js >=7.0`

## Development

Great! If you are planning to contribute to the framework, make sure to adhere to following conventions, since a consistent code-base is always joy to work with.

Run the following command to see list of available npm scripts.

```
npm run
```

### Tests & Linting

1. Lint your code using standardJs. Run `npm run lint` command to check if there are any linting errors.
2. Make sure you write tests for all the changes/bug fixes.
3. Also you can write **regression tests**, which shows that something is failing but doesn't breaks the build. Which is actually a nice way to show that something fails. Regression tests are written using `test.failing()` method.
4. Make sure all the tests are passing on `travis` and `appveyor`.

### General Practices

Since Es6 is in, you should strive to use latest features. For example:

1. Use `Spread` over `arguments` keyword.
2. Never use `bind` or `call`. After calling these methods, we cannot guarantee the scope of any methods and in AdonisJs codebase we do not override the methods scope.
3. Make sure to write proper docblock.

## Issues & PR

It is always helpful if we try to follow certain practices when creating issues or PR's, since it will save everyone's time.

1. Always try creating regression tests when you find a bug (if possible).
2. Share some context on what you are trying to do, with enough code to reproduce the issue.
3. For general questions, please create a forum thread.
4. When creating a PR for a feature, make sure to create a parallel PR for docs too.

## Documentation
You can learn more about ace in the [official documentation](https://adonisjs.com/docs/ace)

[appveyor-image]: https://img.shields.io/appveyor/ci/thetutlage/ace/master.svg?style=flat-square

[appveyor-url]: https://ci.appveyor.com/project/thetutlage/ace

[npm-image]: https://img.shields.io/npm/v/@adonisjs/ace.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@adonisjs/ace

[travis-image]: https://img.shields.io/travis/adonisjs/ace/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/adonisjs/ace

[coveralls-image]: https://img.shields.io/coveralls/adonisjs/ace/develop.svg?style=flat-square

[coveralls-url]: https://coveralls.io/github/adonisjs/ace
