// should use mono root and fliphub resolve code
// to walk up as needed
// and simply check if the __dirname includes node_modules
// to allow it to work with symlinks
// also check require.main which they already do

// const timer = require('fliptime')
// timer.start('up')

// timer.start('arp1')
// const arp1 = require('app-root-path').toString()
// timer.stop('arp1').log('arp1')

// timer.start('arp')
const arp = require('./arp')(__dirname)
// timer.stop('arp')

const {dirname} = require('path')
const {upDir, hasPkg, splitSlashAndPop, isReal} = require('./deps')

let cache = {}
// timer.start('hashpath')

// store in node config
// if run via npm, would be able to easily find
const Paths = {
  appRootPath: arp,
  self: __dirname,
  main: require.main.filename,
  mainDir: dirname(require.main.filename),
  cwd: process.cwd(),
  PWD: process.env.PWD,
  PATH: process.env.PATH,
  OLDPWD: process.env.OLDPWD,
  HOME: process.env.HOME,
}

const hash =
  Paths.appRootPath + Paths.self + Paths.main + Paths.cwd + Paths.OLDPWD
// timer.stop('hashpath')

// timer.start('config')
// const Config = require('./minconfig')
// const config = new Config(hash)
// const hashedInConfig = config.get(hash)
// console.log({hashedInConfig}, config.get(hash), config.has(hash))
// timer.stop('config')

const paths = {
  dirStack: [],
  stack: [], // level would be the index?
  found: false,
}

// use the path utils in flipfile
class Up {
  /**
   * @param  {Object} opts options
   */
  constructor(opts) {
    const defaults = {
      depth: 10,
      asObj: false,
      file: 'package.json',
      dir: false,
      require: true,
      prefer: 'near',
      asDir: false, // instead of file
      greedy: true,
      debug: false,
    }
    let args = Object.assign(defaults, opts)
    this.opts = args
    this.has = hasPkg.bind(null, args.file)
    this.Paths = Paths
    this.paths = paths
  }

  /**
   * @return {string} nearest path that has it
   */
  nearest() {
    return this.paths.stack
      .slice(0)
      .filter(finding => finding.found)
      .map(finding => finding.dir)
      .sort((a, b) => a.length - b.length)
      .pop()
  }

  /**
   * @return {string} farthest path that has it
   */
  farthest() {
    return this.paths.stack
      .slice(0)
      .filter(finding => finding.found)
      .map(finding => finding.dir)
      .sort((a, b) => b.length - a.length)
      .pop()
  }

  /**
   * @return {string} preferred distance path
   */
  getPreferred() {
    if (this.opts.prefer === 'near') return this.nearest()
    return this.farthest()
  }

  _get() {
    const file = this.getPreferred() + '/' + this.opts.file
    // require('fliplog').quick(this.paths.stack, file)

    if (this.opts.require === true) {
      try {
        const required = require(file) // eslint-disable-line
        return {required, file}
      }
      catch (e) {
        // ignore
      }
    }
    return {file, required: file}
  }

  /**
   * @return {string | any} path or required
   */
  get() {
    if (this.opts.asObj) return this

    const {file, required} = this._get()

    // config.set(hash, file)
    cache[hash] = file

    return required
  }

  /**
   * @return {boolean}
   */
  insideNodeModules() {
    return Paths.appRootPath.includes('node_modules')
  }

  /**
   * @example when run by a bundler
   * @return {boolean}
   */
  mainInsideNodeModules() {
    return Paths.main.includes('node_modules')
  }

  /**
   * @return {string | boolean} highest working directory
   */
  highestWd() {
    const {cwd, PWD, OLDPWD} = Paths
    if (PWD.includes(OLDPWD)) return PWD
    if (cwd.includes(OLDPWD)) return cwd
    // if (OLDPWD.includes(PWD)) return OLDPWD
    return cwd
  }

  /**
   * @return {Up} @chainable
   */
  start() {
    const {greedy, dir} = this.opts
    let found = false

    if (cache[hash] && !cache[hash].includes('undefined')) {
      // console.log(config.get(hash), 'WHAT')
      // this.paths.stack = [cache[hash]]
      return this
    }

    if (dir !== false) {
      found = this.find(dir)
    }

    if (greedy === true || !this.insideNodeModules()) {
      // console.log('not inside node modules', Paths.appRootPath)
      found = this.find(Paths.appRootPath)
    }

    // console.log({found}, 'insideNodeModules', this.mainInsideNodeModules())
    if (greedy === true || !found & (this.mainInsideNodeModules() === false)) {
      // console.log('maindir', Paths.mainDir)
      found = this.find(Paths.mainDir)
    }
    // console.log({found})

    const wd = this.highestWd()
    if (wd && (greedy === true || !found)) {
      // console.log('highest wd', wd)
      found = this.find(wd)
    }
    // console.log({found})

    return this
  }

  attempt(attempt) {
    const found = this.has(attempt)

    const findings = {
      found,
      dir: attempt,
    }

    this.paths.dirStack.push(attempt)
    this.paths.stack.push(findings)

    if (findings.found === true) this.paths.found = findings

    return this
  }

  // start from
  find(start) {
    const {depth} = this.opts
    let attempt = start

    // ignore off of the bat if already includes start
    if (this.paths.dirStack.includes(attempt)) return this.paths.found

    // attempt with the start
    this.attempt(attempt)

    // keep going, check if it has the file
    for (let i = 0; i < depth; i++) {
      attempt = upDir(attempt)

      if (this.paths.dirStack.includes(attempt)) return this.paths.found

      if (isReal(attempt) === false) continue

      if (attempt === Paths.HOME) return this.paths.found

      this.attempt(attempt)
    }

    return this.paths.found
  }
}

/**
 * @param {string} [dir=null]
 * @return {Object} pkg
 */
function getPkg(dir = process.env.APP_ROOT_PATH || false) {
  let opts = {}
  if (typeof dir === 'string') opts.dir = dir
  else if (opts !== false) Object.assign(opts, dir)
  else opts = false
  const up = new Up(opts)
  up.toString = getPkg.toString
  return up.start()
}

getPkg.Paths = Paths
getPkg.toString = (opts = {}) => {
  if (cache[hash] && !cache[hash].includes('undefined')) return cache[hash]
  return getPkg(Object.assign({}, opts)).get()
}
getPkg.toObj = (opts = {}) => {
  return getPkg(Object.assign({asObj: true}, opts))
}

module.exports = getPkg
