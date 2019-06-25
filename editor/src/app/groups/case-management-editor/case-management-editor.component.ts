import { Component, OnInit, OnDestroy } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { GroupsService } from '../services/groups.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

interface CaseNode {
  name: string;
  id: string;
  type: string;
  children?: any;
}


@Component({
  selector: 'app-case-management-editor',
  templateUrl: './case-management-editor.component.html',
  styleUrls: ['./case-management-editor.component.css']
})
export class CaseManagementEditorComponent implements OnInit, OnDestroy {
  treeControl = new NestedTreeControl<CaseNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<CaseNode>();
  groupId;
  currentNodeType;
  formType = '';
  subscription: Subscription;
  constructor(private route: ActivatedRoute, private groupsService: GroupsService, private router: Router) { }
  async ngOnInit() {
    this.groupId = this.route.snapshot.paramMap.get('groupName');
    this.currentNodeType = this.route.snapshot.queryParamMap.get('currentNodeType');
    this.subscription = this.route.queryParams.subscribe(async queryParams => {
      this.formType = queryParams['formType'];
    });
    let data = [];
    for (const c of await this.groupsService.getCaseDefinitions(this.groupId)) {
      const caseDetail = await this.groupsService.getCaseStructure(this.groupId, c['id']);
      const cases = {

        id: caseDetail['id'],
        name: caseDetail['name'],
        type: 'caseDefinitionStructure',
        children: (() => {
          if (caseDetail['id']) {
            return caseDetail['eventDefinitions'] && caseDetail['eventDefinitions'].map(eventDefinition => {
              eventDefinition.type = 'eventDefinition';
              eventDefinition.caseDetailId = caseDetail['id'];
              const e = eventDefinition;
              e['children'] = e['eventFormDefinitions'] && e['eventFormDefinitions'].map(eventFormDefinition => {
                eventFormDefinition.type = 'eventFormDefinition';
                eventFormDefinition.caseDetailId = caseDetail['id'];
                eventFormDefinition.parentId = e.id;
                return eventFormDefinition;
              });
              return e;
            });
          } return [];
        })()

      };
      data = [...data, cases];
    }
    this.dataSource.data = data;

  }
  hasChild = (_: number, node: CaseNode) => !!node.children && node.children.length > 0;
  onClickNode(event: Event, currentNodeType, id, caseDetailId, parentId) {
    event.stopPropagation();
    this.currentNodeType = currentNodeType;
    const formType = 'edit';
    this.router.navigate([], {
      queryParams: { id, currentNodeType, caseDetailId, parentId, formType },
      queryParamsHandling: 'merge'
    });
  }

  ngOnDestroy() {
    this.formType = '';
    this.subscription.unsubscribe();
  }
}
