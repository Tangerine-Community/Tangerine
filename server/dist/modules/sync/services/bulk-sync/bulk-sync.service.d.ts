import { HttpService } from "@nestjs/axios";
export declare class BulkSyncService {
    private httpService;
    constructor(httpService: HttpService);
    dump(groupId: string, deviceId: string, syncUsername: string, syncPassword: string): Promise<any>;
    getDbDump(groupId: string, locationIdentifier: string): Promise<any>;
}
