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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const tangerine_config_service_1 = require("../tangerine-config/tangerine-config.service");
const DB = require('../../../db');
const log = require('tangy-log').log;
let UserService = class UserService {
    configService;
    DB = DB;
    usersDb = new DB('users');
    constructor(configService) {
        this.configService = configService;
    }
    async getUserByUsername(username) {
        const result = await this.usersDb.find({ selector: { username } });
        return result.docs[0];
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tangerine_config_service_1.TangerineConfigService])
], UserService);
//# sourceMappingURL=user.service.js.map