import { TangerineConfigService } from '../../../../shared/services/tangerine-config/tangerine-config.service';
import { GroupService } from '../../../../shared/services/group/group.service';
import { ClientUserService } from '../../../../shared/services/client-user/client-user.service';
import { DbService } from '../../../../shared/services/db/db.service';
import { HttpService } from "@nestjs/axios";
export declare class SyncSessionService {
    private readonly http;
    private readonly dbService;
    private readonly configService;
    private readonly groupConfig;
    private readonly clientUserService;
    constructor(http: HttpService, dbService: DbService, configService: TangerineConfigService, groupConfig: GroupService, clientUserService: ClientUserService);
    start(groupId: string, deviceId: string): Promise<string>;
    expireSyncSessions(): Promise<void>;
}
