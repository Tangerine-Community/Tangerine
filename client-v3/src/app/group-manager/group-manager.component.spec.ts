import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupManagerComponent } from './group-manager.component';
import {GroupManagerModule} from "./group-manager.module";
import {Validators} from "@angular/forms";
import {TangerinePageComponent} from "../tangerine-forms/tangerine-page/tangerine-page.component";
import {By} from "@angular/platform-browser";
import {Group} from "./group";
import {GroupResult} from "app/group-manager/group-result";


describe('GroupManagerComponent', () => {
  let component: GroupManagerComponent;
  let fixture: ComponentFixture<GroupManagerComponent>;
  const tangerinePageConfigStub = [{
    className: 'row',
    fieldGroup: [{
      key: 'groupName',
      type: 'input',
      templateOptions: {
        type: 'text',
        label: 'Group Name'
      },
      validators: {
        validation: Validators.compose([Validators.required])
      }
    }]
  }];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        GroupManagerModule
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
    let group:Group = {
      _id: "foo",
      name:"bigDaddy",
      _rev:"bingo"
    }
    component.groupModel = group;
    fixture.detectChanges();
    const inputElements = fixture.debugElement.queryAll(By.css('input'));
    expect(inputElements[0].nativeElement.value).toEqual(group.name);
  });


});
