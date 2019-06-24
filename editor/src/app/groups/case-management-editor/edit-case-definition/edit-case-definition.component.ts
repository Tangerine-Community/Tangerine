import { Component, OnInit, OnDestroy } from '@angular/core';
import { GroupsService } from '../../services/groups.service';
import { ActivatedRoute } from '@angular/router';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { TangyErrorHandler } from 'src/app/shared/_services/tangy-error-handler.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-case-definition',
  templateUrl: './edit-case-definition.component.html',
  styleUrls: ['./edit-case-definition.component.css']
})
export class EditCaseDefinitionComponent implements OnInit, OnDestroy {
  formInActive = true;
  caseName: '';
  groupId;
  caseIndex;
  caseDefinitions;
  subscription: Subscription;

  constructor(private route: ActivatedRoute, private groupsService: GroupsService, private errorHandler: TangyErrorHandler) {
    this.groupId = this.route.snapshot.paramMap.get('groupName');
  }

  async  ngOnInit() {
    this.caseDefinitions = await this.groupsService.getCaseDefinitions(this.groupId);
    this.subscription = this.route.queryParams.subscribe(async queryParams => {
      this.caseIndex = this.caseDefinitions.findIndex(e => e['id'] === queryParams['id']);
      this.caseName = this.caseDefinitions[this.caseIndex]['name'];
    });
  }
  async editCase() {
    try {
      this.caseDefinitions[this.caseIndex]['name'] = this.caseName;
      const caseDefinitionFilePath = './case-definitions.json';
      await this.groupsService.saveFileToGroupDirectory(this.groupId, this.caseDefinitions, caseDefinitionFilePath);
      this.formInActive = true;
      this.errorHandler.handleError(_TRANSLATE('Case Saved Successfully.'));
    } catch (error) {
      this.errorHandler.handleError(_TRANSLATE('Could not Save Case.'));
    }
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
