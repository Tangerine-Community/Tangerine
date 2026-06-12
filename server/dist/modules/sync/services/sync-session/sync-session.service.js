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
exports.SyncSessionService = void 0;
const common_1 = require("@nestjs/common");
const tangerine_config_service_1 = require("../../../../shared/services/tangerine-config/tangerine-config.service");
const uuid_1 = require("uuid");
const group_service_1 = require("../../../../shared/services/group/group.service");
const client_user_service_1 = require("../../../../shared/services/client-user/client-user.service");
const db_service_1 = require("../../../../shared/services/db/db.service");
const axios_1 = require("@nestjs/axios");
const log = require('tangy-log').log;
let SyncSessionService = class SyncSessionService {
    http;
    dbService;
    configService;
    groupConfig;
    clientUserService;
    constructor(http, dbService, configService, groupConfig, clientUserService) {
        this.http = http;
        this.dbService = dbService;
        this.configService = configService;
        this.groupConfig = groupConfig;
        this.clientUserService = clientUserService;
    }
    async start(groupId, deviceId) {
        try {
            const syncUsername = `syncUser-${(0, uuid_1.v4)()}-${Date.now()}`;
            const syncPassword = (0, uuid_1.v4)();
            const config = await this.configService.config();
            const syncUserDoc = {
                "_id": `org.couchdb.user:${syncUsername}`,
                "name": syncUsername,
                "roles": [`sync-${groupId}`],
                "type": "user",
                "password": syncPassword
            };
            await this.http.post(`${config.couchdbEndpoint}/_users`, syncUserDoc).toPromise();
            log.info(`Created sync session for user ${deviceId} in group ${groupId}`);
            return `${config.protocol}://${syncUsername}:${syncPassword}@${config.hostName}/db/${groupId}`;
        }
        catch (e) {
            throw e;
        }
    }
    async expireSyncSessions() {
        const expireLimit = 24 * 60 * 60 * 1000;
        const _usersDb = this.dbService.instantiate(`_users`);
        const expiredSyncSessions = (await _usersDb.allDocs({ include_docs: true }))
            .rows
            .map(row => row.doc)
            .filter(userDoc => userDoc._id.includes('org.couchdb.user:syncUser'))
            .filter(userDoc => (Date.now() - parseInt(userDoc.name.split('-')[6])) > expireLimit);
        for (const expiredSyncSession of expiredSyncSessions) {
            await _usersDb.remove(expiredSyncSession);
        }
    }
};
exports.SyncSessionService = SyncSessionService;
exports.SyncSessionService = SyncSessionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        db_service_1.DbService,
        tangerine_config_service_1.TangerineConfigService,
        group_service_1.GroupService,
        client_user_service_1.ClientUserService])
], SyncSessionService);
//# sourceMappingURL=sync-session.service.js.map