import { GroupResponsesService } from './../../shared/services/group-responses/group-responses.service';
import { Controller, All, Param, Body , Req} from '@nestjs/common';
import { SSL_OP_TLS_BLOCK_PADDING_BUG } from 'constants';
import { Request } from 'express';
import { decodeJWT } from 'src/auth-utils';
const log = require('tangy-log').log

@Controller('group-responses')
export class GroupResponsesController {

  constructor(
    private readonly groupResponsesService: GroupResponsesService
  ) { }

  @All('list/:groupId/:skip/:limit')
  async list(@Param('groupId') groupId, @Param('skip') skip, @Param('limit') limit) {
    return await this.groupResponsesService.list(groupId, skip, limit)
  }

  @All('query/:groupId')
  async query(@Param('groupId') groupId, @Body('query') query) {
    return await this.groupResponsesService.find(groupId, query)
  }
  @All('search/:groupId')
  async search(@Param('groupId') groupId, @Body('phrase') phrase, @Body('index') index) {
    return await this.groupResponsesService.search(groupId, phrase, index)
  }
  
  @All('index/:groupId')
  async index(@Param('groupId') groupId, @Body('index') index) {
    await this.groupResponsesService.index(groupId, index)
    return {status: 'ok'}
  }

  @All('create/:groupId')
  async create(@Param('groupId') groupId, @Body('response') response:any) {
    const freshDevice = await this.groupResponsesService.create(groupId, response)
    return freshDevice
  }

  @All('read/:groupId/:responseId')
  async read(@Param('groupId') groupId, @Param('responseId') responseId) {
    return await this.groupResponsesService.read(groupId, responseId)
  }

  @All('readRev/:groupId/:responseId/:rev')
  async readRev(@Param('groupId') groupId, @Param('responseId') responseId, @Param('rev') rev) {
    return await this.groupResponsesService.readRev(groupId, responseId, rev)
  }

  @All('update/:groupId')
  async update(@Param('groupId') groupId, @Body('response') response:any, @Req() request:Request) {
    const tangerineModifiedByUserId = decodeJWT(request['headers']['authorization'])['username']
    const freshResponse = await this.groupResponsesService.update(groupId, {...response, tangerineModifiedByUserId})
    return freshResponse
  }

  @All('delete/:groupId/:responseId')
  async delete(@Param('groupId') groupId:string, @Param('responseId') responseId:string) {
    await this.groupResponsesService.delete(groupId, responseId)
    return {} 
  }
  @All('patch/:groupId/:responseId')
  async patch(@Param('groupId') groupId:string, @Param('responseId') responseId:string,  @Req() request:Request) {
    const tangerineModifiedByUserId = decodeJWT(request['headers']['authorization'])['username']
    const doc = await this.groupResponsesService.read(groupId, responseId)
    const freshResponse = await this.groupResponsesService.update(groupId, {...doc,...request['body'],tangerineModifiedByUserId})
    return request['body']
  }
}
