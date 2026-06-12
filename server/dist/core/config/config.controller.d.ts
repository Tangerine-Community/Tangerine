import { TangerineConfigService } from './../../shared/services/tangerine-config/tangerine-config.service';
export declare class ConfigController {
    private tangerineConfigService;
    constructor(tangerineConfigService: TangerineConfigService);
    getConfig(): {
        enabledModules: string[];
        hideSkipIf: boolean;
    };
}
