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
exports.GroupResponsesService = void 0;
const db_service_1 = require("./../db/db.service");
const common_1 = require("@nestjs/common");
const update_group_search_index_js_1 = require("../../../scripts/update-group-search-index.js");
const update_group_archived_index_js_1 = require("../../../scripts/update-group-archived-index.js");
const DB = require('../../../db');
const log = require('tangy-log').log;
const fs = require('fs-extra');
const tangyModules = require('../../../modules/index.js')();
const uuid = require('uuid');
let GroupResponsesService = class GroupResponsesService {
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
    async find(groupId, query) {
        const groupDb = this.getGroupsDb(groupId);
        const response = await groupDb.find(query);
        return response.docs;
    }
    async search(groupId, phrase, index, limit = 50, skip = 0) {
        if (typeof index === 'undefined') {
            index = 'search';
        }
        if (index === 'archived') {
            await (0, update_group_archived_index_js_1.updateGroupArchivedIndex)(groupId);
        }
        else {
            await (0, update_group_search_index_js_1.updateGroupSearchIndex)(groupId);
        }
        const groupDb = this.getGroupsDb(groupId);
        const result = await groupDb.query(index, phrase
            ? {
                startkey: `${phrase}`.toLocaleLowerCase(),
                endkey: `${phrase}\uffff`.toLocaleLowerCase(),
                include_docs: true,
                limit,
                skip
            }
            : {
                include_docs: true,
                limit,
                skip
            });
        const searchResults = result.rows.map(row => {
            const variables = row.doc.items.reduce((variables, item) => {
                return {
                    ...variables,
                    ...item.inputs.reduce((variables, input) => {
                        return {
                            ...variables,
                            [input.name]: input.value
                        };
                    }, {})
                };
            }, {});
            return {
                _id: row.doc._id,
                matchesOn: row.value,
                formId: row.doc.form.id,
                formType: row.doc.type,
                lastModified: row.doc.lastModified,
                doc: row.doc,
                variables
            };
        });
        return searchResults.reduce((uniqueResults, result) => {
            return uniqueResults.find(x => x._id === result._id)
                ? uniqueResults
                : [...uniqueResults, result];
        }, []);
    }
    async create(groupId, responseData) {
        const groupDb = this.getGroupsDb(groupId);
        const response = await groupDb.put(responseData);
        return await groupDb.get(response.id);
    }
    async read(groupId, responseId) {
        const groupDb = this.getGroupsDb(groupId);
        let response;
        try {
            response = await groupDb.get(responseId);
        }
        catch (e) {
            if (e.status !== 404) {
                log.error(e);
            }
        }
        return response;
    }
    async readRev(groupId, responseId, rev) {
        const groupDb = this.getGroupsDb(groupId);
        const response = await groupDb.get(responseId, { rev: rev });
        return response;
    }
    async update(groupId, response) {
        const tangerineModifiedOn = Date.now();
        try {
            const groupDb = this.getGroupsDb(groupId);
            const originalResponse = await groupDb.get(response._id);
            await groupDb.put({
                ...response,
                tangerineModifiedOn,
                _rev: originalResponse._rev
            });
            const freshResponse = await groupDb.get(response._id);
            return freshResponse;
        }
        catch (e) {
            try {
                const groupDb = this.getGroupsDb(groupId);
                await groupDb.put({ ...response, tangerineModifiedOn });
                const freshResponse = await groupDb.get(response._id);
                return freshResponse;
            }
            catch (e) {
                console.log(e);
            }
        }
    }
    async delete(groupId, responseId) {
        const groupDb = this.getGroupsDb(groupId);
        const response = await groupDb.get(responseId);
        await groupDb.remove(response);
    }
    async index(groupId, index) {
        const groupDb = this.getGroupsDb(groupId);
        await groupDb.createIndex({ index });
    }
    getGroupsDb(groupId) {
        return this.dbService.instantiate(groupId);
    }
};
exports.GroupResponsesService = GroupResponsesService;
exports.GroupResponsesService = GroupResponsesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [db_service_1.DbService])
], GroupResponsesService);
//# sourceMappingURL=group-responses.service.js.map