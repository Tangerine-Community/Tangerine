import { Component, Input, Output, EventEmitter, OnInit, ViewChild, AfterViewInit } from '@angular/core';

import { TdDynamicFormsComponent } from '@covalent/dynamic-forms';

@Component({
  selector: 'app-binder',
  templateUrl: './binder.component.html',
  styleUrls: ['./binder.component.css']
})
export class BinderComponent implements OnInit {

  @Input() config: any;
  @Output() binderDone: EventEmitter<Object> = new EventEmitter();
  private currentSection: object = {'title':''};
  private currentPage: object;
  private currentPathIndex: number = 0;
  private currentPath: string = '';
  private log: Array<any> = [];
  private variables: object = {};
  private objectByPath: object = {};
  private pathByIndex: Array<any> = [];
  private indexByPath: object = {};
  @ViewChild(TdDynamicFormsComponent) form: TdDynamicFormsComponent;
  constructor() { }

   ngOnInit() {
    this.organize();
    this.step(this.pathByIndex[0]);
  }
  ngAfterViewInit() {
    this.form.form.valueChanges.subscribe( () => {
      console.log(this.form.value);
    });
  }

  private organize() {;
    let path = '';
    let i = 0;
    var that = this;
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
      var pathFragments = path.split('\/');
      pathFragments.pop();
      path = pathFragments.join('/');

    }
    indexChildren(this.config);
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
      var shouldSkip = false
      if (nextObject.preCondition !== '') {
        var variables = this.variables;
        var skipLogic = 'var preCondition = function() { ' + nextObject.preCondition + ' }; shouldSkip = preCondition();';
        console.log('Executing skipLogic:');
        console.log(skipLogic);
        eval(skipLogic);
      }
      if (shouldSkip) {
        // Find the next sibling section.
        var i = this.currentPathIndex;
        var nextSiblingPath = null;
        var sectionDepth = (this.currentPath.split('\/')).length;
        while (nextSiblingPath == null) {
          i++;
          var nextPotentialSiblingPath = this.pathByIndex[i];
          if (nextPotentialSiblingPath) {
            var nextPotentialSiblingPathFragments = nextPotentialSiblingPath.split('\/');
            if (nextPotentialSiblingPathFragments.length == sectionDepth) {
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
      return;
    }
  }

  private onPageSubmit() {
    this.log.push({
      time: (new Date()).toUTCString(),
      action: 'pageSubmit',
      data: this.form.value
    });
    this.variables = Object.assign(this.variables, this.form.value);
    this.step();
  }

  private done() {
    this.binderDone.emit({
      variables: this.variables,
      log: this.log
    });
  }

}