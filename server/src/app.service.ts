import { SyncSessionService } from './modules/sync/services/sync-session/sync-session.service';
import { Injectable, HttpService } from '@nestjs/common';
const DB = require('./db')
import { TangerineConfigService } from './shared/services/tangerine-config/tangerine-config.service';
import { GroupService } from './shared/services/group/group.service';
import { TangerineConfig } from './shared/classes/tangerine-config';
import { ModulesDoc } from './shared/classes/modules-doc.class';
import createSitewideDatabase = require('./create-sitewide-database');
const reportingWorker = require('./reporting/reporting-worker')
const log = require('tangy-log').log
const util = require('util');
const exec = util.promisify(require('child_process').exec)
const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))
const tangyModules = require('./modules/index.js')()
const enableModule = require('./modules/enable-module.js')
const disableModule = require('./modules/disable-module.js')
const { spawn } = require('child_process');

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
    this.checkForNewGroups()
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
    await createSitewideDatabase('_users')
    await createSitewideDatabase('app')
    await createSitewideDatabase('groups')
    await createSitewideDatabase('users')
    await this.appDb.put({_id: 'installed', value: true})
    await this.appDb.put({_id: 'version', value: process.env.TANGERINE_VERSION})
    await exec('git config --system user.name "tangerine"')
    await exec(`ssh-keygen -t rsa -b 4096 -f /root/.ssh/id_rsa-tmp -P "" -C "tangerine@${process.env.T_HOST_NAME}"`)
    await exec(`cat /root/.ssh/id_rsa-tmp > /root/.ssh/id_rsa`)
    await exec(`cat /root/.ssh/id_rsa-tmp.pub > /root/.ssh/id_rsa.pub`)
    await exec(`chmod 600 /root/.ssh/id_rsa`)
    log.info('Installed')
  }
  
  async checkForNewGroups(){
    console.log("Checking for new groups...")
    const newGroupQueue = []
    this.groupService.groups$.subscribe({
      next: (group) => {
        console.log('Queueing report database(s) processing for ' + group._id + ': ')
        console.log(group)
        newGroupQueue.push(group)
      }
    })

    // Add new groups if there are entries in the newGroupQueue array.
    while (true) {
      while (newGroupQueue.length > 0) {
        const newGroup = newGroupQueue.pop()
        await reportingWorker.addGroup(newGroup)
        console.log('Adding group ' + newGroup + ' to reporting worker queue')
        // groupsList = await this.groupService.listGroups()
        await sleep(5*1000)
      }
      await sleep(5*1000)
    }
  }

  async keepAliveReportingWorker() {
    console.log("Loading the reporting worker...")
    let groupsList = await this.groupService.listGroups()
    await reportingWorker.prepare(groupsList)
    let workerState = await reportingWorker.getWorkerState()
    let enabledModules = process.env.T_MODULES
      ? JSON.parse(process.env.T_MODULES.replace(/\'/g,`"`))
      : []
    let modulesUsingChangesFeed = process.env.T_MODULES_USING_CHANGES_FEED
      ? JSON.parse(process.env.T_MODULES_USING_CHANGES_FEED.replace(/\'/g,`"`))
      : []
    let modulesUsingChangesFeedEnabled = modulesUsingChangesFeed.filter(moduleName => enabledModules.includes(moduleName))
    console.log('modulesUsingChangesFeedEnabled.length: ' + modulesUsingChangesFeedEnabled.length + ' modulesUsingChangesFeedEnabled: ' + modulesUsingChangesFeedEnabled)
    
      // Keep alive.
      while (true) {
        for (let i = 0; i < modulesUsingChangesFeedEnabled.length; i++) {
          const moduleName = modulesUsingChangesFeedEnabled[i]
          await this.runBatchModule(moduleName, modulesUsingChangesFeedEnabled);
          await sleep(3*1000)
        }
      }
      // await sleep(3*1000)
  }

  private async runBatchModule(moduleName, modulesUsingChangesFeedEnabled) {
    console.log('Enabling changes feed for ' + moduleName + ' out of ' + modulesUsingChangesFeedEnabled)
    try {
      // const workerState = await reportingWorker.getWorkerState()
    // , {
    //     detached: true,
    //       stdio: 'ignore'
    //   }
    //   const result = await spawn(`reporting-worker-batch, [${moduleName}]`)
      const child = await spawn(`reporting-worker-batch ${moduleName}`, {
        stdio: 'inherit',
        shell: true
      });
      child.on('data', async (data) => {
        log.error(`log child data:\n${data}`);
        console.error(`console child data:\n${data}`);
        await sleep(3 * 1000)
      });
      child.on('error', (data) => {
        console.error(`child error:\n${data}`);
      });
      child.on('close', async (code) => {
        console.log(`reporting-worker-batch ${moduleName} exited with code ${code}`);
      });

      const workerState = await reportingWorker.getWorkerState()
      if (workerState.hasOwnProperty('processed') === false || workerState.processed === 0) {
        console.log('No documents processed, restarting reporting worker after delay: ' + this.configService.config().reportingDelay + ' seconds')
        await sleep(this.configService.config().reportingDelay)
      } else {
        log.info(`Processed ${workerState.processed} changes.`)
      }
      // if (result.stderr) {
      //   log.error(result.stderr)
      //   await sleep(3 * 1000)
      // } else {
      //   const workerState = await reportingWorker.getWorkerState()
      //   if (workerState.hasOwnProperty('processed') === false || workerState.processed === 0) {
      //     await sleep(this.configService.config().reportingDelay)
      //   } else {
      //     log.info(`Processed ${workerState.processed} changes.`)
      //   }
      // }
    } catch (error) {
      log.error('Reporting process had an error:' + error)
      // console.log(error)
      await sleep(3 * 1000)
    }
  }

  async keepAliveSessionSweeper() {
    console.log("Loading the session sweeper...")
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
