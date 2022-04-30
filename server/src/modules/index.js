const log = require('tangy-log').log
class TangyModules {

  constructor() {
    
    let enabledModules = process.env.T_MODULES
      ? JSON.parse(process.env.T_MODULES.replace(/\'/g,`"`))
      : []
    this.modules = enabledModules.map(moduleName => require(`/tangerine/server/src/modules/${moduleName}/index.js`))
    this.enabledModules = enabledModules
  }

  async hook(hookName, data) {
    for (let module of this.modules) {
      if (module.hasOwnProperty('hooks') && module.hooks.hasOwnProperty(hookName)) {
        let reportingModule;
        if (data && data.reportingConfig && data.reportingConfig.module) {
          reportingModule = data.reportingConfig.module
        }
        // log.debug(`${module.name} module is trying to run hook ${hookName} during the ${reportingModule} run.`)
        if (reportingModule) {
          if (module.name === reportingModule) {
            log.debug(`${module.name} module is running hook ${hookName}`)
            data = await module.hooks[hookName](data)
          } else {
            // log.debug(`${module.name} module MAY NOT RUN hook ${hookName} during the ${reportingModule} run.`)
          }
        } else {
          // log.debug(`${module.name} module does not need a module flow to run hook ${hookName}`)
            data = await module.hooks[hookName](data)
        }
      }
    }
    return data;
  }

}

module.exports = function() {
  return new TangyModules()
}