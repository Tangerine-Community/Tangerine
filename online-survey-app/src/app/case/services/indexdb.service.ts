import { Injectable } from '@angular/core';
import { openDB } from 'idb';

@Injectable({ providedIn: 'root' })
export class IndexedDBService {
  private dbPromise = openDB('xapi-db', 1, {
    upgrade(db) {
      db.createObjectStore('statements', { keyPath: 'id', autoIncrement: true });
    }
  });

  async addStatement(statement: any) {
    const db = await this.dbPromise;
    await db.add('statements', { ...statement, timestamp: Date.now() });
  }

  async getAllStatements() {
    const db = await this.dbPromise;
    return db.getAll('statements');
  }

  async clearStatements() {
    const db = await this.dbPromise;
    await db.clear('statements');
  }
}
