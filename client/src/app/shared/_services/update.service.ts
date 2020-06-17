import { VariableService } from './variable.service';
import { _TRANSLATE } from 'src/app/shared/translation-marker';
import { Subject } from 'rxjs';
import { AppConfigService } from './app-config.service';
import { UserService } from 'src/app/shared/_services/user.service';
import { Injectable } from '@angular/core';
import { updates } from '../../core/update/update/updates';

const VAR_CURRENT_UPDATE_INDEX = 'VAR_CURRENT_UPDATE_INDEX'
const VAR_VERSION_CUSTOM_QUERIES = 'VAR_VERSION_CUSTOM_QUERIES'
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
      let infoDoc = { _id: '', atUpdateIndex: 0 };
      try {
        infoDoc = await userDb.get('info');
      } catch (e) {
        await userDb.put({ _id: 'info', atUpdateIndex: 0 });
        infoDoc = await userDb.get('info');
      }
      const atUpdateIndex = infoDoc.hasOwnProperty('atUpdateIndex') ? infoDoc.atUpdateIndex : 0;
      const finalUpdateIndex = updates.length - 1;
      if (finalUpdateIndex !== atUpdateIndex) {
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
    let infoDoc = { _id: '', atUpdateIndex: 0 };
    try {
      infoDoc = await userDb.get('info');
    } catch (e) {
      await userDb.put({ _id: 'info', atUpdateIndex: 0 });
      infoDoc = await userDb.get('info');
    }
    let totalUpdatesApplied = 0
    let atUpdateIndex = infoDoc.hasOwnProperty('atUpdateIndex') ? infoDoc.atUpdateIndex : 0;
    const finalUpdateIndex = updates.length - 1;
    if (finalUpdateIndex !== atUpdateIndex) {
      let requiresViewsRefresh = false;
      while (finalUpdateIndex !== atUpdateIndex) {
        this.status$.next(_TRANSLATE(`Applying Update: ${totalUpdatesApplied+1}`))
        if (updates[atUpdateIndex+1].requiresViewsUpdate) {
          requiresViewsRefresh = true;
        }
        await updates[atUpdateIndex+1].script(userDb, appConfig, this.userService);
        totalUpdatesApplied++;
        atUpdateIndex++;
        if (requiresViewsRefresh) {
          await this.userService.updateAllDefaultUserDocs()
        }
      }
      atUpdateIndex--;
      infoDoc.atUpdateIndex = atUpdateIndex;
      await userDb.put(infoDoc);
    }
  }


  /*
   * Sync Protocol 2
   */

  async sp2_updateRequired() {
    const atUpdateIndex = await this.getCurrentUpdateIndex()
    return atUpdateIndex !== updates.length - 1 ? true : false
  }

  async sp2_processUpdates() {

    const username = await this.userService.getCurrentUser();
    const appConfig = await this.appConfigService.getAppConfig()
    const userDb = await this.userService.getUserDatabase(username);
    let atUpdateIndex = await this.getCurrentUpdateIndex()
    const finalUpdateIndex = updates.length - 1;
    let requiresViewsRefresh = false;

    if (finalUpdateIndex !== atUpdateIndex) {
      while (atUpdateIndex < finalUpdateIndex) {
        this.status$.next(_TRANSLATE(`Applying Update: ${atUpdateIndex+1}`))
        if (updates[atUpdateIndex+1].requiresViewsUpdate) requiresViewsRefresh = true;
        await updates[atUpdateIndex+1].script(userDb, appConfig, this.userService);
        atUpdateIndex++;
        await this.setCurrentUpdateIndex(atUpdateIndex)
      }
    }

    try {
      // Get the queries.js using eval()
      let queryJs = await this.http.get('./assets/queries.js', {responseType: 'text'}).toPromise()
      let queries;
      eval(`queries = ${queryJs}`)
      // iterate each one, look at each doc, look at the version property, and compare to the one in variablesService. If not matching, do a put
      let versionCustomQueries = <number>await this.variableService.get(VAR_VERSION_CUSTOM_QUERIES)
      for (const query of queries) {
        let version = query.version
        if (version !== versionCustomQueries) {
          let doc = {
            _id: '_design/' + query.id,
            version: query.version,
            views: {
              [query.id]: {
                ...typeof query.view === 'string'? {"map": query.view.toString()}: {
                  ...query.view.map? {"map": query.view.map.toString()}: {},
                  ...query.view.reduce? {"reduce": query.view.reduce.toString()}: {}
                },
              }
            }
          }
          // get the view doc from the db
          try {
            const docInDb = await userDb.get(query.id)
            await userDb.put({
              ...doc,
              _rev: docInDb._rev
            })
          } catch(err) {
            await userDb.put(doc)
          }
        }
      }
    } catch (e) {
      console.log("Error: " + JSON.stringify(e))
    }
    // TODO: do we initiate indexing here (be sure to use a limit:0 in the options so as to not choke the system memory), or first time report is run?
  }

  async getCurrentUpdateIndex() {
    return <number>await this.variableService.get(VAR_CURRENT_UPDATE_INDEX)
  }

  async setCurrentUpdateIndex(index) {
    await this.variableService.set(VAR_CURRENT_UPDATE_INDEX, index)
  }

}
