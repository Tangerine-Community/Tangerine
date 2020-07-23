import { ConflictManifest } from '../classes/conflict-manifest';
import { EventForm } from 'src/app/case/classes/event-form.class';

export const CONFLICT_TYPE__EVENT_FORM__FORM_RESPONSE_ID_CREATED = 'CONFLICT_TYPE__EVENT_FORM__FORM_RESPONSE_ID_CREATED' 

export function detect({a, b, conflicts, merged, caseDefinition}:ConflictManifest):ConflictManifest {
  const aEventForms:Array<EventForm> = a.events.reduce((eventForms, caseEvent) => {
    return [...eventForms, ...caseEvent.eventForms]
  }, [])
  const bEventForms:Array<EventForm> = b.events.reduce((eventForms, caseEvent) => {
    return [...eventForms, ...caseEvent.eventForms]
  }, [])
  conflicts = [
    ...conflicts,
    ...aEventForms.reduce((conflicts, aEventForm) => {
      return [
        ...conflicts,
        ...(
          aEventForm.formResponseId &&
          bEventForms.some(bEventForm => bEventForm.id === aEventForm.id) &&
          !bEventForms.find(bEventForm => bEventForm.id === aEventForm.id).formResponseId 
        )
          ? [{
            type: CONFLICT_TYPE__EVENT_FORM__FORM_RESPONSE_ID_CREATED,
            info: {
              where: 'a',
              eventFormId: aEventForm.id,
              formResponseId: aEventForm.formResponseId
            }

          }]
          : []
      ]
    }, []),
    ...bEventForms.reduce((conflicts, bEventForm) => {
      return [
        ...conflicts,
        ...(
          bEventForm.formResponseId &&
          aEventForms.some(aEventForm => aEventForm.id === bEventForm.id) &&
          !aEventForms.find(aEventForm => aEventForm.id === bEventForm.id).formResponseId 
        )
          ? [{
            type: CONFLICT_TYPE__EVENT_FORM__FORM_RESPONSE_ID_CREATED,
            info: {
              where: 'b',
              eventFormId: bEventForm.id,
              formResponseId: bEventForm.formResponseId
            }

          }]
          : []
      ]
    }, []),
  ]

  return {
    a,
    b,
    conflicts,
    merged,
    caseDefinition
  }
}

export function resolve({a, b, conflicts, merged, caseDefinition}:ConflictManifest):ConflictManifest {
  return {
    a,
    b,
    conflicts,
    merged,
    caseDefinition
  }
}

export const conflictType_EventForm_FormResponseIDCreated = {
  type: CONFLICT_TYPE__EVENT_FORM__FORM_RESPONSE_ID_CREATED,
  detect,
  resolve
}

