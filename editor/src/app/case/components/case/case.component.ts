import {Component, AfterContentInit, ChangeDetectorRef} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CaseService } from '../../services/case.service'
import { CaseEventDefinition } from '../../classes/case-event-definition.class';
import * as moment from 'moment';
import { CaseEvent } from '../../classes/case-event.class';
import {Issue} from "../../classes/issue.class";
import {GroupIssuesService} from "../../../groups/services/group-issues.service";
import axios from "axios";
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { AuthenticationService } from 'src/app/core/auth/_services/authentication.service';
import {ProcessMonitorService} from "../../../shared/_services/process-monitor.service";

class CaseEventInfo {
  caseEvents:Array<CaseEvent>;
  caseEventDefinition:CaseEventDefinition;
}

@Component({
  selector: 'app-case',
  templateUrl: './case.component.html',
  styleUrls: ['./case.component.css']
})
export class CaseComponent implements AfterContentInit {

  private ready = false
  templateTitle = ''
  templateDescription = ''
  caseEventsInfo:Array<CaseEventInfo>
  creatableCaseEventsInfo:Array<CaseEventInfo>
  selectedNewEventType = ''
  private inputSelectedDate = moment().format('YYYY-MM-DD')
  window:any
  caseService: CaseService
  authenticationService: AuthenticationService
  issues:Array<Issue>
  conflictingEvents:Array<any>
  moment
  groupId:string
  caseId:string
  hideRestore: boolean = false
  hideFormPlayer = true
  step = -1;
  process: any;
  showArchivedSliderState = false;

  constructor(
    private route: ActivatedRoute,
    caseService: CaseService,
    private router: Router,
    private ref: ChangeDetectorRef,
    authenticationService: AuthenticationService,
    private groupIssuesService:GroupIssuesService,
    private processMonitorService: ProcessMonitorService
  ) {
    ref.detach()
    this.window = window
    this.caseService = caseService
    this.authenticationService = authenticationService
    this.moment = moment
  }

  async ngAfterContentInit() {
    const process = this.processMonitorService.start('caseOpen', 'Opening Case...')
    this.groupId = window.location.pathname.split('/')[2]
    this.caseId = window.location.hash.split('/')[2]
    await this.loadCaseInstanceInfo(true)
    
    this.onCaseOpen()

    this.calculateTemplateData()
    await this.getIssuesAndConflicts(this.caseId)
    this.ready = true
    this.processMonitorService.stop(process.id)

    // this is required to reload the expansion panel
    this.ref.detectChanges()
  }

  setStep(index: number) {
    this.step = (this.step != index) ? index : -1;
    //this.getIssuesAndConflicts(this.groupId)
    this.ref.detectChanges()
  }

  showArchivedSliderChange() {
    this.showArchivedSliderState = !this.showArchivedSliderState
    this.calculateTemplateData()
    this.ref.detectChanges()
  }

  async loadCaseInstanceInfo(reload:boolean) {
    if (reload || !this.caseService.case || this.caseId !== this.caseService.case._id) {
      await this.caseService.load(this.caseId)
    }
    this.caseService.setContext()
    this.window.caseService = this.caseService
  }

  calculateTemplateData() {
    const caseService = this.caseService
    const getVariable = (variableName) => {
      const variablesByName = caseService.case.items.reduce((variablesByName,item) => {
        for (let input of item.inputs) {
          variablesByName[input.name] = input.value
        }
        return variablesByName
      }, {})
      return variablesByName[variableName]
    }
    eval(`this.templateTitle = caseService.caseDefinition.templateCaseTitle ? \`${caseService.caseDefinition.templateCaseTitle}\` : ''`)
    eval(`this.templateDescription = caseService.caseDefinition.templateCaseDescription ? \`${caseService.caseDefinition.templateCaseDescription}\` : ''`)
    this.caseEventsInfo = this
      .caseService
      .caseDefinition
      .eventDefinitions
      .map(caseEventDefinition => {
        return {
          caseEventDefinition,
          caseEvents: 
            this.caseService.case.events.filter(caseEvent => 
              caseEvent.caseEventDefinitionId === caseEventDefinition.id && 
              (this.showArchivedSliderState ? true : !caseEvent.archived))
        }
      })
    this.creatableCaseEventsInfo = this.caseEventsInfo
      .filter(caseEventInfo => {
        return (caseEventInfo.caseEventDefinition.repeatable === true || caseEventInfo.caseEvents.length === 0)
          && undefined === this.caseService.case.disabledEventDefinitionIds.find(eventDefinitionId => eventDefinitionId === caseEventInfo.caseEventDefinition.id)
      })
    
    this.selectedNewEventType = ''
    this.inputSelectedDate = moment(new Date()).format('YYYY-MM-DD')
    this.ref.detectChanges()
  }
  
  async getIssuesAndConflicts(caseId) {
    try {
      const queryResults = await this.groupIssuesService.query(this.groupId, {
        fun: "issuesByCaseId",
        keys: [caseId],
        include_docs: true,
        descending: true
      })
      this.issues = queryResults.map(issue => issue.doc)
    } catch (e) {
      console.error("Error fetching issues: " + JSON.stringify(e))
    }
    try {
      const queryResults = await this.groupIssuesService.query(this.groupId, {
        fun: "conflicts",
        keys: [caseId],
        conflicts: true,
        include_docs: true,
        descending: true
      })
      const conflictsQueryResults = queryResults.map(conflicts => conflicts.doc)
      let conflictRevisionIds = conflictsQueryResults.reduce(function (previousValue, currentValue) {
        return [...previousValue, ...currentValue._conflicts]
      }, [])
      const conflicts = []
      if (conflictRevisionIds) {
        for (const conflictRevisionId of conflictRevisionIds) {
          const token = localStorage.getItem('token');
          const conflictRevisionDoc = (<any>await axios.get(`/group-responses/readRev/${this.groupId}/${caseId}/${conflictRevisionId}`, {headers: {authorization: token}})).data
          conflicts.push(conflictRevisionDoc)
        }
      }
      const caseParticipantIds = this.caseService.case.participants.map(participant => participant.id)
      this.conflictingEvents = []
      conflicts.forEach(conflict => {
        const caseEventIds = this.caseService.case.events.map(event => event.id)
        // filter out any events that are from participants not in this "winning" case rev
        const conflictEvents = conflict.events.map(event => {
          if (event.eventForms) {
            const hasParticipant = (eventForm) => {
              // The first Registration event's participantId is empty.
              if (eventForm.participantId === "") {
                return true
              } else {
                return caseParticipantIds.includes(eventForm.participantId)
              }
            }
            const relevantEvent = event.eventForms.some(hasParticipant)
            if (relevantEvent) {
              return event
            }
          }
        })
        // Now find any events that are not in the "winning" rev.
        conflictEvents.forEach(event => {
          const isOldEvent = caseEventIds.includes(event.id)
          if (!isOldEvent) {
            // since we are putting events from different _revs in the same array, need to mark which _rev the event belongs to.
            event.conflictRevisionId = conflict._rev
            this.conflictingEvents.push(event)
          }
        })
      })
    } catch (e) {
      console.error("Error fetching conflicts: " + JSON.stringify(e))
    }
  }

  onOpenCaseConfirmButtonClick() {
    this.caseService.openCaseConfirmed = true
    this.ref.detectChanges()
  }

  async onCaseOpen(){
    await eval(this.caseService.caseDefinition.onCaseOpen)
  }

  async onSubmit() {
    const process = this.processMonitorService.start('savingEvent', _TRANSLATE('Saving event...'))
    if (this.selectedNewEventType !== '') {
      var caseEvent = this.caseService.createEvent(this.selectedNewEventType)
      await this.caseService.onCaseEventCreate(caseEvent)
      await this.caseService.save()
      this.calculateTemplateData()
      this.processMonitorService.stop(process.id)
    }
  }
  async onRestore(event) {
    const restoreConfirmed = confirm(_TRANSLATE('Restore this event?'));
    if (restoreConfirmed) {
      if (event.restored) {
        alert("Already restored.")
      } else {
        console.log("Before: this.caseService.case.events length: " + this.caseService.case.events.length)
        this.caseService.case.events.push(event)
        console.log("After: this.caseService.case.events length: " + this.caseService.case.events.length)
        event.restored = Date.now()
        await this.caseService.save()
        let eventFormId
        if (event.eventForms && event.eventForms.length > 0) {
          eventFormId = event.eventForms[0].id
        }
        try {
          await this.caseService.createIssue(`Conflict event merged on ${event.name}`, `conflictRevisionId:${event.conflictRevisionId}`, this.caseService.case._id, event.id, eventFormId, 'EDITOR', 'EDITOR', null)
        } catch (e) {
          console.log("Error: " + JSON.stringify(e))
        }
        // recalc the case structure - this.calculateTemplateData()
        // then this.ref.detectChanges()
        this.calculateTemplateData()
        const caseId = window.location.hash.split('/')[2]
        await this.getIssuesAndConflicts(caseId)
        // calculateTemplateData already does a this.ref.detectChanges(), but just in case...
        this.ref.detectChanges()
      }
    }
  }

  async onUnarchiveEvent(event) {
    const restoreConfirmed = confirm(_TRANSLATE('Unarchive this event?'));
    if (restoreConfirmed) {
      if (event.restored) {
        alert("Already unarchived.")
      } else {
        await this.caseService.unarchiveCaseEvent(event.id)

        this.calculateTemplateData()
        const caseId = window.location.hash.split('/')[2]
        await this.getIssuesAndConflicts(caseId)
        this.ref.detectChanges()
      }
    }
  }

  scroll(el: HTMLElement) {
    el.scrollIntoView();
  }

  processCaseAction(event: any) {
    if (event == "delete") {
      this.delete()
    } else if (event == "archive") {
      this.archive()
    } else if (event == "unarchive") {
      this.unarchive()
    }
  }

  async archive() {
    const confirmation = confirm(_TRANSLATE('Are you sure you want to archive this case?'))
    if (confirmation) {
      this.process = this.processMonitorService.start('archiving a case', 'Archiving a case.')
      await this.caseService.archive()
      this.processMonitorService.stop(this.process.id)

      // Reload the page so the breadcrumb updates
      this.router.navigate(['case', this.caseId])
    }
  }

  async unarchive() {
    const confirmation = confirm(_TRANSLATE('Are you sure you want to unarchive this case?'))
    if (confirmation) {
      this.process = this.processMonitorService.start('unarchiving a case', 'Un-archiving a case.')
      await this.caseService.unarchive()
      this.processMonitorService.stop(this.process.id)

      this.loadCaseInstanceInfo(true)
      this.calculateTemplateData()
      this.ref.detectChanges()
    }
  }

  async delete() {
    const confirmDelete = confirm(
      _TRANSLATE('Are you sure you want to delete this case? You will not be able to undo the operation')
    );
    if (confirmDelete) {
      this.process = this.processMonitorService.start('deleting a case', 'Deleting a case.')
      await this.caseService.delete()
      this.processMonitorService.stop(this.process.id)

      this.loadCaseInstanceInfo(true)
      this.ref.detectChanges()
    }
  }

  async onCaseEventArchive(caseEventId) {
    const confirmArchive = confirm(
      _TRANSLATE('Are you sure you want to archive this event?')
      );
    if (confirmArchive) {
      await this.caseService.archiveCaseEvent(caseEventId)

      this.loadCaseInstanceInfo(true)
      this.calculateTemplateData()
    }
  }

  async onCaseEventUnarchive(caseEventId) {
    const confirmArchive = confirm(
      _TRANSLATE('Are you sure you want to unarchive this event?')
      );
    if (confirmArchive) {
      await this.caseService.unarchiveCaseEvent(caseEventId)

      this.loadCaseInstanceInfo(true)
      this.calculateTemplateData()
    }
  }

}
