exports.doc = {
  "_id": "f49c3256-f056-46ea-aca2-4066d5df515f",
  "collection": "TangyFormResponse",
  "form": {
    "id": "field-demo",
    "complete": true,
    "linearMode": false,
    "hideClosedItems": false,
    "hideCompleteFab": false,
    "tabIndex": 1,
    "showResponse": true,
    "showSummary": false,
    "hasSummary": false,
    "tagName": "TANGY-FORM"
  },
  "items": [
    {
      "id": "text_inputs",
      "src": "../content/field-demo/text-inputs.html",
      "title": "Text Inputs",
      "summary": false,
      "hideButtons": false,
      "hideBackButton": true,
      "hideNextButton": true,
      "inputs": [
        {
          "name": "text_input_1",
          "private": false,
          "label": "This is an input for text.",
          "type": "text",
          "errorMessage": "",
          "required": false,
          "disabled": true,
          "hidden": false,
          "invalid": false,
          "incomplete": true,
          "value": "fekj",
          "allowedPattern": "",
          "tagName": "TANGY-INPUT"
        },
        {
          "name": "text_input_2",
          "private": false,
          "label": "This is an input for text that is required.",
          "type": "text",
          "errorMessage": "This is required.",
          "required": true,
          "disabled": true,
          "hidden": false,
          "invalid": false,
          "incomplete": true,
          "value": "lkj",
          "allowedPattern": "",
          "tagName": "TANGY-INPUT"
        },
        {
          "name": "text_input_3",
          "private": false,
          "label": "This text input is disabled.",
          "type": "text",
          "errorMessage": "",
          "required": false,
          "disabled": true,
          "hidden": false,
          "invalid": false,
          "incomplete": true,
          "value": "",
          "allowedPattern": "",
          "tagName": "TANGY-INPUT"
        },
        {
          "name": "text_input_4",
          "private": false,
          "label": "This text input requires a valid email address.",
          "type": "email",
          "errorMessage": "A valid email address is required.",
          "required": false,
          "disabled": true,
          "hidden": false,
          "invalid": false,
          "incomplete": true,
          "value": "lkj@kgd.co",
          "allowedPattern": "",
          "tagName": "TANGY-INPUT"
        },
        {
          "name": "text_input_5",
          "private": false,
          "label": "This is a text input that only uses `allowed-pattern` to prevent users from entering input other than numbers 1 - 7. See http://www.html5pattern.com/ for more examples of patterns.",
          "type": "text",
          "errorMessage": "",
          "required": false,
          "disabled": true,
          "hidden": false,
          "invalid": false,
          "incomplete": true,
          "value": "",
          "allowedPattern": "[1-7]",
          "tagName": "TANGY-INPUT"
        },
        {
          "name": "userProfileId",
          "value": "fb4c070e-9ba1-4278-bfba-e4258065ecb5"
        }
      ],
      "open": false,
      "incomplete": false,
      "disabled": false,
      "hidden": false,
      "locked": true,
      "tagName": "TANGY-FORM-ITEM"
    },
    {
      "id": "checkboxes",
      "src": "../content/field-demo/checkboxes.html",
      "title": "Checkboxes",
      "summary": false,
      "hideButtons": false,
      "hideBackButton": true,
      "hideNextButton": true,
      "inputs": [
        {
          "name": "checkbox_1",
          "label": "This checkbox is not required.",
          "required": false,
          "disabled": true,
          "invalid": false,
          "incomplete": true,
          "hidden": false,
          "value": "",
          "tagName": "TANGY-CHECKBOX"
        },
        {
          "name": "checkbox_2",
          "label": "This checkbox is required.",
          "required": true,
          "disabled": true,
          "invalid": false,
          "incomplete": true,
          "hidden": false,
          "value": "on",
          "tagName": "TANGY-CHECKBOX"
        },
        {
          "name": "checkbox_3",
          "label": "This checkbox is disabled, but if enabled, it is then also required.",
          "required": true,
          "disabled": true,
          "invalid": false,
          "incomplete": true,
          "hidden": false,
          "value": "",
          "tagName": "TANGY-CHECKBOX"
        },
        {
          "name": "checkbox_4",
          "label": "Check this checkbox to enable the disabled checkbox.",
          "required": false,
          "disabled": true,
          "invalid": false,
          "incomplete": true,
          "hidden": false,
          "value": "",
          "tagName": "TANGY-CHECKBOX"
        },
        {
          "name": "checkbox_5",
          "label": "This checkbox is hidden, but if show, it is also required.",
          "required": true,
          "disabled": true,
          "invalid": false,
          "incomplete": true,
          "hidden": true,
          "value": "",
          "tagName": "TANGY-CHECKBOX"
        },
        {
          "name": "checkbox_6",
          "label": "Check this checkbox to show the hidden checkbox.",
          "required": false,
          "disabled": true,
          "invalid": false,
          "incomplete": true,
          "hidden": false,
          "value": "",
          "tagName": "TANGY-CHECKBOX"
        },
        {
          "name": "checkbox_group_1",
          "value": [
            {
              "name": "checkbox_group_1__checkbox_1",
              "label": "Option 1",
              "required": false,
              "disabled": false,
              "invalid": false,
              "incomplete": true,
              "hidden": false,
              "value": "on",
              "tagName": "TANGY-CHECKBOX"
            },
            {
              "name": "checkbox_group_1__checkbox_2",
              "label": "Option 2",
              "required": false,
              "disabled": false,
              "invalid": false,
              "incomplete": true,
              "hidden": false,
              "value": "",
              "tagName": "TANGY-CHECKBOX"
            },
            {
              "name": "checkbox_group_1__checkbox_3",
              "label": "Option 3",
              "required": false,
              "disabled": false,
              "invalid": false,
              "incomplete": true,
              "hidden": false,
              "value": "",
              "tagName": "TANGY-CHECKBOX"
            },
            {
              "name": "checkbox_group_1__checkbox_4",
              "label": "Option 4",
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
          "label": "This is a checkbox group.",
          "hidden": false,
          "incomplete": true,
          "invalid": false,
          "tagName": "TANGY-CHECKBOXES"
        },
        {
          "name": "checkbox_group_2",
          "value": [
            {
              "name": "checkbox_group_2__checkbox_1",
              "label": "Option 1",
              "required": false,
              "disabled": false,
              "invalid": false,
              "incomplete": true,
              "hidden": false,
              "value": "",
              "tagName": "TANGY-CHECKBOX"
            },
            {
              "name": "checkbox_group_2__checkbox_2",
              "label": "Option 2",
              "required": false,
              "disabled": false,
              "invalid": false,
              "incomplete": true,
              "hidden": false,
              "value": "on",
              "tagName": "TANGY-CHECKBOX"
            },
            {
              "name": "checkbox_group_2__checkbox_3",
              "label": "Option 3",
              "required": false,
              "disabled": false,
              "invalid": false,
              "incomplete": true,
              "hidden": false,
              "value": "",
              "tagName": "TANGY-CHECKBOX"
            },
            {
              "name": "checkbox_group_2__checkbox_4",
              "label": "Option 4",
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
          "required": true,
          "disabled": true,
          "label": "This is a checkbox group that requires that it be saved with at least 1 checked checkbox.",
          "hidden": false,
          "incomplete": true,
          "invalid": false,
          "tagName": "TANGY-CHECKBOXES"
        },
        {
          "name": "checkbox_group_3",
          "value": [
            {
              "name": "checkbox_group_3__checkbox_1",
              "label": "Option 1",
              "required": false,
              "disabled": false,
              "invalid": false,
              "incomplete": true,
              "hidden": false,
              "value": "",
              "tagName": "TANGY-CHECKBOX"
            },
            {
              "name": "checkbox_group_3__checkbox_2",
              "label": "Option 2",
              "required": false,
              "disabled": false,
              "invalid": false,
              "incomplete": true,
              "hidden": false,
              "value": "on",
              "tagName": "TANGY-CHECKBOX"
            },
            {
              "name": "checkbox_group_3__checkbox_3",
              "label": "Option 3",
              "required": false,
              "disabled": false,
              "invalid": false,
              "incomplete": true,
              "hidden": false,
              "value": "on",
              "tagName": "TANGY-CHECKBOX"
            },
            {
              "name": "checkbox_group_3__checkbox_4",
              "label": "Option 4",
              "required": false,
              "disabled": false,
              "invalid": false,
              "incomplete": true,
              "hidden": false,
              "value": "",
              "tagName": "TANGY-CHECKBOX"
            }
          ],
          "atLeast": 2,
          "required": false,
          "disabled": true,
          "label": "This is a checkbox group that is not required, but if you do make a selection it is not valid until you check at least 2 checkboxes.",
          "hidden": false,
          "incomplete": true,
          "invalid": false,
          "tagName": "TANGY-CHECKBOXES"
        },
        {
          "name": "checkbox_group_4",
          "value": [
            {
              "name": "checkbox_group_4__checkbox_1",
              "label": "Option 1",
              "required": false,
              "disabled": false,
              "invalid": false,
              "incomplete": true,
              "hidden": false,
              "value": "",
              "tagName": "TANGY-CHECKBOX"
            },
            {
              "name": "checkbox_group_4__checkbox_2",
              "label": "Option 2",
              "required": false,
              "disabled": false,
              "invalid": false,
              "incomplete": true,
              "hidden": false,
              "value": "",
              "tagName": "TANGY-CHECKBOX"
            },
            {
              "name": "checkbox_group_4__checkbox_3",
              "label": "Option 3",
              "required": false,
              "disabled": false,
              "invalid": false,
              "incomplete": true,
              "hidden": false,
              "value": "",
              "tagName": "TANGY-CHECKBOX"
            },
            {
              "name": "checkbox_group_4__checkbox_4",
              "label": "Option 4",
              "required": false,
              "disabled": false,
              "invalid": false,
              "incomplete": true,
              "hidden": false,
              "value": "on",
              "tagName": "TANGY-CHECKBOX"
            }
          ],
          "atLeast": 0,
          "required": true,
          "disabled": true,
          "label": "This is a disabled checkbox group.",
          "hidden": false,
          "incomplete": true,
          "invalid": false,
          "tagName": "TANGY-CHECKBOXES"
        },
        {
          "name": "checkbox_group_4_enable",
          "label": "Check this checkbox to enable another checkbox group. If the checkbox group is enabled it will be required to submit the form.",
          "required": false,
          "disabled": true,
          "invalid": false,
          "incomplete": true,
          "hidden": false,
          "value": "on",
          "tagName": "TANGY-CHECKBOX"
        },
        {
          "name": "checkbox_group_5",
          "value": [
            {
              "name": "checkbox_group_5__checkbox_1",
              "label": "Option 1",
              "required": false,
              "disabled": false,
              "invalid": false,
              "incomplete": true,
              "hidden": false,
              "value": "",
              "tagName": "TANGY-CHECKBOX"
            },
            {
              "name": "checkbox_group_5__checkbox_2",
              "label": "Option 2",
              "required": false,
              "disabled": false,
              "invalid": false,
              "incomplete": true,
              "hidden": false,
              "value": "",
              "tagName": "TANGY-CHECKBOX"
            },
            {
              "name": "checkbox_group_5__checkbox_3",
              "label": "Option 3",
              "required": false,
              "disabled": false,
              "invalid": false,
              "incomplete": true,
              "hidden": false,
              "value": "",
              "tagName": "TANGY-CHECKBOX"
            },
            {
              "name": "checkbox_group_5__checkbox_4",
              "label": "Option 4",
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
          "required": true,
          "disabled": true,
          "label": "This is a hidden checkbox group.",
          "hidden": true,
          "incomplete": true,
          "invalid": false,
          "tagName": "TANGY-CHECKBOXES"
        },
        {
          "name": "checkbox_group_5_show",
          "label": "Check this checkbox to show another checkbox group. If the checkbox group is shown it will be required to submit the form.",
          "required": false,
          "disabled": true,
          "invalid": false,
          "incomplete": true,
          "hidden": false,
          "value": "",
          "tagName": "TANGY-CHECKBOX"
        }
      ],
      "open": false,
      "incomplete": false,
      "disabled": false,
      "hidden": false,
      "locked": true,
      "tagName": "TANGY-FORM-ITEM"
    },
    {
      "id": "radio_buttons",
      "src": "../content/field-demo/radio-buttons.html",
      "title": "Radiobuttons",
      "summary": false,
      "hideButtons": false,
      "hideBackButton": true,
      "hideNextButton": true,
      "inputs": [
        {
          "name": "radio_buttons_1",
          "value": [
            {
              "name": "tangerine",
              "label": "Tangerine",
              "required": false,
              "disabled": false,
              "invalid": false,
              "incomplete": true,
              "hidden": false,
              "value": "",
              "tagName": "TANGY-RADIO-BUTTON"
            },
            {
              "name": "apple",
              "label": "Apple",
              "required": false,
              "disabled": false,
              "invalid": false,
              "incomplete": true,
              "hidden": false,
              "value": "on",
              "tagName": "TANGY-RADIO-BUTTON"
            },
            {
              "name": "pear",
              "label": "Pear",
              "required": false,
              "disabled": false,
              "invalid": false,
              "incomplete": true,
              "hidden": false,
              "value": "",
              "tagName": "TANGY-RADIO-BUTTON"
            },
            {
              "name": "coconut",
              "label": "Coconut",
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
          "label": "These are radio buttons.",
          "hidden": false,
          "invalid": false,
          "incomplete": true,
          "tagName": "TANGY-RADIO-BUTTONS"
        },
        {
          "name": "radio_buttons_2",
          "value": [
            {
              "name": "tangerine",
              "label": "Tangerine",
              "required": false,
              "disabled": false,
              "invalid": false,
              "incomplete": true,
              "hidden": false,
              "value": "on",
              "tagName": "TANGY-RADIO-BUTTON"
            },
            {
              "name": "apple",
              "label": "Apple",
              "required": false,
              "disabled": false,
              "invalid": false,
              "incomplete": true,
              "hidden": false,
              "value": "",
              "tagName": "TANGY-RADIO-BUTTON"
            },
            {
              "name": "pear",
              "label": "Pear",
              "required": false,
              "disabled": false,
              "invalid": false,
              "incomplete": true,
              "hidden": false,
              "value": "",
              "tagName": "TANGY-RADIO-BUTTON"
            },
            {
              "name": "coconut",
              "label": "Coconut",
              "required": false,
              "disabled": false,
              "invalid": false,
              "incomplete": true,
              "hidden": false,
              "value": "",
              "tagName": "TANGY-RADIO-BUTTON"
            }
          ],
          "required": true,
          "disabled": true,
          "label": "These are radio buttons where at least one selection is required.",
          "hidden": false,
          "invalid": false,
          "incomplete": true,
          "tagName": "TANGY-RADIO-BUTTONS"
        },
        {
          "name": "radio_buttons_3",
          "value": [
            {
              "name": "tangerine",
              "label": "Tangerine",
              "required": false,
              "disabled": false,
              "invalid": false,
              "incomplete": true,
              "hidden": false,
              "value": "",
              "tagName": "TANGY-RADIO-BUTTON"
            },
            {
              "name": "apple",
              "label": "Apple",
              "required": false,
              "disabled": false,
              "invalid": false,
              "incomplete": true,
              "hidden": false,
              "value": "",
              "tagName": "TANGY-RADIO-BUTTON"
            },
            {
              "name": "pear",
              "label": "Pear",
              "required": false,
              "disabled": false,
              "invalid": false,
              "incomplete": true,
              "hidden": false,
              "value": "",
              "tagName": "TANGY-RADIO-BUTTON"
            },
            {
              "name": "coconut",
              "label": "Coconut",
              "required": false,
              "disabled": false,
              "invalid": false,
              "incomplete": true,
              "hidden": false,
              "value": "",
              "tagName": "TANGY-RADIO-BUTTON"
            }
          ],
          "required": true,
          "disabled": true,
          "label": "These are radio buttons that are disabled. If enabled, then a selection is required.",
          "hidden": false,
          "invalid": false,
          "incomplete": true,
          "tagName": "TANGY-RADIO-BUTTONS"
        },
        {
          "name": "radio_buttons_3_enable",
          "label": "Check this checkbox to enable the disabled radio buttons.",
          "required": false,
          "disabled": true,
          "invalid": false,
          "incomplete": true,
          "hidden": false,
          "value": "",
          "tagName": "TANGY-CHECKBOX"
        },
        {
          "name": "radio_buttons_4",
          "value": [
            {
              "name": "tangerine",
              "label": "Tangerine",
              "required": false,
              "disabled": false,
              "invalid": false,
              "incomplete": true,
              "hidden": false,
              "value": "",
              "tagName": "TANGY-RADIO-BUTTON"
            },
            {
              "name": "apple",
              "label": "Apple",
              "required": false,
              "disabled": false,
              "invalid": false,
              "incomplete": true,
              "hidden": false,
              "value": "",
              "tagName": "TANGY-RADIO-BUTTON"
            },
            {
              "name": "pear",
              "label": "Pear",
              "required": false,
              "disabled": false,
              "invalid": false,
              "incomplete": true,
              "hidden": false,
              "value": "",
              "tagName": "TANGY-RADIO-BUTTON"
            },
            {
              "name": "coconut",
              "label": "Coconut",
              "required": false,
              "disabled": false,
              "invalid": false,
              "incomplete": true,
              "hidden": false,
              "value": "",
              "tagName": "TANGY-RADIO-BUTTON"
            }
          ],
          "required": true,
          "disabled": true,
          "label": "These are radio buttons that are hidden. If not hidden, then a selection is required.",
          "hidden": true,
          "invalid": false,
          "incomplete": true,
          "tagName": "TANGY-RADIO-BUTTONS"
        },
        {
          "name": "radio_buttons_4_show",
          "label": "Check this checkbox to show the hidden radio buttons.",
          "required": false,
          "disabled": true,
          "invalid": false,
          "incomplete": true,
          "hidden": false,
          "value": "",
          "tagName": "TANGY-CHECKBOX"
        }
      ],
      "open": false,
      "incomplete": false,
      "disabled": false,
      "hidden": false,
      "locked": true,
      "tagName": "TANGY-FORM-ITEM"
    },
    {
      "id": "select_lists",
      "src": "../content/field-demo/select-lists.html",
      "title": "Select Lists",
      "summary": false,
      "hideButtons": false,
      "hideBackButton": true,
      "hideNextButton": true,
      "inputs": [
        {
          "name": "select_1",
          "value": "",
          "required": false,
          "disabled": true,
          "label": "These are select lists.",
          "secondaryLabel": "Choose from this list of fruits",
          "hidden": false,
          "invalid": false,
          "incomplete": true,
          "tagName": "TANGY-SELECT"
        },
        {
          "name": "select_2",
          "value": "apple",
          "required": true,
          "disabled": true,
          "label": "These are select lists where at least one selection is required.",
          "secondaryLabel": "",
          "hidden": false,
          "invalid": false,
          "incomplete": true,
          "tagName": "TANGY-SELECT"
        },
        {
          "name": "select_3",
          "value": "",
          "required": true,
          "disabled": true,
          "label": "These are select lists that are disabled. If enabled, then a selection is required.",
          "secondaryLabel": "",
          "hidden": false,
          "invalid": false,
          "incomplete": true,
          "tagName": "TANGY-SELECT"
        },
        {
          "name": "select_3_enable",
          "label": "Check this checkbox to enable the disabled select.",
          "required": false,
          "disabled": true,
          "invalid": false,
          "incomplete": true,
          "hidden": false,
          "value": "",
          "tagName": "TANGY-CHECKBOX"
        },
        {
          "name": "select_4",
          "value": "",
          "required": true,
          "disabled": true,
          "label": "These are select lists that are hidden. If not hidden, then a selection is required.",
          "secondaryLabel": "",
          "hidden": true,
          "invalid": false,
          "incomplete": true,
          "tagName": "TANGY-SELECT"
        },
        {
          "name": "select_4_show",
          "label": "Check this checkbox to show the hidden select.",
          "required": false,
          "disabled": true,
          "invalid": false,
          "incomplete": true,
          "hidden": false,
          "value": "",
          "tagName": "TANGY-CHECKBOX"
        }
      ],
      "open": false,
      "incomplete": false,
      "disabled": false,
      "hidden": false,
      "locked": true,
      "tagName": "TANGY-FORM-ITEM"
    },
    {
      "id": "location",
      "src": "../content/field-demo/location.html",
      "title": "Location",
      "summary": false,
      "hideButtons": false,
      "hideBackButton": true,
      "hideNextButton": true,
      "inputs": [
        {
          "name": "location",
          "value": [
            {
              "level": "county",
              "value": "county2"
            },
            {
              "level": "school",
              "value": "school3"
            }
          ],
          "label": "Select your school",
          "required": true,
          "invalid": false,
          "locationSrc": "../content/location-list.json",
          "showLevels": "county,school",
          "hidden": false,
          "disabled": true,
          "tagName": "TANGY-LOCATION"
        }
      ],
      "open": false,
      "incomplete": false,
      "disabled": false,
      "hidden": false,
      "locked": true,
      "tagName": "TANGY-FORM-ITEM"
    },
    {
      "id": "gps",
      "src": "../content/field-demo/gps.html",
      "title": "GPS",
      "summary": false,
      "hideButtons": false,
      "hideBackButton": true,
      "hideNextButton": true,
      "inputs": [
        {
          "name": "gps-coords",
          "value": {
            "latitude": 44.4529814,
            "longitude": -73.1958786,
            "accuracy": 20
          },
          "required": false,
          "advancedMode": false,
          "disabled": true,
          "tagName": "TANGY-GPS"
        }
      ],
      "open": false,
      "incomplete": false,
      "disabled": false,
      "hidden": false,
      "locked": true,
      "tagName": "TANGY-FORM-ITEM"
    },
    {
      "id": "date_time",
      "src": "../content/field-demo/date-time.html",
      "title": "Date and Time",
      "summary": false,
      "hideButtons": false,
      "hideBackButton": true,
      "hideNextButton": true,
      "inputs": [
        {
          "name": "date_1",
          "private": false,
          "label": "Date",
          "type": "date",
          "errorMessage": "",
          "required": false,
          "disabled": true,
          "hidden": false,
          "invalid": false,
          "incomplete": true,
          "value": "2018-05-31",
          "allowedPattern": "",
          "tagName": "TANGY-INPUT"
        },
        {
          "name": "time_1",
          "private": false,
          "label": "Time",
          "type": "time",
          "errorMessage": "",
          "required": false,
          "disabled": true,
          "hidden": false,
          "invalid": false,
          "incomplete": true,
          "value": "15:47",
          "allowedPattern": "",
          "tagName": "TANGY-INPUT"
        },
        {
          "name": "hidden_timestamp",
          "private": false,
          "label": "",
          "type": "text",
          "errorMessage": "",
          "required": false,
          "disabled": true,
          "hidden": true,
          "invalid": false,
          "incomplete": true,
          "value": 1527796064517,
          "allowedPattern": "",
          "tagName": "TANGY-INPUT"
        },
        {
          "name": "mark_time_checkbox",
          "label": "Tap to mark the time.",
          "required": false,
          "disabled": true,
          "invalid": false,
          "incomplete": true,
          "hidden": false,
          "value": "",
          "tagName": "TANGY-CHECKBOX"
        },
        {
          "name": "mark_time_date",
          "private": false,
          "label": "Date",
          "type": "date",
          "errorMessage": "",
          "required": false,
          "disabled": true,
          "hidden": false,
          "invalid": false,
          "incomplete": true,
          "value": "",
          "allowedPattern": "",
          "tagName": "TANGY-INPUT"
        },
        {
          "name": "mark_time_time",
          "private": false,
          "label": "Time",
          "type": "time",
          "errorMessage": "",
          "required": false,
          "disabled": true,
          "hidden": false,
          "invalid": false,
          "incomplete": true,
          "value": "",
          "allowedPattern": "",
          "tagName": "TANGY-INPUT"
        }
      ],
      "open": false,
      "incomplete": false,
      "disabled": false,
      "hidden": false,
      "locked": true,
      "tagName": "TANGY-FORM-ITEM"
    },
    {
      "id": "timed_grids",
      "src": "../content/field-demo/timed-grid.html",
      "title": "Timed Grid",
      "summary": false,
      "hideButtons": false,
      "hideBackButton": true,
      "hideNextButton": true,
      "inputs": [
        {
          "name": "class1_term2",
          "value": [
            {
              "name": "class1_term2-1",
              "value": "",
              "disabled": true,
              "highlighted": false,
              "pressed": false,
              "tagName": "TANGY-TOGGLE-BUTTON"
            },
            {
              "name": "class1_term2-2",
              "value": "",
              "disabled": true,
              "highlighted": false,
              "pressed": false,
              "tagName": "TANGY-TOGGLE-BUTTON"
            },
            {
              "name": "class1_term2-3",
              "value": "on",
              "disabled": true,
              "highlighted": false,
              "pressed": true,
              "tagName": "TANGY-TOGGLE-BUTTON"
            },
            {
              "name": "class1_term2-4",
              "value": "",
              "disabled": true,
              "highlighted": false,
              "pressed": false,
              "tagName": "TANGY-TOGGLE-BUTTON"
            },
            {
              "name": "class1_term2-5",
              "value": "",
              "disabled": true,
              "highlighted": false,
              "pressed": false,
              "tagName": "TANGY-TOGGLE-BUTTON"
            },
            {
              "name": "class1_term2-6",
              "value": "",
              "disabled": true,
              "highlighted": false,
              "pressed": false,
              "tagName": "TANGY-TOGGLE-BUTTON"
            },
            {
              "name": "class1_term2-7",
              "value": "",
              "disabled": true,
              "highlighted": false,
              "pressed": false,
              "tagName": "TANGY-TOGGLE-BUTTON"
            },
            {
              "name": "class1_term2-8",
              "value": "on",
              "disabled": true,
              "highlighted": false,
              "pressed": true,
              "tagName": "TANGY-TOGGLE-BUTTON"
            },
            {
              "name": "class1_term2-9",
              "value": "",
              "disabled": true,
              "highlighted": false,
              "pressed": false,
              "tagName": "TANGY-TOGGLE-BUTTON"
            },
            {
              "name": "class1_term2-10",
              "value": "",
              "disabled": true,
              "highlighted": false,
              "pressed": false,
              "tagName": "TANGY-TOGGLE-BUTTON"
            },
            {
              "name": "class1_term2-11",
              "value": "",
              "disabled": true,
              "highlighted": false,
              "pressed": false,
              "tagName": "TANGY-TOGGLE-BUTTON"
            },
            {
              "name": "class1_term2-12",
              "value": "",
              "disabled": true,
              "highlighted": false,
              "pressed": false,
              "tagName": "TANGY-TOGGLE-BUTTON"
            },
            {
              "name": "class1_term2-13",
              "value": "",
              "disabled": true,
              "highlighted": false,
              "pressed": false,
              "tagName": "TANGY-TOGGLE-BUTTON"
            },
            {
              "name": "class1_term2-14",
              "value": "",
              "disabled": true,
              "highlighted": false,
              "pressed": false,
              "tagName": "TANGY-TOGGLE-BUTTON"
            },
            {
              "name": "class1_term2-15",
              "value": "",
              "disabled": true,
              "highlighted": false,
              "pressed": false,
              "tagName": "TANGY-TOGGLE-BUTTON"
            },
            {
              "name": "class1_term2-16",
              "value": "",
              "disabled": true,
              "highlighted": false,
              "pressed": false,
              "tagName": "TANGY-TOGGLE-BUTTON"
            },
            {
              "name": "class1_term2-17",
              "value": "",
              "disabled": true,
              "highlighted": false,
              "pressed": false,
              "tagName": "TANGY-TOGGLE-BUTTON"
            },
            {
              "name": "class1_term2-18",
              "value": "",
              "disabled": true,
              "highlighted": false,
              "pressed": false,
              "tagName": "TANGY-TOGGLE-BUTTON"
            },
            {
              "name": "class1_term2-19",
              "value": "",
              "disabled": true,
              "highlighted": false,
              "pressed": false,
              "tagName": "TANGY-TOGGLE-BUTTON"
            },
            {
              "name": "class1_term2-20",
              "value": "",
              "disabled": true,
              "highlighted": false,
              "pressed": false,
              "tagName": "TANGY-TOGGLE-BUTTON"
            },
            {
              "name": "class1_term2-21",
              "value": "",
              "disabled": true,
              "highlighted": false,
              "pressed": false,
              "tagName": "TANGY-TOGGLE-BUTTON"
            },
            {
              "name": "class1_term2-22",
              "value": "",
              "disabled": true,
              "highlighted": false,
              "pressed": false,
              "tagName": "TANGY-TOGGLE-BUTTON"
            },
            {
              "name": "class1_term2-23",
              "value": "",
              "disabled": true,
              "highlighted": false,
              "pressed": false,
              "tagName": "TANGY-TOGGLE-BUTTON"
            },
            {
              "name": "class1_term2-24",
              "value": "",
              "disabled": true,
              "highlighted": false,
              "pressed": false,
              "tagName": "TANGY-TOGGLE-BUTTON"
            },
            {
              "name": "class1_term2-25",
              "value": "",
              "disabled": true,
              "highlighted": false,
              "pressed": false,
              "tagName": "TANGY-TOGGLE-BUTTON"
            },
            {
              "name": "class1_term2-26",
              "value": "",
              "disabled": true,
              "highlighted": false,
              "pressed": false,
              "tagName": "TANGY-TOGGLE-BUTTON"
            },
            {
              "name": "class1_term2-27",
              "value": "",
              "disabled": true,
              "highlighted": false,
              "pressed": false,
              "tagName": "TANGY-TOGGLE-BUTTON"
            },
            {
              "name": "class1_term2-28",
              "value": "",
              "disabled": true,
              "highlighted": false,
              "pressed": false,
              "tagName": "TANGY-TOGGLE-BUTTON"
            },
            {
              "name": "class1_term2-29",
              "value": "",
              "disabled": true,
              "highlighted": false,
              "pressed": false,
              "tagName": "TANGY-TOGGLE-BUTTON"
            },
            {
              "name": "class1_term2-30",
              "value": "",
              "disabled": true,
              "highlighted": false,
              "pressed": false,
              "tagName": "TANGY-TOGGLE-BUTTON"
            },
            {
              "name": "class1_term2-31",
              "value": "",
              "disabled": true,
              "highlighted": false,
              "pressed": false,
              "tagName": "TANGY-TOGGLE-BUTTON"
            },
            {
              "name": "class1_term2-32",
              "value": "",
              "disabled": true,
              "highlighted": true,
              "pressed": false,
              "tagName": "TANGY-TOGGLE-BUTTON"
            }
          ],
          "mode": "TANGY_TIMED_MODE_DISABLED",
          "duration": 80,
          "columns": 4,
          "showLabels": false,
          "invalid": false,
          "incomplete": true,
          "required": true,
          "disabled": true,
          "timeRemaining": 78,
          "startTime": 1527796069491,
          "endTime": 1527796072023,
          "tagName": "TANGY-TIMED"
        }
      ],
      "open": false,
      "incomplete": false,
      "disabled": false,
      "hidden": false,
      "locked": true,
      "tagName": "TANGY-FORM-ITEM"
    },
    {
      "id": "timed_grids_feedback",
      "src": "../content/field-demo/timed-grid-feedback.html",
      "title": "Timed Grid Feedback",
      "summary": false,
      "hideButtons": false,
      "hideBackButton": true,
      "hideNextButton": true,
      "inputs": [],
      "open": false,
      "incomplete": false,
      "disabled": false,
      "hidden": false,
      "locked": true,
      "tagName": "TANGY-FORM-ITEM"
    },
    {
      "id": "complete",
      "src": "../content/field-demo/complete.html",
      "title": "Complete",
      "summary": false,
      "hideButtons": false,
      "hideBackButton": true,
      "hideNextButton": true,
      "inputs": [
        {
          "name": "test",
          "label": "Some required field you must check before marking complete.",
          "required": true,
          "disabled": true,
          "invalid": false,
          "incomplete": true,
          "hidden": false,
          "value": "on",
          "tagName": "TANGY-CHECKBOX"
        },
        {
          "name": "complete",
          "value": "",
          "disabled": true,
          "goHome": false,
          "tagName": "TANGY-COMPLETE-BUTTON"
        }
      ],
      "open": false,
      "incomplete": true,
      "disabled": false,
      "hidden": false,
      "locked": true,
      "tagName": "TANGY-FORM-ITEM"
    },
    {
      "id": "summary",
      "src": "../content/field-demo/summary.html",
      "title": "Summary",
      "summary": true,
      "hideButtons": false,
      "hideBackButton": true,
      "hideNextButton": true,
      "inputs": [],
      "open": false,
      "incomplete": true,
      "disabled": false,
      "hidden": true,
      "locked": false,
      "tagName": "TANGY-FORM-ITEM"
    }
  ],
  "inputs": [],
  "complete": true,
  "focusIndex": 9,
  "nextFocusIndex": 10,
  "previousFocusIndex": 8,
  "startDatetime": "5/31/2018, 3:46:12 PM",
  "startUnixtime": 1527795972180,
  "uploadDatetime": "",
  "nextItemId": "summary",
  "previousItemId": "timed_grids_feedback",
  "progress": 0
}
