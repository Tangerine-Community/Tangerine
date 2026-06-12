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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const tangerine_config_service_1 = require("../../shared/services/tangerine-config/tangerine-config.service");
let UserController = class UserController {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    permissionCanManageSitewideUsers(request) {
        const user = request.user;
        const user1Only = this.configService.config().user1ManagedServerUsers;
        if (user1Only === false || (user1Only === true && request.user && request.user.name === 'user1')) {
            return 'true';
        }
        else {
            return 'false';
        }
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Get)('permission/can-manage-sitewide-users'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "permissionCanManageSitewideUsers", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)('user'),
    __metadata("design:paramtypes", [tangerine_config_service_1.TangerineConfigService])
], UserController);
//# sourceMappingURL=user.controller.js.map