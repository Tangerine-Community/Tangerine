export class FormInfo {
  id:string
  src:string
  type:string
  title:string
  description:string = ''
  listed = true
  searchSettings: FormSearchSettings
}

export interface FormSearchSettings {
  shouldIndex:boolean
  variablesToIndex:Array<string>
  primaryTemplate:string
  secondaryTemplate:string
}
