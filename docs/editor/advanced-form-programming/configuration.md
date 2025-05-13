# Configuration

## App Configuration

`app-config.json` should have the following properties defined.

- `homeUrl:string`  The default route to load when no route is specified. Think of this as the root url

"homeURL": "case-management" – for basic apps or coach
"homeURL": "dashboard" – for basic teach apps with formative assessment only
"homeURL": " attendance-dashboard" – attendance-dashboard that uses the SART summary as the main page
"homeURL": "case-home" – for case module enabled groups. 
"homeURL": "custom-app" – allows you to create your own app through index.html and components

- `securityPolicy` - This is an array of all the combinations of the security policies to be enforced in the app. NOTE: `noPassword` and `password` are mutually exclusive. Only one should be provided and not both.
    - `password`
    - `noPassword`
- `modules` -  This settings controls the modules enabled for this group. In general this setting is the same as that of config.sh but in some situations you may wish to have a particular group be sync2 or teach. 
    - `class` - enables the Teach module
    - `case` - enables the case module
    - `sync-protocol-2` - always use with case enabled. Will enable the interface  for configuring sync2
- `appName` - can set a custom app name
- `packageName` - change the packaage name so that more than one apps can be installed e.g. rg.rti.tangerine.**YourName**
- `columnsOnVisitsTab` - enables the display of a text or number column on the Visits tab
- `uploadToken` - set automatically, the token used by the app. It must be the same as that in config.sh
- `languageDirection` - can set the default direction of the language in the app. The direction is assosiated with the languge and can be overwritten by the user if they change the lanague
- `languageCode` - the language code, same as a defined lanaguge in transltaions.json
- `customLoginMarkup` - allows you to enter some html to show up on the app login screen. You can use this for branding. 
- `hideProfile` - will disable the user profile, usually we use this in conjunctions with centrallyManagedUserProfile
- `centrallyManagedUserProfile` - makes the app work only with predefined user profiles. The end user needs the user profile ID (last X chars) to login
- `uploadUnlockedFormReponses` -  instructs the app to upload all results, even those that have not been submited
- `goHomeAfterFormSubmit` -  will redirect the user to the form listing after they submit a form - does not work well if using summary sections
- `kioskMode` - enables a link in the top right menu to enter Kiosk Mode
- `exitClicks` - number of taps on a non-input to exit the kiosk mode - this is to avoid that children interacting with the app can browse away
- `teachProperties` - contains an array of settings for teach
    - `units` - the units for grouping of continuous assessment scores and attendance
    - `unitDates` - the unit, same as in **units** and the start and end dates
    - `studentRegistrationFields` - inputs to be used in results for students. Make sure that here you have at least the student_name, and classId. Failure to include studnet_name will result in an empty listing of students on the app.
    - `attendancePrimaryThreshold` - dashboard threshold for attedndace upper limit
    - `attendanceSecondaryThreshold` - dashboard threshold for attendance lower limit
    - `scoringPrimaryThreshold`  - dashboard threshold for scoring upper limit
    - `scoringSecondaryThreshold` - dashboard threshold for scoring lower limit
    - `behaviorPrimaryThreshold`  - dashboard threshold for behavior upper limit
    - `behaviorSecondaryThreshold` - dashboard threshold for behavior lower limit

```
"teachProperties": {
        "units": ["Semester 1", "Semester 2"],
        "unitDates": [
          {
            "name": "Semester 1",
            "start": "2024-02-15",
            "end": "2024-04-23"
          },
          {
            "name": "Semester 2",
            "start": "2024-04-24",
            "end": "2024-06-30"
          } ],
        "attendancePrimaryThreshold": 80,
        "attendanceSecondaryThreshold": 70,
        "scoringPrimaryThreshold": 70,
        "scoringSecondaryThreshold": 60,
        "behaviorPrimaryThreshold": 90,
        "behaviorSecondaryThreshold": 80,
        "useAttendanceFeature": true,
      "studentRegistrationFields": [
          "student_name",
        "student_surname",
        "gender",
        "age",
        "classId",
        "student_num"
      ]
     }

```

  