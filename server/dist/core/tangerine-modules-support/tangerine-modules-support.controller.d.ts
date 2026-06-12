import { TangerineConfigService } from './../../shared/services/tangerine-config/tangerine-config.service';
export declare class ModuleController {
    private tangerineConfigService;
    constructor(tangerineConfigService: TangerineConfigService);
    enable(moduleName: string): Promise<{
        message: string;
    }>;
}
