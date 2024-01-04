import {Feedback} from "./feedback";
import { Injectable } from "@angular/core";
import {MediaInput} from "../media-input-editor/media-input-item";

@Injectable()
export class FormMetadata {
  id: string;
  title: string;
  src: string;
  feedbackItems:Array<Feedback>
  mediaInputItems:Array<MediaInput>
}
