export class GroupDevice {
  _id:string
  collection = 'Device'
  token:string
  claimed = false
  syncLocations:Array<SyncLocation> = []
  location:any
}

export interface SyncLocation {
  level:string
  id:string
}