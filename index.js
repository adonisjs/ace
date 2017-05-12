#!/usr/bin/env node
const omelette = require('omelette')

const firstArgument = ({ reply }) => {
  reply([ 'beautiful', 'cruel', 'far' ])
}

const planet = ({ reply }) => {
  reply([ 'world', 'mars', 'pluto' ])
}

omelette`hello|hi ${firstArgument} ${planet}`.init()
