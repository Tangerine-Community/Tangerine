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
      if(module.hasOwnProperty('hooks') && module.hooks.hasOwnProperty(hookName)) {
        data = await module.hooks[hookName](data)
      }
    }
    return data;
  }

  /*
   * setVariable() is used in the modules to set the output value of a variable based on the input's metadata and the 
   * Tangerine server level configurations related to reporting. The hierarchy of elements is based on our experience 
   * in users want the data to appear.
   * 
   * Assumptions:
   * 1. If the input is 'hidden' or 'disabled', it was not 'skipped' (intentionally) by the user
   * 2. The input can only be 'skipped' if it is not 'hidden' or 'disabled'
   * 3. 'undefined' variables are handled last
   */
  setVariable(flatFormResponse, input, key, value) {
    if ((input.hidden || input.disabled)) {
      if (process.env.T_REPORTING_MARK_DISABLED_OR_HIDDEN_WITH !== "ORIGINAL_VALUE") {
        flatFormResponse[key] = process.env.T_REPORTING_MARK_DISABLED_OR_HIDDEN_WITH
      } else {
        flatFormResponse[key] = value
      }
    } else if (input.skipped && !input.required) {
      flatFormResponse[key] = process.env.T_REPORTING_MARK_SKIPPED_WITH
    } else if (value === undefined && process.env.T_REPORTING_MARK_UNDEFINED_WITH !== "ORIGINAL_VALUE") {
      // value is neither hidden, disabled, nor skipped, but is still 'undefined'
      flatFormResponse[key] = process.env.T_REPORTING_MARK_UNDEFINED_WITH
    } else {
      flatFormResponse[key] = value
    }
  }

}

module.exports = function() {
  return new TangyModules()
}