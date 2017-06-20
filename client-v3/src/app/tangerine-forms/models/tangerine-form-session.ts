import { TangerineFormSection } from './tangerine-form-section';

export class TangerineFormSession {
  id: '';
  formId: '';
  sectionIndex: number;
  pageIndex: number;
  markedDone = false;
  sections: Array<TangerineFormSection>;
}
