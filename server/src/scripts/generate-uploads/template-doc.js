exports.doc = {
  "_id": "c0bae228-d9c7-4b93-9d41-b3754943d63f",
  "collection": "TangyFormResponse",
  "form": {
    "title": "Example Form",
    "complete": true,
    "linearMode": false,
    "hideClosedItems": false,
    "hideCompleteFab": false,
    "tabIndex": 1,
    "showResponse": true,
    "showSummary": false,
    "hasSummary": false,
    "onSubmit": "",
    "id": "example",
    "tagName": "TANGY-FORM"
  },
  "items": [
    {
      "id": "item_1",
      "title": "item1",
      "summary": false,
      "hideButtons": false,
      "hideBackButton": true,
      "rightToLeft": false,
      "hideNextButton": true,
      "showCompleteButton": false,
      "inputs": [
        {
          "name": "first_name",
          "private": false,
          "label": "What is your first name?",
          "type": "",
          "errorMessage": "",
          "required": false,
          "disabled": true,
          "hidden": false,
          "invalid": false,
          "incomplete": true,
          "value": "",
          "allowedPattern": "",
          "min": "",
          "max": "",
          "tagName": "TANGY-INPUT"
        },
        {
          "name": "middle_name",
          "private": false,
          "label": "What is your middle name?",
          "type": "",
          "errorMessage": "",
          "required": false,
          "disabled": true,
          "hidden": false,
          "invalid": false,
          "incomplete": true,
          "value": "",
          "allowedPattern": "",
          "min": "",
          "max": "",
          "tagName": "TANGY-INPUT"
        },
        {
          "name": "last_name",
          "private": false,
          "label": "What is your last name?",
          "type": "",
          "errorMessage": "",
          "required": false,
          "disabled": true,
          "hidden": false,
          "invalid": false,
          "incomplete": true,
          "value": "",
          "allowedPattern": "",
          "min": "",
          "max": "",
          "tagName": "TANGY-INPUT"
        },
        {
          "name": "fruit_selection",
          "value": [
            {
              "name": "Orange",
              "label": "Orange",
              "required": false,
              "disabled": false,
              "invalid": false,
              "incomplete": true,
              "hidden": false,
              "value": "",
              "tagName": "TANGY-RADIO-BUTTON"
            },
            {
              "name": "Banana",
              "label": "Banana",
              "required": false,
              "disabled": false,
              "invalid": false,
              "incomplete": true,
              "hidden": false,
              "value": "",
              "tagName": "TANGY-RADIO-BUTTON"
            },
            {
              "name": "Tangerine",
              "label": "Tangerine",
              "required": false,
              "disabled": false,
              "invalid": false,
              "incomplete": true,
              "hidden": false,
              "value": "",
              "tagName": "TANGY-RADIO-BUTTON"
            }
          ],
          "required": false,
          "disabled": true,
          "label": "What is your favorite fruit?",
          "hidden": false,
          "invalid": false,
          "incomplete": true,
          "tagName": "TANGY-RADIO-BUTTONS"
        },
        {
          "name": "orange",
          "tagName": "OPTION",
          "constructorName": "HTMLOptionElement",
          "disabled": true
        },
        {
          "name": "banana",
          "tagName": "OPTION",
          "constructorName": "HTMLOptionElement",
          "disabled": true
        },
        {
          "name": "tangerine",
          "tagName": "OPTION",
          "constructorName": "HTMLOptionElement",
          "disabled": true
        },
        {
          "name": "fruit_selection_2",
          "value": "",
          "required": false,
          "disabled": true,
          "label": "What is your second favorite fruit?",
          "secondaryLabel": "",
          "hidden": false,
          "invalid": false,
          "incomplete": true,
          "tagName": "TANGY-SELECT"
        },
        {
          "name": "orange",
          "tagName": "OPTION",
          "constructorName": "HTMLOptionElement",
          "disabled": true
        },
        {
          "name": "banana",
          "tagName": "OPTION",
          "constructorName": "HTMLOptionElement",
          "disabled": true
        },
        {
          "name": "tangerine",
          "tagName": "OPTION",
          "constructorName": "HTMLOptionElement",
          "disabled": true
        },
        {
          "name": "fruit_time",
          "value": [
            {
              "name": "Morning",
              "label": "Morning",
              "required": false,
              "disabled": false,
              "invalid": false,
              "incomplete": true,
              "hidden": false,
              "value": "",
              "tagName": "TANGY-CHECKBOX"
            },
            {
              "name": "Afternoon",
              "label": "Afternoon",
              "required": false,
              "disabled": false,
              "invalid": false,
              "incomplete": true,
              "hidden": false,
              "value": "",
              "tagName": "TANGY-CHECKBOX"
            },
            {
              "name": "Evening",
              "label": "Evening",
              "required": false,
              "disabled": false,
              "invalid": false,
              "incomplete": true,
              "hidden": false,
              "value": "",
              "tagName": "TANGY-CHECKBOX"
            }
          ],
          "atLeast": 0,
          "required": false,
          "disabled": true,
          "label": "What time do you take fruit?",
          "hidden": false,
          "incomplete": true,
          "invalid": false,
          "tagName": "TANGY-CHECKBOXES"
        },
        {
          "name": "morning",
          "tagName": "OPTION",
          "constructorName": "HTMLOptionElement",
          "disabled": true
        },
        {
          "name": "afternoon",
          "tagName": "OPTION",
          "constructorName": "HTMLOptionElement",
          "disabled": true
        },
        {
          "name": "evening",
          "tagName": "OPTION",
          "constructorName": "HTMLOptionElement",
          "disabled": true
        },
        {
          "name": "location",
          "value": [],
          "required": false,
          "invalid": false,
          "locationSrc": "./assets/location-list.json",
          "showLevels": "county,school",
          "hidden": false,
          "disabled": true,
          "filterBy": "county2",
          "filterByGlobal": true,
          "tagName": "TANGY-LOCATION"
        },
        {
          "name": "gps",
          "value": {
            "latitude": 44.4529961,
            "longitude": -73.1958883,
            "accuracy": 20
          },
          "required": false,
          "hideAccuracyDistance": false,
          "hideAccuracyLevel": false,
          "hideCoordinates": false,
          "disabled": true,
          "invalid": false,
          "inGeofence": false,
          "tagName": "TANGY-GPS"
        },
        {
          "name": "pronounse_fruits",
          "value": [
            {
              "name": "orange",
              "value": "",
              "disabled": true,
              "highlighted": false,
              "pressed": false,
              "tagName": "TANGY-TOGGLE-BUTTON",
              "hidden": true
            },
            {
              "name": "banana",
              "value": "",
              "disabled": true,
              "highlighted": false,
              "pressed": false,
              "tagName": "TANGY-TOGGLE-BUTTON",
              "hidden": true
            },
            {
              "name": "tangerine",
              "value": "",
              "disabled": true,
              "highlighted": false,
              "pressed": false,
              "tagName": "TANGY-TOGGLE-BUTTON",
              "hidden": true
            },
            {
              "name": "kiwi",
              "value": "",
              "disabled": true,
              "highlighted": false,
              "pressed": false,
              "tagName": "TANGY-TOGGLE-BUTTON",
              "hidden": true
            },
            {
              "name": "coconut",
              "value": "",
              "disabled": true,
              "highlighted": false,
              "pressed": false,
              "tagName": "TANGY-TOGGLE-BUTTON",
              "hidden": true
            },
            {
              "name": "strawberry",
              "value": "",
              "disabled": true,
              "highlighted": true,
              "pressed": false,
              "tagName": "TANGY-TOGGLE-BUTTON",
              "hidden": true
            }
          ],
          "mode": "TANGY_TIMED_MODE_DISABLED",
          "duration": 20,
          "columns": 3,
          "showLabels": true,
          "invalid": false,
          "incomplete": true,
          "required": true,
          "disabled": true,
          "timeRemaining": 20,
          "startTime": 1538913228280,
          "endTime": 1538913229126,
          "tagName": "TANGY-TIMED"
        }
      ],
      "open": true,
      "incomplete": false,
      "disabled": false,
      "hidden": false,
      "locked": true,
      "tagName": "TANGY-FORM-ITEM"
    },
    {
      "id": "item-2",
      "title": "Item 2",
      "summary": false,
      "hideButtons": false,
      "hideBackButton": true,
      "rightToLeft": false,
      "hideNextButton": true,
      "showCompleteButton": true,
      "inputs": [
        {
          "tagName": "TANGY-CARDS",
          "name": "cars",
          "value": [
            {
              "tagName": "TANGY-CARD",
              "name": "558b531a-798c-4cad-9405-ac2e93f74f9d",
              "value": [
                {
                  "name": "make",
                  "private": false,
                  "label": "Make",
                  "type": "",
                  "errorMessage": "",
                  "required": false,
                  "disabled": false,
                  "hidden": false,
                  "invalid": false,
                  "incomplete": true,
                  "value": "Toyota",
                  "allowedPattern": "",
                  "min": "",
                  "max": "",
                  "tagName": "TANGY-INPUT"
                },
                {
                  "name": "model",
                  "private": false,
                  "label": "Model",
                  "type": "",
                  "errorMessage": "",
                  "required": false,
                  "disabled": false,
                  "hidden": false,
                  "invalid": false,
                  "incomplete": true,
                  "value": "Prius",
                  "allowedPattern": "",
                  "min": "",
                  "max": "",
                  "tagName": "TANGY-INPUT"
                },
                {
                  "name": "year",
                  "private": false,
                  "label": "Year",
                  "type": "number",
                  "errorMessage": "",
                  "required": false,
                  "disabled": false,
                  "hidden": false,
                  "invalid": false,
                  "incomplete": true,
                  "value": "2005",
                  "allowedPattern": "",
                  "min": "",
                  "max": "",
                  "tagName": "TANGY-INPUT"
                }
              ],
              "label": "",
              "disabled": false,
              "invalid": false,
              "incomplete": true,
              "hidden": false
            },
            {
              "tagName": "TANGY-CARD",
              "name": "453d07d8-c898-498f-8183-ce95eb0ef5ed",
              "value": [
                {
                  "name": "make",
                  "private": false,
                  "label": "Make",
                  "type": "",
                  "errorMessage": "",
                  "required": false,
                  "disabled": false,
                  "hidden": false,
                  "invalid": false,
                  "incomplete": true,
                  "value": "Honda",
                  "allowedPattern": "",
                  "min": "",
                  "max": "",
                  "tagName": "TANGY-INPUT"
                },
                {
                  "name": "model",
                  "private": false,
                  "label": "Model",
                  "type": "",
                  "errorMessage": "",
                  "required": false,
                  "disabled": false,
                  "hidden": false,
                  "invalid": false,
                  "incomplete": true,
                  "value": "Civic",
                  "allowedPattern": "",
                  "min": "",
                  "max": "",
                  "tagName": "TANGY-INPUT"
                },
                {
                  "name": "year",
                  "private": false,
                  "label": "Year",
                  "type": "number",
                  "errorMessage": "",
                  "required": false,
                  "disabled": false,
                  "hidden": false,
                  "invalid": false,
                  "incomplete": true,
                  "value": "2010",
                  "allowedPattern": "",
                  "min": "",
                  "max": "",
                  "tagName": "TANGY-INPUT"
                }
              ],
              "label": "",
              "disabled": false,
              "invalid": false,
              "incomplete": true,
              "hidden": false
            }
          ],
          "label": "",
          "disabled": true,
          "invalid": false,
          "incomplete": true,
          "hidden": false
        }
      ],
      "open": true,
      "incomplete": false,
      "disabled": false,
      "hidden": false,
      "locked": true,
      "tagName": "TANGY-FORM-ITEM"
    }
  ],
  "complete": true,
  "focusIndex": 1,
  "nextFocusIndex": -1,
  "previousFocusIndex": 0,
  "startDatetime": "10/7/2018, 7:53:16 AM",
  "startUnixtime": 1538913196161,
  "uploadDatetime": "",
  "previousItemId": "item_1",
  "progress": 0
} 
