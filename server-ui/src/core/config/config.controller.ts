import { TangerineConfigService } from './../../shared/services/tangerine-config/tangerine-config.service';
import { TangerineConfig } from './../../shared/classes/tangerine-config';
import { Controller, All } from '@nestjs/common';

@Controller('config')
export class ConfigController {
  constructor(
    private tangerineConfigService:TangerineConfigService
  ) { }

  @All('')
  getConfig() {
    const tangerineConfig = this.tangerineConfigService.config()
    return {
      // enabledModules: tangerineConfig.enabledModules,
      hideSkipIf: tangerineConfig.hideSkipIf
    }
  }
}
