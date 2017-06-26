# chain-able-find

> find files synchronously, easily, with a chainable interface

[![Build Status][travis-image]][travis-url]
[![NPM version][chain-able-find-npm-image]][chain-able-find-npm-url]
[![MIT License][license-image]][license-url]
[![chain-able-find][gitter-badge]][gitter-url]
[![Dependencies][david-deps-img]][david-deps-url]
[![fluent](https://img.shields.io/badge/⛓-fluent-9659F7.svg)](https://github.com/fluents/chain-able)

[chain-able-find-npm-image]: https://img.shields.io/npm/v/chain-able-find.svg
[chain-able-find-npm-url]: https://npmjs.org/package/chain-able-find
[license-image]: http://img.shields.io/badge/license-${license}-blue.svg?style=flat
[license-url]: https://spdx.org/licenses/${license}
[gitter-badge]: https://img.shields.io/gitter/room/chain-able-find/pink.svg
[gitter-url]: https://gitter.im/chain-able-find/Lobby

[travis-image]: https://travis-ci.org/fluents/chain-able-find.svg?branch=master
[travis-url]: https://travis-ci.org/chain-able-find/chain-able-find

[david-deps-img]: https://david-dm.org/chain-able-find/chain-able-find.svg
[david-deps-url]: https://david-dm.org/chain-able-find/chain-able-find


<!--
[![Standard JS Style][standard-image]][standard-url]
[standard-image]: https://img.shields.io/badge/%F0%9F%91%95%20code%20style-standard%2Bes6+-blue.svg
[standard-url]: https://github.com/aretecode/eslint-config-aretecode
-->


## 📦 install
```bash
yarn add chain-able-find
npm i chain-able-find --save
```

```js
const find = require('chain-able-find')
```

## [📘 examples](./examples)


### glob compat syntax

```js
const found = find(['!*.js', 'a.js'], {sync: false})
```

### chainable syntax

```js
const found = find
  .init()
  .recursive(true)
  .ignoreDirs(['ignant'])
  .matchFiles(['**/*.js'])
  .abs(true)
  .sync(true)
  .find(cwd)
  .results()
```

### object syntax

```js
const found = ff({
  matchFiles: ['**/*.js'],
  recursive: true,
  ignoreDirs: ['ignant'],
  abs: true,
  sync: true,
  cwd: entry,
})
```

## [🌐 documentation](./docs)
## [🔬 tests](./tests)
## [🏋️ benchmarks](./bench)
