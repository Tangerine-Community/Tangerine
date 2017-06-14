
import { TangerineFormsServiceTestDouble } from './tangerine-forms-service-test-double';
import { TangerineForm } from './tangerine-form';

describe('TangerineForm', () => {

  beforeEach(() => {
  });

  it('should be created with a simple form', () => {
      const service = new TangerineFormsServiceTestDouble;
      const formObject = service.get('simpleForm');
      const tangerineForm = new TangerineForm(formObject);
      // No expect, just looking for Errors thrown.
  });

  it('should be created with a complex form', () => {
      const service = new TangerineFormsServiceTestDouble;
      const formObject = service.get('multiStepFormWithSkipLogic');
      // TODO: No expect, just looking for Errors thrown.
  });

  it('should find first page with no path', () => {
    const service = new TangerineFormsServiceTestDouble;
    const formObject = service.get('simpleForm');
    const tangerineForm = new TangerineForm(formObject);
    const firstPath = '';
    const nextPath = tangerineForm.pathMap.pathByIndex[1];
    const context = tangerineForm.findContextFromPath(firstPath);
    expect(context.pagePath).toBe(nextPath);
  });

  it('should find next page from path and be marked as last page', () => {
      const service = new TangerineFormsServiceTestDouble;
      const formObject = service.get('simpleForm');
      const tangerineForm = new TangerineForm(formObject);
      const firstPath = tangerineForm.pathMap.pathByIndex[1];
      const nextPath = tangerineForm.pathMap.pathByIndex[2];
      const context = tangerineForm.findNextContextFromPath(firstPath);
      expect(context.pagePath).toBe(nextPath);
      expect(context.isLastPage).toBe(true);
  });

  it('in flatSectionForm should find next page from path and be marked as last page', () => {
      const service = new TangerineFormsServiceTestDouble;
      const formObject = service.get('flatSectionForm');
      const tangerineForm = new TangerineForm(formObject);
      const firstPath = tangerineForm.pathMap.pathByIndex[1];
      const nextPath = tangerineForm.pathMap.pathByIndex[3];
      const context = tangerineForm.findNextContextFromPath(firstPath);
      expect(context.pagePath).toBe(nextPath);
      expect(context.isLastPage).toBe(true);
  });
}); ;
