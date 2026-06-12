import { GroupDeviceService } from './../../../../shared/services/group-device/group-device.service';
import { SyncSessionInfo, SyncSessionv2Service } from '../../services/sync-session/sync-session-v2.service';
export declare class SyncSessionv2Controller {
    private readonly syncSessionService;
    private readonly groupDeviceService;
    constructor(syncSessionService: SyncSessionv2Service, groupDeviceService: GroupDeviceService);
    start(groupId: string, deviceId: string, deviceToken: string): Promise<SyncSessionInfo>;
}
