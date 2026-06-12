import { TangerineConfigService } from '../../../../shared/services/tangerine-config/tangerine-config.service';
import { GroupService } from '../../../../shared/services/group/group.service';
import { ClientUserService } from '../../../../shared/services/client-user/client-user.service';
import { DbService } from '../../../../shared/services/db/db.service';
import { LocationConfig } from 'src/shared/classes/group-device.class';
import { GroupDeviceService } from 'src/shared/services/group-device/group-device.service';
import { HttpService } from "@nestjs/axios";
export declare class SyncSessionInfo {
    syncSessionUrl: string;
    deviceSyncLocations: Array<LocationConfig>;
}
export declare class SyncSessionv2Service {
    private readonly http;
    private readonly dbService;
    private readonly configService;
    private readonly groupConfig;
    private readonly groupDeviceService;
    private readonly clientUserService;
    constructor(http: HttpService, dbService: DbService, configService: TangerineConfigService, groupConfig: GroupService, groupDeviceService: GroupDeviceService, clientUserService: ClientUserService);
    start(groupId: string, deviceId: string): Promise<SyncSessionInfo>;
    expireSyncSessions(): Promise<void>;
}
