const {resolve} = require('path')
const ff = require('../src/chris')

const entry = resolve(__dirname, '../test/fixture')
const found = ff({
  test: ['**/*.js'],
  recursive: true,
  ignoreDirs: ['ignant'],
  abs: true,
  sync: true,
  cwd: entry,
})

console.log(found)
