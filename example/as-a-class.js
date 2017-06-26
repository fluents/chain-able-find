// https://github.com/substack/node-findit
const {resolve} = require('path')
const log = require('fliplog')
const Chris = require('../src')

const entry = resolve(__dirname, '../test/fixture')
const chris = new Chris()
const found = chris
  .abs(true)
  .sync(true)
  .recursive(true)
  .ignoreDirs(['ignant'])
  .test(['**/*.js'])
  .find(entry)
  .results()

log.quick(found)
