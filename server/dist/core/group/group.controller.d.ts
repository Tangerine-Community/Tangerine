import { GroupService } from '../../shared/services/group/group.service';
import { Group } from '../../shared/classes/group';
import { TangerineConfigService } from '../../shared/services/tangerine-config/tangerine-config.service';
import { UserService } from '../../shared/services/user/user.service';
export declare class GroupController {
    private readonly groupService;
    private readonly configService;
    private readonly userService;
    constructor(groupService: GroupService, configService: TangerineConfigService, userService: UserService);
    create(label: string, contentSet: string, request: Request): Promise<Group>;
    read(groupId: any): Promise<Group>;
    update(group: any): Promise<string>;
    delete(group: any): Promise<string>;
    list(request: any): Promise<Array<Group>>;
    contentSets(): Promise<any>;
    startSession(group: any, username: any, type: any): Promise<object>;
}
