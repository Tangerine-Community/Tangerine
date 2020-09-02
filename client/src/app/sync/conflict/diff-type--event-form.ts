import { MergeInfo } from './../classes/merge-info.class';
import { DiffInfo } from './../classes/diff-info.class';
import { EventForm } from 'src/app/case/classes/event-form.class';
import {CaseDiffTypes} from "./diff-types.const";

export const DIFF_TYPE__EVENT_FORM = 'DIFF_TYPE__EVENT_FORM'

// TODO: What happens when an event form is marked complete? An event can be marked complete after that.
// should we run this.caseService.markEventFormComplete(this.caseEvent.id, this.eventForm.id) if complete is true in the conflictDoc?
// run the merge doc through the case service reducers - add export to the reducers, and run them in our resolve functions.
// should this running of the reducers be run here or in the higher merge function?
// better run them in the higher merge function.

function differ(comparison:string, eventForm: EventForm, comparisonEventForms: Array<EventForm>) {
  let differences = []
  let compareEventForm:EventForm = comparisonEventForms.find(comparisonEventform => {
    if (comparisonEventform.id === eventForm.id) {
      return comparisonEventform
    }
  })
  if (compareEventForm) {
    if (eventForm.formResponseId && !compareEventForm.formResponseId) {
      differences.push('formResponseId')
    }
    if ((eventForm.complete) && (!compareEventForm.complete)) {
      differences.push('complete')
    }
    if ((eventForm.required) && (!compareEventForm.required)) {
      differences.push('required')
    }
  } else {
    // throw a diff when eventForms does not exist in comparisonEventForms - i.e. a new eventForm
    differences.push('new')
  }

  if (differences.length > 0) {
    return [{
      type: DIFF_TYPE__EVENT_FORM,
      resolved: false,
      info: {
        where: comparison,
        caseEventId: eventForm.caseEventId,
        eventFormId: eventForm.id,
        formResponseId: eventForm.formResponseId,
        required: eventForm.required ? eventForm.required : null,
        complete: eventForm.complete ? eventForm.complete : null,
        differences: differences,
        newEventform: eventForm
      }
    }]
  } else {
    return []
  }
}

/**
 * Compare all eventForms between the 2 docs.
 * Only looping through the eventForms in b - the losing conflict - to see if there are any differences that should be merged with a - the winning conflict.
 * @param a
 * @param b
 * @param diffs
 * @param caseDefinition
 */
export function detect({a, b, diffs, caseDefinition}:DiffInfo):DiffInfo {
  const aEventForms:Array<EventForm> = a.events.reduce((eventForms, caseEvent) => {
    return [...eventForms, ...caseEvent.eventForms]
  }, [])
  const bEventForms:Array<EventForm> = b.events.reduce((eventForms, caseEvent) => {
    return [...eventForms, ...caseEvent.eventForms]
  }, [])
  diffs = [
    ...diffs,
    ...bEventForms.reduce((diffs, bEventForm) => {
      return [
        ...diffs,
        ...(differ('b', bEventForm, aEventForms))
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
  const recognizedDiffs = diffInfo.diffs.filter(diff => diff.type === DIFF_TYPE__EVENT_FORM)
  // const affectedEventFormIds = recognizedDiffs.map(diff => diff.info.eventFormId)

  // Should we add any new eventforms from b to a? Otherwise we will miss them when we hit a 'new' difference...
  // no don't do that - remember that each eventForm can have its own diff, so new eventForms will trigger the creation of a new diff.
  // plus we are looking at both a and b. so we might miss it on the a side, but will get it when detect for bEventForms happens.

  recognizedDiffs.forEach(diff => {
      if (diff.info.differences.includes('formResponseId')) {
        merged.events.map(event => {
           if (event.id === diff.info.caseEventId) {
             event.eventForms.map(eventForm => {
               eventForm.formResponseId = diff.info.formResponseId
             })
           }
        })
      } else if (diff.info.differences.includes('required')) {
        merged.events.map(event => {
          event.eventForms.map(eventForm => {
            eventForm.required = diff.info.required
          })
        })
      } else if (diff.info.differences.includes('complete')) {
        merged.events.map(event => {
             event.eventForms.map(eventForm => {
               eventForm.complete = diff.info.complete
             })
        })
      } else if (diff.info.differences.includes('new')) {
        // Add new eventForm to the correct event.
        let comparison = diff.info.where = 'a' ? 'b' : 'a';
        let newEventform = diff.info.newEventform
        merged.events.forEach(event => {
         if (event.id === diff.info.caseEventId) {
           event.eventForms.push(newEventform)
         }
        })
      }
  })

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
      ...merged
    }
  }
}

export const diffType_EventForm = {
  type: DIFF_TYPE__EVENT_FORM,
  detect,
  resolve,
  diffType: 'case'
} as CaseDiffTypes;




