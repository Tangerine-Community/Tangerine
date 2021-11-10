module.exports = async function disableModule(moduleName) {
  let module
  try {
    module = require(`/tangerine/server/src/modules/${moduleName}/index.js`)
  } catch (e) {
    console.log(`require failed for ${moduleName}`)
    return {
      message: `${moduleName} is disabled but note that ${moduleName} module does not exit on the file system so this command did nothing.`
    }
  }
  if (module && module.disable) {
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
