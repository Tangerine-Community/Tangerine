import { Controller, Body, All } from '@nestjs/common';
import { GroupService } from '../../shared/services/group/group.service';
import { Group } from '../../shared/classes/group';

@Controller('nest/group')
export class GroupController {

  constructor(private readonly groupService: GroupService) { }

  @All('create')
  async create(@Body('label') label:string):Promise<Group> {
    return await this.groupService.create(label)
  }

  @All('read')
  async read(@Body('groupId') groupId) {
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
  async list():Promise<[Group]> {
    return await this.groupService.listGroups()
  }

}
