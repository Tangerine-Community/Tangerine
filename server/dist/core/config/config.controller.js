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
exports.ConfigController = void 0;
const tangerine_config_service_1 = require("./../../shared/services/tangerine-config/tangerine-config.service");
const common_1 = require("@nestjs/common");
let ConfigController = class ConfigController {
    tangerineConfigService;
    constructor(tangerineConfigService) {
        this.tangerineConfigService = tangerineConfigService;
    }
    getConfig() {
        const tangerineConfig = this.tangerineConfigService.config();
        return {
            enabledModules: tangerineConfig.enabledModules,
            hideSkipIf: tangerineConfig.hideSkipIf
        };
    }
};
exports.ConfigController = ConfigController;
__decorate([
    (0, common_1.All)(''),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "getConfig", null);
exports.ConfigController = ConfigController = __decorate([
    (0, common_1.Controller)('config'),
    __metadata("design:paramtypes", [tangerine_config_service_1.TangerineConfigService])
], ConfigController);
//# sourceMappingURL=config.controller.js.map