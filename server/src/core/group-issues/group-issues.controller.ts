import { Controller, All, Param, Body } from '@nestjs/common';
import {GroupIssuesService} from "./../../shared/services/group-issues/group-issues.service";
const log = require('tangy-log').log

@Controller('group-issues')
export class GroupIssuesController {

  constructor(
    private readonly groupIssuesService: GroupIssuesService
  ) { }
  
  @All('query/:groupId')
  async query(@Param('groupId') groupId, @Body('options') options) {
    return await this.groupIssuesService.query(groupId, options)
  }
  
}
