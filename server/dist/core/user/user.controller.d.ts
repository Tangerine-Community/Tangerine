import { TangerineConfigService } from '../../shared/services/tangerine-config/tangerine-config.service';
export declare class UserController {
    private readonly configService;
    constructor(configService: TangerineConfigService);
    permissionCanManageSitewideUsers(request: any): "true" | "false";
}
