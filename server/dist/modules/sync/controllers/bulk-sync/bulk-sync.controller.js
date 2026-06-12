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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkSyncController = void 0;
const common_1 = require("@nestjs/common");
const sync_session_service_1 = require("../../services/sync-session/sync-session.service");
const group_device_service_1 = require("../../../../shared/services/group-device/group-device.service");
const bulk_sync_service_1 = require("../../services/bulk-sync/bulk-sync.service");
const log = require('tangy-log').log;
let BulkSyncController = class BulkSyncController {
    syncSessionService;
    groupDeviceService;
    bulkSyncService;
    constructor(syncSessionService, groupDeviceService, bulkSyncService) {
        this.syncSessionService = syncSessionService;
        this.groupDeviceService = groupDeviceService;
        this.bulkSyncService = bulkSyncService;
    }
    async start(groupId, deviceId, deviceToken) {
        try {
            if (await this.groupDeviceService.tokenDoesMatch(groupId, deviceId, deviceToken)) {
                const tokenUrl = await this.syncSessionService.start(groupId, deviceId);
                const params = tokenUrl.split('/');
                const baseUrl = params[2];
                const baseUrlParams = baseUrl.split('@');
                const syncCredentials = baseUrlParams[0].split(':');
                console.log("syncCredentials: " + syncCredentials);
                const syncUsername = syncCredentials[0];
                const syncPassword = syncCredentials[1];
                let metadataFile;
                try {
                    metadataFile = await this.bulkSyncService.dump(groupId, deviceId, syncUsername, syncPassword);
                }
                catch (e) {
                    console.log("Error: " + e);
                }
                return metadataFile;
            }
            else {
                console.log(`Permission Denied: Device ${deviceId} used incorrect token to start sync session.`);
            }
        }
        catch (err) {
            log.error(`Error in sync-session/start with groupId: ${groupId} deviceId: ${deviceId} deviceToken: ${deviceToken} `);
            console.log(err);
        }
    }
    async getDbDump(groupId, deviceId, deviceToken, locationIdentifier) {
        try {
            if (await this.groupDeviceService.tokenDoesMatch(groupId, deviceId, deviceToken)) {
                let dumpFile;
                try {
                    dumpFile = await this.bulkSyncService.getDbDump(groupId, locationIdentifier);
                }
                catch (e) {
                    console.log("Error: " + e);
                }
                return dumpFile;
            }
            else {
                console.log(`Permission Denied: Device ${deviceId} used incorrect token to start sync session.`);
            }
        }
        catch (err) {
            log.error(`Error in sync-session/start with groupId: ${groupId} deviceId: ${deviceId} deviceToken: ${deviceToken} `);
            console.log(err);
        }
    }
};
exports.BulkSyncController = BulkSyncController;
__decorate([
    (0, common_1.Get)('start/:groupId/:deviceId/:deviceToken'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Param)('deviceId')),
    __param(2, (0, common_1.Param)('deviceToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], BulkSyncController.prototype, "start", null);
__decorate([
    (0, common_1.Get)('getDbDump/:groupId/:deviceId/:deviceToken/:locationIdentifier'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Param)('deviceId')),
    __param(2, (0, common_1.Param)('deviceToken')),
    __param(3, (0, common_1.Param)('locationIdentifier')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], BulkSyncController.prototype, "getDbDump", null);
exports.BulkSyncController = BulkSyncController = __decorate([
    (0, common_1.Controller)('bulk-sync'),
    __metadata("design:paramtypes", [sync_session_service_1.SyncSessionService,
        group_device_service_1.GroupDeviceService,
        bulk_sync_service_1.BulkSyncService])
], BulkSyncController);
//# sourceMappingURL=bulk-sync.controller.js.map