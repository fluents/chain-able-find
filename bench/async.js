const {resolve} = require('path')
const log = require('fliplog')
const globby = require('globby')
const Bench = require('../../bench-chain')
const Chris = require('../src/chris')

const entry = resolve(__dirname, '../test/fixture')

const chris = new Chris()
const sleep = sleepDuration =>
  new Promise(presolve => setTimeout(presolve, sleepDuration))

Bench.init(__dirname, 'fluent-find-glob-cache-async')
  // .name('chris-vs-globby')
  .tags('caching,async')
  .addAsync('chris', async done => {
    chris
      .recursive(true)
      .ignoreDirs(['ignant'])
      .matchFiles(['**/*.js'])
      .walkin(entry)
    await sleep(1)
    return done()
  })
  .addAsync('glob', async done => {
    await sleep(1)
    return globby(['fixture/**/*.js'], ['!ignant/**', '!ignant'], {
      cwd: entry,
      absolute: true,
    }).then(d => {
      done()
    })
  })
  .run()
