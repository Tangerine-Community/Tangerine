export class Device {
  _id:string
  token:string
  syncLocations:Array<SyncLocation> = []
}

export interface SyncLocation {
  level:string
  id:string
}