import { Injectable } from '@angular/core';
import { openDB } from 'idb'; // using idb@4.0.5

@Injectable({ providedIn: 'root' })
export class IndexedDBService {
  private dbPromise = openDB('xapi-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('statements')) {
        db.createObjectStore('statements', { keyPath: 'id', autoIncrement: true });
      }
    }
  });

  async addStatement(statement: any): Promise<void> {
    const db = await this.dbPromise;
    await db.add('statements', {
      data: statement,
      timestamp: Date.now()
    });
  }

  async getAllStatements(): Promise<{ id: number; data: any }[]> {
    const db = await this.dbPromise;
    const tx = db.transaction('statements', 'readonly');
    const store = tx.objectStore('statements');

    const all = await store.getAll();
    const keys = await store.getAllKeys();

    return all.map((record: any, index: number) => ({
      id: keys[index] as number,
      data: record.data
    }));
  }

  async deleteStatementsByIds(ids: number[]): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction('statements', 'readwrite');
    const store = tx.objectStore('statements');

    for (const id of ids) {
      await store.delete(id);
    }

    await tx.done;
  }

  async clearStatements(): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction('statements', 'readwrite');
    await tx.objectStore('statements').clear();
    await tx.done;
  }
}
