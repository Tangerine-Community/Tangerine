export class Device {
  _id:string
  collection = 'Device'
  token:string
  claimed:boolean
  syncLocations:Array<LocationConfig> = []
  assignedLocation:LocationConfig
}

export interface LocationConfig {
  showLevels: Array<string>
  value: Array<LocationSelection>
}

export interface LocationSelection {
  level:string
  value:string
}