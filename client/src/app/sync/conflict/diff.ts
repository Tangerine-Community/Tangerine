import { DiffInfo } from './../classes/diff-info.class';
import { DIFF_TYPES } from './diff-types.const';
import { CaseDefinition } from 'src/app/case/classes/case-definition.class';
import { Case } from "src/app/case/classes/case.class";

export function diff(a:any, b:any, caseDefinition:CaseDefinition):DiffInfo {

  const diffReducer = (diffInfo:DiffInfo, diffType) => {
    // does the order the diffTypes run matter?
    if (diffInfo && ((diffType.diffType === 'any') || (diffType.diffType === diffInfo.a.type))) {
      return diffType.detect(diffInfo)
    } else {
      return diffInfo
    }
  }
  const initialDiffInfo:DiffInfo = {
    a,
    b,
    caseDefinition,
    diffs: []
  }
  return DIFF_TYPES.reduce(diffReducer, initialDiffInfo)
}
