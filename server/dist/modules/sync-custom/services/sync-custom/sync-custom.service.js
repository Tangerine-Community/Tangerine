"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncCustomService = void 0;
const common_1 = require("@nestjs/common");
const DB = require('../../../../db.js');
const clog = require('tangy-log').clog;
const log = require('tangy-log').log;
const pako = require('pako');
let SyncCustomService = class SyncCustomService {
    async processPush(groupId, data) {
        let db = new DB(groupId);
        try {
            const payload = pako.inflate(data, { to: 'string' });
            const packet = JSON.parse(payload);
            try {
                let doc = await db.get(packet.doc._id);
                packet.doc._rev = doc._rev;
            }
            catch (err) {
                delete packet.doc._rev;
            }
            await db.put(packet.doc).catch(err => log.error(err));
            return { status: 'ok' };
        }
        catch (e) {
            log.error(e);
        }
    }
    processPull() {
    }
};
exports.SyncCustomService = SyncCustomService;
exports.SyncCustomService = SyncCustomService = __decorate([
    (0, common_1.Injectable)()
], SyncCustomService);
//# sourceMappingURL=sync-custom.service.js.map