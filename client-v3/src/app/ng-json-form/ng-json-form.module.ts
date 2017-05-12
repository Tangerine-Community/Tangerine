import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgJsonFormComponent } from './ng-json-form/ng-json-form.component';
import { NgJsonFormQuestionComponent } from './ng-json-form-question/ng-json-form-question.component';

export { NgJsonFormComponent }

@NgModule({
  imports: [
    CommonModule, ReactiveFormsModule, BrowserModule
  ],
  exports: [NgJsonFormComponent],
  declarations: [NgJsonFormComponent, NgJsonFormQuestionComponent]
})
export class NgJsonFormModule { }
