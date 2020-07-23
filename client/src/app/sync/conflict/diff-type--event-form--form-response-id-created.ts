import { MergeInfo } from './../classes/merge-info.class';
import { DiffInfo } from './../classes/diff-info.class';
import { EventForm } from 'src/app/case/classes/event-form.class';

export const DIFF_TYPE__EVENT_FORM__FORM_RESPONSE_ID_CREATED = 'DIFF_TYPE__EVENT_FORM__FORM_RESPONSE_ID_CREATED' 

export function detect({a, b, diffs, caseDefinition}:DiffInfo):DiffInfo {
  const aEventForms:Array<EventForm> = a.events.reduce((eventForms, caseEvent) => {
    return [...eventForms, ...caseEvent.eventForms]
  }, [])
  const bEventForms:Array<EventForm> = b.events.reduce((eventForms, caseEvent) => {
    return [...eventForms, ...caseEvent.eventForms]
  }, [])
  diffs = [
    ...diffs,
    ...aEventForms.reduce((diffs, aEventForm) => {
      return [
        ...diffs,
        ...(
          aEventForm.formResponseId &&
          bEventForms.some(bEventForm => bEventForm.id === aEventForm.id) &&
          !bEventForms.find(bEventForm => bEventForm.id === aEventForm.id).formResponseId 
        )
          ? [{
            type: DIFF_TYPE__EVENT_FORM__FORM_RESPONSE_ID_CREATED,
            resolved: false,
            info: {
              where: 'a',
              eventFormId: aEventForm.id,
              formResponseId: aEventForm.formResponseId
            }

          }]
          : []
      ]
    }, []),
    ...bEventForms.reduce((diffs, bEventForm) => {
      return [
        ...diffs,
        ...(
          bEventForm.formResponseId &&
          aEventForms.some(aEventForm => aEventForm.id === bEventForm.id) &&
          !aEventForms.find(aEventForm => aEventForm.id === bEventForm.id).formResponseId 
        )
          ? [{
            type: DIFF_TYPE__EVENT_FORM__FORM_RESPONSE_ID_CREATED,
            resolved: false,
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
    diffs,
    caseDefinition
  }
}

export function resolve({diffInfo, merged}:MergeInfo):MergeInfo {
  return {
    diffInfo,
    merged,
  }
}

export const diffType_EventForm_FormResponseIDCreated = {
  type: DIFF_TYPE__EVENT_FORM__FORM_RESPONSE_ID_CREATED,
  detect,
  resolve
}

