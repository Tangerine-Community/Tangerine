import {Feedback} from "../../feedback";
import {StudentResult} from "./student-result";

export interface ClassGroupingReport {
  id: string;
  itemId: string;
  formId: string;
  subtestName: string;
  classSize:number;
  studentsAssessed:number;
  aveCorrectPerc:number;
  aveCorrect:number;
  attempted:number;
  max:number;
  duration:number;
  studentsToWatch:string[];
  feedback:Feedback;
  allStudentResults:Array<StudentResult>;
}
