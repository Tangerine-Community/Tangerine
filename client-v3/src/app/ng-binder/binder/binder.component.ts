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
  currentSection: object = {'title':''};
  currentPage: object;
  currentPathIndex: number = 0;
  currentPath: string = '';
  result: Array<any> = [];
  objectsByPath: object = {};
  pathsByIndex: Array<any> = [];
  orderIndexByPath: object = {};
  @ViewChild(TdDynamicFormsComponent) form: TdDynamicFormsComponent;
  constructor() { }

   ngOnInit() {
    //this.currentPage = this.config[this.pageNumber];
    //let foo = this.flatten(this.config);
    this.organize();
    this.step(false);
  }
  ngAfterViewInit() {
    this.form.form.valueChanges.subscribe( () => {
      console.log(this.form.value);
    });
  }

  organize() {;
    let path = '';
    let i = 0;
    var that = this;
    function indexChildren(parent) {
      // step forward path
      path += `/${parent._id}`;
      that.pathsByIndex.push(path);
      if (parent.children && parent.children.length > 0) {
        parent.children.forEach(element => {
          that.objectsByPath[path + '/' + element._id] = element;
          that.orderIndexByPath[path + '/' + element._id] = i;
          i++;
          indexChildren(element);
        });
      }
      // step back path
      var frags = path.split('\/');
      frags.pop();
      path = frags.join('/');

    }
    indexChildren(this.config);
    this.pathsByIndex.shift();
  }

  step(iterate = true) {
    if (iterate !== false) {
      this.currentPathIndex++;
    }
    this.currentPath = this.pathsByIndex[this.currentPathIndex];
    if (this.currentPath == null) {
      return this.binderDone.emit(this.result);
    }
    const nextObject = this.objectsByPath[this.currentPath];
    if (nextObject.collection === 'section') {
      this.currentSection = nextObject;
      return this.step();
    }
    this.currentPage = nextObject;
  }

  onNextClick() {
    this.result.push(this.form.value);
    this.step();
  }

}
