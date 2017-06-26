// const timer = require('fliptime')
// timer.start('deps')

const {join, dirname} = require('path')
const {readFileSync, writeFileSync, existsSync} = require('fs')
const os = require('os')
// const mkdirp = require('mkdirp').sync
// const writeFileAtomic = require('write-file-atomic').sync

function rand(min = 1, max = 1000) {
  // eslint-disable-next-line no-mixed-operators
  return Math.floor(Math.random() * (max - min + 1) + min)
}

const home = os.homedir()
// const rando = len =>
//   randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len)

// timer.stop('deps').log('deps')
// timer.start('config-vars')
let configDir = process.env.XDG_CONFIG_HOME
if (!configDir && home) configDir = join(home, '.config')
else if (!configDir) configDir = join(os.tmpdir(), rand(32)) // eslint-disable-line

const permissionError = 'You don\'t have access to this file.'
const defaultPathMode = 0o0700
const writeFileOptions = {mode: 0o0600}
// timer.stop('config-vars').log('config-vars')

// @TODO @NOTE `get` + `try catch` could deopt easily
class Configstore {
  constructor(id, defaults, opts = {}) {
    // timer.start('construct')
    const pathPrefix = opts.globalConfigPath ?
      join(id, 'config.json') :
      join('configstore', `${id}.json`)

    this.path = join(configDir, pathPrefix)
    this.loaded = false
    this.all = Object.assign({}, defaults, this.all)
    // timer.stop('construct').log('construct')
  }
  get all() {
    // timer.start('all!')
    if (this.loaded === true) return this.contents
    this.loaded = true

    if (!existsSync(this.path)) {
      require('mkdirp').sync(dirname(this.path), defaultPathMode)
    }

    const contents = readFileSync(this.path, 'utf8')

    try {
      this.contents = JSON.parse(contents)
      // timer.stop('all!').log('all!')
      return this.contents
    }
    catch (error) {
      // Create dir if it doesn't exist
      if (error.code === 'ENOENT') {
        require('mkdirp').sync(dirname(this.path), defaultPathMode)
        this.contents = {}
        return {}
      }

      // Improve the message of permission errorors
      if (error.code === 'EACCES') {
        error.message = `${error.message}\n${permissionError}\n`
      }

      // Empty the file if it encounters invalid JSON
      if (error.name === 'SyntaxError') {
        writeFileSync(this.path, '', writeFileOptions)
        this.contents = {}
        return {}
      }

      throw error
    }
  }
  set all(val) {
    // timer.start('write-all')
    // writeFileSync(this.path, JSON.stringify(val, null, '\t'), writeFileOptions)
    // timer.stop('write-all').log('write-all')
    // return this
    try {
      // Make sure the folder exists as it could have been deleted in the meantime
      // require('mkdirp').sync(dirname(this.path), defaultPathMode)

      const written = writeFileSync(
        this.path,
        JSON.stringify(val, null, '\t'),
        writeFileOptions
      )
      // timer.stop('write-all').log('write-all')
      return written
    }
    catch (error) {
      // Improve the message of permission errorors
      if (error.code === 'EACCES') {
        error.message = `${error.message}\n${permissionError}\n`
      }

      throw error
    }
  }
  get(key) {
    return this.contents[key]
  }
  set(key, val) {
    const config = this.all
    config[key] = val
    this.all = config
  }
  has(key) {
    return !!this.contents[key]
  }
}

module.exports = Configstore
