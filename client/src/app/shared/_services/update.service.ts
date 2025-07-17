import { VariableService } from './variable.service';
import { _TRANSLATE } from 'src/app/shared/translation-marker';
import { Subject } from 'rxjs';
import { AppConfigService } from './app-config.service';
import { UserService } from 'src/app/shared/_services/user.service';
import { Injectable } from '@angular/core';
import { updates } from '../../core/update/update/updates';
import {HttpClient} from "@angular/common/http";
import {UserDatabase} from "../_classes/user-database.class";
import {SyncService} from "../../sync/sync.service";

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
    private appConfigService:AppConfigService,
    private http: HttpClient,
    private syncService: SyncService,
  ) { }

  async install() {
    await this.setCurrentUpdateIndex(updates.length - 1)
  }

  sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))

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
      let atUpdateIndex = await this.variableService.get('atUpdateIndex');
      if (!atUpdateIndex) {
        const userDb = await this.userService.getUserDatabase(username);
        atUpdateIndex = await this.migrateInfodoc(userDb, atUpdateIndex);
      }
      const finalUpdateIndex = updates.length - 1;
      if (finalUpdateIndex !== atUpdateIndex) {
        return true
      } else {
        return false
      }
    }
  }

  private async migrateInfodoc(userDb: UserDatabase, atUpdateIndex) {
    // Use try in case this is an old account where info doc was not created.
    try {
      const infoDoc = await userDb.get('info');
      atUpdateIndex = infoDoc.hasOwnProperty('atUpdateIndex') ? infoDoc['atUpdateIndex'] : 0
      await this.variableService.set('atUpdateIndex', atUpdateIndex);
      console.log("migrateInfodoc atUpdateIndex migrated from infoDoc: " + atUpdateIndex)
    } catch (e) {
      await this.variableService.set('atUpdateIndex', 0);
      atUpdateIndex = 0;
      console.log("migrateInfodoc atUpdateIndex set to: " + atUpdateIndex)
    }
    return atUpdateIndex;
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
    let totalUpdatesApplied = 0
    let atUpdateIndex = await this.variableService.get('atUpdateIndex');
    if (!atUpdateIndex) {
      atUpdateIndex = await this.migrateInfodoc(userDb, atUpdateIndex);
    }

    const finalUpdateIndex = updates.length - 1;
    if (finalUpdateIndex !== atUpdateIndex) {
      let requiresViewsRefresh = false;
      while (finalUpdateIndex !== atUpdateIndex) {
        this.status$.next(_TRANSLATE(`Applying Update: ${totalUpdatesApplied+1}`))
        if (updates[atUpdateIndex+1].requiresViewsUpdate) {
          requiresViewsRefresh = true;
        }
        if (updates[atUpdateIndex+1].message) {
          this.status$.next(_TRANSLATE(`${updates[atUpdateIndex+1].message}`))
          await this.sleep(1000)
        }
        await updates[atUpdateIndex+1].script(userDb, appConfig, this.userService, this.variableService, this.syncService, this.status$);
        totalUpdatesApplied++;
        atUpdateIndex++;
        if (requiresViewsRefresh) {
          await this.userService.updateAllDefaultUserDocs()
        }
      }
      atUpdateIndex--;
      await this.variableService.set('atUpdateIndex', atUpdateIndex);
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

    const username = this.userService.getCurrentUser();
    const appConfig = await this.appConfigService.getAppConfig()
    const userDb = await this.userService.getUserDatabase(username);
    let atUpdateIndex = await this.getCurrentUpdateIndex()
    const finalUpdateIndex = updates.length - 1;
    let requiresViewsRefresh = false;

    if (finalUpdateIndex !== atUpdateIndex) {
      while (atUpdateIndex < finalUpdateIndex) {
        this.status$.next(_TRANSLATE(`Applying Update: ${atUpdateIndex+1}`))
        if (updates[atUpdateIndex+1].requiresViewsUpdate) requiresViewsRefresh = true;
        if (updates[atUpdateIndex+1].message) {
          this.status$.next(_TRANSLATE(`${updates[atUpdateIndex+1].message}`))
          await this.sleep(1000)
        }
        await updates[atUpdateIndex+1].script(userDb, appConfig, this.userService, this.variableService, this.syncService, this.status$);
        atUpdateIndex++;
        await this.setCurrentUpdateIndex(atUpdateIndex)
      }
    }
    await this.updateCustomViews(userDb);
  }

  private async updateCustomViews(userDb: UserDatabase) {
    try {
      // Get the queries.js using eval()
      let queryJs = await this.http.get('./assets/queries.js', {responseType: 'text'}).toPromise()
      let queries;
      eval(`queries = ${queryJs}`)
      // iterate each one, look at each doc, look at the version property, and compare to the one in variablesService. If not matching, do a put
      for (const query of queries) {
        let dbVersion, dbRev;
        let fileVersion = query.version
        // get the view doc from the db
        try {
          const docInDb = await userDb.get('_design/' + query.id)
          dbVersion = docInDb.version
          dbRev = docInDb._rev
        } catch (err) {
          // We don't have this design doc.
        }
        if (fileVersion !== dbVersion) {
          console.log("Updating custom view: " + query.id)
          let doc = {
            _id: '_design/' + query.id,
            version: query.version,
            views: {
              [query.id]: {
                ...typeof query.view === 'string' ? {"map": query.view.toString()} : {
                  ...query.view.map ? {"map": query.view.map.toString()} : {},
                  ...query.view.reduce ? {"reduce": query.view.reduce.toString()} : {}
                },
              }
            }
          }
          if (dbRev) {
            try {
              await userDb.put({
                ...doc,
                _rev: dbRev
              })
            } catch (err) {
              console.log('Error putting ' + '_design/' + query.id + ' Error: ' + err)
            }
          } else {
            await userDb.put(doc)
          }
        }
      }
      // TODO: do we initiate indexing here (be sure to use a limit:0 in the options so as to not choke the system memory), or first time report is run?
    } catch (e) {
      console.log("Error: " + JSON.stringify(e))
    }
  }

  async getCurrentUpdateIndex() {
    return <number>await this.variableService.get(VAR_CURRENT_UPDATE_INDEX)
  }

  async setCurrentUpdateIndex(index) {
    await this.variableService.set(VAR_CURRENT_UPDATE_INDEX, index)
  }
  
  async getBeforeCustomUpdates() {
    const customUpdates =<any> await this.http.get('./assets/before-custom-updates.js', {responseType: 'text'}).toPromise()
    return customUpdates
  }
  
  async getAfterCustomUpdates() {
    const customUpdates =<any> await this.http.get('./assets/after-custom-updates.js', {responseType: 'text'}).toPromise()
    return customUpdates
  }
  
  async runCustomUpdatesBefore(customUpdates) {
    this.status$.next(_TRANSLATE(`Applying Custom Update before Main Updates. `))
    // Expose a generic log function for custom updates.
    const log = this.status$.next
    eval(customUpdates)
    this.status$.next(_TRANSLATE(`Finished Custom Update before Main Updates. `))
  }
  
  async runCustomUpdatesAfter(customUpdates) {
    this.status$.next(_TRANSLATE(`Applying Custom Update after Main Updates. `))
    // Expose a generic log function for custom updates.
    const log = this.status$.next
    eval(customUpdates)
    this.status$.next(_TRANSLATE(`Finished Custom Update after Main Updates. `))
  }
}
