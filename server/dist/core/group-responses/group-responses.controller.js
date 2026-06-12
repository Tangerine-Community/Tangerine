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
exports.GroupResponsesController = void 0;
const group_responses_service_1 = require("./../../shared/services/group-responses/group-responses.service");
const common_1 = require("@nestjs/common");
const log = require('tangy-log').log;
let GroupResponsesController = class GroupResponsesController {
    groupResponsesService;
    constructor(groupResponsesService) {
        this.groupResponsesService = groupResponsesService;
    }
    async list(groupId, skip, limit) {
        return await this.groupResponsesService.list(groupId, skip, limit);
    }
    async query(groupId, query) {
        return await this.groupResponsesService.find(groupId, query);
    }
    async search(groupId, phrase, index) {
        return await this.groupResponsesService.search(groupId, phrase, index);
    }
    async index(groupId, index) {
        await this.groupResponsesService.index(groupId, index);
        return { status: 'ok' };
    }
    async create(groupId, response) {
        const freshDevice = await this.groupResponsesService.create(groupId, response);
        return freshDevice;
    }
    async read(groupId, responseId) {
        return await this.groupResponsesService.read(groupId, responseId);
    }
    async readRev(groupId, responseId, rev) {
        return await this.groupResponsesService.readRev(groupId, responseId, rev);
    }
    async update(groupId, response) {
        const freshResponse = await this.groupResponsesService.update(groupId, response);
        return freshResponse;
    }
    async delete(groupId, responseId) {
        await this.groupResponsesService.delete(groupId, responseId);
        return {};
    }
};
exports.GroupResponsesController = GroupResponsesController;
__decorate([
    (0, common_1.All)('list/:groupId/:skip/:limit'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Param)('skip')),
    __param(2, (0, common_1.Param)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], GroupResponsesController.prototype, "list", null);
__decorate([
    (0, common_1.All)('query/:groupId'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Body)('query')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GroupResponsesController.prototype, "query", null);
__decorate([
    (0, common_1.All)('search/:groupId'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Body)('phrase')),
    __param(2, (0, common_1.Body)('index')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], GroupResponsesController.prototype, "search", null);
__decorate([
    (0, common_1.All)('index/:groupId'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Body)('index')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GroupResponsesController.prototype, "index", null);
__decorate([
    (0, common_1.All)('create/:groupId'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Body)('response')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GroupResponsesController.prototype, "create", null);
__decorate([
    (0, common_1.All)('read/:groupId/:responseId'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Param)('responseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GroupResponsesController.prototype, "read", null);
__decorate([
    (0, common_1.All)('readRev/:groupId/:responseId/:rev'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Param)('responseId')),
    __param(2, (0, common_1.Param)('rev')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], GroupResponsesController.prototype, "readRev", null);
__decorate([
    (0, common_1.All)('update/:groupId'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Body)('response')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GroupResponsesController.prototype, "update", null);
__decorate([
    (0, common_1.All)('delete/:groupId/:responseId'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Param)('responseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GroupResponsesController.prototype, "delete", null);
exports.GroupResponsesController = GroupResponsesController = __decorate([
    (0, common_1.Controller)('group-responses'),
    __metadata("design:paramtypes", [group_responses_service_1.GroupResponsesService])
], GroupResponsesController);
//# sourceMappingURL=group-responses.controller.js.map