import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { GroupsService } from '../services/groups.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CaseManagementEditorService } from './case-management-editor.service';

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

  title = _TRANSLATE('Case Definitions')
  breadcrumbs:Array<Breadcrumb> = []
 
  treeControl = new NestedTreeControl<CaseNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<CaseNode>();
  groupId;
  currentNodeType;
  formType = '';
  caseDetailId;
  paramsSubscription: Subscription;
  treeSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private groupsService: GroupsService,
    private caseService: CaseManagementEditorService
  ) { }
  async ngOnInit() {
    this.breadcrumbs = [
      <Breadcrumb>{
        label: _TRANSLATE('Case Definitions'),
        url: 'case-definitions'
      }
    ]
    this.groupId = this.route.snapshot.paramMap.get('groupName');
    this.paramsSubscription = this.route.queryParams.subscribe(async queryParams => {
      this.currentNodeType = queryParams['currentNodeType'];
      this.formType = queryParams['formType'];
      this.caseDetailId = queryParams['caseDetailId'];
    });
    this.treeSubscription = this.caseService.getMessage().subscribe(async message => {
      if (message === 'reloadTree') {
        await this.getTreeData();
      }
    });
    await this.getTreeData();

  }

  async getTreeData() {
    let data = [];
    for (const c of await this.groupsService.getCaseDefinitions(this.groupId)) {
      const caseDetail = await this.groupsService.getCaseStructure(this.groupId, c['id']);
      const cases = {

        id: caseDetail['id'],
        name: caseDetail['name'],
        type: 'caseDefinitionStructure',
        caseDetailId: caseDetail['id'],
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
    this.treeControl.dataNodes = data;
    this.expandNodes();
  }

  expandNodes() {
    if (this.caseDetailId) {
      for (const [i, v] of this.treeControl.dataNodes.entries()) {
        if (this.treeControl.dataNodes[i].id === this.caseDetailId) {
          this.treeControl.expand(this.treeControl.dataNodes[i]);
          if (this.currentNodeType === 'eventDefinition' || this.currentNodeType === 'eventFormDefinition') {
            const leafId = this.currentNodeType === 'eventDefinition' ?
              this.route.snapshot.queryParamMap.get('id') : this.route.snapshot.queryParamMap.get('parentId');
            const eventDefinitionIndex = this.treeControl.dataNodes[i].children.findIndex(e => e.id === leafId);
            this.treeControl.expand(this.treeControl.dataNodes[i].children[eventDefinitionIndex]);
          }
          break;
        }
      }
    }
  }
  hasChild = (_: number, node: CaseNode) => !!node.children && node.children.length > 0;
  onClickNode(event: Event, currentNodeType, id, caseDetailId, parentId) {
    event.stopPropagation();
    this.currentNodeType = currentNodeType;
    const selectedTabIndex = this.route.snapshot.queryParamMap.get('selectedTabIndex');
    const formType = 'edit';
    this.router.navigate([], {
      queryParams: { id, currentNodeType, caseDetailId, parentId, formType, selectedTabIndex },
      queryParamsHandling: 'merge'
    });
  }


  ngOnDestroy() {
    this.formType = '';
    this.paramsSubscription.unsubscribe();
    this.treeSubscription.unsubscribe();
  }
}
