class TangyFormService {

  constructor(props) {
    this.databaseName = 'tangy-forms'
    Object.assign(this, props)
  }

  async initialize() {
    this.db = new PouchDB(this.databaseName)
    try {
      let designDoc = await this.db.get('_design/tangy-form')
      if (designDoc.version !== tangyFormDesignDoc.version) {
        updatedDesignDoc = Object.assign({}, designDoc, tangyFormDesignDoc)
        await this.db.put(updatedDesignDoc)
      }
    } catch (e) {
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
    return this.db.query('tangy-form/responseByFormId', {key: formId, include_docs: true})
  }
  
}

var tangyFormDesignDoc = {
    _id: '_design/tangy-form',
    version: '2',
    views: {
      formByFormId: {
        map: function(doc) {
          if (doc.collection !== 'TangyForm') return
          emit(`${doc.formId}`, true)
        }.toString()
      },
      responseByFormId: {
        map: function(doc) {
          if (doc.collection !== 'TangyFormResponse') return
          emit(`${doc.formId}`, true)
        }.toString()
      },
      responseByFormIdAndStartDatetime: {
        map: function(doc) {
          if (doc.collection !== 'TangyFormResponse') return
          emit(`${doc.formId}-${doc.startDatetime}`, true)
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