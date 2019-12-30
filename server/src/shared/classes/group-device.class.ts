const uuidv4 = require('uuid/v4');


export class GroupDevice {
  _id:string = uuidv4()
  collection = 'Device'
  token:string = uuidv4()
  claimed:boolean = false
  updatedOn:number
  version:string
  syncLocations:Array<LocationConfig> = []
  assignedLocation:LocationConfig = new LocationConfig()
}

export class SyncLocation {
  level:string
  id:string
}

// 
export class LocationConfig {
  showLevels: Array<string>
  value:any
}