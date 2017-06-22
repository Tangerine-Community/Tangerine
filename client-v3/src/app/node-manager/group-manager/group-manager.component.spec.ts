import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupManagerComponent } from './group-manager.component';
import {Validators} from "@angular/forms";
import {By} from "@angular/platform-browser";
import {Group} from "./group";
import {NodeManagerModule} from "../node-manager.module";


describe('GroupManagerComponent', () => {
  let component: GroupManagerComponent;
  let fixture: ComponentFixture<GroupManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NodeManagerModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should show one input elements', () => {
    const inputElements = fixture.debugElement.queryAll(By.css('input'));
    expect(inputElements.length).toEqual(1);
  });

  fit('should populate with data of Group model', () => {
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
    component.tangerineFormSession = tangerineFormSession;
    fixture.detectChanges();
    const inputElements = fixture.debugElement.queryAll(By.css('input'));
    let fields = tangerineFormSession.sections[0].pages[0].fields[0].fieldGroup[0]
    expect(inputElements[0].nativeElement.value).toEqual(fields["name"]);
  });


});
