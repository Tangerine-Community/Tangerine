export class FormInfo {
  id:string
  src:string
  type:string
  title:string
  description:string = ''
  listed = true
  searchSettings: FormSearchSettings
  icon:string
}

export interface FormSearchSettings {
  shouldIndex:boolean
  variablesToIndex:Array<string>
  primaryTemplate:string
  secondaryTemplate:string
}
