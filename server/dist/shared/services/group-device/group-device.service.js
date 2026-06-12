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
exports.GroupDeviceService = void 0;
const db_service_1 = require("./../db/db.service");
const group_device_class_1 = require("./../../classes/group-device.class");
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const DB = require('../../../db');
const log = require('tangy-log').log;
const fs = require('fs-extra');
const tangyModules = require('../../../modules/index.js')();
let GroupDeviceService = class GroupDeviceService {
    dbService;
    constructor(dbService) {
        this.dbService = dbService;
    }
    async install(groupId) {
        const groupDevicesDb = this.getGroupDevicesDb(groupId);
    }
    async uninstall(groupId) {
        const groupDevicesDb = this.getGroupDevicesDb(groupId);
        await groupDevicesDb.destroy();
    }
    async list(groupId) {
        const groupDevicesDb = this.getGroupDevicesDb(groupId);
        const response = await groupDevicesDb.query('listDevices', {
            include_docs: false
        });
        return response
            .rows
            .map(row => row.value);
    }
    async create(groupId, deviceData) {
        const groupDevicesDb = this.getGroupDevicesDb(groupId);
        const response = await groupDevicesDb.put({
            ...new group_device_class_1.GroupDevice(),
            ...deviceData,
            token: (0, uuid_1.v4)()
        });
        return await groupDevicesDb.get(response.id);
    }
    async read(groupId, deviceId) {
        const groupDevicesDb = this.getGroupDevicesDb(groupId);
        const device = await groupDevicesDb.get(deviceId);
        return device;
    }
    async update(groupId, device) {
        try {
            const groupDevicesDb = this.getGroupDevicesDb(groupId);
            const originalDevice = await groupDevicesDb.get(device._id);
            await groupDevicesDb.put({
                ...device,
                _rev: originalDevice._rev
            });
            const freshDevice = await groupDevicesDb.get(device._id);
            return freshDevice;
        }
        catch (e) {
            console.log(e);
        }
    }
    async delete(groupId, deviceId) {
        const groupDevicesDb = this.getGroupDevicesDb(groupId);
        const device = await groupDevicesDb.get(deviceId);
        await groupDevicesDb.remove(device);
    }
    async reset(groupId, deviceId) {
        try {
            const groupDevicesDb = this.getGroupDevicesDb(groupId);
            const originalDevice = await groupDevicesDb.get(deviceId);
            await groupDevicesDb.put({
                ...originalDevice,
                lastUpdated: undefined,
                version: undefined,
                token: (0, uuid_1.v4)(),
                claimed: false
            });
            const freshDevice = await groupDevicesDb.get(deviceId);
            return freshDevice;
        }
        catch (e) {
            console.log(e);
        }
    }
    async didSync(groupId, deviceId, version) {
        try {
            const groupDevicesDb = this.getGroupDevicesDb(groupId);
            const originalDevice = await groupDevicesDb.get(deviceId);
            await groupDevicesDb.put({
                ...originalDevice,
                syncedOn: Date.now(),
                version,
                _rev: originalDevice._rev
            });
            const freshDevice = await groupDevicesDb.get(deviceId);
            return freshDevice;
        }
        catch (e) {
            console.log(e);
        }
    }
    async didSyncStatus(groupId, deviceId, version, status) {
        try {
            const groupDevicesDb = this.getGroupDevicesDb(groupId);
            const originalDevice = await groupDevicesDb.get(deviceId);
            if (!originalDevice.replicationStatuses) {
                originalDevice.replicationStatuses = [];
            }
            if (originalDevice.replicationStatus) {
                originalDevice.replicationStatuses.push(originalDevice.replicationStatus);
                delete originalDevice.replicationStatus;
            }
            originalDevice.replicationStatuses.push(status);
            await groupDevicesDb.put({
                ...originalDevice,
                syncedOn: Date.now(),
                version,
                _rev: originalDevice._rev
            });
            const freshDevice = await groupDevicesDb.get(deviceId);
            return freshDevice;
        }
        catch (e) {
            console.log(e);
        }
    }
    async didSyncError(groupId, deviceId, version, error) {
        try {
            const groupDevicesDb = this.getGroupDevicesDb(groupId);
            const originalDevice = await groupDevicesDb.get(deviceId);
            await groupDevicesDb.put({
                ...originalDevice,
                syncedOn: Date.now(),
                version,
                _rev: originalDevice._rev,
                error: error
            });
            const freshDevice = await groupDevicesDb.get(deviceId);
            return freshDevice;
        }
        catch (e) {
            console.log(e);
        }
    }
    async didUpdate(groupId, deviceId, version) {
        try {
            const groupDevicesDb = this.getGroupDevicesDb(groupId);
            const originalDevice = await groupDevicesDb.get(deviceId);
            await groupDevicesDb.put({
                ...originalDevice,
                updatedOn: Date.now(),
                version,
                _rev: originalDevice._rev
            });
            const freshDevice = await groupDevicesDb.get(deviceId);
            return freshDevice;
        }
        catch (e) {
            console.log(e);
        }
    }
    async didUpdateStatus(groupId, deviceId, version, status) {
        try {
            const groupDevicesDb = this.getGroupDevicesDb(groupId);
            const originalDevice = await groupDevicesDb.get(deviceId);
            if (!originalDevice.replicationStatuses) {
                originalDevice.replicationStatuses = [];
            }
            originalDevice.replicationStatuses.push(status);
            await groupDevicesDb.put({
                ...originalDevice,
                updatedOn: Date.now(),
                version,
                _rev: originalDevice._rev
            });
            const freshDevice = await groupDevicesDb.get(deviceId);
            return freshDevice;
        }
        catch (e) {
            console.log(e);
        }
    }
    async register(groupId, deviceId) {
        const groupDevicesDb = this.getGroupDevicesDb(groupId);
        const device = await groupDevicesDb.get(deviceId);
        if (device.claimed === true) {
            throw new Error('Trying to register a device already claimed. Unregister the device first.');
        }
        await groupDevicesDb.put({
            ...device,
            claimed: true,
            registeredOn: Date.now(),
            token: (0, uuid_1.v4)()
        });
        return await groupDevicesDb.get(deviceId);
    }
    async unregister(groupId, deviceId) {
        const groupDevicesDb = this.getGroupDevicesDb(groupId);
        const device = await groupDevicesDb.get(deviceId);
        const freshDevice = await groupDevicesDb.put({
            ...device,
            claimed: false,
            token: (0, uuid_1.v4)()
        });
        return freshDevice;
    }
    async tokenDoesMatch(groupId, deviceId, token) {
        const groupDevicesDb = this.getGroupDevicesDb(groupId);
        const device = await groupDevicesDb.get(deviceId);
        return device.token === token ? true : false;
    }
    getGroupDevicesDb(groupId) {
        return this.dbService.instantiate(`${groupId}-devices`);
    }
};
exports.GroupDeviceService = GroupDeviceService;
exports.GroupDeviceService = GroupDeviceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [db_service_1.DbService])
], GroupDeviceService);
//# sourceMappingURL=group-device.service.js.map