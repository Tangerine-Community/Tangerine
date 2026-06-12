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
exports.GroupIssuesService = void 0;
const db_service_1 = require("./../db/db.service");
const common_1 = require("@nestjs/common");
let GroupIssuesService = class GroupIssuesService {
    dbService;
    constructor(dbService) {
        this.dbService = dbService;
    }
    async list(groupId, start, limit) {
        const groupDb = this.getGroupsDb(groupId);
        const options = { include_docs: true };
        if (start)
            options.start = start;
        if (limit)
            options.limit = limit;
        const response = await groupDb.allDocs(options);
        return response
            .rows
            .map(row => row.doc);
    }
    async query(groupId, options) {
        const groupDb = this.getGroupsDb(groupId);
        const response = await groupDb.query(options.fun, options);
        return response.rows;
    }
    getGroupsDb(groupId) {
        return this.dbService.instantiate(groupId);
    }
};
exports.GroupIssuesService = GroupIssuesService;
exports.GroupIssuesService = GroupIssuesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [db_service_1.DbService])
], GroupIssuesService);
//# sourceMappingURL=group-issues.service.js.map