
import { TangerineFormsServiceTestDouble } from './tangerine-forms-service-test-double';
import { PathMap } from './path-map';

describe('PathMap', () => {

  beforeEach(() => {
  });

  it('should be created', () => {
      const service = new TangerineFormsServiceTestDouble;
      const formObject = service.get('simpleForm');
      const pathMap = new PathMap(formObject);
      expect(JSON.stringify(pathMap.indexByPath)).toBe(`{"/simpleForm/section0":0,"/simpleForm/section0/section0page1":1,"/simpleForm/section0/section0page2":2}`);
      expect(JSON.stringify(pathMap.pathByIndex)).toBe(`["/simpleForm/section0","/simpleForm/section0/section0page1","/simpleForm/section0/section0page2"]`);
      // TODO: This is likely to break for now as things change in the Form schema.
      // expect(JSON.stringify(pathMap.objectByPath)).toBe(``);
  });

  it('should be created with a complex form', () => {
      const service = new TangerineFormsServiceTestDouble;
      const formObject = service.get('multiStepFormWithSkipLogic');
      const pathMap = new PathMap(formObject);
      expect(JSON.stringify(pathMap.indexByPath)).toBe(`{"/43a883f3-9277-42ec-b93b-f037b8a3da4a/section0":0,"/43a883f3-9277-42ec-b93b-f037b8a3da4a/section0/section0page1":1,"/43a883f3-9277-42ec-b93b-f037b8a3da4a/section1":2,"/43a883f3-9277-42ec-b93b-f037b8a3da4a/section1/section1A":3,"/43a883f3-9277-42ec-b93b-f037b8a3da4a/section1/section1A/section1Apage1":4,"/43a883f3-9277-42ec-b93b-f037b8a3da4a/section1/section1A/section1Apage2":5,"/43a883f3-9277-42ec-b93b-f037b8a3da4a/section1/section1B":6,"/43a883f3-9277-42ec-b93b-f037b8a3da4a/section1/section1B/section1Bpage1":7,"/43a883f3-9277-42ec-b93b-f037b8a3da4a/section1/section1B/section1Bpage2":8,"/43a883f3-9277-42ec-b93b-f037b8a3da4a/section3":9,"/43a883f3-9277-42ec-b93b-f037b8a3da4a/section3/section3page1":10,"/43a883f3-9277-42ec-b93b-f037b8a3da4a/section4":11,"/43a883f3-9277-42ec-b93b-f037b8a3da4a/section4/section4page1":12,"/43a883f3-9277-42ec-b93b-f037b8a3da4a/section4/section4page2":13}`);
      expect(JSON.stringify(pathMap.pathByIndex)).toBe(`["/43a883f3-9277-42ec-b93b-f037b8a3da4a/section0","/43a883f3-9277-42ec-b93b-f037b8a3da4a/section0/section0page1","/43a883f3-9277-42ec-b93b-f037b8a3da4a/section1","/43a883f3-9277-42ec-b93b-f037b8a3da4a/section1/section1A","/43a883f3-9277-42ec-b93b-f037b8a3da4a/section1/section1A/section1Apage1","/43a883f3-9277-42ec-b93b-f037b8a3da4a/section1/section1A/section1Apage2","/43a883f3-9277-42ec-b93b-f037b8a3da4a/section1/section1B","/43a883f3-9277-42ec-b93b-f037b8a3da4a/section1/section1B/section1Bpage1","/43a883f3-9277-42ec-b93b-f037b8a3da4a/section1/section1B/section1Bpage2","/43a883f3-9277-42ec-b93b-f037b8a3da4a/section3","/43a883f3-9277-42ec-b93b-f037b8a3da4a/section3/section3page1","/43a883f3-9277-42ec-b93b-f037b8a3da4a/section4","/43a883f3-9277-42ec-b93b-f037b8a3da4a/section4/section4page1","/43a883f3-9277-42ec-b93b-f037b8a3da4a/section4/section4page2"]`);
      // TODO: This is likely to break for now as things change in the Form schema.
      // expect(JSON.stringify(pathMap.objectByPath)).toBe(``);
  });

});
