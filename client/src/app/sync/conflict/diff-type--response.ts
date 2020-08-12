import { MergeInfo } from './../classes/merge-info.class';
import { DiffInfo } from './../classes/diff-info.class';
import { EventForm } from 'src/app/case/classes/event-form.class';
import {ResponseDiffTypes} from "./diff-types.const";

export const DIFF_TYPE__RESPONSE__COMPLETE = 'DIFF_TYPE__RESPONSE__COMPLETE'
export const DIFF_TYPE__RESPONSE__INPUTS = 'DIFF_TYPE__RESPONSE__INPUTS'

export function detect({a, b, diffs, caseDefinition}:DiffInfo):DiffInfo {
  const aComplete:boolean = a.complete
  const bComplete:boolean = b.complete
  const itemsReducer = (count, item) => {
    return count + item.inputs.length
  }
  let aInputsCount = a.items.reduce(itemsReducer, 0)
  let bInputsCount = b.items.reduce(itemsReducer, 0)
  diffs = (aComplete !== bComplete) ? [{
      type: DIFF_TYPE__RESPONSE__COMPLETE,
      resolved: false,
      info: {
        where: 'a',
        id: a._id,
        complete: aComplete
      }
    }] : []

  if (aInputsCount > bInputsCount) {
    diffs.push({
      type: DIFF_TYPE__RESPONSE__INPUTS,
      resolved: false,
      info: {
        where: 'a',
        id: a._id,
        inputs: a.inputs
      }
    })
  }

  if (bInputsCount > aInputsCount) {
    diffs.push({
      type: DIFF_TYPE__RESPONSE__INPUTS,
      resolved: false,
      info: {
        where: 'b',
        id: b._id,
        inputs: b.inputs
      }
    })
  }

  return {
    a,
    b,
    diffs,
    caseDefinition
  }
}

export function resolve({diffInfo, merged}:MergeInfo):MergeInfo {
  const recognizedDiffs = diffInfo.diffs.filter(diff => ['DIFF_TYPE__RESPONSE__COMPLETE','DIFF_TYPE__RESPONSE__INPUTS'].includes(diff.type))
  return {
    diffInfo: {
      ...diffInfo,
      diffs: recognizedDiffs.map(diff => {
        return {
          ...diff,
          resolved: true
        }
      })
    },
    merged: recognizedDiffs.map(diff => {
        if ((diff.type === DIFF_TYPE__RESPONSE__INPUTS) && (diff.info.where === 'a')) {
          // return a
        } else if ((diff.type === DIFF_TYPE__RESPONSE__INPUTS) && (diff.info.where === 'b')) {
          // return b
        }
      })
  }
}

export const diffType_Response_Complete = {
  type: DIFF_TYPE__RESPONSE__COMPLETE,
  detect,
  resolve,
  diffType: 'response'
} as ResponseDiffTypes;

export const diffType_Response_Inputs = {
  type: DIFF_TYPE__RESPONSE__INPUTS,
  detect,
  resolve,
  diffType: 'response'
} as ResponseDiffTypes;

