import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TwoWaySyncComponent } from './components/two-way-sync/two-way-sync.component';
import { SharedModule } from '../shared/shared.module';
import { DEFAULT_USER_DOCS } from '../shared/_tokens/default-user-docs.token';
import { HttpClientModule } from '@angular/common/http';
import { TwoWaySyncService } from './services/two-way-sync.service';
import { MatCardModule, MatButtonModule } from '@angular/material';
import { TwoWaySyncRoutingModule } from './two-way-sync-routing.module';
const emit = (key, value = '') => {
  return true;
}

@NgModule({
  exports: [TwoWaySyncComponent],
  declarations: [TwoWaySyncComponent],
  providers: [
    {
      provide: DEFAULT_USER_DOCS,
      useValue: [
        {
          _id: '_design/two-way-sync_conflicts',
          views: {
            'two-way-sync_conflicts': {
              map: function (doc) {
                if (doc._conflicts) {
                  emit(true)
                }
              }.toString()
            }
          }
        },
        {
          _id: '_design/sync_filter-by-form-ids',
          filters: {
            "sync_filter-by-form-ids": function (doc, req) {
              var formIds = req.query.formIds.split(',')
              return doc.collection === 'TangyFormResponse' &&
                doc.form &&
                doc.form.id &&
                formIds.includes(doc.form.id)
            }.toString()
          }
        } 
      ],
      multi: true
    },
    TwoWaySyncService
  ],
  imports: [
    CommonModule,
    TwoWaySyncRoutingModule,
    SharedModule,
    MatCardModule,
    MatButtonModule,
    HttpClientModule
  ]
})
export class TwoWaySyncModule { }
