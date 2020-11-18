export class ReplicationStatus {
  pulled:number
  pushed:number
  forcePushed:number
  initialConflicts:Array<string>
  pullConflicts:Array<string>
  pushConflicts:Array<string>
}
