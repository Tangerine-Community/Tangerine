const tangyModules = require('./index.js')()

module.exports = async function bootModule(moduleName) {
  const module = tangyModules.modules.find(module => module.name === moduleName)
  if (module) {
    if (module.hooks && module.hooks.boot) {
      await module.hooks.boot()
      return {
        message: `${moduleName} booted.`
      }
    } else {
      return {
        message: `${moduleName} is enabled but note that ${moduleName} module does not have an boot hook so this command did nothing.`
      }
    }
  } else {
    throw new Error('Error: You must first enable that module via T_MODULES.')
  }
}
