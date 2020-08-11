import { MergeInfo } from './../classes/merge-info.class';
import { DiffInfo } from './../classes/diff-info.class';
import { DIFF_TYPES } from './diff-types.const';

export function merge(diffInfo: DiffInfo):MergeInfo {
  // TODO: create an interface for the diffTypes
  const mergeReducer = (mergeInfo:MergeInfo, diffType) => diffType.resolve(mergeInfo)
    // make sure we are making a deep clone of 'a'...
  const initialMergeInfo:MergeInfo = {
    diffInfo,
    merged: JSON.parse(JSON.stringify(diffInfo.a))
  }
  return DIFF_TYPES.reduce(mergeReducer, initialMergeInfo)
}
