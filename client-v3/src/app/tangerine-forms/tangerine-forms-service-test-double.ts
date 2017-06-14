import {Validators, FormGroup} from '@angular/forms';

export class TangerineFormsServiceTestDouble {
    simpleForm: object = {
        _id: 'simpleForm',
        _rev: '3-045b5094-e6c8-4603-8c12-f909eae744de',
        collection: 'Form',
        formRevision: 'ced3aca4-3101-11e7-93ae-92361f002671',
        formSchemaId: 'dd74f132-3101-11e7-93ae-92361f002671',
        status: 'published',
        title: 'Form for School Observations',
        children: [
            {
                _id: 'section0',
                collection: 'section',
                title: 'Section 0 - Questions',
                preCondition: '',
                children: [
                    {
                        _id: 'section0page1',
                        title: 'Very simple questions',
                        collection: 'Page',
                        config: [{
                            className: 'row',
                            fieldGroup: [{
                                key: 'question1',
                                type: 'input',
                                templateOptions: {
                                    type: 'text',
                                    label: 'Question 1'
                                },
                                validators: {
                                validation: Validators.compose([Validators.required])
                                }
                            }, {
                                key: 'question2',
                                type: 'input',
                                templateOptions: {
                                    type: 'text',
                                    label: 'Question 2'
                                },
                                validators: {
                                validation: Validators.compose([Validators.required])
                                }
                            }]
                        }]
                    },
                    {
                        _id: 'section0page2',
                        title: 'Very simple questions 2',
                        collection: 'Page',
                        config: [{
                            className: 'row',
                            fieldGroup: [{
                                key: 'question3',
                                type: 'input',
                                templateOptions: {
                                    type: 'text',
                                    label: 'Question 3'
                                },
                                validators: {
                                validation: Validators.compose([Validators.required])
                                }
                            }, {
                                key: 'question4',
                                type: 'input',
                                templateOptions: {
                                    type: 'text',
                                    label: 'Question 4'
                                },
                                validators: {
                                validation: Validators.compose([Validators.required])
                                }
                            }]
                        }]
                    }
                ]
            }
        ]
    };

    // TODO
    deepSectionForm: object = {

    };

    flatSectionForm: object = {
        _id: 'simpleForm',
        _rev: '3-045b5094-e6c8-4603-8c12-f909eae744de',
        collection: 'Form',
        formRevision: 'ced3aca4-3101-11e7-93ae-92361f002671',
        formSchemaId: 'dd74f132-3101-11e7-93ae-92361f002671',
        status: 'published',
        title: 'Form for School Observations',
        children: [
            {
                _id: 'section0',
                collection: 'section',
                title: 'Section 0',
                preCondition: '',
                children: [
                    {
                        _id: 'section0page1',
                        title: 'Very simple questions',
                        collection: 'Page',
                        config: [{
                            className: 'row',
                            fieldGroup: [{
                                key: 'question1',
                                type: 'input',
                                templateOptions: {
                                    type: 'text',
                                    label: 'Question 1'
                                },
                                validators: {
                                validation: Validators.compose([Validators.required])
                                }
                            }, {
                                key: 'question2',
                                type: 'input',
                                templateOptions: {
                                    type: 'text',
                                    label: 'Question 2'
                                },
                                validators: {
                                validation: Validators.compose([Validators.required])
                                }
                            }]
                        }]
                    }
                ]
            },
            {
                _id: 'section1',
                collection: 'section',
                title: 'Section 1',
                preCondition: '',
                children: [
                    {
                        _id: 'section0page2',
                        title: 'Very simple questions 2',
                        collection: 'Page',
                        config: [{
                            className: 'row',
                            fieldGroup: [{
                                key: 'question3',
                                type: 'input',
                                templateOptions: {
                                    type: 'text',
                                    label: 'Question 3'
                                },
                                validators: {
                                validation: Validators.compose([Validators.required])
                                }
                            }, {
                                key: 'question4',
                                type: 'input',
                                templateOptions: {
                                    type: 'text',
                                    label: 'Question 4'
                                },
                                validators: {
                                validation: Validators.compose([Validators.required])
                                }
                            }]
                        }]
                    }
                ]
            }
        ]
    };

    multiStepFormWithSkipLogic: object = {
      _id: '43a883f3-9277-42ec-b93b-f037b8a3da4a',
      _rev: '1-045b5094-e6c8-4603-8c12-f909eae744de',
      title: 'Form for School Observations Spreadsheet v3',
      collection: 'Form',
      status: 'published',
      schemaRevId: 'dd74f132-3101-11e7-93ae-92361f002671',
      children: [
        {
          _id: 'section0',
          collection: 'section',
          title: 'Section 0 - A Fateful Question',
          preCondition: '',
          children: [
            {
              _id: 'section0page1',
              title: 'Where would you like to go?',
              collection: 'Page',
              config: [
                {
                  type: 'array',
                  name: 'answer_questions_about_cars_and_boats',
                  label: 'Would you like to answer some questions about cars and boats?',
                  selections: [
                    'yes',
                    'no'
                  ]
                }
              ]
            }
          ]
        },
        {
          _id: 'section1',
          collection: 'section',
          title: 'Section 1: Car Surveys',
          preCondition: 'if (variables.answer_questions_about_cars_and_boats == \'no\') { return true; }',
          children: [
            {
              _id: 'section1A',
              collection: 'section',
              title: 'Section 1A - Cars',
              preCondition: '',
              children: [
                {
                  _id: 'section1Apage1',
                  title: 'Car Engines',
                  collection: 'Page',
                  config: [
                    {
                      type: 'array',
                      name: 'car_engine_favorite',
                      label: 'What is your favorite type of engine?',
                      selections: [
                        'Electric',
                        'Diesel',
                        'Gasoline'
                      ]
                    },
                    {
                      type: 'text',
                      name: 'car_engine_name',
                      label: 'What was the name of your favorite engine?',
                      required: true
                    }
                  ]
                },
                {
                  _id: 'section1Apage2',
                  title: 'Car Colors',
                  collection: 'Page',
                  config: [
                    {
                      type: 'array',
                      name: 'car_color_favorite',
                      label: 'What your favorite color of car?',
                      selections: [
                        'Blue',
                        'Green',
                        'Yellow',
                        'Red'
                      ]
                    }
                  ]
                }
              ]
            },
            {
              _id: 'section1B',
              collection: 'section',
              title: 'Section 1B - Boats',
              preCondition: '',
              children: [
                {
                  _id: 'section1Bpage1',
                  title: 'Boat Engines',
                  collection: 'Page',
                  config: [
                    {
                      type: 'array',
                      name: 'boat_engine_favorite',
                      label: 'What is your favorite type of engine?',
                      selections: [
                        'Electric',
                        'Diesel',
                        'Gasoline'
                      ]
                    },
                    {
                      type: 'text',
                      name: 'boat_engine_name',
                      label: 'What was the name of your favorite engine?',
                      required: true
                    }
                  ]
                },
                {
                  _id: 'section1Bpage2',
                  title: 'Boat Colors',
                  collection: 'Page',
                  config: [
                    {
                      type: 'array',
                      name: 'boat_color_favorite',
                      label: 'What your favorite color of boat?',
                      selections: [
                        'Blue',
                        'Green',
                        'Yellow',
                        'Red'
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          _id: 'section3',
          collection: 'section',
          title: 'Section 3 - Another Fateful Section',
          preCondition: '',
          children: [
            {
              _id: 'section3page1',
              title: 'Where would you like to go?',
              collection: 'Page',
              config: [
                {
                  type: 'array',
                  name: 'answer_questions_about_cats_and_binders',
                  label: 'Would you like to answer some questions about cats and binders?',
                  selections: [
                    'yes',
                    'no'
                  ]
                }
              ]
            }
          ]
        },
        {
          _id: 'section4',
          collection: 'section',
          title: 'Section 4 - Binders and Cats',
          preCondition: 'if (variables.answer_questions_about_cats_and_binders == \'no\') { return true; }',
          children: [
            {
              _id: 'section4page1',
              title: 'Binder Questions',
              collection: 'Page',
              config: [
                {
                  type: 'array',
                  name: 'binder_opinion',
                  label: 'What do you think of binders?',
                  selections: [
                    'Good',
                    'Great',
                    'Dislike',
                    'Unproven'
                  ]
                },
                {
                  type: 'text',
                  name: 'favorite_binder',
                  label: 'What was the name of your favorite binder?',
                  required: true
                }
              ]
            },
            {
              _id: 'section4page2',
              title: 'Cat Questions',
              collection: 'Page',
              config: [
                {
                  type: 'array',
                  name: 'cat_opinion',
                  label: 'What do you think of cats?',
                  selections: [
                    'Good',
                    'Great',
                    'Dislike',
                    'Unproven'
                  ]
                },
                {
                  type: 'text',
                  name: 'favorite_cat',
                  label: 'What was the name of your favorite cat?',
                  required: true
                }
              ]
            }
          ]
        }
      ]
    };

    get (formId) {
        return this[formId];
    };

}
