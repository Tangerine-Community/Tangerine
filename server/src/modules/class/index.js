const clog = require('tangy-log').clog
const fs = require('fs-extra')

async function flattenFormResponse (data) {
  try {

    const groupId = data.groupId
    const appConfig = JSON.parse(await fs.readFile(`/tangerine/client/content/groups/${groupId}/app-config.json`, "utf8"))

    let formResponse = data.formResponse
    let flatFormResponse = data.flatFormResponse
    if (formResponse.type == 'response' && formResponse.metadata && formResponse.metadata.studentRegistrationDoc) {
      const studentRegistrationFields = Array.isArray(appConfig.teachProperties.studentRegistrationFields) ? appConfig.teachProperties.studentRegistrationFields : Object.keys(formResponse.metadata.studentRegistrationDoc);
      const studentRegistrationInputs = Object.fromEntries(
        Object.entries(formResponse.metadata.studentRegistrationDoc).filter(([key]) => studentRegistrationFields.includes(key))
      );
      Object.entries(studentRegistrationInputs).forEach(([key, value]) => {
        if (key == '') { return }
        if (Array.isArray(value)) {
          const values = value.filter(option => option.value === "on");
          if (values.length > 1) {
            // inputs with multi-select values
            values.forEach((v, i) => {
              flatFormResponse[`sr_${key}_${i}`] = v.name || '';
            });
          } else {
            // inputs with single select values
            flatFormResponse[`sr_${key}`] = value[0].name || '';
          }
        } else {
          flatFormResponse[`sr_${key}`] = value;
        }
});
    }
    return {flatFormResponse, formResponse}
  } catch (err) {
    console.error(err)
  }
}

module.exports = {
  name: 'class',
  hooks: {
    csv_flatFormReponse: flattenFormResponse,
    mysqljs_flatFormResponse: flattenFormResponse,
    groupNew: function(data) {
      return new Promise(async (resolve, reject) => {
        const {groupName, appConfig} = data
        clog("Setting homeUrl to dashboard and uploadUnlockedFormReponses to true.")
        appConfig.homeUrl =  "dashboard"
        appConfig.uploadUnlockedFormReponses =  true
        // copy the class forms
        try {
          await fs.copy('/tangerine/server/src/modules/class/', `/tangerine/client/content/groups/${groupName}`)
          clog("Copied class module forms.")
        } catch (err) {
          console.error(err)
        }
        let formsName = appConfig.syncProtocol === '1' ? 'forms-sp1.json' : 'forms-sp2.json'
        const classJSON = JSON.parse(await fs.readFile(`/tangerine/server/src/modules/class/${formsName}`))
        const groupJSON = JSON.parse(await fs.readFile(`/tangerine/client/content/groups/${groupName}/forms.json`))
        const newGroupJSON = groupJSON.concat(classJSON);
        await fs.writeFile(`/tangerine/client/content/groups/${groupName}/forms.json`, JSON.stringify(newGroupJSON), 'utf8')
        resolve(data)
      })
    },
  }
}
