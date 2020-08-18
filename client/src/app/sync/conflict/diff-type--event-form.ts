import { MergeInfo } from './../classes/merge-info.class';
import { DiffInfo } from './../classes/diff-info.class';
import { EventForm } from 'src/app/case/classes/event-form.class';
import {CaseDiffTypes} from "./diff-types.const";

export const DIFF_TYPE__EVENT_FORM = 'DIFF_TYPE__EVENT_FORM'

// TODO: move to a more general event form diff, and expand to deal with data(?), required, complete, and formResponseId fields
// What happens when an event form is marked complete? An event can be marked complete after that.
// should we run this.caseService.markEventFormComplete(this.caseEvent.id, this.eventForm.id) if complete is true in the conflictDoc?
// run the merge doc through the case service reducers - add export to the reducers, and run them in our resolve functions.
// should this running of the reducers be run here or in the higher merge function?
// better run them in the higher merge function.

function differ(comparison:string, eventForm: EventForm, conflictEventForms: Array<EventForm>) {
  let diffRequireds = diffRequired(comparison, eventForm, conflictEventForms)
  let diffFormResponseIds = diffFormResponseId(comparison, eventForm, conflictEventForms)
  let diffCompletes = diffComplete(comparison, eventForm, conflictEventForms)
  return [...diffRequireds, ...diffFormResponseIds, ...diffCompletes]
}

function diffFormResponseId(comparison:string, eventForm: EventForm, conflictEventForms: Array<EventForm>) {
  return (
    eventForm.formResponseId &&
    conflictEventForms.some(bEventForm => bEventForm.id === eventForm.id) &&
    !conflictEventForms.find(bEventForm => bEventForm.id === eventForm.id).formResponseId
  )
    ? [{
      type: DIFF_TYPE__EVENT_FORM,
      subType: 'formResponseId',
      resolved: false,
      info: {
        where: comparison,
        eventFormId: eventForm.id,
        formResponseId: eventForm.formResponseId
      }
    }]
    : [];
}

function diffRequired(comparison:string, eventForm: EventForm, conflictEventForms: Array<EventForm>) {
  return (
    eventForm.required &&
    conflictEventForms.some(bEventForm => bEventForm.id === eventForm.id) &&
    !conflictEventForms.find(bEventForm => bEventForm.id === eventForm.id).required
  )
    ? [{
      type: DIFF_TYPE__EVENT_FORM,
      subType: 'required',
      resolved: false,
      info: {
        where: comparison,
        eventFormId: eventForm.id,
        formResponseId: eventForm.formResponseId,
        required: eventForm.required
      }

    }]
    : [];
}

function diffComplete(comparison:string, eventForm: EventForm, conflictEventForms: Array<EventForm>) {
  return (
    eventForm.complete &&
    conflictEventForms.some(bEventForm => bEventForm.id === eventForm.id) &&
    !conflictEventForms.find(bEventForm => bEventForm.id === eventForm.id).complete
  )
    ? [{
      type: DIFF_TYPE__EVENT_FORM,
      subType: 'complete',
      resolved: false,
      info: {
        where: comparison,
        eventFormId: eventForm.id,
        formResponseId: eventForm.formResponseId,
        complete: eventForm.complete
      }

    }]
    : [];
}

// TODO - most important property is the eventForm id - all the other data can be resolved in the merge.
// We are too specific w/ the current approach.
// show only that there is a difference, and let the merge command suss out the differences and merge.
// there may be different cases/combinations of differences

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
        ...(differ('a', aEventForm, bEventForms))
      ]
    }, []),
    // ...bEventForms.reduce((diffs, bEventForm) => {
    //   return [
    //     ...diffs,
    //     ...(differ('b', bEventForm, aEventForms))
    //   ]
    // }, []),
  ]

  return {
    a,
    b,
    diffs,
    caseDefinition
  }
}

export function resolve({diffInfo, merged}:MergeInfo):MergeInfo {
  const recognizedDiffs = diffInfo.diffs.filter(diff => diff.type === DIFF_TYPE__EVENT_FORM)
  // const affectedEventFormIds = recognizedDiffs.map(diff => diff.info.eventFormId)
  return {
    diffInfo: {
      ...diffInfo,
      diffs: diffInfo.diffs.map(diff => {
        return diff.type === DIFF_TYPE__EVENT_FORM
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
        let eventForms = []
          event.eventForms.map(eventForm => {
            if (recognizedDiffs.some(diff => diff.info.eventFormId === eventForm.id)) {
              let mergedEventForm = eventForm
              recognizedDiffs.forEach(diff => {
                if (diff.info.eventFormId === eventForm.id) {
                  if (diff.subType === 'formResponseId') {
                    mergedEventForm = {
                      ...mergedEventForm,
                      formResponseId: diff.info.formResponseId
                    }
                  } else if (diff.subType === 'required') {
                    mergedEventForm =  {
                      ...mergedEventForm,
                      required: diff.info.required
                    }
                  } else if (diff.subType === 'complete') {
                    mergedEventForm = {
                      ...mergedEventForm,
                      complete: diff.info.complete
                    }
                  } else {
                    console.log("unimplemented subType: " + diff.subType)
                    eventForms.push(mergedEventForm)
                  }
                }
              })
              eventForms.push(mergedEventForm)
            } else {
              eventForms.push(eventForm)
            }
          })
        return {
            ...event,
          eventForms: eventForms
        }
      })
    }
  }
}

export const diffType_EventForm = {
  type: DIFF_TYPE__EVENT_FORM,
  detect,
  resolve,
  diffType: 'case'
} as CaseDiffTypes;




