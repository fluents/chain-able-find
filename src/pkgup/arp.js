// Save OS-specific path separator
// Load global paths
const {dirname, resolve, sep} = require('path')
var {globalPaths} = require('module')

// Guess at NPM's global install dir
var npmGlobalPrefix
if (process.platform === 'win32') {
  npmGlobalPrefix = dirname(process.execPath)
}
else {
  npmGlobalPrefix = dirname(dirname(process.execPath))
}
var npmGlobalModuleDir = resolve(npmGlobalPrefix, 'lib', 'node_modules')

// Resolver
function arp(dir) {
  var resolved = resolve(dir)
  var alternateMethod = false
  var appRootPath = null

  // Make sure that we're not loaded from a global include path
  // Eg. $HOME/.node_modules
  //     $HOME/.node_libraries
  //     $PREFIX/lib/node
  globalPaths.forEach(globalPath => {
    if (!alternateMethod && resolved.indexOf(globalPath) === 0) {
      alternateMethod = true
    }
  })

  // If the app-root-path library isn't loaded globally,
  // and node_modules exists in the path, just split __dirname
  var nodeModulesDir = sep + 'node_modules'
  if (!alternateMethod && resolved.indexOf(nodeModulesDir) !== -1) {
    var parts = resolved.split(nodeModulesDir)
    if (parts.length) {
      appRootPath = parts[0]
      parts = null
    }
  }

  // If the above didn't work, or this module is loaded globally, then
  // resort to require.main.filename (See http://nodejs.org/api/modules.html)
  if (alternateMethod || appRootPath === null) {
    appRootPath = dirname(require.main.filename)
  }

  // Handle global bin/ directory edge-case
  if (
    alternateMethod &&
    appRootPath.indexOf(npmGlobalModuleDir) !== -1 &&
    appRootPath.length - 4 === appRootPath.indexOf(sep + 'bin')
  ) {
    appRootPath = appRootPath.slice(0, -4)
  }

  // Return
  return appRootPath
}

module.exports = arp
