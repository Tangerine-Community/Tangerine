import { Injectable } from '@nestjs/common';

@Injectable()
export class ClientUserService {

  getSyncDocIds(groupId:string, profileId:string):Array<string> {
    return ['1', '2', '3']
  }

}
