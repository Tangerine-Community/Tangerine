import { Injectable } from '@angular/core';
import { ReplicationStatus } from '../classes/replication-status.class';
import PouchDB from 'pouchdb';
import { AppConfigService } from 'src/app/shared/_services/app-config.service';
import { UserService } from 'src/app/shared/_services/user.service';
import { HttpParams, HttpClient, HttpHeaders } from '@angular/common/http';
import { TwoWaySyncSession } from '../classes/two-way-sync-session.class';
import { TangyFormService } from 'src/app/tangy-forms/tangy-form-service';
import { SyncingService } from 'src/app/core/sync-records/_services/syncing.service';
import { TangyFormsInfoService } from 'src/app/tangy-forms/tangy-forms-info-service';
import { UserDatabase } from 'src/app/shared/_classes/user-database.class';

@Injectable({
  providedIn: 'root'
})
export class TwoWaySyncService {

  constructor(
    private readonly appConfigService:AppConfigService,
    private readonly userService:UserService,
    private readonly http:HttpClient,
    private readonly syncService:SyncingService
  ) { }

  // userProfileId is required for the first sync if your centrally managed user profile is currently remote to you. 
  // As soon as it's local, we can look it up and all we need is the username.
  sync(username:string, userProfileId = ''):Promise<ReplicationStatus> {
    return new Promise(async (resolve, reject) => {
      try{
        const config = await this.appConfigService.getAppConfig()
        const localDb = await this.userService.getUserDatabase(username)
        if (!userProfileId) {
          let profileDoc = await this.userService.getUserProfile(username)
          userProfileId = profileDoc._id
        }
        const syncSession = <TwoWaySyncSession>await this.http.get(`${config.serverUrl}sync-session/start/${config.groupName}/${userProfileId}`).toPromise()
        const remoteDb = new PouchDB(syncSession.pouchDbSyncUrl)
        localDb.sync(remoteDb, syncSession.pouchDbSyncOptions).on('complete', async  (info) => {
          const conflictsQuery = await localDb.query('two-way-sync_conflicts');
          const uploadQueue = await this.syncService.getUploadQueue(username, syncSession.formIdsToNotPush)
          await this.syncService.push(username, syncSession.formIdsToNotPush)
          resolve(<ReplicationStatus>{
            pulled: info.pull.docs_written,
            pushed: info.push.docs_written,
            forcePushed: uploadQueue.length,
            conflicts: conflictsQuery.rows.map(row => row.id)
          })
        }).on('error', function (errorMessage) {
          console.log("boo, something went wrong! error: " + errorMessage)
          reject(errorMessage)
        });
      } catch (err) {
        reject(err)
      }
    })
  }

}
