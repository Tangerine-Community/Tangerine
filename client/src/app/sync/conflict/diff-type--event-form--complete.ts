import { MergeInfo } from './../classes/merge-info.class';
import { DiffInfo } from './../classes/diff-info.class';
import { EventForm } from 'src/app/case/classes/event-form.class';

export const DIFF_TYPE__EVENT_FORM__COMPLETE = 'DIFF_TYPE__EVENT_FORM__COMPLETE'

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
          bEventForms.find(bEventForm => (bEventForm.id === aEventForm.id) && (bEventForm.complete !== aEventForm.complete))
        )
          ? [{
            type: DIFF_TYPE__EVENT_FORM__COMPLETE,
            resolved: false,
            info: {
              where: 'a',
              eventFormId: aEventForm.id,
              formResponseId: aEventForm.formResponseId,
              complete: aEventForm.complete
            }

          }]
          : []
      ]
    }, [])
  ]

  return {
    a,
    b,
    diffs,
    caseDefinition
  }
}

export function resolve({diffInfo, merged}:MergeInfo):MergeInfo {
  const recognizedDiffs = diffInfo.diffs.filter(diff => diff.type === DIFF_TYPE__EVENT_FORM__COMPLETE)
  // const affectedEventFormIds = recognizedDiffs.map(diff => diff.info.eventFormId)
  return {
    diffInfo: {
      ...diffInfo,
      diffs: diffInfo.diffs.map(diff => {
        return diff.type === DIFF_TYPE__EVENT_FORM__COMPLETE
          ? {
            ...diff,
            resolved: true
          }
          : diff
      })
    },
    merged: {
      ...merged,
      events: merged.events.map(event => {
        return {
          ...event,
          eventForms: event.eventForms.map(eventForm => {
            return recognizedDiffs.some(diff => diff.info.eventFormId === eventForm.id)
              ? {
                ...eventForm,
                complete: recognizedDiffs.find(diff => diff.info.eventFormId === eventForm.id).info.complete
              }
              : eventForm
          })
        }

      })
    }
  }
}

export const diffType_EventForm_Complete = {
  type: DIFF_TYPE__EVENT_FORM__COMPLETE,
  detect,
  resolve
}

