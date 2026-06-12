import { DbService } from './../db/db.service';
interface PouchDbQueryOptions {
    viewName: string;
    fun: string;
    keys: Array<any>;
    startkey: Array<any>;
    endkey: Array<any>;
    limit: number;
    skip: number;
}
export declare class GroupIssuesService {
    private readonly dbService;
    constructor(dbService: DbService);
    list(groupId: any, start: number, limit: number): Promise<any>;
    query(groupId: any, options: PouchDbQueryOptions): Promise<any>;
    private getGroupsDb;
}
export {};
