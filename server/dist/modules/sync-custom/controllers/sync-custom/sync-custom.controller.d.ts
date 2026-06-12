import { SyncCustomService } from './../../services/sync-custom/sync-custom.service';
import { GroupDeviceService } from './../../../../shared/services/group-device/group-device.service';
export declare class SyncCustomController {
    private readonly syncCustomService;
    private readonly groupDeviceService;
    constructor(syncCustomService: SyncCustomService, groupDeviceService: GroupDeviceService);
    start(groupId: string, docId: string, deviceId: string, deviceToken: string, data: any): Promise<any>;
}
