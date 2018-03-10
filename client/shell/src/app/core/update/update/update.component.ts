import { Component, OnInit } from '@angular/core';
import { WindowRef } from '../../window-ref.service';
import { NgIf } from '@angular/common';
import { TangyFormService } from '../../../tangy-forms/tangy-form-service';
import { updates } from './updates';
import PouchDB from 'pouchdb';
import { TangerineFormPage } from '../../../../../e2e/app.po';

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.css']
})
export class UpdateComponent implements OnInit {

  message = 'Checking for updates...';
  totalUpdatesApplied = 0;
  needsUpdating = false;

  constructor(
    private windowRef: WindowRef
  ) { }

  async ngOnInit() {
    let window = this.windowRef.nativeWindow
    let usersDb = new PouchDB('users');
    const response = await usersDb.allDocs({include_docs: true});
    const usernames = response
      .rows
      .map(row => row.doc)
      .filter(doc => doc.hasOwnProperty('username'))
      .map(doc => doc.username);
    for (let username of usernames) {
      let userDb = await new PouchDB(username);
      // Use try in case this is an old account where info doc was not created.
      let infoDoc = { _id: '', atUpdateIndex: 0};
      try {
        infoDoc = await userDb.get('info');
      } catch (e) {
        await userDb.put({_id: 'info', atUpdateIndex: 0});
        infoDoc = await userDb.get('info');
      }
      let atUpdateIndex = infoDoc.hasOwnProperty('atUpdateIndex') ? infoDoc.atUpdateIndex : 0;
      let lastUpdateIndex = updates.length-1
      if (lastUpdateIndex !== atUpdateIndex) {
        this.needsUpdating = true;
        this.message = "Applying updates...";
        let requiresViewsRefresh = false;
        while(lastUpdateIndex >= atUpdateIndex) {
          if (updates[atUpdateIndex].requiresViewsUpdate) {
            requiresViewsRefresh = true
          }
          await updates[atUpdateIndex].script(userDb);
          this.totalUpdatesApplied++;
          atUpdateIndex++;
        }
        atUpdateIndex--;
        if (requiresViewsRefresh) {
          let tangyFormService = new TangyFormService(username)
          await tangyFormService.initialize();
        }
        infoDoc.atUpdateIndex = atUpdateIndex;
        await userDb.put(infoDoc);
      }
    }
    this.message = '✓ Yay! You are up to date.';
  }

}
