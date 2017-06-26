const {pkg, AppCLI} = require('../fluent-skeleton')

pkg
  .version('0.0.1')
  .name('fluent-find')
  .description('find files synchronously, easily, with a fluent interface')
  .main('src/index.js')
  .scripts({
    test: `ava --verbose`,
    docs: `jsdoc src --recurse --destination 'docgen'`,
  })
  .devDeps([
    'ava@^0.19.1',
    'doxdox@2.0.2',
    'jsdoc@3.4.3',
    'jsdoc-api@3.0.0',
    'jsdoc-babel@0.3.0',
    'bench-chain@*',
    'fliplog@*@*',
  ])
  .deps([])
  .keywords(['fluent', 'find', 'glob', 'chainable'])
  .license('MIT')
  .author('aretecode', 'aretecode@gmail.com')
  .repo('aretecode/fluent-find')
  .dir(__dirname)
  .save()
