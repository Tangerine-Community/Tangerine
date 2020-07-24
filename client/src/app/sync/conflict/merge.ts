import { MergeInfo } from './../classes/merge-info.class';
import { DiffInfo } from './../classes/diff-info.class';
import { DIFF_TYPES } from './diff-types.const';
import { CaseDefinition } from 'src/app/case/classes/case-definition.class';
import { Case } from "src/app/case/classes/case.class";
import { diff } from './diff';

export function merge(a:Case, b:Case, caseDefinition:CaseDefinition):MergeInfo {
  const diffInfo = diff(a, b , caseDefinition) 
  const mergeReducer = (mergeInfo:MergeInfo, diffType) => diffType.merge(mergeInfo)
  const initialMergeInfo = {
    a,
    b,
    caseDefinition,
    diffs: diffInfo.diffs
  }
  return DIFF_TYPES.reduce(mergeReducer, initialMergeInfo)
}