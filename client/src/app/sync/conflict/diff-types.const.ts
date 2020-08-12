import { diffType_EventForm_FormResponseIDCreated } from './diff-type--event-form--form-response-id-created';
import {diffType_EventForm_Complete} from "./diff-type--event-form--complete";
import {diffType_Response_Complete, diffType_Response_Inputs} from "./diff-type--response";

export interface DiffTypes {
  type: string
  diffType: string
}

export interface CaseDiffTypes extends DiffTypes {
  type: string
  detect: any
  resolve: any
  diffType: string
}

export interface ResponseDiffTypes extends DiffTypes {
  type: string
  detect: any
  resolve: any
  diffType: string
}

export const DIFF_TYPES = [
  diffType_EventForm_FormResponseIDCreated,
  diffType_EventForm_Complete,
  diffType_Response_Complete,
  diffType_Response_Inputs
]

