"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncModule = void 0;
const common_1 = require("@nestjs/common");
const shared_module_1 = require("../../shared/shared.module");
const sync_session_service_1 = require("./services/sync-session/sync-session.service");
const sync_session_controller_1 = require("./controllers/sync-session/sync-session.controller");
const bulk_sync_controller_1 = require("./controllers/bulk-sync/bulk-sync.controller");
const bulk_sync_service_1 = require("./services/bulk-sync/bulk-sync.service");
const sync_session_v2_service_1 = require("./services/sync-session/sync-session-v2.service");
const sync_session_v2_controller_1 = require("./controllers/sync-session/sync-session-v2.controller");
const axios_1 = require("@nestjs/axios");
let SyncModule = class SyncModule {
};
exports.SyncModule = SyncModule;
exports.SyncModule = SyncModule = __decorate([
    (0, common_1.Module)({
        imports: [shared_module_1.SharedModule, axios_1.HttpModule],
        exports: [sync_session_service_1.SyncSessionService, sync_session_v2_service_1.SyncSessionv2Service, bulk_sync_service_1.BulkSyncService],
        providers: [sync_session_service_1.SyncSessionService, sync_session_v2_service_1.SyncSessionv2Service, bulk_sync_service_1.BulkSyncService],
        controllers: [sync_session_controller_1.SyncSessionController, sync_session_v2_controller_1.SyncSessionv2Controller, bulk_sync_controller_1.BulkSyncController]
    })
], SyncModule);
//# sourceMappingURL=sync.module.js.map