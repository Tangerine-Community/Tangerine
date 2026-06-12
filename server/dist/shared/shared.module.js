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
exports.SharedModule = void 0;
const group_responses_service_1 = require("./services/group-responses/group-responses.service");
const group_device_service_1 = require("./services/group-device/group-device.service");
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const group_service_1 = require("./services/group/group.service");
const tangerine_config_service_1 = require("./services/tangerine-config/tangerine-config.service");
const client_user_service_1 = require("./services/client-user/client-user.service");
const user_service_1 = require("./services/user/user.service");
const db_service_1 = require("./services/db/db.service");
const group_issues_service_1 = require("./services/group-issues/group-issues.service");
let SharedModule = class SharedModule {
    groupService;
    constructor(groupService) {
        this.groupService = groupService;
    }
};
exports.SharedModule = SharedModule;
exports.SharedModule = SharedModule = __decorate([
    (0, common_1.Module)({
        imports: [axios_1.HttpModule],
        exports: [
            db_service_1.DbService,
            client_user_service_1.ClientUserService,
            tangerine_config_service_1.TangerineConfigService,
            group_service_1.GroupService,
            group_device_service_1.GroupDeviceService,
            group_responses_service_1.GroupResponsesService,
            group_issues_service_1.GroupIssuesService,
            user_service_1.UserService
        ],
        providers: [
            db_service_1.DbService,
            tangerine_config_service_1.TangerineConfigService,
            group_service_1.GroupService,
            group_device_service_1.GroupDeviceService,
            group_responses_service_1.GroupResponsesService,
            group_issues_service_1.GroupIssuesService,
            client_user_service_1.ClientUserService,
            user_service_1.UserService
        ]
    }),
    __metadata("design:paramtypes", [group_service_1.GroupService])
], SharedModule);
//# sourceMappingURL=shared.module.js.map