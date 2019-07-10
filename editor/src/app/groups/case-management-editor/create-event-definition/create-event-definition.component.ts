import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupsService } from '../../services/groups.service';
import { TangyErrorHandler } from 'src/app/shared/_services/tangy-error-handler.service';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { CaseManagementEditorService } from '../case-management-editor.service';

@Component({
  selector: 'app-create-event-definition',
  templateUrl: './create-event-definition.component.html',
  styleUrls: ['./create-event-definition.component.css']
})
export class CreateEventDefinitionComponent implements OnInit, OnDestroy {
  eventForm = {
    id: '',
    name: '',
    description: '',
    repeatable: undefined,
    required: undefined,
    eventFormDefinitions: []
  };
  initialFormState = { ...this.eventForm };
  groupId;
  subscription: Subscription;
  caseStructure;
  caseDetailId;
  constructor(private route: ActivatedRoute,
    private router: Router,
    private groupsService: GroupsService,
    private caseService: CaseManagementEditorService,
    private errorHandler: TangyErrorHandler) {
    this.groupId = this.route.snapshot.paramMap.get('groupName');
  }

  ngOnInit() {
    this.subscription = this.route.queryParams.subscribe(async queryParams => {
      this.caseDetailId = queryParams['caseDetailId'];
      this.caseStructure = await this.groupsService.getCaseStructure(this.groupId, `./${queryParams['caseDetailId']}`);
    });
  }
  async createEventDefinition() {
    try {
      this.caseStructure.eventDefinitions = [...this.caseStructure.eventDefinitions, this.eventForm];
      await this.groupsService.saveFileToGroupDirectory(this.groupId, this.caseStructure, `${this.caseDetailId}.json`);
      this.caseService.sendMessage('reloadTree');
      this.errorHandler.handleError(_TRANSLATE('Event Definition Saved Successfully.'));
      this.eventForm = { ...this.initialFormState };
    } catch (error) {
      this.errorHandler.handleError(_TRANSLATE('Event Definition not Saved.'));
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
