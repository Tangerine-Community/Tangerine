import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
// import { TangerinePageComponent } from '../tangerine-page/tangerine-page.component';
import { TangerineFormResult } from '../tangerine-form-result';
import { TangerineForm } from '../tangerine-form';
import { TangerineFormContext } from '../tangerine-form-context';

@Component({
  selector: 'app-tangerine-form',
  templateUrl: './tangerine-form.component.html',
  styleUrls: ['./tangerine-form.component.css']
})
export class TangerineFormComponent implements OnInit {

  // IO.
  @Input() form: TangerineForm;
  @Input() result: TangerineFormResult;
  // TODO: If result used a setter, that setter could be in charge of emitting these events instead of having to remember to that
  // manually every time result is updated.
  @Output() resultUpdate: EventEmitter<Object> = new EventEmitter();
  @Output() resultDone: EventEmitter<Object> = new EventEmitter();

  // State is stored in Result, but from that state we need a valid context for our Template to work from.
  private _context: TangerineFormContext;

  constructor() {

  }

   ngOnInit() {

    // TODO: Could do this.result and this.form as a setter to instantiate the classes. Or maybe they should already be correct Class.
    if (!this.result) {
      this.result = new TangerineFormResult();
    }
    this.form = new TangerineForm(this.form);

    // Set the context.
    this.context = this.form.findContextFromPath(this.result.currentPath);
  }

  // Context used for template variables.
  set context(context) {
    this._context = context;
    this.result.currentPath = this.context.pagePath;
    // TODO: Save new path to log.
    // TODO Run skip logic.
  }
  get context() {
    return this._context;
  }

  private onTangerinePageUpdate(datum) {
    if (datum.status === 'VALID') {
      this.result.pageValid = true;
    }
    // this.result.currentPageVariables = datum.variables;
    this.result.variables = Object.assign(this.result.variables, datum.variables);
  }

  private saveCurrentResult(action = 'next') {
    this.result.log.push({
      time: (new Date()).toUTCString(),
      action: action
    });
    // this.result.currentPageStatus = '';
    if (action === 'complete') {
      this.result.complete = true;
    }
    this.resultUpdate.emit(this.result);
  }

  private onClickNext() {
    this.saveCurrentResult('next');
    this.context = this.form.findNextContextFromPath(this.result.currentPath);
  }

  private onClickDone() {
    this.saveCurrentResult('complete');
    this.resultDone.emit(this.result);
  }

        /*
        Skip logic stuff to be migrated up, or maybe into the Form Class.


        This stuff needs to go in the component I think.
        const nextObject = this.objectByPath[path];
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
            return nextSiblingPath;
            }
        }
        // return this.step();
        } else {
        this.currentPage = nextObject;
        this.showCurrentPage();
        return;
    }
    */
}
