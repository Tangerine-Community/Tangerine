import { LocationConfig } from './../device/classes/device.class';
import { HttpClient } from '@angular/common/http';
import { ReplicationStatus } from './classes/replication-status.class';
import { AppConfig } from 'src/app/shared/_classes/app-config.class';
import { FormInfo } from 'src/app/tangy-forms/classes/form-info.class';
import { UserDatabase } from './../shared/_classes/user-database.class';
import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb'
import {Subject} from 'rxjs';
import {VariableService} from '../shared/_services/variable.service';
import {AppConfigService} from '../shared/_services/app-config.service';
import { AppContext } from '../app-context.enum';
import {Case} from "../case/classes/case.class";
import {CaseDefinition} from "../case/classes/case-definition.class";
import {CaseDefinitionsService} from "../case/services/case-definitions.service";
import {MergeInfo} from "./classes/merge-info.class";
import {CaseService} from "../case/services/case.service";
import {diff} from "./conflict/diff";
import {merge} from "./conflict/merge";
import {TangyFormResponse} from "../tangy-forms/tangy-form-response.class";
import {EventForm} from "../case/classes/event-form.class";
import {TangyFormService} from "../tangy-forms/tangy-form.service";

export interface LocationQuery {
  level:string
  id:string
}

export class SyncCouchdbDetails {
  serverUrl:string
  groupId:string
  deviceId:string
  deviceToken:string
  formInfos:Array<FormInfo> = []
  locationQueries:Array<LocationQuery> = []
  deviceSyncLocations:Array<LocationConfig>
}

@Injectable({
  providedIn: 'root'
})
export class SyncCouchdbService {

  public readonly syncMessage$: Subject<any> = new Subject();

  constructor(
    private http: HttpClient,
    private variableService: VariableService,
    private appConfigService: AppConfigService,
    private caseDefinitionsService: CaseDefinitionsService,
    private caseService: CaseService,
    private tangyFormService: TangyFormService,
  ) { }

  /*
   Note that if you run this with no forms configured to CouchDB sync,
   that will result in no filter query and everything will be synced. Use carefully.
  */
  async sync(userDb:UserDatabase, syncDetails:SyncCouchdbDetails): Promise<ReplicationStatus> {
    const appConfig = await this.appConfigService.getAppConfig()
    const syncSessionUrl = await this.http.get(`${syncDetails.serverUrl}sync-session/start/${syncDetails.groupId}/${syncDetails.deviceId}/${syncDetails.deviceToken}`, {responseType:'text'}).toPromise()
    const remoteDb = new PouchDB(syncSessionUrl)
    // From Form Info, generate the pull and push selectors.
    const pullSelector = {
      "$or" : [
        ...syncDetails.formInfos.reduce(($or, formInfo) => {
          if (formInfo.couchdbSyncSettings && formInfo.couchdbSyncSettings.enabled && formInfo.couchdbSyncSettings.pull) {
            $or = [
              ...$or,
              ...syncDetails.deviceSyncLocations.length > 0 && formInfo.couchdbSyncSettings.filterByLocation
                ? syncDetails.deviceSyncLocations.map(locationConfig => {
                  // Get last value, that's the focused sync point.
                  let location = locationConfig.value.slice(-1).pop()
                  return {
                    "form.id": formInfo.id,
                    [`location.${location.level}`]: location.value
                  }
                })
                : [
                  {
                    "form.id": formInfo.id
                  }
                ]
            ]
          }
          return $or
        }, []),
        ...syncDetails.deviceSyncLocations.length > 0
          ? syncDetails.deviceSyncLocations.map(locationConfig => {
            // Get last value, that's the focused sync point.
            let location = locationConfig.value.slice(-1).pop()
            return {
              "type": "issue",
              [`location.${location.level}`]: location.value,
              "resolveOnAppContext": AppContext.Client
            }
          })
          : [
            {
              "resolveOnAppContext": AppContext.Client,
              "type": "issue"
            }
          ]
      ]
    }
    const pushSelector = {
      "$or" : [
        ...syncDetails.formInfos.reduce(($or, formInfo) => {
          if (formInfo.couchdbSyncSettings && formInfo.couchdbSyncSettings.enabled && formInfo.couchdbSyncSettings.push) {
            $or = [
              ...$or,
              {
                "form.id": formInfo.id
              }
            ]
          }
          return $or
        }, []),
        {
          "type": "issue"
        }
      ]
    }
    // Get the sequences we'll be starting with.
    let pull_last_seq = await this.variableService.get('sync-pull-last_seq')
    let push_last_seq = await this.variableService.get('sync-push-last_seq')
    if (typeof pull_last_seq === 'undefined') {
      pull_last_seq = 0;
    }
    if (typeof push_last_seq === 'undefined') {
      push_last_seq = 0;
    }

    const startLocalSequence = (await userDb.changes({descending: true, limit: 1})).last_seq
    await this.variableService.set('sync-push-last_seq-start', startLocalSequence)

    let pullSyncOptions = {
      "since": pull_last_seq,
      "batch_size": 50,
      "batches_limit": 1,
      ...appConfig.couchdbPullUsingDocIds
        ? {
          "doc_ids": (await remoteDb.find({
            "limit": 987654321,
            "fields": ["_id"],
            "selector":  pullSelector
          })).docs.map(doc => doc._id)
        }
        : {
          "selector": pullSelector
        }
    }
    let replicationStatus = await this.pull(userDb, remoteDb, pullSyncOptions);
    await this.resolveConflicts(replicationStatus, userDb, remoteDb);

    // Now that we've pulled, let's find the last_seq that we can skip the next time we push.
    // Find the last sequence in the local database and set the sync-push-last_seq variable.
    const lastLocalSequence = (await userDb.changes({descending: true, limit: 1})).last_seq
    await this.variableService.set('sync-push-last_seq', lastLocalSequence)

    const pushSyncOptions = {
      "since": push_last_seq,
      "batch_size": 50,
      "batches_limit": 1,
      ...appConfig.couchdbPush4All ? { } : appConfig.couchdbPushUsingDocIds
        ? {
          "doc_ids": (await userDb.db.find({
            "limit": 987654321,
            "fields": ["_id"],
            "selector":  pushSelector
          })).docs.map(doc => doc._id)
        }
        : {
          "selector": pushSelector
        }
    }

    replicationStatus = await this.push(userDb, remoteDb, pushSyncOptions);
    await this.resolveConflicts(replicationStatus, userDb, remoteDb);

    return replicationStatus
  }

  private async resolveConflicts(replicationStatus: ReplicationStatus, userDb: UserDatabase, remoteDb: PouchDB = null) {
    for (const id of replicationStatus.conflicts) {
      let currentDoc = await userDb.db.get(id, {conflicts: true})
      let conflictRevArray = currentDoc._conflicts
      if (conflictRevArray) {
        const conflictRev = conflictRevArray[0]
        let conflictDoc = await userDb.db.get(id, {rev: conflictRev})
        if (currentDoc.type === 'case') {
          let a:Case = currentDoc
          let b:Case = conflictDoc
          let caseDefinitionId = a.caseDefinitionId
          let caseDefinition = <CaseDefinition>(await this.caseDefinitionsService.load())
            .find(caseDefinition => caseDefinition.id === caseDefinitionId)
          let diffInfo = diff(a, b, caseDefinition)
          // Create issue if we have not detected the conflict type...
          if (diffInfo.diffs.length === 0) {
            let issueMetadata = diffInfo as any
            issueMetadata = {
              ...diffInfo,
              type: 'conflict',
              conflictType: 'case',
              error: 'Unable to detect conflict type.'
            }
            await this.caseService.createIssue(`Unresolved Conflict on ${a.form.title}`, 'Unable to detect conflict type.', a.events[0].id, a.events[0].eventForms[0].id, window['userProfile']._id, window['username'], issueMetadata)
          }
          const mergeInfo = merge(diffInfo)
          // TODO: uncoment if this is necessary
          // Goal is to run markQualifyingCaseAsComplete and markQualifyingEventsAsComplete
          // await this.caseService.load(a._id)
          // this.caseService.setContext(a.events[0].id, a.events[0].eventForms[0].id)

          // remove the conflict
          await remoteDb.remove(mergeInfo.merged._id, conflictRev)
          await userDb.db.remove(mergeInfo.merged._id, conflictRev)
          // test if the correct rev will be in the merged document - is this the winning rev/conflictRev?
          const mergeDocLocal = await userDb.put(mergeInfo.merged) // create a new rev
          const mergeDocRemote = await remoteDb.put(mergeDocLocal) // create a new rev
          // loop through the diffs and see if any have resolve: false
          // do we need a difftype that detects but doesn't resolve - recogises that we cannot act upon it.
          // identify what form type it is
          await this.caseService.createIssue(`Conflict on ${a.form.title}`, '', a._id, mergeInfo.merged.events[0].id, mergeInfo.merged.events[0].eventForms[0].id, window['userProfile']._id, window['username'], mergeInfo)
          //the non-winning rev is a proposal, giving the server user the opportunity to resolve it.
        } else if (currentDoc.type === 'response') {
          const issueMetadata = {
            currentDoc,
            conflictDoc,
            type: 'conflict',
            conflictType: 'response',
            error: 'Conflict resolution not available for responses.'
          }
          const issue = await this.caseService.createIssue(`Unresolved Conflict for response on ${currentDoc.form.title}`, `response id: ${currentDoc._id}`, currentDoc.caseId, currentDoc.eventId , currentDoc.eventFormId, window['userProfile']._id, window['username'], issueMetadata)
          const caseInstance = await this.tangyFormService.getResponse(issue.caseId)
          // is this the correct user id? Should we grab it from the conflictDoc or currentDoc?
          await this.caseService.saveProposedChange(conflictDoc, caseInstance, issue.id, conflictDoc.userProfileId, conflictDoc.username )
        } else {
          console.log("unexpected document type " + currentDoc.type + " for " + currentDoc._id)
        }
      }
    }
  }


  async push(userDb, remoteDb, pouchSyncOptions) {
    const status = <ReplicationStatus>await new Promise((resolve, reject) => {
      let checkpointProgress = 0, diffingProgress = 0, startBatchProgress = 0, pendingBatchProgress = 0
      const direction =  'push'
      userDb.db['replicate'].to(remoteDb, pouchSyncOptions).on('complete', async (info) => {
        await this.variableService.set('sync-push-last_seq', info.last_seq);
        const conflictsQuery = await userDb.query('sync-conflicts');
        resolve(<ReplicationStatus>{
          pushed: info.docs_written,
          conflicts: conflictsQuery.rows.map(row => row.id)
        });
      }).on('change', async (info) => {
        await this.variableService.set('sync-push-last_seq', info.last_seq);
        const progress = {
          'docs_read': info.docs_read,
          'docs_written': info.docs_written,
          'doc_write_failures': info.doc_write_failures,
          'pending': info.pending,
          'direction': direction
        };
        this.syncMessage$.next(progress);
      }).on('active', function (info) {
        if (info) {
          console.log('Push replication is active. Info: ' + JSON.stringify(info));
        } else {
          console.log('Push replication is active.');
        }
      }).on('checkpoint', (info) => {
        if (info) {
          // console.log(direction + ': Checkpoint - Info: ' + JSON.stringify(info));
          let progress;
          if (info.checkpoint) {
            checkpointProgress = checkpointProgress + 1
            progress = {
              'message': checkpointProgress,
              'type': 'checkpoint',
              'direction': direction
            };
          } else if (info.diffing) {
            diffingProgress = diffingProgress + 1
            progress = {
              'message': diffingProgress,
              'type': 'diffing',
              'direction': direction
            };
          } else if (info.startNextBatch) {
            startBatchProgress = startBatchProgress + 1
            progress = {
              'message': startBatchProgress,
              'type': 'startNextBatch',
              'direction': direction
            };
          } else if (info.pendingBatch) {
            pendingBatchProgress = pendingBatchProgress + 1
            progress = {
              'message': pendingBatchProgress,
              'type': 'pendingBatch',
              'direction': direction
            };
          } else {
            progress = {
              'message': JSON.stringify(info),
              'type': 'other',
              'direction': direction
            };
          }
          this.syncMessage$.next(progress);
        } else {
          console.log(direction + ': Calculating Checkpoints.');
        }
      }).on('error', function (errorMessage) {
        console.log('boo, something went wrong! error: ' + errorMessage);
        reject(errorMessage);
      });
    });
    return status;
  }

  async pull(userDb, remoteDb, pouchSyncOptions) {
    const status = <ReplicationStatus>await new Promise((resolve, reject) => {
      let checkpointProgress = 0, diffingProgress = 0, startBatchProgress = 0, pendingBatchProgress = 0
      const direction =  'pull'
      userDb.db['replicate'].from(remoteDb, pouchSyncOptions).on('complete', async (info) => {
        await this.variableService.set('sync-pull-last_seq', info.last_seq);
        const conflictsQuery = await userDb.query('sync-conflicts');
        resolve(<ReplicationStatus>{
          pulled: info.docs_written,
          conflicts: conflictsQuery.rows.map(row => row.id)
        });
      }).on('change', async (info) => {
        await this.variableService.set('sync-pull-last_seq', info.last_seq);
        const progress = {
          'docs_read': info.docs_read,
          'docs_written': info.docs_written,
          'doc_write_failures': info.doc_write_failures,
          'pending': info.pending,
          'direction': 'pull'
        };
        this.syncMessage$.next(progress);
      }).on('active', function (info) {
        if (info) {
          console.log('Pull replication is active. Info: ' + JSON.stringify(info));
        } else {
          console.log('Pull replication is active.');
        }
      }).on('checkpoint', (info) => {
        if (info) {
          // console.log(direction + ': Checkpoint - Info: ' + JSON.stringify(info));
          let progress;
          if (info.checkpoint) {
            checkpointProgress = checkpointProgress + 1
            progress = {
              'message': checkpointProgress,
              'type': 'checkpoint',
              'direction': direction
            };
          } else if (info.diffing) {
            diffingProgress = diffingProgress + 1
            progress = {
              'message': diffingProgress,
              'type': 'diffing',
              'direction': direction
            };
          } else if (info.startNextBatch) {
            startBatchProgress = startBatchProgress + 1
            progress = {
              'message': startBatchProgress,
              'type': 'startNextBatch',
              'direction': direction
            };
          } else if (info.pendingBatch) {
            pendingBatchProgress = pendingBatchProgress + 1
            progress = {
              'message': pendingBatchProgress,
              'type': 'pendingBatch',
              'direction': direction
            };
          }
          this.syncMessage$.next(progress);
        } else {
          console.log(direction + ': Calculating Checkpoints.');
        }
      }).on('error', function (errorMessage) {
        console.log('boo, something went wrong! error: ' + errorMessage);
        reject(errorMessage);
      });
    });
    return status;
  }
}
