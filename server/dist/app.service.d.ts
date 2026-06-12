import { SyncSessionService } from './modules/sync/services/sync-session/sync-session.service';
import { TangerineConfigService } from './shared/services/tangerine-config/tangerine-config.service';
import { GroupService } from './shared/services/group/group.service';
import { TangerineConfig } from './shared/classes/tangerine-config';
export declare class AppService {
    private readonly groupService;
    private readonly configService;
    private readonly syncSessionService;
    constructor(groupService: GroupService, configService: TangerineConfigService, syncSessionService: SyncSessionService);
    installed: boolean;
    appDb: any;
    config: TangerineConfig;
    start(): Promise<void>;
    startModules(): Promise<void>;
    install(): Promise<void>;
    keepAliveReportingWorker(): Promise<void>;
    keepAliveSessionSweeper(): Promise<void>;
}
