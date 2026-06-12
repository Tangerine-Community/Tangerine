"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreModule = void 0;
const tangerine_modules_support_controller_1 = require("./tangerine-modules-support/tangerine-modules-support.controller");
const group_device_public_controller_1 = require("./group-device/group-device-public.controller");
const group_device_manage_controller_1 = require("./group-device/group-device-manage.controller");
const common_1 = require("@nestjs/common");
const shared_module_1 = require("../shared/shared.module");
const group_controller_1 = require("./group/group.controller");
const user_controller_1 = require("./user/user.controller");
const config_controller_1 = require("./config/config.controller");
const group_responses_controller_1 = require("./group-responses/group-responses.controller");
const isAuthenticated = require("../middleware/is-authenticated");
const group_issues_controller_1 = require("./group-issues/group-issues.controller");
const { permit, permitOnGroupIf } = require('../middleware/permitted');
let CoreModule = class CoreModule {
    configure(consumer) {
        consumer
            .apply(isAuthenticated)
            .forRoutes(config_controller_1.ConfigController);
        consumer
            .apply(isAuthenticated)
            .forRoutes(tangerine_modules_support_controller_1.ModuleController);
        consumer
            .apply(isAuthenticated)
            .forRoutes(group_controller_1.GroupController);
        consumer
            .apply(isAuthenticated)
            .forRoutes(group_responses_controller_1.GroupResponsesController);
        consumer
            .apply(isAuthenticated)
            .forRoutes(group_issues_controller_1.GroupIssuesController);
        consumer
            .apply(isAuthenticated)
            .forRoutes(user_controller_1.UserController);
        consumer
            .apply(isAuthenticated)
            .forRoutes(group_device_manage_controller_1.GroupDeviceManageController);
        consumer
            .apply(isAuthenticated, permit(['can_create_group']))
            .forRoutes({ path: 'nest/group/create', method: common_1.RequestMethod.POST });
        consumer
            .apply(isAuthenticated, permitOnGroupIf('can_administer_couchdb_server'))
            .forRoutes({ path: 'nest/group/start-session', method: common_1.RequestMethod.POST });
    }
};
exports.CoreModule = CoreModule;
exports.CoreModule = CoreModule = __decorate([
    (0, common_1.Module)({
        controllers: [
            group_controller_1.GroupController,
            user_controller_1.UserController,
            group_device_public_controller_1.GroupDevicePublicController,
            group_device_manage_controller_1.GroupDeviceManageController,
            config_controller_1.ConfigController,
            group_responses_controller_1.GroupResponsesController,
            group_issues_controller_1.GroupIssuesController
        ],
        imports: [shared_module_1.SharedModule]
    })
], CoreModule);
//# sourceMappingURL=core.module.js.map