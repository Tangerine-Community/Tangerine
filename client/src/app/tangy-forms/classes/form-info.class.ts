export class FormInfo {
  id:string
  src:string
  type:string
  title:string
  description:string = ''
  listed = true
  archived = false
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
}

export interface CouchdbSyncSettings {
  enabled: boolean
  pull: boolean
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
