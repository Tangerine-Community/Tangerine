import { DiffInfo } from './../classes/diff-info.class';
import { DIFF_TYPES } from './diff-types.const';
import { CaseDefinition } from 'src/app/case/classes/case-definition.class';
import { Case } from "src/app/case/classes/case.class";

export function diff(a:Case, b:Case, caseDefinition:CaseDefinition) {
  const diffReducer = (diffInfo:DiffInfo, diffType) => diffType.detect(diffInfo)
  const initialDiffInfo:DiffInfo = {
    a,
    b,
    caseDefinition,
    diffs: []
  }
  return DIFF_TYPES.reduce(diffReducer, initialDiffInfo)
}