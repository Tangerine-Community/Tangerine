import { Injectable } from '@nestjs/common';
import { TangerineConfig } from '../../classes/tangerine-config';
const tangyModules = require('../../../modules/index.js')()

@Injectable()
export class TangerineConfigService {
  config() {
    return <TangerineConfig>{
      enabledModules: tangyModules.enabledModules,
      uploadToken: process.env.T_UPLOAD_TOKEN,
      hostName: process.env.T_HOST_NAME,
      protocol: process.env.T_PROTOCOL,
      couchdbEndpoint: process.env.T_COUCHDB_ENDPOINT,
      user1ManagedServerUsers: process.env.T_USER1_MANAGED_SERVER_USERS === 'true'
        ? true
        : false,
      userOneUsername: process.env.T_USER1,
      userOnePassword: process.env.T_USER1_PASSWORD,
      dbAdminUsername: process.env.T_COUCHDB_USER_ADMIN_NAME,
      dbAdminPassword: process.env.T_COUCHDB_USER_ADMIN_PASSWORD,
      syncUsername: process.env.T_SYNC_USERNAME,
      syncPassword: process.env.T_SYNC_PASSWORD,
      hideSkipIf: process.env.T_HIDE_SKIP_IF === 'true' ? true : false,
      reportingDelay: parseInt(process.env.T_REPORTING_DELAY),
      couchdbSync4All: process.env.T_COUCHDB_SYNC_4_ALL === 'true' ? true : false,
      openRegistration: process.env.T_OPEN_REGISTRATION === 'true' ? true : false
    }
  }
}
