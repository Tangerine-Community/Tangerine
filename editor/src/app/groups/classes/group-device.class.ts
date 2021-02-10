import {v4 as uuidv4} from 'uuid';
import {ReplicationStatus} from "../../sync/replication-status.class";

export class GroupDevice {
  _id:string = uuidv4()
  token:string = uuidv4()
  key:string = uuidv4()
  claimed:boolean = false
  updatedOn:number = undefined
  registeredOn:number = undefined
  syncedOn:number = undefined
  version:string
  assignedLocation: LocationInfo = new LocationInfo()
  syncLocations: Array<LocationInfo> = []
  replicationStatus: ReplicationStatus; // deprecated - migrate to replicationStatuses
  replicationStatuses: Array<ReplicationStatus>;
}

class LocationInfo {
  showLevels:Array<string> = []
  value: Array<LocationNode> = []
}

class LocationNode {
  value:string = ''
  level:string = ''
}
