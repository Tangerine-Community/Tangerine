import { TangerineConfigService } from './../../shared/services/tangerine-config/tangerine-config.service';
import { TangerineConfig } from './../../shared/classes/tangerine-config';
import { Controller, Post, Param } from '@nestjs/common';
const tangyModules = require('../../modules/index.js')()

@Controller('modules')
export class ModuleController {
  constructor(
    private tangerineConfigService:TangerineConfigService
  ) { }

  @Post('enable/:moduleName')
  async enable(@Param('moduleName') moduleName:string) {
    const tangerineConfig = this.tangerineConfigService.config()
    if (tangyModules.enabledModules[moduleName]) {
      if (tangyModules.enabledModules[moduleName].enable) {
        await tangyModules.enabledModules[moduleName].enable({ tangerineConfig })
      }
      return {
        message: 'ok'
      }
    } else {
      throw new Error('You must first enable that module via T_MODULES.')
    }
  }
}
