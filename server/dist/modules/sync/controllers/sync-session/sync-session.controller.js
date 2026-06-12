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
exports.SyncSessionController = void 0;
const group_device_service_1 = require("./../../../../shared/services/group-device/group-device.service");
const common_1 = require("@nestjs/common");
const sync_session_service_1 = require("../../services/sync-session/sync-session.service");
const log = require('tangy-log').log;
let SyncSessionController = class SyncSessionController {
    syncSessionService;
    groupDeviceService;
    constructor(syncSessionService, groupDeviceService) {
        this.syncSessionService = syncSessionService;
        this.groupDeviceService = groupDeviceService;
    }
    async start(groupId, deviceId, deviceToken) {
        try {
            if (await this.groupDeviceService.tokenDoesMatch(groupId, deviceId, deviceToken)) {
                return await this.syncSessionService.start(groupId, deviceId);
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
exports.SyncSessionController = SyncSessionController;
__decorate([
    (0, common_1.Get)('start/:groupId/:deviceId/:deviceToken'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Param)('deviceId')),
    __param(2, (0, common_1.Param)('deviceToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], SyncSessionController.prototype, "start", null);
exports.SyncSessionController = SyncSessionController = __decorate([
    (0, common_1.Controller)('sync-session'),
    __metadata("design:paramtypes", [sync_session_service_1.SyncSessionService,
        group_device_service_1.GroupDeviceService])
], SyncSessionController);
//# sourceMappingURL=sync-session.controller.js.map