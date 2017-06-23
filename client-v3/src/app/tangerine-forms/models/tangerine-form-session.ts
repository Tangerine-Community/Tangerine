import { TangerineFormPage } from './tangerine-form-page';

export class TangerineFormSession {
  id: '';
  formId: '';
  sectionIndex: number;
  pageIndex: number;
  status = 'INITIALIZED';
  pages: Array<TangerineFormPage>;
  model: any = {};
  swipe = 'RIGHT';
}
