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
exports.GroupDeviceManageController = void 0;
const group_device_class_1 = require("./../../shared/classes/group-device.class");
const group_device_service_1 = require("./../../shared/services/group-device/group-device.service");
const common_1 = require("@nestjs/common");
const log = require('tangy-log').log;
let GroupDeviceManageController = class GroupDeviceManageController {
    groupDeviceService;
    constructor(groupDeviceService) {
        this.groupDeviceService = groupDeviceService;
    }
    async list(groupId) {
        return await this.groupDeviceService.list(groupId);
    }
    async create(groupId, deviceData) {
        return await this.groupDeviceService.create(groupId, deviceData);
    }
    async read(groupId, deviceId) {
        return await this.groupDeviceService.read(groupId, deviceId);
    }
    async update(groupId, device) {
        const freshDevice = await this.groupDeviceService.update(groupId, device);
        return freshDevice;
    }
    async reset(groupId, deviceId) {
        const freshDevice = await this.groupDeviceService.reset(groupId, deviceId);
        return freshDevice;
    }
    async delete(groupId, deviceId) {
        await this.groupDeviceService.delete(groupId, deviceId);
        return {};
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
exports.GroupDeviceManageController = GroupDeviceManageController;
__decorate([
    (0, common_1.All)('list/:groupId'),
    __param(0, (0, common_1.Param)('groupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GroupDeviceManageController.prototype, "list", null);
__decorate([
    (0, common_1.All)('create/:groupId'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Body)('deviceData')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GroupDeviceManageController.prototype, "create", null);
__decorate([
    (0, common_1.All)('read/:groupId/:deviceId'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Param)('deviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GroupDeviceManageController.prototype, "read", null);
__decorate([
    (0, common_1.All)('update/:groupId'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Body)('device')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, group_device_class_1.GroupDevice]),
    __metadata("design:returntype", Promise)
], GroupDeviceManageController.prototype, "update", null);
__decorate([
    (0, common_1.All)('reset/:groupId/:deviceId'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Param)('deviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GroupDeviceManageController.prototype, "reset", null);
__decorate([
    (0, common_1.All)('delete/:groupId/:deviceId'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Param)('deviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GroupDeviceManageController.prototype, "delete", null);
__decorate([
    (0, common_1.All)('did-sync/:groupId/:deviceId/:token/:version'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Param)('deviceId')),
    __param(2, (0, common_1.Param)('token')),
    __param(3, (0, common_1.Param)('version')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], GroupDeviceManageController.prototype, "didSync", null);
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
], GroupDeviceManageController.prototype, "didSyncError", null);
__decorate([
    (0, common_1.All)('did-update/:groupId/:deviceId/:token/:version'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Param)('deviceId')),
    __param(2, (0, common_1.Param)('token')),
    __param(3, (0, common_1.Param)('version')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], GroupDeviceManageController.prototype, "didUpdate", null);
__decorate([
    (0, common_1.All)('register/:groupId/:deviceId/:token'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Param)('deviceId')),
    __param(2, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], GroupDeviceManageController.prototype, "register", null);
__decorate([
    (0, common_1.All)('unregister/:groupId/:deviceId/:token'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Param)('deviceId')),
    __param(2, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], GroupDeviceManageController.prototype, "unregister", null);
exports.GroupDeviceManageController = GroupDeviceManageController = __decorate([
    (0, common_1.Controller)('group-device-manage'),
    __metadata("design:paramtypes", [group_device_service_1.GroupDeviceService])
], GroupDeviceManageController);
//# sourceMappingURL=group-device-manage.controller.js.map