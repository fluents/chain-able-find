// require('flipfile/exists')
const exists = require('fs').existsSync

function isReal(dir) {
  return dir !== '' && dir !== null && dir !== undefined
}

/**
 * @param  {string} paths
 * @return {string}
 */
function splitSlashAndPop(paths) {
  // split at every folder
  const str = paths.split('/')

  // remove last
  str.pop()

  return str
}

/**
 * @param  {string} filename (first arg because it is bound, could be curried)
 * @param  {string} dir
 * @return {string}
 */
function hasPkg(filename, dir) {
  return exists(dir + '/' + filename)
}

/**
 * @param  {string} dir
 * @return {string}
 */
function upDir(dir) {
  return splitSlashAndPop(dir).join('/')
}

module.exports = {upDir, hasPkg, splitSlashAndPop, isReal}
