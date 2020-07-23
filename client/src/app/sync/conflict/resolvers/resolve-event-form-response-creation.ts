import { ConflictResolverManifest } from '../../classes/conflict-resolver-manifest';
import { CaseDefinition } from 'src/app/case/classes/case-definition.class';
import { Case } from 'src/app/case/classes/case.class';
export function detectEventFormResponseCreation() {
  return null

} 

export function resolveEventFormResponseCreation({a, b, merged, caseDefinition}:ConflictResolverManifest):ConflictResolverManifest {
  // @TODO
  return {
    a,
    b,
    merged,
    caseDefinition
  }

}