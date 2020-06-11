import {Feedback} from "./feedback";
import { Injectable } from "@angular/core";

@Injectable()
export class FormMetadata {
  id: string;
  title: string;
  src: string;
  feedbackItems:Array<Feedback>
}
