"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const sync_session_service_1 = require("./modules/sync/services/sync-session/sync-session.service");
const common_1 = require("@nestjs/common");
const DB = require('./db');
const tangerine_config_service_1 = require("./shared/services/tangerine-config/tangerine-config.service");
const group_service_1 = require("./shared/services/group/group.service");
const createSitewideDatabase = require("./create-sitewide-database");
const reportingWorker = require('./reporting/reporting-worker');
const log = require('tangy-log').log;
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds));
const tangyModules = require('./modules/index.js')();
const enableModule = require('./modules/enable-module.js');
const disableModule = require('./modules/disable-module.js');
const respawn = require('respawn');
let AppService = class AppService {
    groupService;
    configService;
    syncSessionService;
    constructor(groupService, configService, syncSessionService) {
        this.groupService = groupService;
        this.configService = configService;
        this.syncSessionService = syncSessionService;
    }
    installed = false;
    appDb = new DB('app');
    config;
    async start() {
        this.config = this.configService.config();
        try {
            await this.appDb.get('installed');
            this.installed = true;
        }
        catch (e) {
            await this.install();
            this.installed = true;
        }
        await this.startModules();
        this.keepAliveReportingWorker();
        this.keepAliveSessionSweeper();
    }
    async startModules() {
        let actuallyEnabledModules = [];
        let modulesDoc = {
            _id: 'modules',
            enabledModules: []
        };
        try {
            modulesDoc = await this.appDb.get('modules');
            actuallyEnabledModules = modulesDoc.enabledModules;
        }
        catch (e) {
        }
        const shouldBeEnabledModules = this.config.enabledModules;
        const intersection = actuallyEnabledModules.filter(moduleName => shouldBeEnabledModules.includes(moduleName));
        const shouldEnable = shouldBeEnabledModules.filter(moduleName => !intersection.includes(moduleName));
        const shouldDisable = actuallyEnabledModules.filter(moduleName => !shouldBeEnabledModules.includes(moduleName));
        if (shouldEnable.length > 0) {
            log.info(`Enabling modules: ${shouldEnable.join(' ')}`);
        }
        for (const moduleName of shouldEnable) {
            await enableModule(moduleName);
        }
        if (shouldDisable.length > 0) {
            log.info(`Disabling modules: ${shouldDisable.join(' ')}`);
        }
        for (const moduleName of shouldDisable) {
            await disableModule(moduleName);
        }
        await this.appDb.put({ ...modulesDoc, enabledModules: shouldBeEnabledModules });
        await tangyModules.hook('boot', {});
    }
    async install() {
        log.info('Installing...');
        await createSitewideDatabase('app');
        await createSitewideDatabase('groups');
        await createSitewideDatabase('users');
        await this.appDb.put({ _id: 'installed', value: true });
        await this.appDb.put({ _id: 'version', value: process.env.TANGERINE_VERSION });
        await exec('git config --system user.name "tangerine"');
        await exec(`ssh-keygen -t rsa -b 4096 -f /root/.ssh/id_rsa-tmp -P "" -C "tangerine@${process.env.T_HOST_NAME}"`);
        await exec(`cat /root/.ssh/id_rsa-tmp > /root/.ssh/id_rsa`);
        await exec(`cat /root/.ssh/id_rsa-tmp.pub > /root/.ssh/id_rsa.pub`);
        await exec(`chmod 600 /root/.ssh/id_rsa`);
        log.info('Installed');
    }
    async keepAliveReportingWorker() {
        let groupsList = await this.groupService.listGroups();
        const newGroupQueue = [];
        this.groupService.groups$.subscribe({
            next: (group) => {
                log.debug('Queueing report database(s) processing for ' + group._id + ': ');
                newGroupQueue.push(group);
            }
        });
        await reportingWorker.prepare(groupsList);
        let workerState = await reportingWorker.getWorkerState();
        try {
            while (newGroupQueue.length > 0) {
                await reportingWorker.addGroup(newGroupQueue.pop());
                groupsList = await this.groupService.listGroups();
            }
            log.info("Spawning new reporting-worker node process. Sleep set to : " + this.config.reportingDelay);
            const monitor = respawn(['reporting-worker-batch', ''], {
                name: 'reporting-worker-batch',
                env: { ENV_VAR: 'reporting-worker-batch' },
                cwd: '.',
                maxRestarts: -1,
                sleep: this.config.reportingDelay,
                kill: 10000,
            });
            monitor.on('stdout', function (msg) {
                console.log(msg.toString());
                if (msg.toString().includes('Finished batch.')) {
                    monitor.stop(function () {
                        monitor.start();
                    });
                }
            });
            let didError = false;
            monitor.on('stderr', async (err) => {
                console.log('Error: ' + err);
                didError = true;
                await sleep(3 * 1000);
            });
            monitor.on('stop', async () => {
                if (!didError) {
                    workerState = await reportingWorker.getWorkerState();
                    if (workerState) {
                        if (workerState.hasOwnProperty('processed') === false || workerState.processed === 0) {
                            await sleep(this.configService.config().reportingDelay);
                        }
                        else {
                            log.info(`Processed ${workerState.processed} changes. reporting-worker-batch status: ${monitor.status}`);
                        }
                    }
                    else {
                        log.error(`Weird - no workerState. Gonna take a slight pause.`);
                        await sleep(this.configService.config().reportingDelay);
                    }
                }
                log.info('respawn stopped. ');
            });
            monitor.on('crash', function (msg) {
                log.info('respawn crash: ' + msg);
            });
            monitor.start();
        }
        catch (error) {
            log.error('Reporting process had an error.');
            console.log(error);
            await sleep(3 * 1000);
        }
    }
    async keepAliveSessionSweeper() {
        const config = await this.configService.config();
        if (config.enabledModules.includes('sync-protocol-2')) {
            setInterval(() => {
                try {
                    this.syncSessionService.expireSyncSessions();
                    this.groupService.expireAdminCouchdbSessions();
                }
                catch (e) {
                    log.error(e);
                    console.log(e);
                }
            }, 60 * 60 * 1000);
        }
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [group_service_1.GroupService,
        tangerine_config_service_1.TangerineConfigService,
        sync_session_service_1.SyncSessionService])
], AppService);
//# sourceMappingURL=app.service.js.map