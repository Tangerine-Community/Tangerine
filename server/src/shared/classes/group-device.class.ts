export class GroupDevice {
  _id:string
  collection = 'Device'
  token:string
  claimed:boolean
  syncLocations:Array<LocationConfig> = []
  assignedLocation:LocationConfig
}

export interface SyncLocation {
  level:string
  id:string
}

// 
export interface LocationConfig {
  showLevels: Array<string>
  value:any
}