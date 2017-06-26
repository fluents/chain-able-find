// https://github.com/isaacs/node-glob/blob/master/benchmark.sh

// may need pseudo async mode by returning a promise

const fs = require('fs')
const test = require('ava')
const log = require('fliplog')
const m = require('../src')

const cwd = process.cwd()
// console.log({cwd})
const fixture = ['a.tmp', 'b.tmp', 'c.tmp', 'd.tmp', 'e.tmp']
const generate = () => {
  log.bold('generate fixtures').echo(false)
  try {
    fs.mkdirSync('tmp')
    fixture.forEach(fs.writeFileSync.bind(fs))
  }
  catch (e) {
    console.log(e)
    // ignore
  }
}
const cleanup = () => {
  log.red('cleanup fixtures').echo(false)
  try {
    fs.rmdirSync('tmp')
    fixture.forEach(fs.unlinkSync.bind(fs))
  }
  catch (e) {
    // ignore
  }
}

test.before(generate)
test.after(cleanup)

test('glob - sync', t => {
  try {
    // require('fliplog').quick({two: m(['!*.tmp', 'a.tmp'])})
    // require('fliplog').quick({one: m('*.tmp'), two: m(['!*.tmp', 'a.tmp'])})
    t.deepEqual(m('*.tmp'), ['a.tmp', 'b.tmp', 'c.tmp', 'd.tmp', 'e.tmp'])
    t.deepEqual(m(['!*.tmp', 'a.tmp']), ['a.tmp'])
  }
  catch (e) {
    console.log(e)
    cleanup()
    t.fail(e)
  }
})

test('glob - async', async t => {
  t.deepEqual(await m('*.tmp', {sync: false}), [
    'a.tmp',
    'b.tmp',
    'c.tmp',
    'd.tmp',
    'e.tmp',
  ])
})

test('respect patterns order - async', async t => {
  t.deepEqual(await m(['!*.tmp', 'a.tmp'], {sync: false}), ['a.tmp'])
})

test('return [] for all negative patterns - sync', t => {
  t.deepEqual(m(['!a.tmp', '!b.tmp']), [])
})

test('return [] for all negative patterns - async', async t => {
  t.deepEqual(await m(['!a.tmp', '!b.tmp'], {sync: false}), [])
})

test.skip.failing('glob expansion', t => {
  t.deepEqual(m(['a.tmp', '*.tmp', '!{c,d,e}.tmp']), ['a.tmp', 'b.tmp'])
})

test.skip.failing('glob with multiple patterns expansion - async', async t => {
  t.deepEqual(await m(['a.tmp', '*.tmp', '!{c,d,e}.tmp']), ['a.tmp', 'b.tmp'])
})
