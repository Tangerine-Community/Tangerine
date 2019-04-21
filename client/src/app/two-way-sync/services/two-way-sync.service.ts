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

  sync(username:string, userProfileId = ''):Promise<ReplicationStatus> {
    return new Promise(async (resolve, reject) => {
      try{
        const config = await this.appConfigService.getAppConfig()
        const localDb = new PouchDB(username)
        if (!userProfileId) {
          let profileDoc = await this.userService.getUserProfile(username)
          userProfileId = profileDoc._id
        }
        const syncSession = <TwoWaySyncSession>await this.http.get(`${config.serverUrl}sync-session/start/${config.groupName}/${userProfileId}`).toPromise()
        const remoteDb = new PouchDB(syncSession.url)
        localDb.sync(remoteDb, {filter: syncSession.filter, query_params: syncSession.query_params}).on('complete', async  (info) => {
          const conflictsQuery = await localDb.query('two-way-sync_conflicts');
          const formIdsToNotPush:Array<string> = [...syncSession.query_params.formIds.split(','), 'user-profile']
          const uploadQueue = await this.syncService.getUploadQueue(username, formIdsToNotPush)
          await this.syncService.push(username, formIdsToNotPush)
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
