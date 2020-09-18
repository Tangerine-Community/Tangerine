import { Diff } from './diff.class';
import { CaseDefinition } from 'src/app/case/classes/case-definition.class';

export interface DiffInfo {
  a:any
  b:any
  diffs:Array<Diff>
  caseDefinition:CaseDefinition
}
