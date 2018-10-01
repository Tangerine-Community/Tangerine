import PouchDB from 'pouchdb';

// A dummy function so TS does not complain about our use of emit in our pouchdb queries.
const emit = (key, value) => {
  return true;
}

export class TangyFormService {

  db:any;
  databaseName: String;

  constructor(props) {
    this.databaseName = 'tangy-forms'
    Object.assign(this, props)
    this.db = new PouchDB(this.databaseName)
  }

  async initialize() {
    try {
      let designDoc = await this.db.get('_design/tangy-form')
      if (designDoc.version !== tangyFormDesignDoc.version) {
        console.log('Time to update _design/tangy-form')
        console.log('Removing _design/tangy-form')
        await this.db.remove(designDoc)
        console.log('Cleaning up view indexes')
        // @TODO This causes conflicts with open databases. How to avoid??
        //await this.db.viewCleanup()
        console.log('Creating _design/tangy-form')
        await this.db.put(tangyFormDesignDoc)
        //let updatedDesignDoc = Object.assign({}, designDoc, tangyFormDesignDoc)
        //await this.db.put(updatedDesignDoc)
      }
    } catch (e) {
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
  version: '50',
  views: {
    responsesByFormId: {
      map: function (doc) {
        if (doc.collection !== 'TangyFormResponse') return
        emit(`${doc.form.id}`, true)
      }.toString()
    },
    responsesCompleted: {
      map: function (doc) {
        if ((doc.collection === 'TangyFormResponse' && doc.complete === true ||
          (doc.collection === 'TangyFormResponse' && doc.form.id === 'user-profile'))) {
          emit(doc._id, true)
        }
      }.toString()
    },
    responsesLockedAndNotUploaded: {
      map: function (doc) {
        if (
          (doc.collection === 'TangyFormResponse' && doc.complete === true && !doc.uploadDatetime)
          ||
          (doc.collection === 'TangyFormResponse' && doc.form.id === 'user-profile' && !doc.uploadDatetime)
        ) {
          emit(doc._id, true)
        }
      }.toString()
    },
    responsesLockedAndNotUploadedWithName: {
      map: function (doc) {
        if (
          (doc.collection === 'TangyFormResponse' && doc.complete === true && !doc.uploadDatetime)
          ||
          (doc.collection === 'TangyFormResponse' && doc.form.id === 'user-profile' && !doc.uploadDatetime)
        ) {
          emit(doc._id, doc.form.id)
          // emit(doc._id, true)
        }
      }.toString()
    },
    responsesUnLockedAndNotUploaded: {
      map: function (doc) {
        if (
          (doc.collection === 'TangyFormResponse' && (!doc.uploadDatetime || doc.lastModified > doc.uploadDatetime))
          ||
          (doc.collection === 'TangyFormResponse' && doc.form.id === 'user-profile' && !doc.uploadDatetime)
        ) {
          emit(doc._id, true)
        }
      }.toString()
    },
    responsesUnLockedAndNotUploadedWithName: {
      map: function (doc) {
        if (
          (doc.collection === 'TangyFormResponse' && (!doc.uploadDatetime || doc.lastModified > doc.uploadDatetime))
          ||
          (doc.collection === 'TangyFormResponse' && doc.form.id === 'user-profile' && !doc.uploadDatetime)
        ) {
          emit(doc._id, doc.form.id)
          // emit(doc._id, true)
        }
      }.toString()
    },
    responsesLockedAndUploaded: {
      map: function (doc) {
        if (
          (doc.collection === 'TangyFormResponse' && doc.complete === true && !!doc.uploadDatetime)
          ||
          (doc.collection === 'TangyFormResponse' && doc.form.id === 'user-profile' && !!doc.uploadDatetime)
        ) {
          emit(doc._id, true)
        }
      }.toString()
    },
    responsesLockedAndUploadedWithName: {
      map: function (doc) {
        if (
          (doc.collection === 'TangyFormResponse' && doc.complete === true && !!doc.uploadDatetime)
          ||
          (doc.collection === 'TangyFormResponse' && doc.form.id === 'user-profile' && !!doc.uploadDatetime)
        ) {
          emit(doc._id, doc.form.id)
          // emit(doc._id, true)
        }
      }.toString()
    },
    responsesUnLockedAndUploaded: {
      map: function (doc) {
        if (
          (doc.collection === 'TangyFormResponse' && (doc.uploadDatetime || doc.lastModified <= doc.uploadDatetime))
          ||
          (doc.collection === 'TangyFormResponse' && doc.form.id === 'user-profile' && !!doc.uploadDatetime)
        ) {
          emit(doc._id, true)
        }
      }.toString()
    },
    responsesUnLockedAndUploadedWithName: {
      map: function (doc) {
        if (
          (doc.collection === 'TangyFormResponse' && (doc.uploadDatetime || doc.lastModified <= doc.uploadDatetime))
          ||
          (doc.collection === 'TangyFormResponse' && doc.form.id === 'user-profile' && !!doc.uploadDatetime)
        ) {
          emit(doc._id, doc.form.id)
          // emit(doc._id, true)
        }
      }.toString()
    },
    responsesByLocationId: {
      map: function (doc) {
        if (doc.hasOwnProperty('collection') && doc.collection === 'TangyFormResponse') {
          if (doc.form.id === 'user-profile' || doc.form.id === 'reports') return
          let inputs = [];
          doc.items.forEach(item => inputs = [...inputs, ...item.inputs])
          let location = inputs.find(input => (input.tagName === 'TANGY-LOCATION') ? true : false)
          if (location) {
            let lowestLevelLocation = location.value.pop()
            emit(lowestLevelLocation.value, true);
          }
        }
      }.toString()
    },
    responsesByYearMonthLocationId: {
      map: function (doc) {
        if (doc.hasOwnProperty('collection') && doc.collection === 'TangyFormResponse') {
          if (doc.form.id === 'user-profile' || doc.form.id === 'reports') return
          // @TODO Take into account timezone.
          const startDatetime = new Date(doc.startUnixtime);
          let inputs = [];
          doc.items.forEach(item => inputs = [...inputs, ...item.inputs])
          let location = inputs.find(input => (input.tagName === 'TANGY-LOCATION') ? true : false)
          if (location) {
            const lowestLevelLocation = location.value.pop()
            const thisLocationId = lowestLevelLocation.value;
            emit(`${thisLocationId}-${startDatetime.getDate()}-${startDatetime.getMonth()}-${startDatetime.getFullYear()}`, true);
          }
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
