import { TranslateModule } from '@ngx-translate/core';
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
import { MockTangyFormsInfoService } from 'src/app/mocks/services/mock-tangy-forms-info.service';
import { MockSearchService } from 'src/app/mocks/services/mock-search.service';



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
      imports: [ TranslateModule.forRoot() ],
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
          expect(url).toEqual('/tangy-forms-player?formId=form1&responseId=response1')
          done()
        })
        component.searchResults.nativeElement.querySelectorAll('.search-result')[0].click()
      })
    })
  });
});
