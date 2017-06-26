const {resolve} = require('path')
const log = require('fliplog')
const globby = require('globby')
const Bench = require('../../bench-chain')
const Chris = require('../src/chris')

const entry = resolve(__dirname, '../test/fixture')
const chris = new Chris()

Bench.init(__dirname, 'fluent-find-glob-cache')
  .tags('caching')
  .add('chris', () => {
    chris
      .recursive(true)
      .ignoreDirs(['ignant'])
      .matchFiles(['**/*.js'])
      .walkin(entry)
  })
  .add('glob', () => {
    globby.sync(['fixture/**/*.js'], ['!ignant/**', '!ignant'], {
      cwd: entry,
      absolute: true,
    })
  })
  .run()
