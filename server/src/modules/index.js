const util = require("util");
const fs = require("fs");
const {REPORTING_WORKER_STATE} = require("../reporting/constants");
const writeFile = util.promisify(fs.writeFile);

class TangyModules {

  constructor() {
    
    let enabledModules = process.env.T_MODULES
      ? JSON.parse(process.env.T_MODULES.replace(/\'/g,`"`))
      : []
    this.modules = enabledModules.map(moduleName => require(`/tangerine/server/src/modules/${moduleName}/index.js`))
    this.enabledModules = enabledModules
    this.injected = {}
  }

  async hook(hookName, data) {
    // console.log("hook Injected?", this.injected.foo, data)
    for (let module of this.modules) {
      if(module.hasOwnProperty('hooks') && module.hooks.hasOwnProperty(hookName)) {
        data = await module.hooks[hookName](data, async (key, value, config) => {
          this.injected[key] = value
          // console.log("Injected", this.injected.connection)
        }, this.injected)
        // console.log("Hooking", hookName, data, this.injected)
        // data.injected = this.injected
      }
    }
    return data;
  }

}

module.exports = function() {
  return new TangyModules()
}