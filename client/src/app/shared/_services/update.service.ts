import { VariableService } from './variable.service';
import { _TRANSLATE } from 'src/app/shared/translation-marker';
import { Subject } from 'rxjs';
import { AppConfigService } from './app-config.service';
import { UserService } from 'src/app/shared/_services/user.service';
import { Injectable } from '@angular/core';
import { updates } from '../../core/update/update/updates';

const VAR_CURRENT_UPDATE_INDEX = 'VAR_CURRENT_UPDATE_INDEX'
export const VAR_UPDATE_IS_RUNNING = 'VAR_UPDATE_IS_RUNNING'

@Injectable({
  providedIn: 'root'
})
export class UpdateService {

  status$:Subject<string> = new Subject()

  constructor(
    private userService:UserService,
    private variableService:VariableService,
    private appConfigService:AppConfigService
  ) { }

  async install() {
    await this.setCurrentUpdateIndex(updates.length - 1)
  }

  /*
   * Sync Protocol 1
   */

  async sp1_updateRequired() {
    const response = await this.userService.usersDb.allDocs({ include_docs: true });
    // Note the use of mapping by doc.username but falling back to doc._id. That's because
    // an app may be updating from a time when _id was the username.
    const usernames = response
      .rows
      .map(row => row.doc)
      .filter(doc => doc._id.substr(0,7) !== '_design' )
      .map(doc => doc.username ? doc.username : doc._id);
    for (const username of usernames) {
      const userDb = await this.userService.getUserDatabase(username);
      // Use try in case this is an old account where info doc was not created.
      let infoDoc = { _id: '', currentUpdateIndex: 0 };
      try {
        infoDoc = await userDb.get('info');
      } catch (e) {
        await userDb.put({ _id: 'info', currentUpdateIndex: 0 });
        infoDoc = await userDb.get('info');
      }
      const currentUpdateIndex = infoDoc.hasOwnProperty('currentUpdateIndex') ? infoDoc.currentUpdateIndex : 0;
      const finalUpdateIndex = updates.length - 1;
      if (finalUpdateIndex !== currentUpdateIndex) {
        return true
      } else {
        return false
      }
    }
  }

  async sp1_processUpdates() {
    const usernames = await this.userService.getUsernames();
    const appConfig = await this.appConfigService.getAppConfig()
    for (const username of usernames) {
      const userDb = await this.userService.getUserDatabase(username);
      await this.sp1_processUpdatesForUser(userDb.db, appConfig)
    }
  }

  async sp1_processUpdatesForUser(userDb, appConfig) {
    // Use try in case this is an old account where info doc was not created.
    let infoDoc = { _id: '', currentUpdateIndex: 0 };
    try {
      infoDoc = await userDb.get('info');
    } catch (e) {
      await userDb.put({ _id: 'info', currentUpdateIndex: 0 });
      infoDoc = await userDb.get('info');
    }
    let totalUpdatesApplied = 0
    let currentUpdateIndex = infoDoc.hasOwnProperty('currentUpdateIndex') ? infoDoc.currentUpdateIndex : 0;
    const finalUpdateIndex = updates.length - 1;
    if (finalUpdateIndex !== currentUpdateIndex) {
      let requiresViewsRefresh = false;
      while (finalUpdateIndex !== currentUpdateIndex) {
        this.status$.next(_TRANSLATE(`Applying Update: ${totalUpdatesApplied+1}`))
        if (updates[currentUpdateIndex+1].requiresViewsUpdate) {
          requiresViewsRefresh = true;
        }
        await updates[currentUpdateIndex+1].script(userDb, appConfig, this.userService);
        totalUpdatesApplied++;
        currentUpdateIndex++;
        if (requiresViewsRefresh) {
          await this.userService.updateAllDefaultUserDocs()
        }
      }
      currentUpdateIndex--;
      infoDoc.currentUpdateIndex = currentUpdateIndex;
      await userDb.put(infoDoc);
    }
  }


  /*
   * Sync Protocol 2
   */

  async sp2_updateRequired() {
    const currentUpdateIndex = await this.getCurrentUpdateIndex()
    return currentUpdateIndex !== updates.length - 1 ? true : false
  }

  async sp2_processUpdates() {

    const username = await this.userService.getCurrentUser();
    const appConfig = await this.appConfigService.getAppConfig()
    const userDb = await this.userService.getUserDatabase(username);
    let currentUpdateIndex = await this.getCurrentUpdateIndex() 
    const finalUpdateIndex = updates.length - 1;
    let requiresViewsRefresh = false;

    if (finalUpdateIndex !== currentUpdateIndex) {
      while (currentUpdateIndex < finalUpdateIndex) {
        this.status$.next(_TRANSLATE(`Applying Update: ${currentUpdateIndex+1}`))
        if (updates[currentUpdateIndex+1].requiresViewsUpdate) requiresViewsRefresh = true;
        await updates[currentUpdateIndex+1].script(userDb, appConfig, this.userService);
        currentUpdateIndex++;
        await this.setCurrentUpdateIndex(currentUpdateIndex)
      }
    }

  }

  async getCurrentUpdateIndex() {
    return <number>await this.variableService.get(VAR_CURRENT_UPDATE_INDEX)
  }

  async setCurrentUpdateIndex(index) {
    await this.variableService.set(VAR_CURRENT_UPDATE_INDEX, index)
  }

}
