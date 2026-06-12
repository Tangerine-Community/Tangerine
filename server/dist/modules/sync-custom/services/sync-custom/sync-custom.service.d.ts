export declare class SyncCustomService {
    processPush(groupId: any, data: any): Promise<{
        status: string;
    }>;
    processPull(): void;
}
