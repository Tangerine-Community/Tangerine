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
   * 1. 'skipped' means there is skip-logic that made the question not appear
   * 3. 'hidden' is for variables that are auto-calculated
   * 2. 'not required and incomplete' is for optional questions that were not answered
   * 4. 'undefined' handles cases where the user wants something like 'null' or 'na' for easier processing with stats tools
   */
  setVariable(flatFormResponse, input, key, value) {

    if (value === undefined && process.env.T_REPORTING_MARK_UNDEFINED_WITH !== "ORIGINAL_VALUE") {
      value = process.env.T_REPORTING_MARK_UNDEFINED_WITH
    }

    if (input.skipped) {
      flatFormResponse[key] = process.env.T_REPORTING_MARK_SKIPPED_WITH
    } else if (input.hidden && process.env.T_REPORTING_MARK_DISABLED_OR_HIDDEN_WITH !== "ORIGINAL_VALUE") {
      // The name for the variable T_REPORTING_MARK_DISABLED_OR_HIDDEN_WITH is misleading
      // DO NOT ADD 'input.disabled' to the else if statement above
      flatFormResponse[key] = process.env.T_REPORTING_MARK_DISABLED_OR_HIDDEN_WITH
    } else if (!input.required && value == '') {
      flatFormResponse[key] = process.env.T_REPORTING_MARK_OPTIONAL_NO_ANSWER_WITH
    } else {
      flatFormResponse[key] = value
    }
  }

}

module.exports = function() {
  return new TangyModules()
}