import { Controller, Body, All, Param, Req, Request } from '@nestjs/common';
import { GroupService } from '../../shared/services/group/group.service';
import { Group } from '../../shared/classes/group';
import { TangerineConfigService } from '../../shared/services/tangerine-config/tangerine-config.service';
import { UserService } from '../../shared/services/user/user.service';

@Controller('nest/group')
export class GroupController {

  constructor(
    private readonly groupService: GroupService,
    private readonly configService: TangerineConfigService,
    private readonly userService: UserService
  ) { }

  @All('create')
  async create(@Body('label') label:string, @Req() request: Request):Promise<Group> {
    return await this.groupService.create(label, request['user']['name']);
  }

  @All('read/:groupId')
  async read(@Param('groupId') groupId) {
    return await this.groupService.read(groupId)
  }

  @All('update')
  async update(@Body('group') group) {
    await this.groupService.update(group)
    return 'success'
  }

  @All('delete')
  async delete(@Body('group') group) {
    await this.groupService.delete(group)
    return 'success'
  }

  @All('list')
  async list(@Request() request):Promise<Array<Group>> {
    const groups = await this.groupService.listGroups()
    if (request.user && request.user.name === this.configService.config().userOneUsername) {
      return groups
    } else {
      const user = await this.userService.getUserByUsername(request.user.name)
      return groups.filter(group => {
        return user.groups.reduce((foundMembership, groupMembership) => foundMembership ? true : groupMembership.groupName === group._id, false)
      })
    }
  }

  @All('start-session')
  async startSession(@Body('group') group, @Body('username') username, @Body('type') type) {
    console.log("started session for group: " + group + " username: " + username)
    let dbUrlWithCredentials = await this.groupService.startSession(group, username, type)
    // return {username:'admin', password: 'password'}
    return dbUrlWithCredentials
  }

}
