import uuidv4 from 'uuid/v4';


export class GroupDevice {
  _id:string = uuidv4()
  token:string = uuidv4()
  claimed:boolean = false
  assignedLocation: LocationInfo = new LocationInfo()
  syncLocations: Array<LocationInfo> = []
}

class LocationInfo {
  showLevels:Array<string> = []
  value: Array<LocationNode> = []
}

class LocationNode {
  value:string = ''
  level:string = ''
}
