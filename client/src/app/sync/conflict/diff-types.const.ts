import {
  diffType_EventForm
} from "./diff-type--event-form";
import {diffType_Event} from "./diff-type--event";

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
  diffType_Event,
  diffType_EventForm
]

