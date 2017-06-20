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


  fit('should populate with data of NodeValue model', () => {
    let node:NodeValue = {
      _id: "foo",
      name:"topdawg",
      _rev:"bingo"
    }
    component.model = node;
    fixture.detectChanges();
    const inputElements = fixture.debugElement.queryAll(By.css('input'));
    expect(inputElements[0].nativeElement.value).toEqual(node.name);
  });

});
