import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TwoWaySyncComponent } from './two-way-sync.component';
import { TwoWaySyncModule } from '../../two-way-sync.module';
import { ReplicationStatus } from '../../classes/replication-status.class';
import { UserService } from 'src/app/shared/_services/user.service';
import { TwoWaySyncService } from '../../services/two-way-sync.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatCardMdImage, MatCardModule, MatButtonModule } from '@angular/material';

class UserServiceMock {
  getCurrentUser() {
    return 'user1'
  }
}

class TwoWaySyncServiceMock {
  async sync(username) {
    return <ReplicationStatus>{
      pulled: 5,
      pushed: 3,
      conflicts: ['doc1', 'doc2']
    }
  }
}

describe('TwoWaySyncComponent', () => {
  let component: TwoWaySyncComponent;
  let fixture: ComponentFixture<TwoWaySyncComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, MatCardModule, MatButtonModule],
      providers: [
        {provide: UserService, useClass: UserServiceMock},
        {provide: TwoWaySyncService, useClass: TwoWaySyncServiceMock}
      ],
      declarations: [TwoWaySyncComponent]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TwoWaySyncComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should sync and show status', async () => {
    const el = fixture.nativeElement 
    fixture.detectChanges();
    await component.sync()
    fixture.detectChanges();
    expect(el.innerText.includes('Sync Successful')).toBeTruthy()
  })

  
});
