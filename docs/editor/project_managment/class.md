# Class module

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




