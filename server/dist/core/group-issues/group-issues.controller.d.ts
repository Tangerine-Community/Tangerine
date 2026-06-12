import { GroupIssuesService } from "./../../shared/services/group-issues/group-issues.service";
export declare class GroupIssuesController {
    private readonly groupIssuesService;
    constructor(groupIssuesService: GroupIssuesService);
    query(groupId: any, options: any): Promise<any>;
}
