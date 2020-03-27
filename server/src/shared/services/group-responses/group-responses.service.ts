import { DbService } from './../db/db.service';
import { Injectable } from '@nestjs/common';
import { TangerineConfigService } from '../tangerine-config/tangerine-config.service';
import { Group } from '../../classes/group';
import PouchDB from 'pouchdb'
import { v4 as UUID } from 'uuid'
import { BehaviorSubject, Observable, Subject } from 'rxjs';
const DB = require('../../../db')
const log = require('tangy-log').log
const fs = require('fs-extra')
const tangyModules = require('../../../modules/index.js')()
const uuid = require('uuid')

interface PouchDbFindOptions {
  selector:any,
  fields:Array<string>
  sort:Array<any>
  limit:number
  skip:number
  user_index:string
}

@Injectable()
export class GroupResponsesService {

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

  async find(groupId, query:PouchDbFindOptions) {
    const groupDb = this.getGroupsDb(groupId)
    const response  = await groupDb.find(query)
    return response.docs
  }
  
  async create(groupId, responseData:any):Promise<Group> {
    const groupDb = this.getGroupsDb(groupId)
    const response = await groupDb.put(responseData)
    return <Group>await groupDb.get(response.id)
  }

  async read(groupId, responseId) {
    const groupDb = this.getGroupsDb(groupId)
    const response = <Group>await groupDb.get(responseId)
    return response
  }

  async update(groupId, response) {
    try {
      const groupDb = this.getGroupsDb(groupId)
      const originalResponse = await groupDb.get(response._id)
      await groupDb.put({
        ...response,
        _rev: originalResponse._rev
      })
      const freshResponse = <Group>await groupDb.get(response._id)
      return freshResponse
    } catch (e) {
      try {
        const groupDb = this.getGroupsDb(groupId)
        await groupDb.put(response)
        const freshResponse = <Group>await groupDb.get(response._id)
        return freshResponse
      } catch (e) {
        console.log(e)
      }
    }
  }

  async delete(groupId, responseId) {
    const groupDb = this.getGroupsDb(groupId)
    const response = await groupDb.get(responseId)
    await groupDb.remove(response)
  }

  private getGroupsDb(groupId) {
    return this.dbService.instantiate(groupId)
  }

}
