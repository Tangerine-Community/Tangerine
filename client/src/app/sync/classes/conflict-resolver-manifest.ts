import { CaseDefinition } from 'src/app/case/classes/case-definition.class';
import { Case } from "src/app/case/classes/case.class";

export interface ConflictResolverManifest {
  // One of two documents to resolve. 
  a:Case
  // The other of two documents to resolve. 
  b:Case
  // The merged document so far.
  merged:Case
  // The definition describing the Case being merged.
  caseDefinition:CaseDefinition
}