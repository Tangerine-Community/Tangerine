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
exports.GroupDevicePublicController = void 0;
const group_device_service_1 = require("./../../shared/services/group-device/group-device.service");
const common_1 = require("@nestjs/common");
const log = require('tangy-log').log;
let GroupDevicePublicController = class GroupDevicePublicController {
    groupDeviceService;
    constructor(groupDeviceService) {
        this.groupDeviceService = groupDeviceService;
    }
    async didSync(groupId, deviceId, token, version) {
        try {
            if (!await this.groupDeviceService.tokenDoesMatch(groupId, deviceId, token)) {
                return 'Token does not match';
            }
            const device = await this.groupDeviceService.didSync(groupId, deviceId, version);
            return device;
        }
        catch (error) {
            log.error('Error syncing device');
            console.log(error);
            return 'There was an error.';
        }
    }
    async didSyncStatus(groupId, deviceId, token, version, status) {
        try {
            if (!await this.groupDeviceService.tokenDoesMatch(groupId, deviceId, token)) {
                return 'Token does not match';
            }
            const device = await this.groupDeviceService.didSyncStatus(groupId, deviceId, version, status);
            return device;
        }
        catch (error) {
            log.error('Error syncing device');
            console.log(error);
            return 'There was an error.';
        }
    }
    async didSyncError(groupId, deviceId, token, version, error) {
        try {
            if (!await this.groupDeviceService.tokenDoesMatch(groupId, deviceId, token)) {
                return 'Token does not match';
            }
            const device = await this.groupDeviceService.didSyncError(groupId, deviceId, version, error);
            return device;
        }
        catch (error) {
            log.error('Error syncing device');
            console.log(error);
            return 'There was an error.';
        }
    }
    async didUpdate(groupId, deviceId, token, version) {
        try {
            if (!await this.groupDeviceService.tokenDoesMatch(groupId, deviceId, token)) {
                return 'Token does not match';
            }
            const device = await this.groupDeviceService.didUpdate(groupId, deviceId, version);
            return device;
        }
        catch (error) {
            log.error('Error updating device');
            console.log(error);
            return 'There was an error.';
        }
    }
    async didUpdateStatus(groupId, deviceId, token, version, status) {
        try {
            if (!await this.groupDeviceService.tokenDoesMatch(groupId, deviceId, token)) {
                return 'Token does not match';
            }
            const device = await this.groupDeviceService.didUpdateStatus(groupId, deviceId, version, status);
            return device;
        }
        catch (error) {
            log.error('Error updating device');
            console.log(error);
            return 'There was an error.';
        }
    }
    async read(groupId, deviceId, token) {
        try {
            if (!await this.groupDeviceService.tokenDoesMatch(groupId, deviceId, token)) {
                return 'Token does not match';
            }
            const device = await this.groupDeviceService.read(groupId, deviceId);
            return device;
        }
        catch (error) {
            let message = 'Error registering device for group ' + groupId + ' and deviceId ' + deviceId;
            let errorDetails = {
                "message": message,
                "groupId": groupId,
                "deviceId": deviceId,
                "error": error
            };
            log.error(errorDetails);
            throw new common_1.HttpException({
                status: common_1.HttpStatus.NOT_FOUND,
                error: message,
                errorDetails: errorDetails,
            }, common_1.HttpStatus.NOT_FOUND);
        }
    }
    async register(groupId, deviceId, token) {
        try {
            if (!await this.groupDeviceService.tokenDoesMatch(groupId, deviceId, token)) {
                return 'Token does not match';
            }
            const device = await this.groupDeviceService.register(groupId, deviceId);
            return device;
        }
        catch (error) {
            log.error('Error registering device');
            console.log(error);
            return 'There was an error.';
        }
    }
    async unregister(groupId, deviceId, token) {
        try {
            if (!await this.groupDeviceService.tokenDoesMatch(groupId, deviceId, token)) {
                return 'Token does not match';
            }
            await this.groupDeviceService.unregister(groupId, deviceId);
            return 'ok';
        }
        catch (error) {
            log.error('Error registering device');
            console.log(error);
            return 'There was an error.';
        }
    }
};
exports.GroupDevicePublicController = GroupDevicePublicController;
__decorate([
    (0, common_1.All)('did-sync/:groupId/:deviceId/:token/:version'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Param)('deviceId')),
    __param(2, (0, common_1.Param)('token')),
    __param(3, (0, common_1.Param)('version')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], GroupDevicePublicController.prototype, "didSync", null);
__decorate([
    (0, common_1.All)('did-sync-status/:groupId/:deviceId/:token/:version'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Param)('deviceId')),
    __param(2, (0, common_1.Param)('token')),
    __param(3, (0, common_1.Param)('version')),
    __param(4, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], GroupDevicePublicController.prototype, "didSyncStatus", null);
__decorate([
    (0, common_1.All)('did-sync-error/:groupId/:deviceId/:token/:version/:error'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Param)('deviceId')),
    __param(2, (0, common_1.Param)('token')),
    __param(3, (0, common_1.Param)('version')),
    __param(4, (0, common_1.Param)('error')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], GroupDevicePublicController.prototype, "didSyncError", null);
__decorate([
    (0, common_1.All)('did-update/:groupId/:deviceId/:token/:version'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Param)('deviceId')),
    __param(2, (0, common_1.Param)('token')),
    __param(3, (0, common_1.Param)('version')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], GroupDevicePublicController.prototype, "didUpdate", null);
__decorate([
    (0, common_1.All)('did-update-status/:groupId/:deviceId/:token/:version'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Param)('deviceId')),
    __param(2, (0, common_1.Param)('token')),
    __param(3, (0, common_1.Param)('version')),
    __param(4, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], GroupDevicePublicController.prototype, "didUpdateStatus", null);
__decorate([
    (0, common_1.All)('read/:groupId/:deviceId/:token'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Param)('deviceId')),
    __param(2, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], GroupDevicePublicController.prototype, "read", null);
__decorate([
    (0, common_1.All)('register/:groupId/:deviceId/:token'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Param)('deviceId')),
    __param(2, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], GroupDevicePublicController.prototype, "register", null);
__decorate([
    (0, common_1.All)('unregister/:groupId/:deviceId/:token'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Param)('deviceId')),
    __param(2, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], GroupDevicePublicController.prototype, "unregister", null);
exports.GroupDevicePublicController = GroupDevicePublicController = __decorate([
    (0, common_1.Controller)('group-device-public'),
    __metadata("design:paramtypes", [group_device_service_1.GroupDeviceService])
], GroupDevicePublicController);
//# sourceMappingURL=group-device-public.controller.js.map