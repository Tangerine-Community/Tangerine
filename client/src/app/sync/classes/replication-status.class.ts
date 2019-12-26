export class ReplicationStatus {
  pulled:number
  pushed:number
  forcePushed:number
  conflicts:Array<string>
}