export class CouchdbSyncStatus {
  pulled:number
  pushed:number
  forcePushed:number
  conflicts:Array<string>
}