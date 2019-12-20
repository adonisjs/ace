# Ace

Ace is command line framework embedded into AdonisJS for creating CLI commands. AdonisJS is the only Node.js framework that allows creating CLI commands as part of the application codebase.

## Why you need a command line framework

Many developers see project scaffolding as the only use case for CLI commands. However, a backend service or application often needs CLI commands for many other tasks like

1. Running database migrations.
2. Seeding database with some initial dummy data.
3. Starting background jobs process for handling queue jobs.

Normally you will find yourself writing scripts for handling the above mentioned tasks and with every script you have to write all the boilerplate code for booting the application before your script can do it's job.

If your scripts relies on user arguments and flags, then you will have to write code for handling them as well. Quickly, each script will turn into a mini command of it's own.

## Registering commands
The commands lives inside the `commands` directory of the application root.
