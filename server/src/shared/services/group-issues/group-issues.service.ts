import { DbService } from './../db/db.service';
import { Injectable } from '@nestjs/common';

interface PouchDbQueryOptions {
  viewName:string
  fun:string
  keys:Array<any>
  startkey:Array<any>
  endkey:Array<any>
  limit:number
  skip:number
}

@Injectable()
export class GroupIssuesService {

  constructor(
    private readonly dbService:DbService
  ) {}

  async list(groupId, start:number, limit:number) {
    const groupDb = this.getGroupsDb(groupId)
    const options = <any>{ include_docs:true }
    if (start) options.start = start
    if (limit) options.limit = limit
    const response  = await groupDb.allDocs(options)
    return response
      .rows
      .map(row => row.doc)
  }

  /**
   * 
   * @param groupId
   * @param query
   */
  async query(groupId, options:PouchDbQueryOptions) {
    const groupDb = this.getGroupsDb(groupId)
    // console.log("options for groupId: " + groupId + " : " + JSON.stringify(options))
    const response  = await groupDb.query(options.fun, options)
    // console.log("response: " + JSON.stringify(response))
    return response.rows
  }

  private getGroupsDb(groupId) {
    return this.dbService.instantiate(groupId)
  }
}
