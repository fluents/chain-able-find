const {resolve} = require('path')
const log = require('fliplog')
const ff = require('../src/index')

const entry = resolve(__dirname, '../test/fixture')
const found = ff
  .init()
  .recursive(true)
  .ignoreDirs(['ignant'])
  .matchFiles(['**/*.js'])
  .abs(true)
  .sync(true)
  .find(entry)
  .results()

log.quick(found)
