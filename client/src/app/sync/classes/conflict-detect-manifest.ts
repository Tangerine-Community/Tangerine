import { CaseDefinition } from 'src/app/case/classes/case-definition.class';
import { Case } from "src/app/case/classes/case.class";

export interface ConflictResolverManifest {
  a:Case
  b:Case
  caseDefinition:CaseDefinition
}