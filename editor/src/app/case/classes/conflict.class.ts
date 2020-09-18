import {DiffInfo} from "../../sync/diff-info.class";
import {MergeInfo} from "../../sync/merge-info.class";

export class Conflict {
  diffInfo: DiffInfo
  mergeInfo: MergeInfo
  type: string
  docType: string
  merged: boolean
  error: string
}
