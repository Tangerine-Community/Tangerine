import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupManagerComponent } from './group-manager.component';
import {Validators} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {TangerineGroup} from '../../tangerine-forms/models/tangerine-group';
import {NodeManagerModule} from '../node-manager.module';
import {TangerineFormSession} from '../../tangerine-forms/models/tangerine-form-session';
// import TangerineFormComponent


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
  
});
