import { TangyFormsDocs } from './tangy-forms.docs';
import { SharedModule } from '../shared/shared.module';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TangyFormsRoutingModule } from './tangy-forms-routing.module';
import { TangyFormsPlayerComponent } from './tangy-forms-player/tangy-forms-player.component';
import { UserService } from '../shared/_services/user.service';
import { TangyFormsQueries } from './tangy-forms.queries';
import { DEFAULT_USER_DOCS } from '../shared/_tokens/default-user-docs.token';
import { TangyFormService } from './tangy-form.service';
import { TangyFormsInfoService } from './tangy-forms-info-service';
import { TangyFormsPlayerRouteComponent } from './tangy-forms-player-route/tangy-forms-player-route.component';
import { MatLegacyMenu as MatMenu, MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyButton as MatButton, MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    MatMenuModule,
    MatButtonModule,
    TangyFormsRoutingModule,
    SharedModule
  ],
  exports: [
    TangyFormsPlayerComponent
  ],
  providers: [
    {
      provide: DEFAULT_USER_DOCS,
      useValue: [
        {
          _id: '_design/tangy-form',
          views: TangyFormsQueries
        },
        ...TangyFormsDocs
      ],
      multi: true
    },
    TangyFormsInfoService,
    TangyFormService
  ],
  declarations: [TangyFormsPlayerComponent, TangyFormsPlayerRouteComponent]
})
export class TangyFormsModule { }
