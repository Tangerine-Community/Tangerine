# Class module

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

