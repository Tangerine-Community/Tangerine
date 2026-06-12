import { DbService } from './../db/db.service';
import { GroupDevice } from './../../classes/group-device.class';
export declare class GroupDeviceService {
    private readonly dbService;
    constructor(dbService: DbService);
    install(groupId: any): Promise<void>;
    uninstall(groupId: any): Promise<void>;
    list(groupId: any): Promise<any>;
    create(groupId: any, deviceData: any): Promise<GroupDevice>;
    read(groupId: any, deviceId: any): Promise<GroupDevice>;
    update(groupId: any, device: any): Promise<GroupDevice>;
    delete(groupId: any, deviceId: any): Promise<void>;
    reset(groupId: string, deviceId: string): Promise<GroupDevice>;
    didSync(groupId: string, deviceId: string, version: string): Promise<GroupDevice>;
    didSyncStatus(groupId: string, deviceId: string, version: string, status: any): Promise<GroupDevice>;
    didSyncError(groupId: string, deviceId: string, version: string, error: string): Promise<GroupDevice>;
    didUpdate(groupId: string, deviceId: string, version: string): Promise<GroupDevice>;
    didUpdateStatus(groupId: string, deviceId: string, version: string, status: any): Promise<GroupDevice>;
    register(groupId: any, deviceId: any): Promise<GroupDevice>;
    unregister(groupId: any, deviceId: any): Promise<any>;
    tokenDoesMatch(groupId: any, deviceId: any, token: any): Promise<boolean>;
    private getGroupDevicesDb;
}
