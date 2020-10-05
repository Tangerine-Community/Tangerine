import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { SearchService } from './search.service';
import { UserService } from './user.service';
import { TangyFormsInfoService } from 'src/app/tangy-forms/tangy-forms-info-service';
import { FormInfo, FormSearchSettings, CouchdbSyncSettings, CustomSyncSettings } from 'src/app/tangy-forms/classes/form-info.class';
import { Subject } from 'rxjs';
import { UserAccount } from '../_classes/user-account.class';
import PouchDB from 'pouchdb';
import { assertNotNull } from '@angular/compiler/src/output/output_ast';
import { AppConfigService } from './app-config.service';

class MockUserService {

  public userLoggedIn$:Subject<UserAccount> = new Subject()
  public userLoggedOut$:Subject<UserAccount> = new Subject()

  isLoggedIn() {
    return true
  }

  getCurrentUser() {
    return 'test-user'
  }

  getUserDatabase(username:string) {
    return new PouchDB('test-user')
  }

  async getUserAccount(username) {
    return {
      _id: 'test-user'

    }

  }

}

class MockAppConfigService {
  getAppConfig() {
    return {
      syncProtocol: '1' 
    }
  }
}




class MockFormsInfoService {
  async getFormsInfo():Promise<Array<FormInfo>> {
    return [
      {
        id: 'example',
        src: './assets/example/form.html',
        description: 'test test',
        type: 'form',
        listed: true,
        archived: false,
        title: 'Example',
        templates: [],
        searchSettings: <FormSearchSettings>{
          shouldIndex: true,
          variablesToIndex: ['foo', 'bar']
        },
        couchdbSyncSettings: <CouchdbSyncSettings>{
          enabled:false,
          filterByLocation:false
        },
        customSyncSettings: <CustomSyncSettings>{
          enabled: false,
          push: false,
          pull: false,
          excludeIncomplete: false
        },
        formVersionId: null, 
        formVersions: null
      }
    ]
  }
}

const exampleFormResponse = {
  _id: "formResponse1",
  form: {
    id: 'example'
  },
  items: [
    {
      inputs: [
        {
          name: 'foo',
          value: 'foo is foo'
        },
        {
          name: 'bar',
          value: 'bar is bar'
        }
      ]
    }
  ]
}

describe('SearchService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [ HttpClientModule],
    providers: [
      {
        provide: UserService,
        useClass: MockUserService
      },
      {
        provide: TangyFormsInfoService,
        useClass: MockFormsInfoService
      },
      {
        provide: AppConfigService,
        useClass: MockAppConfigService
      }
    ]
  }));

  it('should be created', () => {
    const service: SearchService = TestBed.get(SearchService);
    expect(service).toBeTruthy();
  });

  /* @TODO Needs refactoring around creating a user account.
   *
  fit('should index and be searchable', async (done) => {
    const searchService: SearchService = TestBed.get(SearchService);
    searchService.subscribedToLoggedInUser$.subscribe(async () => {
      let userDb = new PouchDB('test-user')
      searchService.didIndex$.subscribe(async () => {
        let searchDocs = await searchService.search('test-user', 'foo')
        expect(searchDocs.length).toEqual(1)
        await userDb.destroy()
        const indexDb = new PouchDB('test-user_search')
        await indexDb.destroy()
        done()
      })
      await userDb.put(exampleFormResponse)
    })
    await searchService.start()
  })
  */

});
