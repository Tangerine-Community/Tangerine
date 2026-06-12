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
exports.SyncCustomController = void 0;
const sync_custom_service_1 = require("./../../services/sync-custom/sync-custom.service");
const group_device_service_1 = require("./../../../../shared/services/group-device/group-device.service");
const common_1 = require("@nestjs/common");
const log = require('tangy-log').log;
let SyncCustomController = class SyncCustomController {
    syncCustomService;
    groupDeviceService;
    constructor(syncCustomService, groupDeviceService) {
        this.syncCustomService = syncCustomService;
        this.groupDeviceService = groupDeviceService;
    }
    async start(groupId, docId, deviceId, deviceToken, data) {
        try {
            if (await this.groupDeviceService.tokenDoesMatch(groupId, deviceId, deviceToken)) {
                return await this.syncCustomService.processPush(groupId, data);
            }
            else {
            }
        }
        catch (err) {
            log.error(`Error in sync-session/start`);
            console.log(err);
        }
    }
};
exports.SyncCustomController = SyncCustomController;
__decorate([
    (0, common_1.Post)('push/:groupId/:docId/:deviceId/:deviceToken'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Param)('docId')),
    __param(2, (0, common_1.Param)('deviceId')),
    __param(3, (0, common_1.Param)('deviceToken')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], SyncCustomController.prototype, "start", null);
exports.SyncCustomController = SyncCustomController = __decorate([
    (0, common_1.Controller)('sync-custom'),
    __metadata("design:paramtypes", [sync_custom_service_1.SyncCustomService,
        group_device_service_1.GroupDeviceService])
], SyncCustomController);
//# sourceMappingURL=sync-custom.controller.js.map