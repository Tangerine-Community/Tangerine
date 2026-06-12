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
exports.GroupIssuesController = void 0;
const common_1 = require("@nestjs/common");
const group_issues_service_1 = require("./../../shared/services/group-issues/group-issues.service");
const log = require('tangy-log').log;
let GroupIssuesController = class GroupIssuesController {
    groupIssuesService;
    constructor(groupIssuesService) {
        this.groupIssuesService = groupIssuesService;
    }
    async query(groupId, options) {
        return await this.groupIssuesService.query(groupId, options);
    }
};
exports.GroupIssuesController = GroupIssuesController;
__decorate([
    (0, common_1.All)('query/:groupId'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Body)('options')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GroupIssuesController.prototype, "query", null);
exports.GroupIssuesController = GroupIssuesController = __decorate([
    (0, common_1.Controller)('group-issues'),
    __metadata("design:paramtypes", [group_issues_service_1.GroupIssuesService])
], GroupIssuesController);
//# sourceMappingURL=group-issues.controller.js.map