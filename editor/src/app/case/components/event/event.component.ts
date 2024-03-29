import { EventFormDefinition } from './../../classes/event-form-definition.class';
import axios from "axios";
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/core/auth/_services/authentication.service';
import { CaseService } from '../../services/case.service'
import { CaseEvent } from '../../classes/case-event.class'
import { CaseEventDefinition } from '../../classes/case-event-definition.class';
import { EventForm } from '../../classes/event-form.class';
import {GroupIssuesService} from "../../../groups/services/group-issues.service";
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';

interface EventFormInfo {
  eventFormDefinition:EventFormDefinition
  eventForm:EventForm
}

interface ParticipantInfo {
  id: string
  renderedListItem:string
  availableEventFormDefinitionsForParticipant: Array<string>
  newFormLink:string
  eventFormInfos: Array<EventFormInfo>
}

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})
export class EventComponent implements OnInit {

  caseId: string
  eventId: string
  caseEvent:CaseEvent
  caseEventDefinition: CaseEventDefinition
  participantInfos:Array<ParticipantInfo>
  noRoleEventFormInfos: Array<EventFormInfo>
  authenticationService: AuthenticationService
  groupId:string
  conflictingEventForms:Array<any> = []
  conflictingEventsExist: boolean = false
  loaded = false
  availableEventFormDefinitions:Array<EventFormDefinition> = []
  selectedNewEventFormDefinition = ''
  window:any
  step = -1;
  showArchivedSliderState: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private caseService: CaseService,
    authenticationService: AuthenticationService,
    private groupIssuesService:GroupIssuesService,
    private ref: ChangeDetectorRef
  ) { 
    ref.detach()
    this.window = window
    this.authenticationService = authenticationService
  }

  async ngOnInit() {
    this.groupId = window.location.pathname.split('/')[2]

    this.route.params.subscribe(async params => {    
      this.caseId = params.caseId
      this.eventId = params.eventId

      await this.loadEventFormsInfos(true)

      this.onEventOpen() 

      await this.getConflicts(this.caseEvent.caseId)

      this.loaded = true
      this.ref.detectChanges()
    })
  }

  async loadEventFormsInfos(reload:boolean) {
    if (reload) {
      await this.caseService.load(this.caseId)
    }
    this.caseService.setContext(this.eventId)
    this.window.caseService = this.caseService
    this.caseEvent = this
      .caseService
      .case
      .events
      .find(caseEvent => caseEvent.id === this.eventId)

    this.caseEventDefinition = this
    .caseService
    .caseDefinition
    .eventDefinitions
    .find(caseDef => caseDef.id === this.caseEvent.caseEventDefinitionId)

    const noRoleEventFormDefinitionIds: Array<string> = this.caseEventDefinition.eventFormDefinitions
      .filter(eventFormDefinition => !eventFormDefinition.forCaseRole)
      .map(eventFormDefinition => eventFormDefinition.id)
    this.noRoleEventFormInfos = this
      .caseEvent
      .eventForms
      .filter(eventForm => (this.showArchivedSliderState ? true : !eventForm.archived) && noRoleEventFormDefinitionIds.includes(eventForm.eventFormDefinitionId))
      .map(eventForm => {
        return <EventFormInfo>{
          eventForm,
          eventFormDefinition: this
            .caseEventDefinition
            .eventFormDefinitions
            .find(eventFormDefinition => eventFormDefinition.id === eventForm.eventFormDefinitionId)
        }
      })
  }

  async onEventOpen(){
    await eval(this.caseEventDefinition.onEventOpen)
  }

  async ngOnDestroy() {
    await eval(this.caseEventDefinition.onEventClose)
  }

  setStep(index: number) {
    this.step = index;
    this.getConflicts(this.groupId)
    this.ref.detectChanges()
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }

  async showArchivedSliderChange() {
    this.showArchivedSliderState = !this.showArchivedSliderState
    await this.loadEventFormsInfos(false)
    this.ref.detectChanges()
  }

  async getConflicts(caseId) {
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
      this.conflictingEventsExist = false
      if (conflictRevisionIds) {
        for (const conflictRevisionId of conflictRevisionIds) {
          const token = localStorage.getItem('token');
          const conflictRevisionDoc = (<any>await axios.get(`/group-responses/readRev/${this.groupId}/${caseId}/${conflictRevisionId}`, {headers: {authorization: token}})).data
          conflicts.push(conflictRevisionDoc)
        }
      }
      const caseParticipantIds = this.caseService.case.participants.map(participant => participant.id)
      this.conflictingEventForms = []
      conflicts.forEach(conflict => {
        const caseEvent = this.caseService.case.events.find(caseEvent => caseEvent.id)
        // filter out any events that are from participants not in this "winning" case rev
        const conflictEvents = conflict.events.map(conflictEvent => {
          if (caseEvent.id == conflictEvent.id && conflictEvent.eventForms) {
            const hasParticipant = (eventForm) => {
              // The first Registration event's participantId is empty.
              if (eventForm.participantId === "") {
                return true
              } else {
                return caseParticipantIds.includes(eventForm.participantId)
              }
            }
            const relevantEvent = conflictEvent.eventForms.some(hasParticipant)
            if (relevantEvent) {
              return conflictEvent
            }
          }
        })
        // Now find any events that are not in the "winning" rev.
        conflictEvents.forEach(conflictEvent => {
          if (!caseEvent.id == conflictEvent.id) {
            // since we are putting events from different _revs in the same array, need to mark which _rev the event belongs to.
            conflictEvent.conflictRevisionId = conflict._rev
            this.conflictingEventForms.push(conflictEvent.eventForms)
            this.conflictingEventsExist = true
          }
        })
      })
    } catch (e) {
      console.error("Error fetching conflicts: " + JSON.stringify(e))
    }

    this.ref.detectChanges()
  }

  async onRestore(form) {
    const restoreConfirmed = confirm(_TRANSLATE('Restore this event form?'));
    if (restoreConfirmed) {
      if (form.restored) {
        alert("Already restored.")
      } else {
        form.restored = Date.now()
        await this.caseService.save()
        let eventFormId = form.id

        try {
          await this.caseService.createIssue(`Conflict event merged on ${form.name}`, `conflictRevisionId:${form.conflictRevisionId}`, this.caseService.case._id, form.id, eventFormId, 'EDITOR', 'EDITOR', null)
        } catch (e) {
          console.log("Error: " + JSON.stringify(e))
        }

        const caseId = window.location.hash.split('/')[2]
        await this.getConflicts(caseId)
        // calculateTemplateData already does a this.ref.detectChanges(), but just in case...
        this.ref.detectChanges()
      }
    }
  }

  async onEventFormDelete(eventFormId) {
    const unarchiveConfirmed = confirm(_TRANSLATE('Are you sure you want to delete this form?'));
    if (unarchiveConfirmed) {
        this.caseService.deleteEventForm(this.caseEvent.id, eventFormId)
        await this.caseService.save()
        await this.loadEventFormsInfos(true)
        this.ref.detectChanges()
    }
  }

  async onEventFormArchive(eventFormId) {
    const unarchiveConfirmed = confirm(_TRANSLATE('Are you sure you want to archive this form?'));
    if (unarchiveConfirmed) {
        await this.caseService.archiveEventForm(this.caseEvent.id, eventFormId)
        await this.loadEventFormsInfos(true)
        this.ref.detectChanges()
    }
  }

  async onEventFormUnarchive(eventFormId) {
    const unarchiveConfirmed = confirm(_TRANSLATE('Are you sure you want to unarchive this form?'));
    if (unarchiveConfirmed) {
        await this.caseService.unarchiveEventForm(this.caseEvent.id, eventFormId)
        await this.loadEventFormsInfos(true)
        this.ref.detectChanges()
    }
  }

}
