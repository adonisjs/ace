'use strict'

/**
 * adonis-ace
 * Copyright(c) 2015-2015 Harminder Virk
 * MIT Licensed
*/

const chai = require('chai')
const expect = chai.expect
const Parser = require('../src/Parser')

describe('Parser', function() {

  it('should parse signature to find command arguments', function () {
    const parsed = Parser.parseSignature('{name} {age}')
    expect(parsed.args).to.be.an('array')
    expect(parsed.args).to.have.length(2)
  })

  it('should parse signature to find command flags', function () {
    const parsed = Parser.parseSignature('{name} {--age}')
    expect(parsed.args).to.be.an('array')
    expect(parsed.args).to.have.length(1)
    expect(parsed.flags).to.be.an('array')
    expect(parsed.flags).to.have.length(1)
  })

  it('should tell whether argument is optional or not', function () {
    const parsed = Parser.parseSignature('{name?}')
    expect(parsed.args).to.be.an('array')
    expect(parsed.args).to.have.length(1)
    expect(parsed.args[0].optional).to.equal(true)
  })

  it('should find argument default value', function () {
    const parsed = Parser.parseSignature('{name?=virk}')
    expect(parsed.args).to.be.an('array')
    expect(parsed.args).to.have.length(1)
    expect(parsed.args[0].defaultValue).to.equal('virk')
  })

  it('should read argument description', function () {
    const parsed = Parser.parseSignature('{name=virk : Enter your username}')
    expect(parsed.args).to.be.an('array')
    expect(parsed.args).to.have.length(1)
    expect(parsed.args[0].description).to.equal('Enter your username')
  })

  it('should parse multiple options', function () {
    const parsed = Parser.parseSignature('{name=virk : Enter your username} {age : Enter your age}')
    expect(parsed.args).to.be.an('array')
    expect(parsed.args).to.have.length(2)
    expect(parsed.args[0].description).to.equal('Enter your username')
    expect(parsed.args[1].description).to.equal('Enter your age')
  })

  it('should make flags accept values', function () {
    const parsed = Parser.parseSignature('{--name=@value}')
    expect(parsed.flags).to.be.an('array')
    expect(parsed.flags).to.have.length(1)
    expect(parsed.flags[0].defaultValue).to.equal('@value')
  })

  it('should return option name', function () {
    const parsed = Parser.parseSignature('{name}')
    expect(parsed.args[0].name).to.equal('name')
  })

  it('should return option name when option is optional', function () {
    const parsed = Parser.parseSignature('{name?}')
    expect(parsed.args[0].name).to.equal('name')
  })

  it('should return option name when option has a default value', function () {
    const parsed = Parser.parseSignature('{name?=virk}')
    expect(parsed.args[0].name).to.equal('name')
  })

  it('should return option name when option has a description', function () {
    const parsed = Parser.parseSignature('{name?=virk:This is a name}')
    expect(parsed.args[0].name).to.equal('name')
    expect(parsed.args[0].description).to.equal('This is a name')
    expect(parsed.args[0].defaultValue).to.equal('virk')
    expect(parsed.args[0].optional).to.equal(true)
  })

});
