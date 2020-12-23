const tangyModules = require('./index.js')()

module.exports = async function disableModule(moduleName) {
  const module = require(`/tangerine/server/src/modules/${moduleName}/index.js`)
  if (module.disable) {
    await module.disable()
    return {
      message: `${moduleName} disabled.`
    }
  } else {
    return {
      message: `${moduleName} is disabled but note that ${moduleName} module does not have an enable hook so this command did nothing.`
    }
  }
}
