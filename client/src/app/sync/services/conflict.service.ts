import {CaseService} from "../../case/services/case.service";
import {CaseDefinitionsService} from "../../case/services/case-definitions.service";
import {TangyFormService} from "../../tangy-forms/tangy-form.service";
import {Injectable} from "@angular/core";
import {ReplicationStatus} from "../classes/replication-status.class";
import {UserDatabase} from "../../shared/_classes/user-database.class";
import {CaseDefinition} from "../../case/classes/case-definition.class";
import {Case} from "../../case/classes/case.class";
import {diff} from "../conflict/diff";
import {MergeInfo} from "../classes/merge-info.class";
import {merge} from "../conflict/merge";
import {Conflict} from "../../case/classes/conflict.class";
import {AppContext} from "../../app-context.enum";

@Injectable({
  providedIn: 'root'
})
export class ConflictService {
  constructor(
    private caseService: CaseService,
    private caseDefinitionsService: CaseDefinitionsService,
    private tangyFormService: TangyFormService
  ) { }

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
          
          // Override using the winning doc if canonicalTimestamp is available and is newer than this document.
          // By using diffInfo['canonicalTimestampOverrideDoc'], automerge is disabled.
          let diffInfo, merged
          if (b['canonicalTimestamp'] > a['canonicalTimestamp'] || (b['canonicalTimestamp'] && !a['canonicalTimestamp'])) {
            diffInfo = diff(a, b, caseDefinition)
            // Turn off automerge using the canonicalTimestampOverrideDoc flag.
            // Identify which doc is merged in the canonicalTimestampOverrideDoc property
            diffInfo['canonicalTimestampOverrideDoc'] = 'b'
            merged = {...b, _rev:a._rev}
            try {
              await userDb.put(merged) // create a new rev
            } catch (e) {
              console.log("Error: " + e)
            }
          }
          else if (a['canonicalTimestamp'] && !b['canonicalTimestamp']) {
            //The doc with canonicalTimestamp won already via Couchdb conflict resolution. We turn off automerge.
            diffInfo = diff(a, b, caseDefinition)
            diffInfo['canonicalTimestampOverrideDoc'] = 'a'
            merged = {...a}
          }
          
          if (diffInfo['canonicalTimestampOverrideDoc']) {
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
          // TODO indicate that the merge did happen - and which rev won.
          let conflict:Conflict = {
            diffInfo: null,
            mergeInfo: null,
            type: 'conflict',
            docType: currentDoc.type,
            merged: false,
            error: 'No diff handler available.'
          }
          // TODO need correct event id and eventFormId from a.
          const issue = await this.caseService.createIssue(`Unresolved Conflict for ${currentDoc.form.title}`, `type: ${currentDoc.type}; id: ${currentDoc._id}`, currentDoc.caseId, currentDoc.eventId , currentDoc.eventFormId, window['userProfile']._id, window['username'], [AppContext.Editor], conflict)
          const caseInstance = await this.tangyFormService.getResponse(issue.caseId)
          // is this the correct user id? Should we grab it from the conflictDoc or currentDoc?
          // const userProfile = await this.userService.getUserAccountById(conflictDoc.tangerineModifiedByUserId);
          // remove the conflict
          await userDb.db.remove(currentDoc._id, conflictRev)

          // TODO: move this into its own diff type....
          let winningDoc, losingDoc
          if (currentDoc.tangerineModifiedOn > conflictDoc.tangerineModifiedOn) {
            winningDoc = currentDoc
            losingDoc = conflictDoc
          } else {
            winningDoc = conflictDoc
            losingDoc = currentDoc
          }
          // Saving the losingDoc in case it needs to be reverted.
          await this.caseService.saveProposedChange(losingDoc, caseInstance, issue._id, conflictDoc.tangerineModifiedByUserId, conflictDoc.tangerineModifiedByUserId )
          await userDb.put(winningDoc) // create a new rev
          // TODO: if this was a pull, should we check if the remoteDb has a different rev at this point - to avoid another conflict?
          // if the remoteDB is at a different seq id, return false, and then keep pulling, until it returns true, and then push.
          // This particular solution may be too much of an edge case...
        }
      }
    }
  }
}

