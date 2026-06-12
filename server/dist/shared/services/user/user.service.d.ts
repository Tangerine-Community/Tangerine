import { TangerineConfigService } from '../tangerine-config/tangerine-config.service';
import { User } from 'src/shared/classes/user';
export declare class UserService {
    private readonly configService;
    DB: any;
    usersDb: any;
    constructor(configService: TangerineConfigService);
    getUserByUsername(username: any): Promise<User>;
}
