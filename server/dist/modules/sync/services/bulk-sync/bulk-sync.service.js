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
exports.BulkSyncService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const PouchDB = require('pouchdb');
const dbDefaults = require('../../../../db-defaults');
PouchDB.defaults(dbDefaults, { timeout: 50000 });
let BulkSyncService = class BulkSyncService {
    httpService;
    constructor(httpService) {
        this.httpService = httpService;
    }
    async dump(groupId, deviceId, syncUsername, syncPassword) {
        console.log("Dumping database at route /api/generateDbDump.");
        const response = await this.httpService.get(`/api/generateDbDump/${groupId}/${deviceId}/${syncUsername}/${syncPassword}`).toPromise();
        return response.data;
    }
    async getDbDump(groupId, locationIdentifier) {
        console.log("Dumping database at route /api/getDbDump.");
        const response = await this.httpService.get(`/api/getDbDump/${groupId}/${locationIdentifier}/`).toPromise();
        return response.data;
    }
};
exports.BulkSyncService = BulkSyncService;
exports.BulkSyncService = BulkSyncService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], BulkSyncService);
//# sourceMappingURL=bulk-sync.service.js.map