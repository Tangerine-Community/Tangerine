import { SyncSessionService } from "../../services/sync-session/sync-session.service";
import { GroupDeviceService } from "../../../../shared/services/group-device/group-device.service";
import { BulkSyncService } from "../../services/bulk-sync/bulk-sync.service";
export declare class BulkSyncController {
    private readonly syncSessionService;
    private readonly groupDeviceService;
    private readonly bulkSyncService;
    constructor(syncSessionService: SyncSessionService, groupDeviceService: GroupDeviceService, bulkSyncService: BulkSyncService);
    start(groupId: string, deviceId: string, deviceToken: string): Promise<any>;
    getDbDump(groupId: string, deviceId: string, deviceToken: string, locationIdentifier: string): Promise<any>;
}
