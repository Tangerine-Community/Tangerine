
export class StudentResult {
  id: string;
  name: string;
  classId:string;
  forms:[];
  response:any;
  score:any;
  max:any;
  scorePercentageCorrect:number;
  maxValueAnswer:number;
  totalCorrect:number;
  formTitle:string;
  studentId:string;
  category:string;
  customScore: Number
  results:Array<StudentResult>;
}
