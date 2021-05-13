
export interface CaseRole {
  id:string
  label:string
  templateListItem:string
  dataDefinitions: Array<CaseRoleDataDefinition>
}

export interface CaseRoleDataDefinition {
  identifier:boolean
  name:string
  type:string
}
