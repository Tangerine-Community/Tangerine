class TangyModules {

  constructor() {
    let enabledModules = JSON.parse(process.env.T_MODULES.replace(/\'/g,`"`))
    this.modules = enabledModules.map(moduleName => require(`/tangerine/server/src/modules/${moduleName}/index.js`))
  }

  async hook(hookName, data) {
    for (let module of this.modules) {
      if(module.hasOwnProperty('hooks') && module.hooks.hasOwnProperty(hookName)) {
        data = await module.hooks[hookName](data)
      }
    }
    return data;
  }

}

module.exports = function() {
  return new TangyModules()
}