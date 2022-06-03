const tangyModules = require('./index.js')()

module.exports = async function enableModule(moduleName) {
  const module = tangyModules.modules.find(module => module.name === moduleName)
  if (module) {
    if (module.hooks && module.hooks.enable) {
      await module.hooks.enable()
      return {
        message: `${moduleName} enabled.`
      }
    } else {
      return {
        message: `${moduleName} is enabled but note that ${moduleName} module does not have an enable hook so this command did nothing.`
      }
    }
  } else {
    throw new Error('Error: You must first enable the module: ' + moduleName + ' via T_MODULES or set module.exports.name in the module.')
  }
}
