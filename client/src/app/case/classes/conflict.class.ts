import {DiffInfo} from "../../sync/classes/diff-info.class";
import {MergeInfo} from "../../sync/classes/merge-info.class";

export class Conflict {
  diffInfo: DiffInfo
  mergeInfo: MergeInfo
  type: string
  docType: string
  merged: boolean
  error: string
}
