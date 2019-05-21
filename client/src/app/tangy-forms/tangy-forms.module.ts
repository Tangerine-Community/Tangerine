import { SharedModule } from '../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TangyFormsRoutingModule } from './tangy-forms-routing.module';
import { TangyFormsPlayerComponent } from './tangy-forms-player/tangy-forms-player.component';
import { UserService } from '../shared/_services/user.service';
import { TangyFormsQueries } from './tangy-forms.queries';
import { DEFAULT_USER_DOCS } from '../shared/_tokens/default-user-docs.token';
import { TangyFormService } from './tangy-form.service';
import { TangyFormsInfoService } from './tangy-forms-info-service';

@NgModule({
  imports: [
    CommonModule,
    TangyFormsRoutingModule,
    SharedModule
  ],
  providers: [
    {
      provide: DEFAULT_USER_DOCS,
      useValue: [
        {
          _id: '_design/tangy-form',
          views: TangyFormsQueries
        }
      ],
      multi: true
    },
    TangyFormsInfoService,
    TangyFormService
  ],
  declarations: [TangyFormsPlayerComponent]
})
export class TangyFormsModule { }
