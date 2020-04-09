import {UserService} from '../../shared/_services/user.service';
import {Injectable} from '@angular/core';

// A dummy function so TS does not complain about our use of emit in our pouchdb queries.
const emit = (key, value) => {
  return true;
};

@Injectable({
  providedIn: 'root'
})
export class ClassFormService {

  db: any;
  databaseName: string;
  userDB: any;

  constructor(
    private userService: UserService
  ) {}

  async initialize() {
    try {
      // this.userDB  = await this.userService.getUserDatabase('tangy-class');
      this.userDB  = await this.userService.getUserDatabase();
      const designDoc = await this.userDB.get('_design/tangy-class');
      if (designDoc.version !== tangyClassDesignDoc.version) {
        console.log('Time to update _design/tangy-class');
        console.log('Removing _design/tangy-class');
        await this.userDB.remove(designDoc);
        console.log('Creating _design/tangy-class');
        await this.userDB.put(tangyClassDesignDoc);
      }
    } catch (e) {
      this.loadDesignDoc();
    }
  }

  async loadDesignDoc() {
    await this.userDB.put(tangyClassDesignDoc);
  }

  // Would be nice if this was queue based so if two saves get called at the same time, the differentials are sequentials updated
  // into the database. Using a getter and setter for property fields, this would be one way to queue.
  async saveResponse(responseDoc) {
    let r;
    if (!responseDoc._id) {
      r = await this.userDB.post(responseDoc);
    } else {
      r = await this.userDB.put(responseDoc);
    }
    return await this.userDB.get(r.id);

  }

  async getResponse(responseId) {
    try {
      const doc = await this.userDB.get(responseId);
      return doc;
    } catch (e) {
      return false;
    }
  }
  async getResponsesByStudentId(studentId) {
    const result = await this.userDB.query('tangy-class/responsesByStudentId', {
      key: studentId,
      include_docs: true
    });
    return result.rows;
  }
  async getResponsesByFormId(formId) {
    const r = await this.db.query('tangy-class/responsesByFormId', { key: formId, include_docs: true });
    return r.rows.map((row) => row.doc);
  }

  getInputValues(doc) {
    const inputs = doc.items.reduce((acc, item) => [...acc, ...item.inputs], []);
    const obj = {};
    for (const el of inputs) {
      const attrs = inputs.attributes;
      for (let i = inputs.length - 1; i >= 0; i--) {
        obj[inputs[i].name] = inputs[i].value;
      }
    }
    return obj;
  }

}

const tangyClassDesignDoc = {
  _id: '_design/tangy-class',
  version: '28',
  views: {
    responsesForStudentRegByClassId: {
      map: function (doc) {
        if (doc.hasOwnProperty('collection') && doc.collection === 'TangyFormResponse' && !doc.archive) {
          if (doc.form.id !== 'student-registration') { return; }
          let inputs = [];
          doc.items.forEach(item => inputs = [...inputs, ...item.inputs]);
          const classIdInput = inputs.find(input => (input.name === 'classId') ? true : false);
          if (classIdInput) {
            const studentNameInput = inputs.find(input => (input.name === 'student_name') ? true : false);
            emit([classIdInput.value, studentNameInput.value], true);
          }
        }
      }.toString()
    },
    responsesByClassIdCurriculumId: {
      map: function (doc) {
        if (doc.hasOwnProperty('collection') && doc.collection === 'TangyFormResponse' && !doc.archive) {
          if (doc.hasOwnProperty('metadata') && doc.metadata.studentRegistrationDoc.classId) {
            // console.log("matching: " + doc.metadata.studentRegistrationDoc.classId)
             emit([doc.metadata.studentRegistrationDoc.classId, doc.form.id], true);
          }
        }
      }.toString()
    },
    responsesByClassId: {
      map: function (doc) {
        if (doc.hasOwnProperty('collection') && doc.collection === 'TangyFormResponse' && !doc.archive) {
          if (doc.hasOwnProperty('metadata') && doc.metadata.studentRegistrationDoc.classId) {
            emit(doc.metadata.studentRegistrationDoc.classId, true);
          }
        }
      }.toString()
    },
    responsesByStudentId: {
      map: function (doc) {
        if (doc.hasOwnProperty('collection') && doc.collection === 'TangyFormResponse' && !doc.archive) {
          if (doc.hasOwnProperty('metadata') && doc.metadata.studentRegistrationDoc.id) {
            emit(doc.metadata.studentRegistrationDoc.id, true);
          }
        }
      }.toString()
    },
    responsesByFormId: {
      map: function (doc) {
        if (doc.collection !== 'TangyFormResponse') { return; }
        if (!doc.archive) {
          emit(`${doc.form.id}`, true);
        }
      }.toString()
    }
  }
};
export { tangyClassDesignDoc };

