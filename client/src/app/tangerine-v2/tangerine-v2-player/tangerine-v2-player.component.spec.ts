import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TangerineV2PlayerComponent } from './tangerine-v2-player.component';

describe('TangerineV2PlayerComponent', () => {
  let component: TangerineV2PlayerComponent;
  let fixture: ComponentFixture<TangerineV2PlayerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TangerineV2PlayerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TangerineV2PlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
