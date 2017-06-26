const {readdirSync, lstatSync} = require('fs')
const Chain = require('chain-able')
const doesInclude = require('./modules/does-include')
const globToRegExp = require('./modules/glob-to-regex')

let cache = {}

/**
 * @see flipfile/isDir
 * @since  0.0.1
 * @desc   uses lstatSync
 * @param  {string}  path
 * @return {boolean} title says it all
 */
function isDir(path) {
  var stat = lstatSync(path)
  return stat && stat.isDirectory()
}

/**
 * @type {Chain}
 */
class Christopher extends Chain {
  /**
   * @param {Chainable | *} [parent=null]
   */
  constructor(parent = null) {
    super(parent)

    // alias
    this.matchFiles = this.test.bind(this)
    this.walkin = this.find.bind(this)

    /* prettier-ignore */
    this
      .extend([
        'recursive',
        'cwd',
        'dir',
        'ignoreDirs',
        'includeFiles',
        'includeDirs', // @TODO
        'entry',       // @TODO
        'maxDepth',
        'depth',
        'sync',
        'abs',
        'cache',
      ])
      .maxDepth(1000000)
      .recursive(true)
      .sync(true)
      .depth(0)
      .abs(false)
      .cache(true)
  }

  /**
   * @since 0.0.1
   * @desc static factory
   * @param {Chainable | *} [parent=null]
   * @return {Christopher} @chainable
   */
  static init(parent) {
    return new Christopher(parent)
  }

  /**
   * @alias matchFiles
   * @since 0.0.1
   * @desc test these files with globs
   * @param  {Array<string>} globs title says it all
   * @return {Christopher} @chainable
   */
  test(globs) {
    // if string, set as arr
    if (typeof globs === 'string') {
      globs = [globs]
    }

    const regexes = globs.map(glob => {
      let negated = false
      if (glob.includes('!') === true) {
        negated = true
        // glob = glob.replace(/[!]/g, '')
      }
      return {
        // , {globstar: true}
        regex: globToRegExp(glob),
        negated,
      }
    })

    const matcher = file => {
      for (let r = 0; r < regexes.length; r++) {
        const {negated, regex} = regexes[r]
        if (negated === true) {
          if (regex.test(file) === true) {
            return false
          }
        }
        else if (regex.test(file) === true) {
          return true
        }
      }
      return false
    }

    return this.set('matchFiles', matcher).set('matchGlobs', globs)
  }

  /**
   * @since 0.0.1
   * @desc when matchFiles, checks the regexes to re-filter
   * @param  {string} paths filter them all if needed
   * @return {string}
   */
  filter(paths) {
    if (this.has('matchFiles') === false) return paths

    const debug = this.get('debug') || true
    const matcher = this.get('matchFiles')
    const satisfied = []

    for (let i = 0; i < paths.length; i++) {
      const found = paths[i]
      if (matcher(paths[i]) === true) {
        satisfied.push(found)
      }
      else if (debug === true) {
        // console.log('not satisfied: ', found)
      }
    }
    return satisfied
  }

  /**
   * @protected
   * @since 0.0.1
   * @see does-include
   * @desc check if this.ignoreDirs has it
   * @param  {string} path chickidy check
   * @return {boolean} title says it all
   */
  aintIgnored(path) {
    if (this.has('ignoreDirs') === false) return true

    const ignore = this.get('ignoreDirs')

    return doesInclude(path, ignore) === false
  }

  /**
   * @protected
   * @TODO @debug depth, findings, dir, satisfied, ignored
   * @since 0.0.1
   * @return {Array<string>} directory listing
   */
  readDir() {
    const dir = this.get('dir')
    const depth = this.get('depth')
    const findings = readdirSync(dir)

    const satisfied = []
    for (let i = 0; i < findings.length; i++) {
      const found = findings[i]
      if (this.aintIgnored(found) === true) {
        satisfied.push(found)
      }
    }

    this.depth(depth + 1)

    return satisfied
  }

  /**
   * @protected
   * @desc terry fox the paths, #runaround
   *       checks if depth is below max
   *       checks ignored
   *       walks the path
   *       pushes satisfied to array
   *
   * @since 0.0.1
   * @see does-include
   * @see this.ignoreDirs,
   * @see this.maxDepth,
   * @see this.depth,
   * @see this.dir
   * @param  {string} path path to look through
   * @param  {string} results push to this array if satisfied
   * @return {void}
   */
  terry(path, results) {
    if (this.get('maxDepth') <= this.get('depth')) return

    const ignore = this.get('ignoreDirs')
    const findings = this.dir(path).walk()

    for (let ii = 0; ii < findings.length; ii++) {
      const found = findings[ii]
      if (ignore === undefined || doesInclude(found, ignore) === false) {
        results.push(found)
      }
    }
  }

  /**
   * @protected
   * @desc walk down [recursively], filter results
   * @since 0.0.1
   * @return {Array<string>} paths found satisfying
   */
  walk() {
    const dir = this.get('dir')
    const dirSlash = dir + '/'
    const recursive = this.get('recursive')
    const list = this.readDir()
    const results = []
    // console.log('calling walk ', dir)

    for (let i = 0; i < list.length; i++) {
      const file = list[i]
      const path = dirSlash + file
      const isDirp = isDir(path)

      if (recursive === true) {
        if (isDirp === true) {
          this.terry(path, results)
        }
        else if (this.aintIgnored(path) === true) {
          results.push(path)
        }
      }
      else if (isDirp === true && this.aintIgnored(path) === true) {
        results.push(path)
      }
    }

    if (this.get('abs') === false) {
      return results.map(result => result.replace(dirSlash, ''))
    }

    return results
  }

  /**
   * @desc christopher walkin that dir
   *       starts from a dir,
   *       stringifies options for cache,
   *       walks the walk, filters
   *
   * @since 0.0.1
   * @param  {string} [dir=process.cwd()] starting point
   * @return {Array<string>} results
   */
  found(dir = null) {
    if (dir === null) dir = process.cwd()
    const chris = this.dir(dir)
    const sync = this.get('sync')
    const cacheEnabled = this.get('cache')
    // console.log('calling found')

    let hash = ''
    if (cacheEnabled === true) {
      // this takes ~7 microseconds to "hash"
      hash += 'recursive:' + chris.get('recursive')
      hash += 'dir:' + chris.get('dir')
      hash += 'ignoreDirs:' + chris.get('ignoreDirs')
      hash += 'includeFiles:' + chris.get('includeFiles')
      hash += 'maxDepth:' + chris.get('maxDepth')
      hash += 'sync:' + sync
      hash += 'abs:' + chris.get('abs')
      hash += 'matchGlobs:' + chris.get('matchGlobs').join(',')

      if (cache[hash] !== undefined) {
        if (this.get('debug') === true) {
          console.log('using cache')
        }
        return cache[hash]
      }
    }

    const result = chris.walk()
    const found = this.filter(result)

    if (cacheEnabled === true) {
      cache[hash] = found
    }

    // emulate async, for compatibility with promise chains
    if (sync === false) {
      return new Promise(presolve => setTimeout(() => presolve(found), 1))
    }

    return found
  }

  find(dir = null) {
    this.set('cwd', dir)
    this.results = () => this.found(dir)
    return this
  }
}

/**
 * @desc return a new Christopher, or extract options and return results
 * @param {Array<string> | string | null} [globs=null] should extract the folders from the globs
 * @param {Object} options
 * @return {Christopher | Array<string>}
 */
function LilBunnyFooFoo(globs = null, options = {}) {
  const chris = Christopher.init()

  const isArr = Array.isArray(globs)

  if (!options.cwd && !options.dir) {
    options.cwd = process.cwd()
    options.dir = process.cwd()
  }
  // if using a single argument
  if (globs !== null && typeof globs === 'object' && !isArr) {
    // console.log('object globs')
    options = globs // eslint-disable-line
    globs = options.test // eslint-disable-line
  }
  else if (globs === undefined || (typeof globs !== 'string' && !isArr)) {
    // console.log('no globs, using class')
    // if passing in no options, return the instance
    return chris
  }

  // console.log('array globs with possible options')

  chris.test(globs)

  if (options.sync !== undefined) {
    chris.sync(options.sync)
  }
  if (options.ignoreDirs !== undefined) {
    chris.ignoreDirs(options.ignoreDirs)
  }
  if (options.abs !== undefined) {
    chris.abs(options.abs)
  }
  else if (options.absolute !== undefined) {
    chris.abs(options.absolute)
  }
  if (options.recursive !== undefined) {
    chris.recursive(options.recursive)
  }
  if (options.maxDepth !== undefined) {
    chris.maxDepth(options.maxDepth)
  }
  if (options.cache !== undefined) {
    chris.cache(options.cache)
  }

  return chris.find(options.cwd).results()
}

LilBunnyFooFoo.init = Christopher.init
LilBunnyFooFoo.Christopher = Christopher
LilBunnyFooFoo.fn = LilBunnyFooFoo
LilBunnyFooFoo.up = () => require('./pkgup') // would want to .get

module.exports = LilBunnyFooFoo
