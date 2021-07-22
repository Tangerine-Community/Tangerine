import {AppInfo} from "../device/services/device.service";

export class ReplicationStatus {
  pulled:number
  pushed:number
  forcePushed:number
  pullConflicts:Array<string>
  pushConflicts:Array<string>
  info: any
  error:any
  remaining:any
  direction:any
  pullError: any
  pushError: any
  initialPushLastSeq: any;  // used for the 'since' property when initiating a replication
  initialPullLastSeq: any;
  currentPushLastSeq: any;  // status.info.last_seq after sync is concluded.
  currentPullLastSeq: any;
  tangerineVersion: any;
  message: string;
  effectiveConnectionType: string;
  networkDownlinkSpeed: string;
  networkDownlinkMax: string;
  deviceInfo: AppInfo;
  dbDocCount: any;
  batchSize: any;
  localDocsForLocation: any;
  syncCouchdbServiceStartTime: string;
  syncCouchdbServiceEndime: string;
  syncCouchdbServiceDuration: number;
  userAgent: string;
  localDocsCount: number;
  remoteDocsCount: number;
  idsToSyncCount: number;
  compareDocsStartTime: string;
  compareDocsEndTime: string;
  compareSyncDuration: number;
  fullSync: string;
  compareDocsDirection: string;
  deletedArchivedDocs: number;
  storageAvailable: number;
}
