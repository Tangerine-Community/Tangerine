export class TangerineFormInfo {
  id: string
  title: string
  type: string
  src: string
  searchSettings:FormSearchSettings =  <FormSearchSettings>{
    shouldIndex: true,
    variablesToIndex: [],
    primaryTemplate: '',
    secondaryTemplate: ''
  }
  customSyncSettings:CustomSyncSettings = <CustomSyncSettings>{
    enabled: false,
    push: false,
    pull: false,
    excludeIncomplete:false
  }
  couchdbSyncSettings:CouchdbSyncSettings = <CouchdbSyncSettings>{
    enabled: false,
    filterByLocation: false
  }
  archived?: boolean;
}

export interface CouchdbSyncSettings {
  push:boolean
  pull:boolean
  enabled: boolean
  filterByLocation:boolean
}

export interface CustomSyncSettings {
  enabled: boolean
  push:boolean
  pull:boolean
  excludeIncomplete:boolean
}

export interface FormSearchSettings {
  shouldIndex:boolean
  variablesToIndex:Array<string>
  primaryTemplate:string
  secondaryTemplate:string
}

export class TangerineForm extends TangerineFormInfo {
  contents:string
}