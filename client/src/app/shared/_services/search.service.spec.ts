import { TestBed } from '@angular/core/testing';

import { SearchService } from './search.service';
import { UserService } from './user.service';
import { AuthenticationService } from './authentication.service';
import { TangyFormsInfoService } from 'src/app/tangy-forms/tangy-forms-info-service';
import { FormInfo, FormSearchSettings } from 'src/app/tangy-forms/classes/form-info.class';
import { Subject } from 'rxjs';
import { UserAccount } from '../_classes/user-account.class';
import PouchDB from 'pouchdb';
import { assertNotNull } from '@angular/compiler/src/output/output_ast';

class MockUserService {
  getUserDatabase(username:string) {
    return new PouchDB('test-user')
  }

  async getUserAccount(username) {
    return {
      _id: 'test-user'

    }

  }

}

class MockAuthenticationService {
  public userLoggedIn$:Subject<UserAccount> = new Subject()
  public userLoggedOut$:Subject<UserAccount> = new Subject()
  isLoggedIn() {
    return true
  }
}

class MockFormsInfoService {
  async getFormsInfo():Promise<Array<FormInfo>> {
    return [
      {
        id: 'example',
        src: './assets/example/form.html',
        type: 'form',
        title: 'Example',
        searchSettings: <FormSearchSettings>{
          shouldIndex: true,
          variablesToIndex: ['foo', 'bar']
        }
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
    providers: [
      {
        provide: UserService,
        useClass: MockUserService
      },
      {
        provide: AuthenticationService,
        useClass: MockAuthenticationService
      },
      {
        provide: TangyFormsInfoService,
        useClass: MockFormsInfoService
      }
    ]
  }));

  it('should be created', () => {
    const service: SearchService = TestBed.get(SearchService);
    expect(service).toBeTruthy();
  });

  it('should be index and be searchable', async (done) => {
    const searchService: SearchService = TestBed.get(SearchService);
    const authenticationService: AuthenticationService = TestBed.get(AuthenticationService);
    await searchService.start()
    // TODO: This not getting hit?? Probably not starting correctly.
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
    authenticationService.userLoggedIn$.next(<UserAccount>{ _id: 'test-user' })
  })

});
