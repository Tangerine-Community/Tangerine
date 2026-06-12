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
exports.GroupController = void 0;
const common_1 = require("@nestjs/common");
const group_service_1 = require("../../shared/services/group/group.service");
const tangerine_config_service_1 = require("../../shared/services/tangerine-config/tangerine-config.service");
const user_service_1 = require("../../shared/services/user/user.service");
let GroupController = class GroupController {
    groupService;
    configService;
    userService;
    constructor(groupService, configService, userService) {
        this.groupService = groupService;
        this.configService = configService;
        this.userService = userService;
    }
    async create(label, contentSet, request) {
        return await this.groupService.create(label, contentSet, request['user']['name']);
    }
    async read(groupId) {
        return await this.groupService.read(groupId);
    }
    async update(group) {
        await this.groupService.update(group);
        return 'success';
    }
    async delete(group) {
        await this.groupService.delete(group);
        return 'success';
    }
    async list(request) {
        const groups = await this.groupService.listGroups();
        if (request.user && request.user.name === this.configService.config().userOneUsername) {
            return groups;
        }
        else {
            const user = await this.userService.getUserByUsername(request.user.name);
            return groups.filter(group => {
                return user.groups.reduce((foundMembership, groupMembership) => foundMembership ? true : groupMembership.groupName === group._id, false);
            });
        }
    }
    async contentSets() {
        return await this.groupService.contentSets();
    }
    async startSession(group, username, type) {
        console.log("started session for group: " + group + " username: " + username);
        let dbUrlWithCredentials = await this.groupService.startSession(group, username, type);
        return dbUrlWithCredentials;
    }
};
exports.GroupController = GroupController;
__decorate([
    (0, common_1.All)('create'),
    __param(0, (0, common_1.Body)('label')),
    __param(1, (0, common_1.Body)('contentSet')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "create", null);
__decorate([
    (0, common_1.All)('read/:groupId'),
    __param(0, (0, common_1.Param)('groupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "read", null);
__decorate([
    (0, common_1.All)('update'),
    __param(0, (0, common_1.Body)('group')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "update", null);
__decorate([
    (0, common_1.All)('delete'),
    __param(0, (0, common_1.Body)('group')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "delete", null);
__decorate([
    (0, common_1.All)('list'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "list", null);
__decorate([
    (0, common_1.All)('content-sets'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "contentSets", null);
__decorate([
    (0, common_1.Post)('start-session'),
    __param(0, (0, common_1.Body)('group')),
    __param(1, (0, common_1.Body)('username')),
    __param(2, (0, common_1.Body)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "startSession", null);
exports.GroupController = GroupController = __decorate([
    (0, common_1.Controller)('nest/group'),
    __metadata("design:paramtypes", [group_service_1.GroupService,
        tangerine_config_service_1.TangerineConfigService,
        user_service_1.UserService])
], GroupController);
//# sourceMappingURL=group.controller.js.map