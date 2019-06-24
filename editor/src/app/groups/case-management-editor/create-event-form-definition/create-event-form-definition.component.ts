import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GroupsService } from '../../services/groups.service';
import { TangyErrorHandler } from 'src/app/shared/_services/tangy-error-handler.service';
import { Subscription } from 'rxjs';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';

@Component({
  selector: 'app-create-event-form-definition',
  templateUrl: './create-event-form-definition.component.html',
  styleUrls: ['./create-event-form-definition.component.css']
})
export class CreateEventFormDefinitionComponent implements OnInit, OnDestroy {
  eventFormDefinition = {
    id: '',
    formId: '',
    name: '',
    repeatable: undefined,
    required: undefined
  };
  groupId;
  formsList;
  subscription: Subscription;
  caseDetailId;
  eventDefinitionId;
  caseStructure;
  initialFormState = { ...this.eventFormDefinition };
  constructor(private route: ActivatedRoute, private groupsService: GroupsService, private errorHandler: TangyErrorHandler) { }

  async ngOnInit() {
    this.groupId = this.route.snapshot.paramMap.get('groupName');
    this.formsList = await this.groupsService.getFormsList(this.groupId);
    this.subscription = this.route.queryParams.subscribe(async queryParams => {
      this.caseDetailId = queryParams['caseDetailId'];
      this.eventDefinitionId = queryParams['parentId'];
      this.caseStructure = await this.groupsService.getCaseStructure(this.groupId, this.caseDetailId);
    });
  }
  async createEventFormDefinition() {
    try {
      const eventDefinitions = this.caseStructure.eventDefinitions;
      const parentIndex = eventDefinitions.findIndex(e => e.id === this.eventDefinitionId);
      this.eventFormDefinition.id =
        `${this.groupsService.normalizeInput(this.eventFormDefinition.name)}-${this.groupsService.generateID(6)}`;
      this.caseStructure.eventDefinitions[parentIndex].eventFormDefinitions =
        [...this.caseStructure.eventDefinitions[parentIndex].eventFormDefinitions, this.eventFormDefinition];
      await this.groupsService.saveFileToGroupDirectory(this.groupId, this.caseStructure, `${this.caseDetailId}.json`);
      this.errorHandler.handleError(_TRANSLATE('Event Form Definition Saved Successfully.'));
      this.eventFormDefinition = { ...this.initialFormState };
    } catch (error) {
      this.errorHandler.handleError(_TRANSLATE('Event Form Definition not Saved.'));
    }
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
