"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TangerineConfigService = void 0;
const common_1 = require("@nestjs/common");
const tangyModules = require('../../../modules/index.js')();
let TangerineConfigService = class TangerineConfigService {
    config() {
        return {
            enabledModules: tangyModules.enabledModules,
            uploadToken: process.env.T_UPLOAD_TOKEN,
            hostName: process.env.T_HOST_NAME,
            protocol: process.env.T_PROTOCOL,
            couchdbEndpoint: process.env.T_COUCHDB_ENDPOINT,
            user1ManagedServerUsers: process.env.T_USER1_MANAGED_SERVER_USERS === 'true'
                ? true
                : false,
            userOneUsername: process.env.T_USER1,
            userOnePassword: process.env.T_USER1_PASSWORD,
            dbAdminUsername: process.env.T_COUCHDB_USER_ADMIN_NAME,
            dbAdminPassword: process.env.T_COUCHDB_USER_ADMIN_PASSWORD,
            syncUsername: process.env.T_SYNC_USERNAME,
            syncPassword: process.env.T_SYNC_PASSWORD,
            hideSkipIf: process.env.T_HIDE_SKIP_IF === 'true' ? true : false,
            reportingDelay: parseInt(process.env.T_REPORTING_DELAY),
            couchdbSync4All: process.env.T_COUCHDB_SYNC_4_ALL === 'true' ? true : false
        };
    }
};
exports.TangerineConfigService = TangerineConfigService;
exports.TangerineConfigService = TangerineConfigService = __decorate([
    (0, common_1.Injectable)()
], TangerineConfigService);
//# sourceMappingURL=tangerine-config.service.js.map