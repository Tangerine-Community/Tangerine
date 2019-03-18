import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassFormsPlayerComponent } from './class-forms-player.component';
import { ClassModule } from '../class.module';
import { AppRoutingModule } from 'src/app/app-routing.module';

describe('ClassFormsPlayerComponent', () => {
  let component: ClassFormsPlayerComponent;
  let fixture: ComponentFixture<ClassFormsPlayerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ClassModule,
        AppRoutingModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassFormsPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
