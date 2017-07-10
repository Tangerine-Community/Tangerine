import { Injectable } from '@angular/core';
import * as PouchDB from 'pouchdb';
@Injectable()
export class TangerineFormSessionsService {
  DB = new PouchDB('tangerine-form-sessions');
  constructor() {
  }
  async getAll(formId) {
    try {
      const result = await this.DB.allDocs({
        include_docs: true
      });
      const docs = result.rows.map((row) => row.doc);
      docs.sort((a, b) => b.date - a.date);
      if (formId) {
        return docs.filter((doc) => doc.formId === formId);
      }
      return docs;
    } catch (error) {
      console.log(error);
    }
  }

  async add(session) {
    try {
      const response = await this.DB.post(session);
      session._rev = response.rev;
      console.log(`TANGERINE_FORM_SESSIONS_ADD, TangerineFormSession._id: ${session._id}`);
      return session;
    } catch (error) {
      console.log(error);
    }
  }

  async update(session) {
    try {
      const response = await this.DB.put(session);
      session._rev = response.rev;
      console.log(`TANGERINE_FORM_SESSIONS_UPDATE, TangerineFormSession._id: ${session._id}, TangerineFormSession._rev: ${session._rev}`);
      return session;
    } catch (error) {
      console.log(error);
    }
  }

  async forceSave(session) {
    let doc = {rev: '', _rev: ''};
    try {
      // Get the most recent rev and then save the session.
      doc = await this.DB.get(session._id);
      console.log('Updating form session');
      session._rev = doc._rev;
      doc = await this.DB.put(session);
    } catch (error) {
      // Getting and updating failed, must be a new doc.
      try {
        console.log('Inserting new form session');
        doc = await this.DB.post(session);
      } catch (error) {
        console.log('Unable to post a new doc or update the doc.');
      }
    }
    session._rev = doc.rev;
    console.log(`TANGERINE_FORM_SESSIONS_UPDATE, TangerineFormSession._id: ${session._id}, TangerineFormSession._rev: ${session._rev}`);
    return session;
  }

  async delete(session) {
    try {
      const response = await this.DB.delete(session);
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  }
}
