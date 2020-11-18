import { DiffInfo } from './../classes/diff-info.class';
import { CaseDefinition } from 'src/app/case/classes/case-definition.class';
import {CaseService} from "../../case/services/case.service";
import {CaseDefinitionsService} from "../../case/services/case-definitions.service";
import {TangyFormService} from "../../tangy-forms/tangy-form.service";
import {Injectable} from "@angular/core";
import {ReplicationStatus} from "../classes/replication-status.class";
import {UserDatabase} from "../../shared/_classes/user-database.class";
import {Case} from "../../case/classes/case.class";
import {diff} from "../conflict/diff";
import {MergeInfo} from "../classes/merge-info.class";
import {merge} from "../conflict/merge";
import {Conflict} from "../../case/classes/conflict.class";
import {AppContext} from "../../app-context.enum";
import {Issue, IssueStatus} from "../../case/classes/issue.class";

@Injectable({
  providedIn: 'root'
})
export class ConflictService {
  constructor(
    private caseService: CaseService,
    private caseDefinitionsService: CaseDefinitionsService,
    private tangyFormService: TangyFormService
  ) { }

  /*
   * @TODO This does not work as we'd like. See concerns raised in the following ticket: https://github.com/Tangerine-Community/Tangerine/issues/2492
   */
  async dontResolveConflictsButCreateIssues(replicationStatus: ReplicationStatus, userDb: UserDatabase) {
    let newConflicts: Array<string> = replicationStatus.pullConflicts.filter(pullConflictId => !replicationStatus.initialConflicts.includes(pullConflictId))
    const caseDefinitions = await this.caseDefinitionsService.load();
    for (const id of newConflicts) {
      let currentDoc = await userDb.db.get(id, {conflicts: true})
      let conflictDoc
      let conflictRevArray = currentDoc._conflicts
      if (conflictRevArray) {
        const conflictRev = conflictRevArray[0]
        conflictDoc = await userDb.db.get(id, {rev: conflictRev})
      }
      let diffInfo:DiffInfo  
      let caseDefinition:CaseDefinition
      if (currentDoc.type === 'case') {
        caseDefinition = <CaseDefinition>caseDefinitions.find(caseDefinition => caseDefinition.id === currentDoc.caseDefinitionId)
      }
      diffInfo = diff(currentDoc, conflictDoc, caseDefinition)
      let conflict:Conflict = {
        diffInfo: diffInfo,
        mergeInfo: null,
        type: 'conflict',
        docType: currentDoc.type,
        merged: false,
        error: ''
      }
      const issue = await this.caseService.createIssue(
        `Conflict detected on ${currentDoc._id}`,
        '',
        currentDoc._id,
        currentDoc .events[0].id,
        currentDoc.events[0].eventForms[0].id,
        window['userProfile']._id, window['username'],
        [AppContext.Editor],
        conflict
      )
    }
    
  }

  async resolveConflicts(replicationStatus: ReplicationStatus, userDb: UserDatabase, remoteDb = null, direction: string, caseDefinitions:CaseDefinition[]) {
    let conflicts: Array<string> = direction === 'pull' ? replicationStatus.pullConflicts : replicationStatus.pushConflicts
    for (const id of conflicts) {
      // PouchDb just did a sync and has marked this doc as having conflicts. This doc could represent either the version from the remoteDB or the local version.
      let currentDoc = await userDb.db.get(id, {conflicts: true})
      let conflictRevArray = currentDoc._conflicts
      if (conflictRevArray) {
        const conflictRev = conflictRevArray[0]
        let conflictDoc = await userDb.db.get(id, {rev: conflictRev})
        if (currentDoc.type === 'case') {
          let a:Case = currentDoc
          let b:Case = conflictDoc
          let caseDefinitionId = a.caseDefinitionId
          if (!caseDefinitions) {
            caseDefinitions = await this.caseDefinitionsService.load();
          }
          let caseDefinition = <CaseDefinition>caseDefinitions.find(caseDefinition => caseDefinition.id === caseDefinitionId)
          
          // Override using the winning doc if canonicalTimestamp is on one of the docs. 
          let merged
          let diffInfo = diff(a, b, caseDefinition)
          if((a['canonicalTimestamp'] && b['canonicalTimestamp']) && (a['canonicalTimestamp'] !== b['canonicalTimestamp'])) {
          // Turn off automerge using the canonicalTimestampOverrideDoc flag, which identifies which doc is merged
          // We don't know for sure which doc is the one we want to automerge - sometimes Couchdb picks one we didn't expect to win...    
          // In some cases, it may be on both, if this flag has already been used before.
          // In that case, we must compare the canonicalTimestampOverrideDoc
            diffInfo['canonicalTimestampOverrideDoc'] = (a['canonicalTimestamp'] > b['canonicalTimestamp']) ? 'a' : 'b'
            merged = (a['canonicalTimestamp'] > b['canonicalTimestamp']) ? {...a, _rev:b._rev} :  {...b, _rev:a._rev}
          } else if ((a['canonicalTimestamp'] && !b['canonicalTimestamp']) || (b['canonicalTimestamp'] && !a['canonicalTimestamp'])) {
            diffInfo['canonicalTimestampOverrideDoc'] = a['canonicalTimestamp'] ? 'a' : 'b'
            merged = a['canonicalTimestamp'] ? {...a} : {...b}
          }
          
          if (diffInfo['canonicalTimestampOverrideDoc']) {
            try {
              await userDb.put(merged) // create a new rev
            } catch (e) {
              console.log("Error: " + e)
            }
            
            let conflict:Conflict = {
              diffInfo: diffInfo,
              mergeInfo: null,
              type: 'conflict',
              docType: 'case',
              merged: false,
              error: 'Force merge due to canonicalTimestamp override'
            }
            // provide the conflict diff in the issuesMetadata rather than sending the response to be diffed, because the issues differ works on responses instead of cases.
            const issue = await this.caseService.createIssue(`Force merge conflict on ${merged.form.id}`, 'Force merge due to canonicalTimestamp override.', merged._id, merged.events[0].id, merged.events[0].eventForms[0].id, window['userProfile']._id, window['username'], [AppContext.Editor], conflict)
            // We must remove the conflictRev (i.e. the conflict) from the "winning" doc, which is always "a".
            try {
              await userDb.db.remove(diffInfo.a._id, conflictRev)
            } catch (e) {
              console.log("Error: " + e)
            }
          } else {
            diffInfo = diff(a, b, caseDefinition)
            // Create issue if we have not detected the conflict type...
            if (diffInfo.diffs.length === 0) {
              let conflict:Conflict = {
                diffInfo: diffInfo,
                mergeInfo: null,
                type: 'conflict',
                docType: 'case',
                merged: false,
                error: 'Unable to detect conflict type.'
              }
              // provide the conflict diff in the issuesMetadata rather than sending the response to be diffed, because the issues differ works on responses instead of cases.
              const issue = await this.caseService.createIssue(`Unresolved Conflict on ${a.form.id}`, 'Unable to detect conflict type.', a._id, a.events[0].id, a.events[0].eventForms[0].id, window['userProfile']._id, window['username'], [AppContext.Editor], conflict)
              // TODO delete the conflict!!!
              try {
                await userDb.db.remove(diffInfo.a._id, conflictRev)
              } catch (e) {
                console.log("Error: " + e)
              }
            } else {
              const mergeInfo:MergeInfo = merge(diffInfo)

              // TODO: run markQualifyingCaseAsComplete and markQualifyingEventsAsComplete
              // remove the conflict
              try {
                await userDb.db.remove(mergeInfo.merged._id, conflictRev)
              } catch (e) {
                console.log("Error: " + e)
              }
              try {
                await userDb.put(mergeInfo.merged) // create a new rev
              } catch (e) {
                console.log("Error: " + e)
              }
              // Replicate the merged doc to the remoteDb.
              // TODO: confirm this is unnecessary - it will get eventually pushed to the server in the next sync...
              // const options = {doc_ids:[mergeInfo.merged._id]}
              // PouchDB.replicate(userDb.db, remoteDb, options)

              let conflict:Conflict = {
                diffInfo: null,
                mergeInfo: mergeInfo,
                type: 'conflict',
                docType: currentDoc.type,
                merged: true,
                error:null,
              }

              const issue = await this.caseService.createIssue(`Conflict on ${a.form.id}`, '', a._id, null, null, window['userProfile']._id, window['username'], [AppContext.Editor], conflict)
            }
          }
        } else {
          // TODO: move this into its own diff type....

          const diffInfoStub:DiffInfo = {
            a: currentDoc,
            b: conflictDoc,
            caseDefinition: null,
            diffs: []
          }
          
          let conflict:Conflict = {
            diffInfo: diffInfoStub,
            mergeInfo: null,
            type: 'conflict',
            docType: currentDoc.type,
            merged: false,
            error: 'No diff handler available; proceeding with the merge.'
          }
          // TODO need correct event id and eventFormId from a.
          const issue = await this.caseService.createIssue(`Auto-resolved Conflict for ${currentDoc.form.title}`, `type: ${currentDoc.type}; id: ${currentDoc._id}`, currentDoc.caseId, currentDoc.eventId , currentDoc.eventFormId, window['userProfile']._id, window['username'], [AppContext.Editor], conflict)
          const caseInstance = await this.tangyFormService.getResponse(issue.caseId)
          // remove the conflict
          await userDb.db.remove(currentDoc._id, conflictRev)
          // Saving the losingDoc in case it needs to be reverted.
          await this.caseService.saveProposedChange(conflictDoc, caseInstance, issue._id, conflictDoc.tangerineModifiedByUserId, conflictDoc.tangerineModifiedByUserId )
          await userDb.put(currentDoc) // create a new rev
          await this.tangyFormService.saveResponse({
            ...issue,
            status: IssueStatus.Merged
          })
          // TODO: if this was a pull, should we check if the remoteDb has a different rev at this point - to avoid another conflict?
          // if the remoteDB is at a different seq id, return false, and then keep pulling, until it returns true, and then push.
          // This particular solution may be too much of an edge case...
        }
      }
    }
  }
}

