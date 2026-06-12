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
exports.GroupService = void 0;
const common_1 = require("@nestjs/common");
const tangerine_config_service_1 = require("../tangerine-config/tangerine-config.service");
const uuid_1 = require("uuid");
const rxjs_1 = require("rxjs");
const user_service_1 = require("../user/user.service");
const db_service_1 = require("../db/db.service");
const createGroupDatabase = require("src/create-group-database");
const axios_1 = require("@nestjs/axios");
const insertGroupViews = require('../../../insert-group-views.js');
const { spawn } = require('promisify-child-process');
const DB = require('../../../db');
const log = require('tangy-log').log;
const fs = require('fs-extra');
const tangyModules = require('../../../modules/index.js')();
const { permissionsList } = require('../../../permissions-list.js');
const { findUserByUsername, USERS_DB } = require('../../../auth.js');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
let GroupService = class GroupService {
    configService;
    userService;
    http;
    dbService;
    _views = {};
    groups$ = new rxjs_1.Subject();
    groupDatabases = [];
    DB = DB;
    groupsDb = new DB('groups');
    constructor(configService, userService, http, dbService) {
        this.configService = configService;
        this.userService = userService;
        this.http = http;
        this.dbService = dbService;
    }
    async initialize() {
        const groups = await this.listGroups();
        for (const group of groups) {
            this.groupDatabases.push(DB(group._id));
        }
    }
    getGroupDatabase(id = '') {
        return this.groupDatabases.find(groupDatabase => groupDatabase.name === id);
    }
    getSyncUrl(groupId) {
        const config = this.configService.config();
        return `${config.protocol}://${config.hostName}/db/${groupId}`;
    }
    async listGroups() {
        return ((await this.groupsDb.allDocs({ include_docs: true }))
            .rows
            .map(row => row.doc)
            .filter(doc => !doc._id.includes('_design')))
            .sort((a, b) => {
            a.created = a.created || new Date('1970').toJSON();
            b.created = b.created || new Date('1970').toJSON();
            const comparison = a.created > b.created ? 1 : -1;
            return comparison;
        });
    }
    registerViews(moduleName, views) {
        this._views[moduleName] = views;
    }
    async installViews(groupId) {
        log.info(`Installing views for ${groupId}`);
        insertGroupViews(groupId);
        const groupDb = new DB(groupId);
        for (const moduleName in this._views) {
            for (const viewName in this._views[moduleName]) {
                await groupDb.put({
                    _id: `_design/${moduleName}_${viewName}`,
                    views: {
                        [`${moduleName}_${viewName}`]: this._views[moduleName][viewName]
                    }
                });
            }
        }
    }
    async updateAllUserViews() {
        log.info('Updating views...');
        for (const groupDb of this.groupDatabases) {
            log.info(`Updating views for ${groupDb.name}`);
            for (const moduleName in this._views) {
                const ddoc_id = `_design/${moduleName}`;
                try {
                    const designDoc = await groupDb.get(ddoc_id);
                    await groupDb.put({
                        _id: ddoc_id,
                        _rev: designDoc._rev,
                        views: this._views[moduleName]
                    });
                }
                catch (err) {
                    await groupDb.put({
                        _id: ddoc_id,
                        views: this._views[moduleName]
                    });
                }
            }
            await groupDb.viewCleanup();
        }
    }
    async indexAllUserViews() {
        try {
            for (const groupDb of this.groupDatabases) {
                for (const moduleName in this._views) {
                    for (const viewName in this._views[moduleName]) {
                        await groupDb.query(`${moduleName}_${viewName}`, { limit: 1 });
                    }
                }
            }
        }
        catch (err) {
            throw (err);
        }
    }
    async create(label, contentSet, username) {
        if (contentSet) {
            const p = await spawn(`create-group`, [label, contentSet], { encoding: 'utf8' });
            const group = JSON.parse(p.stdout);
            return group;
        }
        const groupId = `group-${(0, uuid_1.v4)()}`;
        const config = await this.configService.config();
        await createGroupDatabase(groupId, '', true);
        await createGroupDatabase(groupId, '-log');
        await createGroupDatabase(groupId, '-conflict-revs');
        const created = new Date().toJSON();
        const adminRole = { role: 'Admin', permissions: permissionsList.groupPermissions.filter(permission => permission !== 'can_manage_group_roles' && permission !== 'can_access_dashboard') };
        const memberRole = { role: 'Member', permissions: ['can_access_author', 'can_access_forms', 'can_access_data', 'can_access_download_csv'] };
        const group = { _id: groupId, label, created, roles: [
                adminRole, memberRole,
            ] };
        await this.groupsDb.put(group);
        if (username !== process.env.T_USER1) {
            const user = await this.userService.getUserByUsername(username);
            user.groups.push({ groupName: groupId, roles: [adminRole.role] });
            await this.userService.usersDb.put(user);
        }
        const groupDb = new DB(groupId);
        let groupName = label;
        await this.installViews(groupId);
        await exec(`cp -r /tangerine/content-sets/default  /tangerine/groups/${groupId}`);
        await exec(`cp /tangerine/translations/*.json /tangerine/groups/${groupId}/client/`);
        await exec(`mkdir /tangerine/groups/${groupId}/client/media`);
        await exec(`mkdir /tangerine/groups/${groupId}/client/locations`);
        await exec(`ln -s /tangerine/groups/${groupId}/client /tangerine/client/content/groups/${groupId}`);
        let appConfig = {};
        appConfig = JSON.parse(await fs.readFile(`/tangerine/groups/${groupId}/client/app-config.defaults.json`, 'utf8'));
        appConfig.groupName = groupName;
        appConfig.groupId = groupId;
        appConfig.serverUrl = `${process.env.T_PROTOCOL}://${process.env.T_HOST_NAME}/`;
        if (tangyModules.enabledModules.includes('sync-protocol-2')) {
            appConfig.syncProtocol = '2';
            delete appConfig.uploadToken;
            delete appConfig.registrationRequiresServerUser;
            delete appConfig.centrallyManagedUserProfile;
        }
        else {
            appConfig.syncProtocol = '1';
            appConfig.uploadToken = process.env.T_UPLOAD_TOKEN;
            appConfig.registrationRequiresServerUser = process.env.T_REGISTRATION_REQUIRES_SERVER_USER === 'true'
                ? true
                : false;
            appConfig.centrallyManagedUserProfile = process.env.T_CENTRALLY_MANAGED_USER_PROFILE === 'true'
                ? true
                : false;
        }
        appConfig.hideProfile = (process.env.T_HIDE_PROFILE === 'true') ? true : false;
        appConfig.modules = tangyModules.enabledModules;
        appConfig.homeUrl = tangyModules.enabledModules.includes('case') ? 'case-home' : 'case-management';
        appConfig.direction = `${process.env.T_LANG_DIRECTION}`;
        if (process.env.T_CATEGORIES) {
            let categoriesString = `${process.env.T_CATEGORIES}`;
            categoriesString = categoriesString.replace(/'/g, '"');
            const categoriesEntries = JSON.parse(categoriesString);
            appConfig.categories = categoriesEntries;
        }
        const forms = [
            {
                id: 'user-profile',
                src: './assets/user-profile/form.html',
                title: 'User Profile',
                listed: false,
                ...tangyModules.enabledModules.includes('case')
                    ? {
                        searchSettings: {
                            shouldIndex: false,
                            variablesToIndex: [],
                            primaryTemplate: '',
                            secondaryTemplate: ''
                        }
                    }
                    : {},
                ...tangyModules.enabledModules.includes('sync-protocol-2')
                    ? {
                        customSyncSettings: {
                            enabled: false,
                            push: false,
                            pull: false,
                            excludeIncomplete: false
                        },
                        couchdbSyncSettings: {
                            enabled: true,
                            push: true,
                            pull: false,
                            filterByLocation: true
                        }
                    }
                    : {}
            },
            ...(!tangyModules.enabledModules.includes('case') && !tangyModules.enabledModules.includes('class'))
                ? [
                    {
                        id: 'reports',
                        src: './assets/reports/form.html',
                        title: 'Reports',
                        listed: false,
                        ...tangyModules.enabledModules.includes('case')
                            ? {
                                searchSettings: {
                                    shouldIndex: false,
                                    variablesToIndex: [],
                                    primaryTemplate: '',
                                    secondaryTemplate: ''
                                }
                            }
                            : {},
                        ...tangyModules.enabledModules.includes('sync-protocol-2')
                            ? {
                                customSyncSettings: {
                                    enabled: false,
                                    push: false,
                                    pull: false,
                                    excludeIncomplete: false
                                },
                                couchdbSyncSettings: {
                                    enabled: false,
                                    push: false,
                                    pull: false,
                                    filterByLocation: true
                                }
                            }
                            : {}
                    }
                ]
                : []
        ];
        await fs.writeFile(`/tangerine/groups/${groupId}/client/forms.json`, JSON.stringify(forms));
        await fs.writeFile(`/tangerine/groups/${groupId}/client/location-list.json`, JSON.stringify({
            "id": "location-list",
            "name": `${groupName} Location List`,
            "locationsLevels": [],
            "locations": {},
            "metadata": {}
        }));
        await exec(`generate-indexes ${group._id}`);
        const data = await tangyModules.hook('groupNew', { groupName: groupId, groupId, appConfig });
        appConfig = data.appConfig;
        await fs.writeFile(`/tangerine/groups/${groupId}/client/app-config.json`, JSON.stringify(appConfig))
            .then(status => log.info('Wrote app-config.json'))
            .catch(err => log.error('An error copying app-config: ' + err));
        this.groupDatabases.push(groupDb);
        this.groups$.next(group);
        return group;
    }
    async contentSets() {
        try {
            const contentSetsInfo = await fs.readJson(`/tangerine/content-sets/content-sets.json`);
            return contentSetsInfo;
        }
        catch (e) {
            return [];
        }
    }
    async read(groupId) {
        return await this.groupsDb.get(groupId);
    }
    async update(group) {
        await this.groupsDb.put(group);
    }
    async delete(group) {
        await this.groupsDb.delete(group);
        const groupDb = this.getGroupDatabase(group._id);
        await groupDb.destroy();
        await exec(`rm -r /tangerine/groups/${group._id}`);
        await exec(`rm /tangerine/client/content/groups/${group._id}`);
    }
    async startSession(groupId, username, type) {
        try {
            const adminUsername = `adminUser-${(0, uuid_1.v4)()}-${Date.now()}`;
            const adminPassword = (0, uuid_1.v4)();
            const config = await this.configService.config();
            const adminUserDoc = {
                "_id": `org.couchdb.user:${adminUsername}`,
                "name": adminUsername,
                "roles": [`admin-${groupId}`],
                "type": "user",
                "password": adminPassword
            };
            await this.http.post(`${config.couchdbEndpoint}/_users`, adminUserDoc).toPromise();
            log.info(`Created admin account for user ${username} in group ${groupId}`);
            return { "dbUrlWithCredentials": `${config.protocol}://${adminUsername}:${adminPassword}@${config.hostName}/db/${groupId}` };
        }
        catch (e) {
            throw e;
        }
    }
    async expireAdminCouchdbSessions() {
        const expireLimit = 8 * 60 * 60 * 1000;
        const _usersDb = this.dbService.instantiate(`_users`);
        const expiredAdminCouchdbSessions = (await _usersDb.allDocs({ include_docs: true }))
            .rows
            .map(row => row.doc)
            .filter(userDoc => userDoc._id.includes('org.couchdb.user:adminUser'))
            .filter(userDoc => (Date.now() - parseInt(userDoc.name.split('-')[6])) > expireLimit);
        for (const expiredAdminCouchdbSession of expiredAdminCouchdbSessions) {
            await _usersDb.remove(expiredAdminCouchdbSession);
        }
    }
};
exports.GroupService = GroupService;
exports.GroupService = GroupService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tangerine_config_service_1.TangerineConfigService,
        user_service_1.UserService,
        axios_1.HttpService,
        db_service_1.DbService])
], GroupService);
//# sourceMappingURL=group.service.js.map