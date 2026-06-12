import { DbService } from './../db/db.service';
import { Group } from '../../classes/group';
interface PouchDbFindOptions {
    selector: any;
    fields: Array<string>;
    sort: Array<any>;
    limit: number;
    skip: number;
    user_index: string;
}
export declare class GroupResponsesService {
    private readonly dbService;
    constructor(dbService: DbService);
    list(groupId: any, start: number, limit: number): Promise<any>;
    find(groupId: any, query: PouchDbFindOptions): Promise<any>;
    search(groupId: any, phrase: string, index: string, limit?: number, skip?: number): Promise<any>;
    create(groupId: any, responseData: any): Promise<Group>;
    read(groupId: any, responseId: any): Promise<any>;
    readRev(groupId: any, responseId: any, rev: any): Promise<Group>;
    update(groupId: any, response: any): Promise<Group>;
    delete(groupId: any, responseId: any): Promise<void>;
    index(groupId: any, index: any): Promise<void>;
    private getGroupsDb;
}
export {};
