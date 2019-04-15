import { Controller, Get, Request } from '@nestjs/common';
import { TangerineConfigService } from '../../shared/services/tangerine-config/tangerine-config.service';
import { User } from '../../shared/classes/user';

@Controller('user')
export class UserController {

  constructor(
    private readonly configService: TangerineConfigService
  ) { }

  @Get('permission/can-manage-sitewide-users')
  permissionCanManageSitewideUsers(@Request() request) {
    const user = <User>request.user
    const user1Only = this.configService.config().user1ManagedServerUsers
    if (user1Only === false || (user1Only === true && request.user && request.user.name === 'user1')) {
      return 'true'
    } else {
      return 'false'
    }

  }

}
