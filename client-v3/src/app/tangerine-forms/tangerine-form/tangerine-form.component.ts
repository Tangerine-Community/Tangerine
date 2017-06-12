import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TangerinePageComponent } from '../tangerine-page/tangerine-page.component';
import { TangerineFormResult } from '../tangerine-form-result';

@Component({
  selector: 'app-tangerine-form',
  templateUrl: './tangerine-form.component.html',
  styleUrls: ['./tangerine-form.component.css']
})
export class TangerineFormComponent implements OnInit {

  @Input() form: any;
  @Input() result: TangerineFormResult = { variables: {}, log: [] };
  @Output() binderDone: EventEmitter<Object> = new EventEmitter();
  private currentSection: object = {'title': ''};
  private currentPage: object;
  private currentPathIndex = 0;
  private currentPath = '';
  private objectByPath: object = {};
  private pathByIndex: Array<any> = [];
  private indexByPath: object = {};
  private pageComponent: TangerinePageComponent;
  disableNext = true;
  ///@ViewChild(TdDynamicFormsComponent) form: TdDynamicFormsComponent;
  constructor() { }

   ngOnInit() {
    this.organize();
    // TODO: Add support for resuming, don't assume index of 0.
    this.step(this.pathByIndex[0]);
  }
  // ngAfterViewInit() {

  // }

  private organize() {;
    let path = '';
    let i = 0;
    const that = this;
    function indexChildren(parent) {
      // step forward path
      path += `/${parent._id}`;
      that.pathByIndex.push(path);
      if (parent.children && parent.children.length > 0) {
        parent.children.forEach(element => {
          that.objectByPath[path + '/' + element._id] = element;
          that.indexByPath[path + '/' + element._id] = i;
          i++;
          indexChildren(element);
        });
      }
      // step back path
      const pathFragments = path.split('\/');
      pathFragments.pop();
      path = pathFragments.join('/');

    }
    indexChildren(this.form);
    this.pathByIndex.shift();
  }

  private step(path = null) {
    // No path? Go to the next path.
    if (path === null) {
      this.currentPathIndex++;
      this.currentPath = this.pathByIndex[this.currentPathIndex];
      if (this.currentPath == null) {
        return this.done();
      }
    } else {
      this.currentPathIndex = this.indexByPath[path];
      this.currentPath = path;
    }
    const nextObject = this.objectByPath[this.currentPath];
    if (nextObject.collection === 'section') {
      this.currentSection = nextObject;
      const shouldSkip = false;
      if (nextObject.preCondition !== '') {
        const variables = this.result.variables;
        const skipLogic = 'var preCondition = function() { ' + nextObject.preCondition + ' }; shouldSkip = preCondition();';
        console.log('Executing skipLogic:');
        console.log(skipLogic);
        eval(skipLogic);
      }
      if (shouldSkip) {
        // Find the next sibling section.
        let i = this.currentPathIndex;
        let nextSiblingPath = null;
        const sectionDepth = (this.currentPath.split('\/')).length;
        while (nextSiblingPath == null) {
          i++;
          const nextPotentialSiblingPath = this.pathByIndex[i];
          if (nextPotentialSiblingPath) {
            const nextPotentialSiblingPathFragments = nextPotentialSiblingPath.split('\/');
            if (nextPotentialSiblingPathFragments.length === sectionDepth) {
              nextSiblingPath = nextPotentialSiblingPath;
            }
          } else {
            nextSiblingPath = 'done';
          }
        }
        if (nextSiblingPath === 'done') {
          this.done();
        } else {
          return this.step(nextSiblingPath);
        }
      }
      return this.step();
    } else {
      this.currentPage = nextObject;
      this.showCurrentPage();
      return;
    }
  }

  private showCurrentPage() {
    // TODO: Using this.currentPage, set up the new TangerinePageComponent.
  }

  private onTangerinePageUpdate(datum) {
    if (datum.status === 'VALID') {
      this.disableNext = false;
    }
    console.log(datum);
  }

  private onClickNext() {
    // TODO: Programatically submit this.pageComponent and then do stuff.
    this.result.log.push({
      time: (new Date()).toUTCString(),
      action: 'pageSubmit',
      data: this.form.value
    });
    this.result.variables = Object.assign(this.result.variables, this.pageComponent.model);
    this.step();
  }

  private done() {
    this.binderDone.emit(this.result);
  }

}
