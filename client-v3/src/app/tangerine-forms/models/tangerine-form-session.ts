import { TangerineFormPage } from './tangerine-form-page';

export class TangerineFormSession {
  id: '';
  formId: '';
  sectionIndex: number;
  pageIndex: number;
  markedDone = false;
  pages: Array<TangerineFormPage>;
  model: any;
}
