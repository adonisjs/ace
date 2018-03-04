<a name="5.0.1"></a>
## [5.0.1](https://github.com/adonisjs/ace/compare/v5.0.0...v5.0.1) (2018-03-04)



<a name="5.0.0"></a>
# [5.0.0](https://github.com/adonisjs/ace/compare/v4.0.8...v5.0.0) (2018-02-07)


### Chores

* **prompts:** use enquirer over inquirer ([13eae0f](https://github.com/adonisjs/ace/commit/13eae0f))


### BREAKING CHANGES

* **prompts:** removed openEditor fn



<a name="4.0.8"></a>
## [4.0.8](https://github.com/adonisjs/ace/compare/v4.0.7...v4.0.8) (2018-01-19)


### Features

* **kernel:** expose method to listen for command errors ([ca34085](https://github.com/adonisjs/ace/commit/ca34085))

<a name="4.0.7"></a>
## [4.0.7](https://github.com/adonisjs/ace/compare/v4.0.5...v4.0.7) (2017-10-29)


### Bug Fixes

* **package:** update fs-extra to version 4.0.2 ([#65](https://github.com/adonisjs/ace/issues/65)) ([3bc49a2](https://github.com/adonisjs/ace/commit/3bc49a2))


<a name="4.0.6"></a>
## [4.0.6](https://github.com/adonisjs/ace/compare/v4.0.5...v4.0.6) (2017-09-24)


### Features

* **inquirer:** expose inquirer to be extended ([4415f32](https://github.com/adonisjs/ace/commit/4415f32))
* **question:** allow to pass extra inquirer options ([3d672ed](https://github.com/adonisjs/ace/commit/3d672ed))



<a name="4.0.5"></a>
## [4.0.5](https://github.com/adonisjs/ace/compare/v4.0.4...v4.0.5) (2017-08-18)


### Bug Fixes

* **readme-example:** arrow function are not allowed here ([#63](https://github.com/adonisjs/ace/issues/63)) ([1551ce9](https://github.com/adonisjs/ace/commit/1551ce9))



<a name="4.0.4"></a>
## [4.0.4](https://github.com/adonisjs/ace/compare/v4.0.3...v4.0.4) (2017-08-02)



<a name="4.0.3"></a>
## [4.0.3](https://github.com/adonisjs/ace/compare/v4.0.2...v4.0.3) (2017-07-28)



<a name="4.0.2"></a>
## [4.0.2](https://github.com/adonisjs/ace/compare/v4.0.1...v4.0.2) (2017-07-17)


### Bug Fixes

* **kernel:** use commander.command over commander.on ([09a25ad](https://github.com/adonisjs/ace/commit/09a25ad))


### Features

* **kernel:** show help when no command is executed ([0e65c76](https://github.com/adonisjs/ace/commit/0e65c76))



<a name="4.0.1"></a>
## [4.0.1](https://github.com/adonisjs/ace/compare/v4.0.0...v4.0.1) (2017-07-16)


### Bug Fixes

* **command:** look instance properties on command ([f9cb1e4](https://github.com/adonisjs/ace/commit/f9cb1e4))



<a name="4.0.0"></a>
# [4.0.0](https://github.com/adonisjs/ace/compare/v3.0.8...v4.0.0) (2017-07-16)


### Bug Fixes

* **test:** fix breaking test ([5a07228](https://github.com/adonisjs/ace/commit/5a07228))


### Features

* add basic functionality for commands ([02a9178](https://github.com/adonisjs/ace/commit/02a9178))
* **command:** add methods to copy and move files ([7216597](https://github.com/adonisjs/ace/commit/7216597))
* **command:** add readfile method ([af2b67e](https://github.com/adonisjs/ace/commit/af2b67e))
* **command:** use command.opts() over command._events ([e0bcade](https://github.com/adonisjs/ace/commit/e0bcade))
* **kernel:** add support for inline commands ([8ce9fdc](https://github.com/adonisjs/ace/commit/8ce9fdc))
* **question:** add support for questions ([24fd3ce](https://github.com/adonisjs/ace/commit/24fd3ce))
* **scaffolding:** add scaffolding commands ([257b09d](https://github.com/adonisjs/ace/commit/257b09d))



<a name="3.0.8"></a>
## [3.0.8](https://github.com/adonisjs/ace/compare/v3.0.7...v3.0.8) (2017-07-11)


### Bug Fixes

* **command:** use command.opts() over command._events ([da5e4e8](https://github.com/adonisjs/ace/commit/da5e4e8)), closes [#604](https://github.com/adonisjs/ace/issues/604)
* **package:** update node-exceptions to version 2.0.0 ([#49](https://github.com/adonisjs/ace/issues/49)) ([89dab62](https://github.com/adonisjs/ace/commit/89dab62))



<a name="3.0.7"></a>
## [3.0.7](https://github.com/adonisjs/ace/compare/v3.0.6...v3.0.7) (2017-02-25)


### Bug Fixes

* **package:** update inquirer to version 3.0.2 ([#45](https://github.com/adonisjs/ace/issues/45)) ([725c528](https://github.com/adonisjs/ace/commit/725c528))


### Features

* **console:** add extra help on help screen ([444e6e8](https://github.com/adonisjs/ace/commit/444e6e8))



<a name="3.0.6"></a>
## [3.0.6](https://github.com/adonisjs/ace/compare/v3.0.5...v3.0.6) (2017-01-26)


### Bug Fixes

* **kernel:** listen event for unknown commands ([25fbb2d](https://github.com/adonisjs/ace/commit/25fbb2d))
* **options:** Check if the option exists in camelCase ([#40](https://github.com/adonisjs/ace/issues/40)) ([f04cd46](https://github.com/adonisjs/ace/commit/f04cd46))



<a name="3.0.5"></a>
## [3.0.5](https://github.com/adonisjs/ace/compare/v3.0.4...v3.0.5) (2016-12-12)



<a name="3.0.4"></a>
## [3.0.4](https://github.com/adonisjs/ace/compare/v3.0.3...v3.0.4) (2016-09-26)


### Features

* **table:** add support for passing styles ([121d864](https://github.com/adonisjs/ace/commit/121d864))



<a name="3.0.3"></a>
## [3.0.3](https://github.com/adonisjs/ace/compare/v3.0.2...v3.0.3) (2016-09-26)



<a name="3.0.2"></a>
## 3.0.2 (2016-08-26)

* Update adonis-fold.

<a name="3.0.1"></a>
## 3.0.1 (2016-06-26)


### Bug Fixes

* Add missing dependency to package.json([effcba8](https://github.com/adonisjs/ace/commit/effcba8))


### Features

* Initiate 3.0([d4abbd7](https://github.com/adonisjs/ace/commit/d4abbd7))
* **ansi:** Add table support to command ansi([a6f111c](https://github.com/adonisjs/ace/commit/a6f111c))
* **command:** Add run method to execute commands within a command([55beb4e](https://github.com/adonisjs/ace/commit/55beb4e))
* **kernel:** add call method to kernel, add missing tests([bbe842f](https://github.com/adonisjs/ace/commit/bbe842f))



