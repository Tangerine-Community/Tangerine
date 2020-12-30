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
  initialPullLastSeq: any
  tangerineVersion: any
  pushStartTime: any
  pullStartTime: any
  pushStopTime: any
  pullStopTime: any
}
