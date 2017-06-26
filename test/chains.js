// const {resolve} = require('path')
// const log = require('fliplog')
// const Chris = require('../src/chris')
//
// const entry = resolve(__dirname, '../test/fixture')
// const chris = new Chris()
// const found = chris
//   .recursive(true)
//   .ignoreDirs(['ignant'])
//   .test(['**/*.js'])
//   .find(entry)
//
// log.quick(found)
const {resolve} = require('path')
const test = require('ava')
const log = require('fliplog')
const {Christopher} = require('../src')
const Chris = require('../src')

const entry = resolve(__dirname, './fixture')

test('instiate as a class', t => {
  const chris = new Christopher()
  const chrisFromFn = new Chris()

  t.true(chris instanceof Christopher)
  t.true(chrisFromFn instanceof Christopher)
})

test('instiate find using chains', t => {
  const chris = new Christopher()

  const found = chris
    .recursive(true)
    .ignoreDirs(['ignant'])
    .test(['**/*.js'])
    .abs(true)
    .sync(true)
    .find(entry)
    .results()

  t.deepEqual(
    found.sort(),
    [
      'eh.js',
      'nested/balls.js',
      'nested/ehs/down/eh.js',
      'nested/ehs/eheh.js',
      'nananenano.js',
    ]
      .map(file => entry + '/' + file)
      .sort()
  )

  // require('fliplog').quick({found, chris, entry})
})

test('can pass in all chainable fns as an obj with options', t => {
  const found = Chris(['**/*.js'], {
    recursive: true,
    ignoreDirs: ['ignant'],
    abs: true,
    sync: true,
    cwd: entry,
  })

  t.deepEqual(
    found.sort(),
    [
      'eh.js',
      'nested/balls.js',
      'nested/ehs/down/eh.js',
      'nested/ehs/eheh.js',
      'nananenano.js',
    ]
      .map(file => entry + '/' + file)
      .sort()
  )
})

test('can pass in all options as a single object', t => {
  const found = Chris({
    test: ['**/*.js'],
    recursive: true,
    ignoreDirs: ['ignant'],
    abs: true,
    sync: true,
    cwd: entry,
  })

  t.deepEqual(
    found.sort(),
    [
      'eh.js',
      'nested/balls.js',
      'nested/ehs/down/eh.js',
      'nested/ehs/eheh.js',
      'nananenano.js',
    ]
      .map(file => entry + '/' + file)
      .sort()
  )
})
