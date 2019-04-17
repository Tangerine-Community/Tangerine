import { Injectable } from '@angular/core';
import { ReplicationStatus } from '../classes/replication-status.class';
import PouchDB from 'pouchdb';
import { AppConfigService } from 'src/app/shared/_services/app-config.service';
import { UserService } from 'src/app/shared/_services/user.service';
import { HttpParams, HttpClient } from '@angular/common/http';
import { TwoWaySyncSession } from '../classes/two-way-sync-session.class';

@Injectable({
  providedIn: 'root'
})
export class TwoWaySyncService {

  constructor(
    private readonly appConfigService:AppConfigService,
    private readonly userService:UserService,
    private readonly http:HttpClient
  ) { }

  sync(username:string):Promise<ReplicationStatus> {
    return new Promise(async (resolve, reject) => {
      try{
        const localDb = new PouchDB(username)
        const syncSession = await this.syncSessionStart(username)
        const remoteDb = new PouchDB(syncSession.url)
        localDb.sync(remoteDb, {filter: syncSession.filter, query_params: syncSession.query_params}).on('complete', async function (info) {
          const conflictsQuery = await localDb.query('two-way-sync_conflicts');
          //await this.syncSessionClose(syncSession)
          resolve(<ReplicationStatus>{
            pulled: info.pull.docs_written,
            pushed: info.push.docs_written,
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

  private async syncSessionStart(username):Promise<TwoWaySyncSession> {
    const appConfig = await this.appConfigService.getAppConfig();
    let profileDoc = await this.userService.getUserProfile(username)
    let params = new HttpParams()
    params.set('profileId', profileDoc._id)
    params.set('groupId', appConfig.groupName)
    return  <TwoWaySyncSession>await this.http.get(`${appConfig.serverUrl}/api/start-sync-session`, { params }).toPromise()
  }

  private async syncSessionClose(syncSession:TwoWaySyncSession):Promise<any> {
  }
}
