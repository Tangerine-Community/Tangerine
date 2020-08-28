import { MergeInfo } from './../classes/merge-info.class';
import { DiffInfo } from './../classes/diff-info.class';
import { EventForm } from 'src/app/case/classes/event-form.class';
import {CaseDiffTypes} from "./diff-types.const";

export const DIFF_TYPE__METADATA = 'DIFF_TYPE__METADATA'
const PROPERTIES = ['buildId', 'deviceId', 'lastModified', 'tangerineModifiedByDeviceId', 'tangerineModifiedByUserId', 'tangerineModifiedOn']

/**
 * Checks for differences in Tangerine metadata fields:
 * - buildId
 - deviceId
 - lastModified
 - tangerineModifiedByDeviceId
 - tangerineModifiedByUserId
 - tangerineModifiedOn
 * @param comparison
 * @param eventForm
 * @param comparisonEventForms
 */
function differ(comparison:string, a: EventForm, b:EventForm) {
  let differences = []
  // let compareEventForm:EventForm = comparisonEventForms.find(comparisonEventform => {
  //   if (comparisonEventform.id === eventForm.id) {
  //     return comparisonEventform
  //   }
  // })
  // if (compareEventForm) {
    // if (eventForm.buildId !==  compareEventForm.buildId) {
    //   differences.push('buildId')
    // }
    // if (eventForm.deviceId !== compareEventForm.deviceId) {
    //   differences.push('deviceId')
    // }
    // if (eventForm.lastModified !== compareEventForm.lastModified) {
    //   differences.push('lastModified')
    // }
    // if (eventForm.tangerineModifiedByDeviceId !== compareEventForm.tangerineModifiedByDeviceId) {
    //   differences.push('tangerineModifiedByDeviceId')
    // }
    // if (eventForm.tangerineModifiedByUserId !== compareEventForm.tangerineModifiedByUserId) {
    //   differences.push('tangerineModifiedByUserId')
    // }
    // if (eventForm.tangerineModifiedOn !== compareEventForm.tangerineModifiedOn) {
    //   differences.push('tangerineModifiedOn')
    // }

    PROPERTIES.forEach(property => {
      if (a[property] !==  b[property]) {
        differences.push(property)
      }
    })
  // }

  if (differences.length > 0) {
    return [{
      type: DIFF_TYPE__METADATA,
      resolved: false,
      info: {
        where: comparison,
        caseEventId: a.caseEventId ? a.caseEventId : null,
        eventFormId: a.id,
        formResponseId: a.formResponseId ? a.formResponseId : null,
        differences: differences
      }
    }]
  } else {
    return []
  }
}

export function detect({a, b, diffs, caseDefinition}:DiffInfo):DiffInfo {
  diffs = [
    ...diffs,
    ...(differ('a', a, b))
  ]

  return {
    a,
    b,
    diffs,
    caseDefinition
  }
}

export function resolve({diffInfo, merged}:MergeInfo):MergeInfo {
  const recognizedDiffs = diffInfo.diffs.filter(diff => diff.type === DIFF_TYPE__METADATA)
  // const affectedEventFormIds = recognizedDiffs.map(diff => diff.info.eventFormId)

  // Should we add any new eventforms from b to a? Otherwise we will miss them when we hit a 'new' difference...
  // no don't do that - remember that each eventForm can have its own diff, so new eventForms will trigger the creation of a new diff.
  // plus we are looking at both a and b. so we might miss it on the a side, but will get it when detect for bEventForms happens.

  recognizedDiffs.forEach(diff => {
    let comparison = diff.info.where = 'a' ? 'b' : 'a'
    PROPERTIES.forEach(property => {
      if (diff.info.differences.includes(property)) {
        if (diffInfo[diff.info.where].lastModified && diffInfo[diff.info.where].lastModified > diffInfo[comparison].lastModified) {
          merged[property] = diffInfo[diff.info.where][property]
        } else {
          merged[property] = diffInfo[comparison][property]
        }
      }
    })
  })

  return {
    diffInfo: {
      ...diffInfo,
      diffs: diffInfo.diffs.map(diff => {
        return diff.type === DIFF_TYPE__METADATA
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

export const diffType_Metadata = {
  type: DIFF_TYPE__METADATA,
  detect,
  resolve,
  diffType: 'any'
} as CaseDiffTypes;




