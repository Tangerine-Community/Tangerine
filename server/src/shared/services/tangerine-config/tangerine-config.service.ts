import { Injectable } from '@nestjs/common';
import { TangerineConfig } from 'src/shared/classes/tangerine-config';

@Injectable()
export class TangerineConfigService {
  config() {
    return <TangerineConfig>{
      uploadToken: process.env.T_UPLOAD_TOKEN,
      hostName: process.env.T_HOST_NAME,
      protocol: process.env.T_PROTOCOL,
      userOneUsername: process.env.T_USER1,
      userOnePassword: process.env.T_USER1_PASSWORD,
      dbAdminUsername: process.env.T_ADMIN,
      dbAdminPassword: process.env.T_PASS,
      syncUsername: process.env.T_SYNC_USERNAME,
      syncPassword: process.env.T_SYNC_PASSWORD
    }
  }
}
