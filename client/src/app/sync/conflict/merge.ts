import { MergeInfo } from './../classes/merge-info.class';
import { DiffInfo } from './../classes/diff-info.class';
import { DIFF_TYPES } from './diff-types.const';
import { CaseDefinition } from 'src/app/case/classes/case-definition.class';
import { Case } from "src/app/case/classes/case.class";
import { diff } from './diff';

export function merge(a:Case, b:Case, caseDefinition:CaseDefinition) {
  const diffInfo = diff(a, b , caseDefinition) 
  const mergeReducer = (diffInfo:DiffInfo, diffType) => diffType.detect(diffInfo)
  const initialMergeInfo = {
    a,
    b,
    caseDefinition,
    diffs: diffInfo.diffs
  }
  return DIFF_TYPES.reduce(mergeReducer, initialMergeInfo)
}