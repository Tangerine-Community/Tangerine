import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupsService } from '../../services/groups.service';
import { Subscription } from 'rxjs';
import { TangyErrorHandler } from 'src/app/shared/_services/tangy-error-handler.service';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';

@Component({
  selector: 'app-create-case-definition-structure',
  templateUrl: './create-case-definition-structure.component.html',
  styleUrls: ['./create-case-definition-structure.component.css']
})
export class CreateCaseDefinitionStructureComponent implements OnInit, OnDestroy {

  groupId;
  caseStructure;
  subscription: Subscription;
  formsList;
  formInActive = true;
  caseForm = {
    id: '',
    formId: '',
    revision: '',
    name: '',
    description: '',
    templateTitle: '',
    templateDescription: '',
    eventDefinitions: [],
    startFormOnOpen: {
      eventId: '',
      eventFormId: '',
    }
  };
  initialForm = { ...this.caseForm };
  caseDefinitions;
  caseId;
  constructor(private route: ActivatedRoute,
    private router: Router, private groupsService: GroupsService,
    private errorHandler: TangyErrorHandler) { }

  async ngOnInit() {
    this.groupId = this.route.snapshot.paramMap.get('groupName');
    this.formsList = await this.groupsService.getFormsList(this.groupId);
    this.subscription = this.route.queryParams.subscribe(async queryParams => {
      this.caseForm = { ...this.initialForm };
      this.formInActive = true;
      this.caseId = queryParams['id'];
      await this.getCaseDetail(`./${this.caseId}`);
    });
  }

  async getCaseDetail(path) {
    this.caseStructure = await this.groupsService.getCaseStructure(this.groupId, path);
    this.caseForm = { ...this.caseForm, ...this.caseStructure };
  }

  async saveForm() {
    try {
      this.caseForm = { ...this.caseForm, revision: await this.groupsService.updateCaseDefinitionRevision(this.groupId, this.caseForm.id) };
      await this.groupsService.saveFileToGroupDirectory(this.groupId, this.caseForm, `./${this.caseForm.id}.json`);

      this.caseDefinitions = await this.groupsService.getCaseDefinitions(this.groupId);
      const caseIndex = this.caseDefinitions.findIndex(e => e['id'] === this.caseId);
      this.caseDefinitions[caseIndex]['name'] = this.caseForm.name;
      await this.groupsService.saveFileToGroupDirectory(this.groupId, this.caseDefinitions, './case-definitions.json');

      this.formInActive = true;
      this.errorHandler.handleError(_TRANSLATE('Case Structure Saved Successfully.'));
    } catch (error) {
      this.errorHandler.handleError(_TRANSLATE('Case Structure not Saved.'));
    }

  }

  createNewEventDefinition() {
    const caseDetailId = this.caseForm.id;
    const parentId = this.caseForm.id;
    const currentNodeType = 'eventDefinition';
    const formType = 'new';
    const selectedTabIndex = this.route.snapshot.queryParamMap.get('selectedTabIndex');
    this.router.navigate(['/projects']).then(() => {
      this.router.navigate([`groups/${this.groupId}`], {
        queryParams: { currentNodeType, caseDetailId, parentId, formType, selectedTabIndex },
        queryParamsHandling: 'merge'
      });
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
