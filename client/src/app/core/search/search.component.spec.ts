import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchComponent } from './search.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { UserService } from 'src/app/shared/_services/user.service';
import { SearchService, SearchDoc } from 'src/app/shared/_services/search.service';
import { FormInfo, FormSearchSettings } from 'src/app/tangy-forms/classes/form-info.class';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TangyFormResponse } from 'src/app/tangy-forms/tangy-form-response.class';
import { TangyFormsInfoService } from 'src/app/tangy-forms/tangy-forms-info-service';
import { Subject } from 'rxjs';

class MockSearchService {
  search(username, searchString) {
    return [
      <SearchDoc>{
        _id: 'response1',
        formId: 'form1',
        formType: 'form',
        variables: {
          foo: "Foo",
          bar: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        }
      },
      <SearchDoc>{
        _id: 'response2',
        formId: 'case1',
        formType: 'case',
        variables: {
          foo: "Foo 2",
          bar: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        }
      }
    ]
  }
}

class MockPouchDB {
  get(id) {
    switch (id) {
      case 'response1': 
        return {
          _id: 'response1',
          form: {
            id: 'form1'
          }
        }
      case 'response2':
        return {
          _id: 'response2',
          form: {
            id: 'form2'
          }
        }
    }
  }
}

class MockUserService {
  getCurrentUser() {
    return 'test-user'
  }
  getUserDatabase(username) {
    return new MockPouchDB()
  }
}

class MockTangyFormsInfoService {
  async getFormsInfo():Promise<Array<FormInfo>> {
    return [
      <FormInfo>{
        id: 'form1',
        title: 'Form 1',
        type: 'form',
        searchSettings: <FormSearchSettings>{
          shouldIndex: true,
          variablesToIndex: ['foo', 'bar'],
          primaryTemplate: '${searchDoc.variables.foo}',
          secondaryTemplate: 'Id: ${searchDoc._id}'
        }
      },
      <FormInfo>{
        id: 'case1',
        title: 'Case 1',
        type: 'case',
        searchSettings: <FormSearchSettings>{
          shouldIndex: true,
          variablesToIndex: ['foo', 'bar'],
          primaryTemplate: '${searchDoc.variables.foo} ${searchDoc.variables.bar}',
          secondaryTemplate: 'Id: ${searchDoc._id}'
        }
      }
    ]
  }
}

class MockRouter {
  navigateByUrl(url) {
    return
  }
}

describe('SearchComponent', () => {
  
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: UserService,
          useClass: MockUserService
        },
        {
          provide: SearchService,
          useClass: MockSearchService
        },
        {
          provide: TangyFormsInfoService,
          useClass: MockTangyFormsInfoService
        },
        {
          provide: Router,
          useClass: MockRouter
        }
      ],
      declarations: [ SearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    router = TestBed.get(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  })

  it('should search and navigate', (done) => {
    component.searchReady$.subscribe(() => {
      component.searchBar.nativeElement.value = 'Foo'
      component.searchBar.nativeElement.dispatchEvent(new Event('change'))
      component.didSearch$.subscribe(() => {
        expect(component.searchResults.nativeElement.querySelectorAll('.search-result').length).toEqual(2)
        component.navigatingTo$.subscribe(url => {
          expect(url).toEqual('/tangy-forms-player/form1/response1')
          done()
        })
        component.searchResults.nativeElement.querySelectorAll('.search-result')[0].click()
      })
    })
  });
});
