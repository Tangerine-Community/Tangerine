export class Device {
  _id:string
  collection = 'Device'
  token:string
  claimed:boolean
  syncLocations:Array<SyncLocation> = []
  location:any
}

export interface SyncLocation {
  level:string
  id:string
}