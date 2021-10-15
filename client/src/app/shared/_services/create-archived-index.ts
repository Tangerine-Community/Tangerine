export const createArchivedIndex = async (db, formsInfo, customSearchJs = '') => {
  const variablesToIndexByFormId = formsInfo.reduce((variablesToIndexByFormId, formInfo) => {
    return formInfo.searchSettings?.shouldIndex
      ? {
        ...variablesToIndexByFormId,
        [formInfo.id]: formInfo.searchSettings.variablesToIndex
      }
      : variablesToIndexByFormId
  }, {})
  const map = `
    function(doc) {
      ${customSearchJs}
      const variablesToIndexByFormId = ${JSON.stringify(variablesToIndexByFormId)}
      if (
        doc.collection === 'TangyFormResponse' &&
        doc.items &&
        doc.archived &&
        Array.isArray(doc.items) &&
        doc.form &&
        doc.form.id &&
        variablesToIndexByFormId.hasOwnProperty(doc.form.id)
      ) {
        let allInputsValueByName = doc.items.reduce((allInputsValueByName, item) => {
          return {
            ...allInputsValueByName,
            ...item.inputs.reduce((itemInputsValueByName, input) => {
              return {
                ...itemInputsValueByName,
                [input.name]: \`\${input.value}\`.toLocaleLowerCase()
              }
            }, {})
          }
        }, {})
        for (let variableToIndex of variablesToIndexByFormId[doc.form.id]) {
          if (allInputsValueByName.hasOwnProperty(variableToIndex)) {
            emit(
              allInputsValueByName[variableToIndex], 
              variableToIndex,
            )
          }
        }
      }
    }
  `
  const updatedSearchDoc = {
    _id: '_design/archived',
    views: {
      'archived': {
        map
      }
    }
  }
  let existingArchivedDoc
  try {
    existingArchivedDoc = await db.get('_design/archived')
    existingArchivedDoc['_rev'] = existingArchivedDoc._rev
  } catch (e) { }
  if (!existingArchivedDoc || (existingArchivedDoc && existingArchivedDoc.views.archived.map !== existingArchivedDoc.views.archived.map)) {
    await db.put(existingArchivedDoc)
  }
}
