const PouchDB = require('pouchdb')
const DB = PouchDB.settings({url: process.env.T_COUCH_URL})f
const variablesDb = new DB('variables')

module.export.getVariable = async function(variableName, context = 'global') {
  let response = await variablesDb.query('variables', { 
    keys: [ [variableName, context] ],
    include_docs: true
  })
  // If looking not in the global context and we didn't find anything, look there.
  if (context !== 'global' && response.rows.length === 0) {
    response = await variablesDb.query('variables', { 
      keys: [ [variableName, 'global'] ],
      include_docs: true
    })
  }
  return response.rows.length === 0 ? undefined : response.rows[0].doc
}

module.export.setVariable = async function(variableName, context = 'global') {
  let response = await variablesDb.query('variables', { 
    keys: [ [variableName, context] ],
    include_docs: true
  })
  // If looking not in the global context and we didn't find anything, look there.
  if (context !== 'global' && response.rows.length === 0) {
    response = await variablesDb.query('variables', { 
      keys: [ [variableName, 'global'] ],
      include_docs: true
    })
  }
  return response.rows.length === 0 ? undefined : response.rows[0].doc
}
