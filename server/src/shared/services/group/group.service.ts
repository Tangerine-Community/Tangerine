import {HttpService, Injectable} from '@nestjs/common';
import { TangerineConfigService } from '../tangerine-config/tangerine-config.service';
import { Group } from '../../classes/group';
import PouchDB from 'pouchdb'
import { v4 as UUID } from 'uuid'
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { UserService } from '../user/user.service';
import {SyncSessionInfo} from "../../../modules/sync/services/sync-session/sync-session-v2.service";
import axios from "axios";
import {DbService} from "../db/db.service";
const insertGroupViews = require('../../../insert-group-views.js')

const DB = require('../../../db')
const log = require('tangy-log').log
const fs = require('fs-extra')
const tangyModules = require('../../../modules/index.js')()
const {permissionsList} = require('../../../permissions-list.js')
const {findUserByUsername, USERS_DB} = require('../../../auth.js')


const util = require('util');
const exec = util.promisify(require('child_process').exec)

// A URL to a proxied CouchDB database complete with protocol, username:password@, host, and proxied path in the URL.
type SyncUrl = string

@Injectable()
export class GroupService {

  _views = {}
  //private _groups: BehaviorSubject<Group> = new BehaviorSubject({})
  //public readonly groups$: Observable<Group> = this._groups.asObservable();
  public readonly groups$: Subject<Group> = new Subject();
  groupDatabases:Array<PouchDB> = []
  DB = DB
  groupsDb = new DB('groups');

  constructor(
    private readonly configService: TangerineConfigService,
    private readonly userService: UserService,
    private readonly http:HttpService,
    private readonly dbService:DbService
  ){}

  async initialize() {
    const groups = await this.listGroups()
    for (const group of groups) {
      this.groupDatabases.push(DB(group._id))
    }
  }

  getGroupDatabase(id = '') {
    return this.groupDatabases.find(groupDatabase => groupDatabase.name === id)
  }

  getSyncUrl(groupId:string):SyncUrl {
    const config = this.configService.config()
    return `${config.protocol}://${config.hostName}/db/${groupId}`
  }

  async listGroups():Promise<Array<Group>> {
    return ((await this.groupsDb.allDocs({ include_docs: true }))
      .rows
      .map(row => row.doc)
      .filter(doc => !doc._id.includes('_design')))
      .sort((a, b) => {
        /**
         * Convert dates to valid JSON to enable us do ASCI comparison with pouchDB
         * Working with Date Objects fails in some instances
         * https://github.com/pouchdb/pouchdb/issues/2351
         */
        a.created = a.created || new Date('1970').toJSON()
        b.created = b.created || new Date('1970').toJSON()
        const comparison = a.created > b.created ? 1 : -1
        return comparison
      })
  }

  // In a Module's constructor, they have the opportunity to use this method to queue views for installation
  // in Group databases.
  // @WARNING We are not currently using this. All views are in the JS module group-views.js as opposed to Nest Modules 
  // using this function to register views.
  // Inspired by https://stackoverflow.com/questions/52263603/angular-add-a-multi-provider-from-lazy-feature-module
  registerViews(moduleName, views) {
    this._views[moduleName] = views
  }

  // During account creation, this method is to be used.
  async installViews(groupDb) {

    log.info(`Installing views for ${groupDb.name}`)
    insertGroupViews(groupDb.name)
    for (const moduleName in this._views) {
      for (const viewName in this._views[moduleName]) {
        await groupDb.put({
          _id: `_design/${moduleName}_${viewName}`,
          views: {
            [`${moduleName}_${viewName}`]: this._views[moduleName][viewName]
          }
        })
      }
    }
  }

  // A helper method for upgrades to be used when a module has a view to upgrade.
  async updateAllUserViews() {
    log.info('Updating views...')
    for (const groupDb of this.groupDatabases) {
      log.info(`Updating views for ${groupDb.name}`)
      for (const moduleName in this._views) {
        const ddoc_id = `_design/${moduleName}`
        try {
          const designDoc = await groupDb.get(ddoc_id)
          await groupDb.put({
            _id: ddoc_id,
            _rev: designDoc._rev,
            views: this._views[moduleName]
          })
        } catch(err) {
          await groupDb.put({
            _id: ddoc_id,
            views: this._views[moduleName]
          })
        }
      }
      await groupDb.viewCleanup()
    }
  }

  // A helper method for upgrades to be used when a module has upgraded a view and now views need indexing.
  async indexAllUserViews() {
    try {
      for (const groupDb of this.groupDatabases) {
        for (const moduleName in this._views) {
          for (const viewName in this._views[moduleName]) {
            await groupDb.query(`${moduleName}_${viewName}`, {limit: 1})
          }
        }
      }
    } catch(err) {
      throw(err)
    }
  }

  async create(label, username):Promise<Group> {
    // Instantiate Group Doc, DB, and assets folder.
    const groupId = `group-${UUID()}`
    const created = new Date().toJSON()
    const adminRole = { role: 'Admin', permissions: permissionsList.groupPermissions.filter(permission => permission !== 'can_manage_group_roles' && permission !== 'can_access_dashboard') };
    const memberRole = { role: 'Member', permissions: ['can_access_author', 'can_access_forms', 'can_access_data', 'can_access_download_csv'] };
    const group = <Group>{_id: groupId, label, created, roles :[
      adminRole, memberRole
    ]} ;
    await this.groupsDb.put(group)
    if (username !== process.env.T_USER1) {
      const user = await this.userService.getUserByUsername(username);
      user.groups.push({groupName: groupId, roles: [adminRole.role]});
      await this.userService.usersDb.put(user);
    }
    const groupDb = new DB(groupId)
    let groupName = label 
    await this.installViews(groupDb)
    await exec(`cp -r /tangerine/content-sets/default  /tangerine/groups/${groupId}`)
    await exec(`cp /tangerine/translations/*.json /tangerine/groups/${groupId}/client/`)
    await exec(`mkdir /tangerine/groups/${groupId}/client/media`)
    // @TODO Create a symlink to the old group client directory until all the other APIs are updated and we have 
    // a proper upgrade script to migrate group directories.
    await exec(`ln -s /tangerine/groups/${groupId}/client /tangerine/client/content/groups/${groupId}`)
    // app-config.json
    //
    let appConfig = <any>{}
    appConfig = <any>JSON.parse(await fs.readFile(`/tangerine/groups/${groupId}/client/app-config.defaults.json`, "utf8"))
    appConfig.groupName = groupName 
    appConfig.groupId = groupId 
    appConfig.serverUrl = `${process.env.T_PROTOCOL}://${process.env.T_HOST_NAME}/`
    if (tangyModules.enabledModules.includes('sync-protocol-2')) {
      appConfig.syncProtocol = '2'
      delete appConfig.uploadToken
      delete appConfig.registrationRequiresServerUser
      delete appConfig.centrallyManagedUserProfile
    } else {
      appConfig.syncProtocol =  '1'
      appConfig.uploadToken = process.env.T_UPLOAD_TOKEN 
      appConfig.registrationRequiresServerUser = process.env.T_REGISTRATION_REQUIRES_SERVER_USER === 'true'
        ? true
        : false
      appConfig.centrallyManagedUserProfile = process.env.T_CENTRALLY_MANAGED_USER_PROFILE === 'true'
        ? true
        : false
    }
    appConfig.hideProfile = (process.env.T_HIDE_PROFILE === 'true') ? true : false 
    appConfig.modules = tangyModules.enabledModules;
    // Note, the default 'case-management' route is a misnomer, that's actually the default Tutor landing page.
    appConfig.homeUrl = tangyModules.enabledModules.includes('case') ? 'case-home' : 'case-management'
    appConfig.direction = `${process.env.T_LANG_DIRECTION}`
    if (process.env.T_CATEGORIES) {
      let categoriesString = `${process.env.T_CATEGORIES}`
      categoriesString = categoriesString.replace(/'/g, '"');
      let categoriesEntries = JSON.parse(categoriesString)
      appConfig.categories = categoriesEntries;
    }
    //
    // forms.json
    //
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
          : { }, 
        ...tangyModules.enabledModules.includes('sync-protocol-2') 
          ? {
            customSyncSettings: {
              enabled: false,
              push: false,
              pull: false,
              excludeIncomplete:false
            },
            couchdbSyncSettings: {
              enabled: true,
              push: true,
              pull: false,
              filterByLocation: true 
            }
          }
          : { } 
      },
      ...(!tangyModules.enabledModules.includes('case') && !tangyModules.enabledModules.includes('class'))
        ? [
          {
            id:'reports',
            src: './reports/form.html',
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
              : { }, 
            ...tangyModules.enabledModules.includes('sync-protocol-2') 
              ? {
                customSyncSettings: {
                  enabled: false,
                  push: false,
                  pull: false,
                  excludeIncomplete:false
                },
                couchdbSyncSettings: {
                  enabled: false,
                  push: false,
                  pull: false,
                  filterByLocation: true 
                }
              }
            : { } 
          }
        ]
        : []
    ]
    await fs.writeFile(`/tangerine/groups/${groupId}/client/forms.json`, JSON.stringify(forms))

    //
    // location-list.json
    //
    await fs.writeFile(`/tangerine/groups/${groupId}/client/location-list.json`, JSON.stringify({
      "locationsLevels": [],
      "locations": {},
      "metadata": {}
    }))
    // Generate Mango Query Indexes. Note we do this here because it depends on the location list being there.
    await exec(`generate-indexes ${group._id}`)
    const data = await tangyModules.hook('groupNew', {groupName: groupId, groupId, appConfig})
    appConfig = data.appConfig
    
    await fs.writeFile(`/tangerine/groups/${groupId}/client/app-config.json`, JSON.stringify(appConfig))
        .then(status => log.info('Wrote app-config.json'))
        .catch(err => log.error('An error copying app-config: ' + err))

    //
    // Stash and emit observable.
    //
    this.groupDatabases.push(groupDb)
    this.groups$.next(group)
    return group
  }

  async read(groupId:string):Promise<Group> {
    return await this.groupsDb.get(groupId)
  }

  async update(group:Group) {
    await this.groupsDb.put(group)
  }

  async delete(group:Group) {
    await this.groupsDb.delete(group)
    const groupDb = this.getGroupDatabase(group._id)
    await groupDb.destroy()
    await exec(`rm -r /tangerine/groups/${group._id}`)
    await exec(`rm /tangerine/client/content/groups/${group._id}`)
  }

  async startSession(groupId:string, username:string, type: string):Promise<object> {
    try {
      // Create sync user
      const adminUsername = `adminUser-${UUID()}-${Date.now()}`
      const adminPassword = UUID()
      const config = await this.configService.config()
      const adminUserDoc = {
        "_id": `org.couchdb.user:${adminUsername}`,
        "name": adminUsername,
        "roles": [`admin-${groupId}`],
        "type": "user",
        "password": adminPassword
      }
      console.log("adminUserDoc: " + JSON.stringify(adminUserDoc))
      await this.http.post(`${config.couchdbEndpoint}/_users`, adminUserDoc).toPromise()
      log.info(`Created admin account for user ${username} in group ${groupId}`)
      // const securityInfo = (await axios.get(`${process.env.T_COUCHDB_ENDPOINT}${groupId}/_security`)).data
      // const updatedSecurityInfo = {...securityInfo, ...{
      //     admins: {
      //       roles: [
      //         `admin-${groupId}`
      //       ]
      //     }
      //   }}
      // console.log("securityInfo: " + JSON.stringify(securityInfo))
      // console.log("updatedSecurityInfo: " + JSON.stringify(updatedSecurityInfo))
      // const response = await axios.put(`${process.env.T_COUCHDB_ENDPOINT}${groupId}/_security`, updatedSecurityInfo)
      // const dbUrlWithCredentials = `${window.location.protocol}//${username}:${password}@${window.location.hostname}/db/${window.location.pathname.split('/')[2]}`
      return {"dbUrlWithCredentials": `${config.protocol}://${adminUsername}:${adminPassword}@${config.hostName}/db/${groupId}`}
    } catch(e) {
      throw e
    }
  }

  async expireAdminCouchdbSessions() {
    // Expire all admin Couchdb sessions after 8 hours. This means if a admin Couchdb session takes longer than
    // 8 hours then it will be interrupted.
    const expireLimit = 8*60*60*1000
    const _usersDb = this.dbService.instantiate(`_users`)
    const expiredAdminCouchdbSessions = (await _usersDb.allDocs({ include_docs: true }))
      .rows
      .map(row => row.doc)
      .filter(userDoc => userDoc._id.includes('org.couchdb.user:adminUser'))
      .filter(userDoc => (Date.now() - parseInt(userDoc.name.split('-')[6])) > expireLimit)
    for (const expiredAdminCouchdbSession of expiredAdminCouchdbSessions) {
      await _usersDb.remove(expiredAdminCouchdbSession)
    }
  }

}
