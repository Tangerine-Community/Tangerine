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
}
