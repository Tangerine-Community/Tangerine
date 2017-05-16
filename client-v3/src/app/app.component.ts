import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Tangerine Form Demo';
  binderConfig: object;
  result: object;
  constructor() {
    this.binderConfig = {
      _id: "43a883f3-9277-42ec-b93b-f037b8a3da4a",
      _rev: "1-045b5094-e6c8-4603-8c12-f909eae744de",
      title: "Binder for School Observations Spreadsheet v3",
      collection: "Binder",
      status: "published",
      spreadsheetId: "ced3aca4-3101-11e7-93ae-92361f002671",
      spreadsheetRevision: "ced3aca4-3101-11e7-93ae-92361f002671",
      spreadsheetSchemaId: "dd74f132-3101-11e7-93ae-92361f002671",
      children: [
        {
          _id: "one",
          collection: "section",
          title: "Section 1: Car Surveys",
          stopwatch: true,
          time_limit: "5 minutes",
          code: "function(event, variables, scope, callback) { ... }",
          declarations: [ ],
          imports: [ ],
          repeatable: true,
          sheetName: 'Student Observations for English P2',
          columnName: 'Student Observations for English P2',
          repeatN: 3,
          forkable: true,
          children: [
            {
              _id: "oneA",
              collection: "section",
              title: "Section 1a: Cars",
              stopwatch: true,
              time_limit: "5 minutes",
              code: "function(event, variables, scope, callback) { ... }",
              declarations: [ ],
              imports: [ ],
              repeatable: true,
              sheetName: 'Student Observations for English P2',
              columnName: 'Student Observations for English P2',
              repeatN: 3,
              forkable: true,
              children: [
                {
                  _id: "1",
                  title: "Car Engines",
                  collection: "Page",
                  columnNames: [ "Column Name 1", "Column Name 2" ],
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
                  _id: "2",
                  title: "Car Colors",
                  collection: "Page",
                  columnNames: [ "Column Name 1", "Column Name 2" ],
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
              _id: "oneB",
              collection: "section",
              title: "Section 1b: Boats",
              stopwatch: true,
              time_limit: "5 minutes",
              code: "function(event, variables, scope, callback) { ... }",
              declarations: [ ],
              imports: [ ],
              repeatable: true,
              sheetName: 'Student Observations for English P2',
              columnName: 'Student Observations for English P2',
              repeatN: 3,
              forkable: true,
              children: [
                {
                  _id: "1",
                  title: "Boat Engines",
                  collection: "Page",
                  columnNames: [ "Column Name 1", "Column Name 2" ],
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
                  _id: "2",
                  title: "Car Colors",
                  collection: "Page",
                  columnNames: [ "Column Name 1", "Column Name 2" ],
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
          _id: "b",
          collection: "section",
          title: "Section 2: Binders and Cats",
          stopwatch: true,
          time_limit: "5 minutes",
          code: "function(event, variables, scope, callback) { ... }",
          declarations: [ ],
          imports: [ ],
          repeatable: true,
          sheetName: 'Student Observations for English P3',
          columnName: 'Student Observations for English P3',
          repeatN: 3,
          forkable: true,
          children: [
            {
              _id: "3",
              title: "Page 1",
              collection: "Page",
              columnNames: [ "Column Name 1", "Column Name 2" ],
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
              _id: "4",
              title: "Page 2",
              collection: "Page",
              columnNames: [ "Column Name 1", "Column Name 2" ],
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
  }


  onBinderDone(data) {
    this.result = data;
    console.log(data);
  }
}
