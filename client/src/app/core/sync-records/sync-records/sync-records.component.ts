import { Component, OnInit } from '@angular/core';

import { WindowRef } from '../../../shared/_services/window-ref.service';
import { SyncingService } from '../_services/syncing.service';
import { UserService } from '../../../shared/_services/user.service';
import {AppConfigService} from "../../../shared/_services/app-config.service";
import PouchDB from 'pouchdb';

@Component({
  selector: 'app-sync-records',
  templateUrl: './sync-records.component.html',
  styleUrls: ['./sync-records.component.css']
})
export class SyncRecordsComponent implements OnInit {
  isSyncSuccesful: boolean = undefined;
  syncStatus = '';
  allUsersSyncData;
  docsNotUploaded: number;
  docsUploaded: number;
  syncPercentageComplete: number;
  syncProtocol = '';
  contentVersion = '';
  window: any;

  constructor(
    private windowRef: WindowRef,
    private syncingService: SyncingService,
    private userService: UserService,
    private appConfigService: AppConfigService,
  ) {
    this.window = this.windowRef.nativeWindow;
  }

  async ngOnInit() {
    const appConfig = await this.appConfigService.getAppConfig();
    this.syncProtocol = appConfig.syncProtocol
    if (typeof this.syncProtocol !== 'undefined' && this.syncProtocol === 'replication') {
    } else {
      this.getUploadProgress();
    }
    if (this.window.location.href.split('/').indexOf('cordova-hot-code-push-plugin') !== -1) {
      this.contentVersion = this.window.location.href.split('/')[this.window.location.href.split('/').indexOf('cordova-hot-code-push-plugin')+1]
    }
    // setInterval(this.getTangyP2PPermissions, 3000);
    this.getTangyP2PPermissions();
  }

  async getUploadProgress() {
    const usernames = await this.userService.getUsernames();
    this.allUsersSyncData = await Promise.all(usernames.map(async username => {
      return await this.calculateUsersUploadProgress(username);
    }));
    this.docsNotUploaded = this.allUsersSyncData.reduce((acc, val) => { return acc + val.docsNotUploaded; }, 0);
    this.docsUploaded = this.allUsersSyncData.reduce((acc, val) => { return acc + val.docsUploaded; }, 0);
    this.syncPercentageComplete =
      ((this.docsUploaded / (this.docsNotUploaded + this.docsUploaded)) * 100) || 0;
  }
  async calculateUsersUploadProgress(username) {
    const uploadQueueResults = await this.syncingService.getUploadQueue(username);
    const docsNotUploaded = uploadQueueResults ? uploadQueueResults.length : 0;
    // const docsUploaded = await this.syncingService.getNumberOfFormsLockedAndUploaded(username);
    const docRowsUploaded = username ? await this.syncingService.getDocsUploaded(username) : await this.syncingService.getDocsUploaded();
    const docsUploaded = docRowsUploaded.length || 0;

    const syncPercentageComplete =
      ((docsUploaded / (docsNotUploaded + docsUploaded)) * 100) || 0;
    return {
      username,
      docsNotUploaded,
      docsUploaded,
      syncPercentageComplete,
      uploadQueueResults
    };
  }
  async getRemoteHost() {
    const appConfig = await this.appConfigService.getAppConfig();
    return appConfig.uploadUrl;
  }
  async sync() {
    this.isSyncSuccesful = undefined;
    const usernames = await this.userService.getUsernames();
    const appConfig = await this.appConfigService.getAppConfig();
    usernames.map(async username => {
      try {
        const result = await this.syncingService.sync(username);
        if (result) {
          this.isSyncSuccesful = true;
          this.getUploadProgress();
        }
      } catch (error) {
        console.error(error);
        this.isSyncSuccesful = false;
        this.getUploadProgress();
      }
    });
  }

  async init() {
    // window['TangyP2PPlugin'] = {};
    // let init = function (arg0, success, error) {
    //   // exec(success, error, 'TangyP2PPlugin', 'init', [arg0]);
    //   eval(success('boop'))
    // };
    // window['TangyP2PPlugin'].init = init;
    window['TangyP2PPlugin'].init(null, function(message) {
      console.log("Message: " + message)
      document.querySelector("#p2p-results").innerHTML += message + '<br/>'
    }, function(err) {
      console.log("TangyP2P error:: " + err)
      document.querySelector("#p2p-results").innerHTML += err + '<br/>'
    });
  }

  async startRegistration() {
    window['TangyP2PPlugin'].startRegistration(null, function(message) {
      console.log("Message: " + message)
      document.querySelector("#p2p-results").innerHTML += message + '<br/>'
    });
  }

  async discoverPeers() {
    window['TangyP2PPlugin'].discoverPeers(null, function(message) {
      console.log("Message: " + message)
      document.querySelector("#p2p-results").innerHTML += message + '<br/>'
    });
  }

  getTangyP2PPermissions() {
    window['TangyP2PPlugin'].getPermission(null, function(message) {
      console.log('Message from getTangyP2PPermissions: ' + message)
    }, function(err) {
      console.log('TangyP2P error:: ' + err)
    });
  }

}


