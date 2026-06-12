import { GroupDeviceService } from './../../../../shared/services/group-device/group-device.service';
import { SyncSessionService } from '../../services/sync-session/sync-session.service';
export declare class SyncSessionController {
    private readonly syncSessionService;
    private readonly groupDeviceService;
    constructor(syncSessionService: SyncSessionService, groupDeviceService: GroupDeviceService);
    start(groupId: string, deviceId: string, deviceToken: string): Promise<string>;
}
