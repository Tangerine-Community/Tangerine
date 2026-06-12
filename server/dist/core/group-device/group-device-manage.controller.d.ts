import { GroupDevice } from './../../shared/classes/group-device.class';
import { GroupDeviceService } from './../../shared/services/group-device/group-device.service';
export declare class GroupDeviceManageController {
    private readonly groupDeviceService;
    constructor(groupDeviceService: GroupDeviceService);
    list(groupId: any): Promise<any>;
    create(groupId: string, deviceData: any): Promise<GroupDevice>;
    read(groupId: any, deviceId: any): Promise<GroupDevice>;
    update(groupId: any, device: GroupDevice): Promise<GroupDevice>;
    reset(groupId: any, deviceId: any): Promise<GroupDevice>;
    delete(groupId: string, deviceId: string): Promise<{}>;
    didSync(groupId: any, deviceId: any, token: any, version: any): Promise<GroupDevice | "Token does not match" | "There was an error.">;
    didSyncError(groupId: any, deviceId: any, token: any, version: any, error: any): Promise<GroupDevice | "Token does not match" | "There was an error.">;
    didUpdate(groupId: any, deviceId: any, token: any, version: any): Promise<GroupDevice | "Token does not match" | "There was an error.">;
    register(groupId: string, deviceId: string, token: string): Promise<GroupDevice | "Token does not match" | "There was an error.">;
    unregister(groupId: string, deviceId: string, token: string): Promise<"ok" | "Token does not match" | "There was an error.">;
}
