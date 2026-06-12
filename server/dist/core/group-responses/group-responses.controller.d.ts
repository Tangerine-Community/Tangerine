import { GroupResponsesService } from './../../shared/services/group-responses/group-responses.service';
export declare class GroupResponsesController {
    private readonly groupResponsesService;
    constructor(groupResponsesService: GroupResponsesService);
    list(groupId: any, skip: any, limit: any): Promise<any>;
    query(groupId: any, query: any): Promise<any>;
    search(groupId: any, phrase: any, index: any): Promise<any>;
    index(groupId: any, index: any): Promise<{
        status: string;
    }>;
    create(groupId: any, response: any): Promise<import("../../shared/classes/group").Group>;
    read(groupId: any, responseId: any): Promise<any>;
    readRev(groupId: any, responseId: any, rev: any): Promise<import("../../shared/classes/group").Group>;
    update(groupId: any, response: any): Promise<import("../../shared/classes/group").Group>;
    delete(groupId: string, responseId: string): Promise<{}>;
}
