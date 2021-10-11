export const createSearchIndex = async (db, formsInfo, customSearchJs = '') => {
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
        !doc.archived &&
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
    _id: '_design/search',
    views: {
      'search': {
        map
      }
    }
  }
  let existingSearchDoc
  try {
    existingSearchDoc = await db.get('_design/search')
    updatedSearchDoc['_rev'] = existingSearchDoc._rev
  } catch (e) { }
  if (!existingSearchDoc || (existingSearchDoc && existingSearchDoc.views.search.map !== updatedSearchDoc.views.search.map)) {
    await db.put(updatedSearchDoc)
  }
}
