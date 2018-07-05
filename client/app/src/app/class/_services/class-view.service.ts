
import PouchDB from 'pouchdb';

// A dummy function so TS does not complain about our use of emit in our pouchdb queries.
const emit = (key, value) => {
  return true;
}

export class ClassViewService {

  db:any;
  databaseName: String;
  userDB:any;

  constructor(props) {
    this.databaseName = 'tangy-class'
    Object.assign(this, props)
    this.userDB = new PouchDB(this.databaseName)
  }

  async initialize() {
    try {
      let designDoc = await this.userDB.get('_design/tangy-class')
      if (designDoc.version !== tangyClassDesignDoc.version) {
        console.log('Time to update _design/tangy-class')
        console.log('Removing _design/tangy-class')
        await this.userDB.remove(designDoc)
        console.log('Creating _design/tangy-class')
        await this.userDB.put(tangyClassDesignDoc)
      }
    } catch (e) {
      this.loadDesignDoc()
    }
  }

  async loadDesignDoc() {
    await this.userDB.put(tangyClassDesignDoc)
  }

}

var tangyClassDesignDoc = {
  _id: '_design/tangy-class',
  version: '7',
  views: {
    responsesByClassIdFormIdStartDatetime: {
      map: function (doc) {
        if (doc.collection !== 'TangyFormResponse') return
          let inputs = [];
          doc.items.forEach(item => inputs = [...inputs, ...item.inputs])
          let input = inputs.find(input => (input.name === 'classId') ? true : false)
          if (input) {
            emit(`${input.value}-${doc.form.id}-${doc.startDatetime}`, true)
          }
      }.toString()
    },
    responsesForStudentRegByClassId: {
      map: function (doc) {
        if (doc.hasOwnProperty('collection') && doc.collection === 'TangyFormResponse') {
          if (doc.form.id !== 'student-registration') return
          let inputs = [];
          doc.items.forEach(item => inputs = [...inputs, ...item.inputs])
          let input = inputs.find(input => (input.name === 'classId') ? true : false)
          if (input) {
            emit(input.value, true);
          }
        }
      }.toString()
    },
    responsesByClassId: {
      map: function (doc) {
        if (doc.hasOwnProperty('collection') && doc.collection === 'TangyFormResponse') {
          let inputs = [];
          doc.items.forEach(item => inputs = [...inputs, ...item.inputs])
          let input = inputs.find(input => (input.name === 'classId') ? true : false)
          if (input) {
            emit(input.value, true);
          }
        }
      }.toString()
    },
    responsesByFormId: {
      map: function (doc) {
        if (doc.collection !== 'TangyFormResponse') return
        emit(`${doc.form.id}`, true)
      }.toString()
    }
  }
}
export { tangyClassDesignDoc }

