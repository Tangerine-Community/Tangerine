import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationsCreatorComponent } from './locations-creator.component';
import {By} from "@angular/platform-browser";
import {NodeValue} from "../node-value";
import {NodeManagerModule} from "../node-manager.module";

describe('LocationsCreatorComponent', () => {
  let component: LocationsCreatorComponent;
  let fixture: ComponentFixture<LocationsCreatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NodeManagerModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationsCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show one input elements', () => {
    const inputElements = fixture.debugElement.queryAll(By.css('input'));
    expect(inputElements.length).toEqual(1);
  });


  it('should populate with data of Group model', () => {
    let tangerineFormSession = {
      id: 'tangerineFormSessionId1',
      formId: 'form1',
      sectionIndex: 0,
      pageIndex: 0,
      markedDone: false,
      sections: [
        {
          status: 'UNSEEN',
          path: '/a',
          pages: [
            {
              status: 'UNSEEN',
              fields: [{
                className: 'row',
                fieldGroup: [
                  {
                    type: 'input',
                    key: 'name',
                    templateOptions: {
                      label: 'Group Name',
                      type: 'text',
                    }
                  }
                ]
              }],
              model: {
                'name': 'boop',
              }
            }
          ]
        }
      ]
    };
    // component.tangerineFormSession = tangerineFormSession;
    fixture.detectChanges();
    const inputElements = fixture.debugElement.queryAll(By.css('input'));
    let model = tangerineFormSession.sections[0].pages[0].model
    expect(inputElements[0].nativeElement.value).toEqual(model["name"]);
  });

});
