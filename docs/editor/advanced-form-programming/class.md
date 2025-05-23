# Class module (Teach)

## Setup

Add `class` to the `T_MODULES` property in config.sh. Create a new group via editor; this takes advantage of the class module which sets important class-related properties and file. If you /must/ use the `create-group` command, change `homeUrl` to `dashboard` or `attendance-dashboard` and set `uploadUnlockedFormReponses =  true`. 

You must also configure the `teachProperties` object in app-config.json for the Teach group. Below is an example configuration. Make sure to include the student name(s) variable and other variables that you want to populate in form responses under `studentRegistrationFields`. If the student name variable is not in this list you may see your student listing as empty on the tablet's dashboard

```
"teachProperties": {
    "units": [
      "Semester 1",
      "Semester 2",
      "Semester 3",
      "Semester 4"
    ],
    "unitDates": [
      {
        "name": "Semester 1",
        "start": "2025-02-15",
        "end": "2025-04-23"
      },
      {
        "name": "Semester 2",
        "start": "2025-04-24",
        "end": "2025-06-30"
      },
      {
        "name": "Semester 3",
        "start": "2025-07-04",
        "end": "2025-09-09"
      },
      {
        "name": "Semester 4",
        "start": "2025-09-11",
        "end": "2025-11-17"
      }
    ],
    "attendancePrimaryThreshold": 80,
    "attendanceSecondaryThreshold": 70,
    "scoringPrimaryThreshold": 70,
    "scoringSecondaryThreshold": 60,
    "behaviorPrimaryThreshold": 70,
    "behaviorSecondaryThreshold": 60,
    "useAttendanceFeature": true,
    "showAttendanceCalendar": true,
    "studentRegistrationFields": [
      "student_name",
      "student_surname",
      "classId",
      "phone",
      "student_num"
    ]
  },
  "useAttendanceFeature": true,
```

## Feedback

Feedback for each form item (subtask) can be entered using the Settings editor.

Feedback is displayed if available on the Student grouping report. The following fields are available:
- ${feedback.example}
- ${feedback.skill}
- ${feedback.assignment}

The following code can be used to format feedback on the Student Grouping report:

```
<div class='feedback-assignment'>${feedback.assignment}</div>
```

```
<div class='feedback-example'>${feedback.example}.</div>
```

Note that the use of these formatting commands are optional.

Here is a sample feedback message that uses this formatting:

```
These students are doing really well. Consider framing your feedback to these student as follows: <div class='feedback-example'>${feedback.example}.</div>
Reflect on these students results: why do you think did these students were particularly successful in ${feedback.skill}.
Was there a specific ${feedback.skill} strategy or activity you used? Did they already know this content?
Is there another strategy or activity they could do to extend their ${feedback.skill} skills?
Consider giving these students supplementary story: <div class='feedback-assignment'>${feedback.assignment}</div> to read
and make 3-5 inferential questions for them to answer. You may also consider engaging these students as peer mentors to
others as these other students do additional practice.
```
## Scoring

There are 3 options for scoring in Class:
- Using a TANGY-TIMED grid
- Using a hidden formId+_score field to store the calculated score value when the form is submitted using the on-change javascript
- Using a score calculated at report run-time.

The dashboard.service populaceTransformedResult function loops through the inputs; for each item type, it calculates the value, score, and max. 

It also keeps a running tally of the sum of all max values (totalMax).

Here are the default rules for each input type:
* TANGY-INPUT:
   * value: value field
   * score: value field
   * max: max field
* TANGY-RADIO-BUTTONS:
   * value: loops through the options and uses the value from the non-empty option
   * score: value 
   * max: Use value of the highest option.
* TANGY-CHECKBOXES:
   * value: loops through the options and uses the value from the non-empty option
   * score: value 
   * max: Use value of the highest option.
   
For a TANGY-TIMED input, once the value and score have been calculated for each item and populated into an answeredQuestions array, we loop through this array and calculate aggregates for the tangy-form-item.
   
* TANGY-TIMED:
  * value: 
  * score: totalCorrect

For tangy form items that use a _score field: Calculate the totalAnswers by subtracting 1 from the item.inputs.length (to account for the _score field)
  Use score for totalCorrect and totalAnswers for maxValueAnswer, unless the max value was assigned earlier.

Finally, there is support for calculating the score at report-time by looping through answeredQuestions and summing the score and max values.

