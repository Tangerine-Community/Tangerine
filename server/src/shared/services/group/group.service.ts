import { Injectable } from '@nestjs/common';
import { TangerineConfigService } from '../tangerine-config/tangerine-config.service';
import { Group } from '../../classes/group';
import PouchDB from 'pouchdb'
import { v4 as UUID } from 'uuid'
import { BehaviorSubject, Observable } from 'rxjs';
const DB = require('../../../db')
const log = require('tangy-log').log
const fs = require('fs-extra')
const tangyModules = require('../../../modules/index.js')()


const util = require('util');
const exec = util.promisify(require('child_process').exec)

// A URL to a proxied CouchDB database complete with protocol, username:password@, host, and proxied path in the URL.
type SyncUrl = string

@Injectable()
export class GroupService {

  _views = {}
  private _groups: BehaviorSubject<Array<Group>> = new BehaviorSubject([])
  public readonly groups$: Observable<Array<Group>> = this._groups.asObservable();
  groupDatabases:Array<PouchDB> = []
  DB = DB
  groupsDb = new DB('groups');

  constructor(private readonly configService:TangerineConfigService){}

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

  async listGroups():Promise<[Group]> {
    return ((await this.groupsDb.allDocs({ include_docs: true }))
      .rows
      .map(row => row.doc)
      .filter(doc => !doc._id.includes('_design')))
  }

  // In a Module's constructor, they have the opportunity to use this method to queue views for installation
  // in Group databases.
  // Inspired by https://stackoverflow.com/questions/52263603/angular-add-a-multi-provider-from-lazy-feature-module
  registerViews(moduleName, views) {
    this._views[moduleName] = views
  }

  // During account creation, this method is to be used.
  async installViews(groupDb) {
    log.info(`Installing views for ${groupDb.name}`)
    for (const moduleName in this._views) {
      await groupDb.put({
        _id: `_design/${moduleName}`,
        views: this._views[moduleName]
      })
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
            await groupDb.query(`${moduleName}/${viewName}`, {limit: 1})
          }
        }
      }
    } catch(err) {
      throw(err)
    }
  }

  async create(label):Promise<Group> {
    // Instantiate Group Doc, DB, and assets folder.
    const groupId = `group-${UUID()}`
    const group = <Group>{_id: groupId, label}
    this.groupsDb.put(group)
    const groupDb = new DB(groupId)
    let groupName = label 
    await this.installViews(groupDb)
    await exec(`cp -r /tangerine/client/src/assets  /tangerine/client/content/groups/${groupId}`)
    // Create appConfig.
    let appConfig = <any>{}
    appConfig = <any>JSON.parse(await fs.readFile(`/tangerine/client/content/groups/${groupId}/app-config.json`, "utf8"))
    appConfig.uploadToken = process.env.T_UPLOAD_TOKEN 
    appConfig.serverUrl = `${process.env.T_PROTOCOL}://${process.env.T_HOST_NAME}/`
    // @TODO Remove this when client has switched from groupName to groupId.
    appConfig.groupName = groupId 
    appConfig.groupId = groupId 
    appConfig.hideProfile = (process.env.T_HIDE_PROFILE === 'true') ? true : false 
    appConfig.registrationRequiresServerUser = (process.env.T_REGISTRATION_REQUIRES_SERVER_USER === 'true') ? true : false
    appConfig.centrallyManagedUserProfile = (process.env.T_CENTRALLY_MANAGED_USER_PROFILE === 'true') ? true : false
    appConfig.modules = tangyModules.modules;
    appConfig.direction = `${process.env.T_LANG_DIRECTION}`
    if (process.env.T_CATEGORIES) {
      let categoriesString = `${process.env.T_CATEGORIES}`
      categoriesString = categoriesString.replace(/'/g, '"');
      let categoriesEntries = JSON.parse(categoriesString)
      appConfig.categories = categoriesEntries;
    }
    // @TODO Remove groupName after modules have switched to groupId.
    const data = await tangyModules.hook('groupNew', {groupName: groupId, groupId, appConfig})
    appConfig = data.appConfig
    await fs.writeFile(`/tangerine/client/content/groups/${groupId}/app-config.json`, JSON.stringify(appConfig))
      .then(status => log.info("Wrote app-config.json"))
      .catch(err => log.error("An error copying app-config: " + err))
    // Create a blank location-list.
    await fs.writeFile(`/tangerine/client/content/groups/${groupId}/location-list.json`, JSON.stringify({
      "locationsLevels": [],
      "locations": {},
      "metadata": {}
    }))
    // Stash and emit observable.
    this.groupDatabases.push(groupDb)
    this._groups.next([...this._groups.getValue(), group])
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
    await exec(`rm -r /tangerine/client/content/groups/${group._id}`)
  }

}
