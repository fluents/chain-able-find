// doesn't seem to respect cwd
// const files = globby
//   // , '!ignant'
//   .sync(['test/fixture/**/*.js'], {
//     cwd: entry,
//     absolute: true,
//   })
// const timer = require('fliptime')
// function globit(i) {
//   timer.start('globby' + i)
//   globby
//     .sync(['fixture/**/*.js'], ['!ignant/**', '!ignant'], {
//       cwd: entry,
//       absolute: true,
//     })
//   timer.stop('globby' + i).log('globby' + i)
// }
// function chrisit(i) {
//   timer.start('chris' + i)
//   chris
//       .recursive(true)
//       .ignoreDirs(['ignant'])
//       .matchFiles(['**/*.js'])
//       .walkin(entry)
//   timer.stop('chris' + i).log('chris' + i)
// }
//
// let i = 0
// while (i < 20) {
//   chrisit(i)
//   globit(i)
//   i++
// }
