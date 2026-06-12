"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncCustomModule = void 0;
const shared_module_1 = require("./../../shared/shared.module");
const sync_custom_service_1 = require("./services/sync-custom/sync-custom.service");
const sync_custom_controller_1 = require("./controllers/sync-custom/sync-custom.controller");
const common_1 = require("@nestjs/common");
let SyncCustomModule = class SyncCustomModule {
};
exports.SyncCustomModule = SyncCustomModule;
exports.SyncCustomModule = SyncCustomModule = __decorate([
    (0, common_1.Module)({
        imports: [shared_module_1.SharedModule],
        controllers: [sync_custom_controller_1.SyncCustomController],
        providers: [sync_custom_service_1.SyncCustomService]
    })
], SyncCustomModule);
//# sourceMappingURL=sync-custom.module.js.map