import { Component, OnInit } from '@angular/core';
import { WindowRef } from '../../window-ref.service';
import { NgIf } from '@angular/common';
import { TangyFormService } from '../../../tangy-forms/tangy-form-service';
import { updates } from './updates';
import PouchDB from 'pouchdb';
import { TangerineFormPage } from '../../../../../e2e/app.po';
import { UserService } from '../../auth/_services/user.service';

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
    private windowRef: WindowRef,
    private userService: UserService
  ) { }

  async ngOnInit() {
    const window = this.windowRef.nativeWindow;
    const response = await this.userService.getAllUsers();
    const usernames = response
      .filter(user => user.hasOwnProperty('username'))
      .map(user => user.username);
    for (const username of usernames) {
      const userDb = await new PouchDB(username);
      // Use try in case this is an old account where info doc was not created.
      let infoDoc = { _id: '', atUpdateIndex: 0 };
      try {
        infoDoc = await userDb.get('info');
      } catch (e) {
        await userDb.put({ _id: 'info', atUpdateIndex: 0 });
        infoDoc = await userDb.get('info');
      }
      let atUpdateIndex = infoDoc.hasOwnProperty('atUpdateIndex') ? infoDoc.atUpdateIndex : 0;
      const lastUpdateIndex = updates.length - 1;
      if (lastUpdateIndex !== atUpdateIndex) {
        this.needsUpdating = true;
        this.message = 'Applying updates...';
        let requiresViewsRefresh = false;
        while (lastUpdateIndex >= atUpdateIndex) {
          if (updates[atUpdateIndex].requiresViewsUpdate) {
            requiresViewsRefresh = true;
          }
          await updates[atUpdateIndex].script(userDb);
          this.totalUpdatesApplied++;
          atUpdateIndex++;
        }
        atUpdateIndex--;
        if (requiresViewsRefresh) {
          const tangyFormService = new TangyFormService(username);
          await tangyFormService.initialize();
        }
        infoDoc.atUpdateIndex = atUpdateIndex;
        await userDb.put(infoDoc);
      }
    }
    this.message = '✓ Yay! You are up to date.';
  }

}
