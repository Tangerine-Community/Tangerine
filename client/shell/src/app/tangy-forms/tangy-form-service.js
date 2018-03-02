import PouchDB from 'pouchdb';

export class TangyFormService {

  constructor(props) {
    this.databaseName = 'tangy-forms'
    Object.assign(this, props)
    this.db = new PouchDB(this.databaseName)
  }

  async initialize() {
    try {
      let designDoc = await this.db.get('_design/tangy-form')
      if (designDoc.version !== tangyFormDesignDoc.version) {
        let updatedDesignDoc = Object.assign({}, designDoc, tangyFormDesignDoc)
        await this.db.put(updatedDesignDoc)
      }
    } catch (e) {
      ``
      this.loadDesignDoc()
    }
  }


  async loadDesignDoc() {
    await this.db.put(tangyFormDesignDoc)
  }

  async getForm(formId) {
    let results = await this.db.query('tangy-form/formByFormId', { key: formId, include_docs: true })
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
    let r = await this.db.query('tangy-form/responsesByFormId', { key: formId, include_docs: true })
    return r.rows.map((row) => row.doc)
  }

  async getResponsesByLocationId(locationId) {
    let r = await this.db.query('tangy-form/responsesByLocationId', { key: locationId, include_docs: true })
    return r.rows.map((row) => row.doc)
  }

}

var tangyFormDesignDoc = {
  _id: '_design/tangy-form',
  version: '14',
  views: {
    responsesByFormId: {
      map: function (doc) {
        if (doc.collection !== 'TangyFormResponse') return
        emit(`${doc.form.id}`, true)
      }.toString()
    },
    responsesLockedAndNotUploaded: {
      map: function (doc) {
        if (doc.collection === 'TangyFormResponse' && doc.complete === true && !doc.uploadDatetime) {
          emit(doc._id, true)
        }
      }.toString()
    },
    responsesLockedAndUploaded: {
      map: function (doc) {
        if (doc.collection === 'TangyFormResponse' && doc.complete === true && !!doc.uploadDatetime) {
          emit(doc._id, true)
        }
      }.toString()
    },
    responsesByLocationId: {
      map: function (doc) {
        if (doc.hasOwnProperty('collection') && doc.collection === 'TangyFormResponse' && doc.complete === true && doc.hasOwnProperty('inputs')) {
          const locationFields = doc.inputs.filter(input => input.hasOwnProperty('tagName') && input.tagName === 'TANGY-LOCATION')
          if (!locationFields || locationFields.length === 0) {
            return;
          }
          locationFields.forEach((field) => {
            const thisLocationId = field.value[field.value.length - 1].value;
            emit(thisLocationId, true)
          })
        }
      }.toString()
    },
    incompleteResponsesByLocationId: {
      map: function (doc) {
        if (doc.hasOwnProperty('collection') && doc.collection === 'TangyFormResponse' && !!doc.complete === false && doc.hasOwnProperty('inputs')) {
          const locationFields = doc.inputs.filter(input => input.hasOwnProperty('tagName') && input.tagName === 'TANGY-LOCATION')
          if (!locationFields || locationFields.length === 0) {
            return;
          }
          locationFields.forEach((field) => {
            const thisLocationId = field.value[field.value.length - 1].value;
            emit(thisLocationId, true)
          })
        }
      }.toString()
    },
    responsesThisMonthByLocationId: {
      map: function (doc) {
        const currentDate = new Date();
        const startDatetime = new Date(doc.startDatetime)
        if (doc.hasOwnProperty('collection')
          && doc.collection === 'TangyFormResponse'
          && startDatetime.getMonth() === currentDate.getMonth() && startDatetime.getFullYear() === currentDate.getFullYear()
          && doc.complete === true && doc.hasOwnProperty('inputs')) {
          const locationFields = doc.inputs.filter(input => input.hasOwnProperty('tagName') && input.tagName === 'TANGY-LOCATION')
          if (!locationFields || locationFields.length === 0) {
            return;
          }
          locationFields.forEach((field) => {
            const thisLocationId = field.value[field.value.length - 1].value;
            emit(thisLocationId, true)
          })
        }
      }.toString()
    },
    responsesByFormIdAndStartDatetime: {
      map: function (doc) {
        if (doc.collection !== 'TangyFormResponse') return
        emit(`${doc.form.id}-${doc.startDatetime}`, true)
      }.toString()
    },
    responseByUploadDatetime: {
      map: function (doc) {
        if (doc.collection !== 'TangyFormResponse') return
        emit(doc.uploadDatetime, true)
      }.toString()
    }
  }
}

export { tangyFormDesignDoc }
