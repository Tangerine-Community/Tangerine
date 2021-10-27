import { SyncSessionService } from './modules/sync/services/sync-session/sync-session.service';
import { Injectable, HttpService } from '@nestjs/common';
const DB = require('./db')
import { TangerineConfigService } from './shared/services/tangerine-config/tangerine-config.service';
import { GroupService } from './shared/services/group/group.service';
import { TangerineConfig } from './shared/classes/tangerine-config';
import { ModulesDoc } from './shared/classes/modules-doc.class';
const reportingWorker = require('./reporting/reporting-worker')
const log = require('tangy-log').log
const util = require('util');
const exec = util.promisify(require('child_process').exec)
const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))
const tangyModules = require('./modules/index.js')()
const enableModule = require('./modules/enable-module.js')
const disableModule = require('./modules/disable-module.js')

@Injectable()
export class AppService {

  constructor(
    private readonly groupService:GroupService,
    private readonly configService: TangerineConfigService,
    private readonly syncSessionService:SyncSessionService,
    private readonly httpClient:HttpService
  ) { }

  installed = false
  appDb = new DB('app')
  config:TangerineConfig

  async start() {
    this.config = this.configService.config()
    try {
      await this.appDb.get('installed')
      this.installed = true
    }
    catch(e) {
      await this.install()
      this.installed = true
    }
    await this.startModules()
    this.keepAliveReportingWorker()
    this.keepAliveSessionSweeper()
    
  }

  async startModules() {
    let actuallyEnabledModules = []
    let modulesDoc = <ModulesDoc>{
      _id: 'modules',
      enabledModules: []
    }
    try {
      modulesDoc = <ModulesDoc>await this.appDb.get('modules')
      actuallyEnabledModules = modulesDoc.enabledModules
    } catch (e) {
      // Do nothing.
    }
    const shouldBeEnabledModules = this.config.enabledModules 
    const intersection = actuallyEnabledModules.filter(moduleName => shouldBeEnabledModules.includes(moduleName))
    const shouldEnable = shouldBeEnabledModules.filter(moduleName => !intersection.includes(moduleName))
    const shouldDisable = actuallyEnabledModules.filter(moduleName => !shouldBeEnabledModules.includes(moduleName))
    if (shouldEnable.length > 0) {
      log.info(`Enabling modules: ${shouldEnable.join(' ')}`)
    }
    for (const moduleName of shouldEnable) {
      await enableModule(moduleName)
    }
    if (shouldDisable.length > 0) {
      log.info(`Disabling modules: ${shouldDisable.join(' ')}`)
    }
    for (const moduleName of shouldDisable) {
      await disableModule(moduleName)
    }
    await this.appDb.put({...modulesDoc, enabledModules: shouldBeEnabledModules})
    await tangyModules.hook('boot', { })
  }

  async install() {
    log.info('Installing...')
    log.info('Creating _users database...')
    log.info(`${this.config.couchdbEndpoint}/_users`)
    await this.httpClient.put(`${this.config.couchdbEndpoint}/_users`).toPromise()
    await this.appDb.put({_id: 'installed', value: true})
    await this.appDb.put({_id: 'version', value: process.env.TANGERINE_VERSION})
    await exec('git config --system user.name "tangerine"')
    await exec(`ssh-keygen -t rsa -b 4096 -f /root/.ssh/id_rsa-tmp -P "" -C "tangerine@${process.env.T_HOST_NAME}"`)
    await exec(`cat /root/.ssh/id_rsa-tmp > /root/.ssh/id_rsa`)
    await exec(`cat /root/.ssh/id_rsa-tmp.pub > /root/.ssh/id_rsa.pub`)
    await exec(`chmod 600 /root/.ssh/id_rsa`)
    log.info('Installed')
  }

  async keepAliveReportingWorker() {
    let groupsList = await this.groupService.listGroups()
    const newGroupQueue = []
    this.groupService.groups$.subscribe({
      next: (group) => {
        console.log('Queueing...')
        console.log(group)
        newGroupQueue.push(group)
      }
    })
    await reportingWorker.prepare(groupsList)
    let workerState = await reportingWorker.getWorkerState()
    // Keep alive.
    while (true) {
      try {
        workerState = await reportingWorker.getWorkerState()
        // Add new groups if there are entries in the newGroupQueue array.
        while (newGroupQueue.length > 0) {
          await reportingWorker.addGroup(newGroupQueue.pop())
          groupsList = await this.groupService.listGroups()
        }
        const result = await exec('reporting-worker-batch')
        if (result.stderr) {
          log.error(result.stderr)
          await sleep(3*1000)
        } else {
          workerState = await reportingWorker.getWorkerState()
          if (workerState.hasOwnProperty('processed') === false || workerState.processed === 0) {
            await sleep(this.configService.config().reportingDelay)
          } else {
            log.info(`Processed ${workerState.processed} changes.`)
          }
        }
      } catch (error) {
        log.error('Reporting process had an error.')
        console.log(error)
        await sleep(3*1000)
      }
    }
  }

  async keepAliveSessionSweeper() {
    const config = await this.configService.config()
    if (config.enabledModules.includes('sync-protocol-2')) {
      setInterval(() => {
        try {
          this.syncSessionService.expireSyncSessions()
          this.groupService.expireAdminCouchdbSessions()
        } catch (e) {
          log.error(e)
          console.log(e)
        }
      }, 60*60*1000)
    }
  }
  
}
