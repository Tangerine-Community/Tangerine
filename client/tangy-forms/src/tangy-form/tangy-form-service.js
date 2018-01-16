// const PouchDB = require('pouchdb-browser');

// import * as PouchDB from '../../node_modules/pouchdb-browser/lib/index.js';
export class TangyFormService {

  constructor(props) {
    this.databaseName = 'tangy-forms'
    Object.assign(this, props)
  }

  async initialize() {
    this.db = new PouchDB(this.databaseName)
    try {
      let designDoc = await this.db.get('_design/tangy-form')
      if (designDoc.version !== tangyFormDesignDoc.version) {
        let updatedDesignDoc = Object.assign({}, designDoc, tangyFormDesignDoc)
        await this.db.put(updatedDesignDoc)
      }
    } catch (e) { ``
      this.loadDesignDoc()
    }
  }


  async loadDesignDoc() {
    await this.db.put(tangyFormDesignDoc)
  }

  async getForm(formId) {
    let results = await this.db.query('tangy-form/formByFormId', {key: formId, include_docs: true})
    if (results.rows.length == 0) {
        return false
    } else {
        return results.rows[0].doc
    }
  }

  async saveForm(formDoc) {
    let r
    if (!formDoc._id) {
      r = await this.db.post(formDoc)
    }
    else {
      r = await this.db.put(formDoc)
    }
    return await this.db.get(r.id)
  }

  // Would be nice if this was queue based so if two saves get called at the same time, the differentials are sequentials updated
  // into the database. Using a getter and setter for property fields, this would be one way to queue.
  async saveResponse(responseDoc) {
    let r
    if (!responseDoc._id) {
      r = await this.db.post(responseDoc)
    }
    else {
      r = await this.db.put(responseDoc)
    }
    return await this.db.get(r.id)

  }

  async getResponse(responseId) {
    try {
        let doc = await this.db.get(responseId)
        return doc
    } catch (e) {
        return false
    }
  }

  async getResponsesByFormId(formId) {
    let r = await this.db.query('tangy-form/responsesByFormId', {key: formId, include_docs: true})
    return r.rows.map((row) => row.doc)
  }

  async getStudentRegistrations(formId) {
    // let r = await this.db.query('tangy-form/responsesByFormIdAll', {key: formId, include_docs: true})
    let r = await this.db.query('tangy-form/responsesByFormIdAll')
    // return r.rows.map((row) => row.doc)
    // let r = await this.db.allDocs({include_docs: true, descending: true});
    // return r.rows
    return r.rows.map((row) => row.value)
  }
  async getResponsesByLocationId(locationId) {
    let r = await this.db.query('tangy-form/responsesByLocationId', {key: locationId, include_docs: true})
    return r.rows.map((row) => row.doc)
  }
  
}

var tangyFormDesignDoc = {
    _id: '_design/tangy-form',
    version: '45',
    views: {
      formByFormId: {
        map: function(doc) {
          if (doc.collection !== 'TangyForm') return
          emit(`${doc.formId}`, true)
        }.toString()
      },
      responsesByFormId: {
        map: function(doc) {
          if (doc.collection !== 'TangyFormResponse') return
          emit(`${doc.formId}`, true)
        }.toString()
      },
      responsesByLocationId: {
        map: function(doc) {
          if (doc.hasOwnProperty('collection') && doc.collection === 'TangyFormResponse' && doc.hasOwnProperty('inputs') ) {
            debugger;
            const locationFields = doc.inputs.filter(input => input.hasOwnProperty('tagName') && input.tagName === 'TANGY-LOCATION')
            if (!locationFields || locationFields.length === 0) {
              return;
            }
            locationFields.forEach((field) => {
              const thisLocationId = field.value[locationFields.length - 1].value
              emit(thisLocationId, true)
            })
          }
        }.toString()
      },
      responsesByFormIdAndStartDatetime: {
        map: function(doc) {
          if (doc.collection !== 'TangyFormResponse') return
          emit(`${doc.formId}-${doc.startDatetime}`, true)
        }.toString()
      },
      responsesByFormIdAll: {
        map: function(doc) {
          debugger;
          if (doc.collection !== 'TangyFormResponse') return
          // if (doc.form.id === 'student_registration') {
          if (doc.hasOwnProperty('collection') && doc.collection === 'TangyFormResponse' && doc.hasOwnProperty('formId') ) {
            if (doc.formId === 'student-registration') {
              // emit(doc.id, true)
              var sr = {}
              // const nameObj = doc.inputs.filter(item => item.hasOwnProperty('name') && item.name === 'student_name')
              debugger;
              for (let input of doc.inputs) {
                let name = input.name
                let inputValue = input.value
                sr[name] = inputValue
              }
              sr['_id'] = doc._id
              emit(doc._id, sr)
            }
          } else {
            debugger;
            if (doc.hasOwnProperty('form')) {
              debugger;
              if (doc.form.id === 'student-registration') {
                debugger;
                var sr = {}
                // const nameObj = doc.inputs.filter(item => item.hasOwnProperty('name') && item.name === 'student_name')
                for (let input of doc.inputs) {
                  let name = input.name
                  let inputValue = input.value
                  sr[name] = inputValue
                }
                sr['_id'] = doc._id
                emit(doc._id, sr)
              }
            }
          }
        }.toString()
      },
      responseByUploadDatetime: {
        map: function(doc) {
          if (doc.collection !== 'TangyFormResponse') return
          emit(doc.uploadDatetime, true)
        }.toString()
      }
    }
}

export {tangyFormDesignDoc}