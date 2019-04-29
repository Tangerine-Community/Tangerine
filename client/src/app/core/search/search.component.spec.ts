import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchComponent } from './search.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { UserService } from 'src/app/shared/_services/user.service';
import { SearchService, SearchDoc } from 'src/app/shared/_services/search.service';
import { FormInfo, FormSearchSettings } from 'src/app/tangy-forms/classes/form-info.class';

class MockSearchService {
  search(username, searchString) {
    return [
      <SearchDoc>{
        _id: 'doc1',
        formId: 'example',
        formType: 'form1',
        data: {
          title: "Foo",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        }
      },
      <SearchDoc>{
        _id: 'doc2',
        formId: 'case1',
        formType: 'case',
        data: {
          title: "Foo 2",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        }
      }
    ]
  }

}

class MockUserService {
  getCurrentUser() {
    return 'test-user'
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
          primaryTemplate: '${searchDoc.data.foo}',
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
          primaryTemplate: '${searchDoc.data.foo} ${searchDoc.data.bar}',
          secondaryTemplate: 'Id: ${searchDoc._id}'
        }
      }
    ]
  }
}

describe('SearchComponent', () => {
  
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;

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
        }
      ],
      declarations: [ SearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  fit('should create', (done) => {
    expect(component).toBeTruthy();
    debugger
    // @TODO Need a component.isReady$ ? Settimout is prone to tests failing due to race conditions.
    /*
    setTimeout(() => {
      component.searchBar.nativeElement.value = 'Foo'
      component.searchBar.nativeElement.dispatchEvent(new Event('change'))
      setTimeout(() => {
        debugger
        expect(component.searchResults.nativeElement.querySelectorAll('.search-doc').length).toEqual(2)
        done()
      },500)
    }, 300)
    */
  },987654321);
});
