import { AuthenticationService } from '../../auth/_services/authentication.service';
import { Injectable } from '@angular/core';
import * as PouchDB from 'pouchdb';
import { environment } from '../../../../environments/environment';
@Injectable()
export class SyncingService {
  constructor(private autheunticationService: AuthenticationService) { }

  getUserDB(): string {
    return localStorage.getItem('currentUser');
  }
  // @TODO refactor this to use node server
  getRemoteHost(): string {
    return environment.remoteCouchDBHost + this.getUserDB();
  }
  async syncAllRecords(username, password) {

    try {
      const response = await this.autheunticationService.loginForUpload(username, password);
      if (response) {
        return new Promise((resolve, reject) => {
          const result = PouchDB.sync(
            this.getUserDB(), this.getRemoteHost()
          )
            .on('complete', (data) => resolve(data))
            .on('error', (err) => reject(err));
        });
      } else {
        return Promise.reject('Wrong credentials');
      }
    } catch (error) {

      return Promise.reject(error);
    }
  }

  async pushAllrecords(username, password) {

    try {
      const response = await this.autheunticationService.loginForUpload(username, password);
      if (response) {
        return new Promise((resolve, reject) => {
          const result = PouchDB.replicate(
            this.getUserDB(), this.getRemoteHost()
          )
            .on('complete', (data) => resolve(data))
            .on('error', (err) => reject(err));
        });
      } else {
        return Promise.reject('Wrong credentials');
      }
    } catch (error) {
      return Promise.reject(error);
    }

  }

  async pullAllRecords(username, password) {

    try {
      const response = await this.autheunticationService.loginForUpload(username, password);
      if (response) {
        return new Promise((resolve, reject) => {
          const result = PouchDB.replicate(
            this.getRemoteHost(), this.getUserDB()
          )
            .on('complete', (data) => resolve(data))
            .on('error', (err) => reject(err));
        });
      } else {
        return Promise.reject('Wrong credentials');
      }
    } catch (error) {
      return Promise.reject(error);
    }
  }

}
