import { MergeInfo } from './../classes/merge-info.class';
import { DiffInfo } from './../classes/diff-info.class';
import {CaseDiffTypes} from "./diff-types.const";
import {CaseEvent} from "../../case/classes/case-event.class";

export const DIFF_TYPE__EVENT = 'DIFF_TYPE__EVENT'

function differ(comparison:string, event: CaseEvent, comparisonEvents: Array<CaseEvent>) {
  let differences = []
  let compareEvent:CaseEvent = comparisonEvents.find(comparisonEvent => {
    if (comparisonEvent.id === event.id) {
      return comparisonEvent
    }
  })
  if (compareEvent) {
    // TODO implement checks for CaseEvent properties
    // if ((event.complete) && (!compareEvent.complete)) {
    //   differences.push('complete')
    // }
  } else {
    // throw a diff when event does not exist in comparisonEvents - i.e. a new event
    differences.push('new')
  }

  if (differences.length > 0) {
    return [{
      type: DIFF_TYPE__EVENT,
      resolved: false,
      info: {
        where: comparison,
        caseEventId: event.id,
        differences: differences,
        newEvent: event
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
  const aEvents:Array<CaseEvent> = a.events
  const bEvents:Array<CaseEvent> = b.events

  diffs = [
    ...diffs,
    ...bEvents.reduce((diffs, bEvent) => {
      return [
        ...diffs,
        ...(differ('b', bEvent, aEvents))
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
  const recognizedDiffs = diffInfo.diffs.filter(diff => diff.type === DIFF_TYPE__EVENT)
  recognizedDiffs.forEach(diff => {
      if (diff.info.differences.includes('new')) {
        let newEvent = diff.info.newEvent
        merged.events.push(newEvent)
      }
  })

  return {
    diffInfo: {
      ...diffInfo,
      diffs: diffInfo.diffs.map(diff => {
        return diff.type === DIFF_TYPE__EVENT
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

export const diffType_Event = {
  type: DIFF_TYPE__EVENT,
  detect,
  resolve,
  diffType: 'case'
} as CaseDiffTypes;




