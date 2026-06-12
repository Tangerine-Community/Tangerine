import { GroupDeviceService } from './../../shared/services/group-device/group-device.service';
export declare class GroupDevicePublicController {
    private readonly groupDeviceService;
    constructor(groupDeviceService: GroupDeviceService);
    didSync(groupId: any, deviceId: any, token: any, version: any): Promise<import("../../shared/classes/group-device.class").GroupDevice | "Token does not match" | "There was an error.">;
    didSyncStatus(groupId: any, deviceId: any, token: any, version: any, status: any): Promise<import("../../shared/classes/group-device.class").GroupDevice | "Token does not match" | "There was an error.">;
    didSyncError(groupId: any, deviceId: any, token: any, version: any, error: any): Promise<import("../../shared/classes/group-device.class").GroupDevice | "Token does not match" | "There was an error.">;
    didUpdate(groupId: any, deviceId: any, token: any, version: any): Promise<import("../../shared/classes/group-device.class").GroupDevice | "Token does not match" | "There was an error.">;
    didUpdateStatus(groupId: any, deviceId: any, token: any, version: any, status: any): Promise<import("../../shared/classes/group-device.class").GroupDevice | "Token does not match" | "There was an error.">;
    read(groupId: any, deviceId: any, token: any): Promise<import("../../shared/classes/group-device.class").GroupDevice | "Token does not match">;
    register(groupId: string, deviceId: string, token: string): Promise<import("../../shared/classes/group-device.class").GroupDevice | "Token does not match" | "There was an error.">;
    unregister(groupId: string, deviceId: string, token: string): Promise<"ok" | "Token does not match" | "There was an error.">;
}
