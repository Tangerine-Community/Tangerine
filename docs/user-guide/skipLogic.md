On-Open / On-Change (Skip) Logic Editor
=======================================

Every instrument/form, section, and individual item provides an
interface for adding logic, e.g. skip logic, that controls the
interactivity and presentation of the instrument, section, or item.

There are two types of skip logic that can be applied:

- On form level - used to skip an entire section and implement logic that is applicable to the entire form
- On section/page level
  - **Most common case:** You can implement those in the item's 'Skip If' field, or
  - **Used for more coplex conditions**Implement the skip in the section's on-change logic

The functions that we use for skip logic are:
- getValue('*name*') - to check the value of input '*name*'
  - Use this for Text, Number, Dates, Time, Radio buttons, or Drop down lists
- getValue('*name*').includes('*value*') - to check if '*value*' is in the selected items of '*name*'
  - Use this call to check if a value is in the list of selected values of a checkbox group input.
- grid specific functions - look at the end of this page for more information.

#### Join skip logic conditions using the && (AND) and || (OR) operators
**getValue(\'repeatedgrade\') == \'1\' && getValue(\'age\') >= 1** 

#### Negate a condition using the ! (NOT) operator
**getValue(\'repeatedgrade\') != \'1\'** Or **!getValue(\'grades_taught\').includes(\'1\')**


### Logic at item level


**You want to skip an item question:**

Navigate to the "Show if" in the Item Editor.

<img src="./media/image68.png" width="570">


In this example this item (e.g., "Which grade did you repeat?" will ONLY
be shown if the response to the previous item (e.g., asking about
whether the person ever repeated a grade) was "yes" (data value 1).

**getValue(\'repeatedgrade\') == \'1\'**

Alternatively, for a preceding question that had "Other" as an answer
option, the logic here might look like this:

**getValue(\'q10\') == \'9\'**

Other examples might include a specific value of a preceding item. Use
the below example for questions of type checkbox group, where more than
one answer can be selected.

**getValue(\'q12\').includes(\'5\')**

**\
NOTE:** The skip logic commands used in Tangerine are case-sensitive and
space-sensitive. You must type precisely the name of the variables which
you want to reference.

**NOTE:** Use single straight quotation marks to demarcate variables
names \', do NOT use single slanted quotation marks ' or double
quotation marks ".

### Logic at instrument/form level

At the instrument/form level, accessing this logic editor is via
advanced settings in the section editor.

<img src="./media/image65.png" width="570">


Click on **ADVANCED** to see the screen below with "on-open" and
"on-change" entries.

<img src="./media/image66.png" width="570">

As outlined earlier, at the **item level**, such logic can be added in
the "Show if" field in the item editor.


<img src="./media/image68.png" width="570">


### On-open and on-change


<img src="./media/image69.png" width="570">

As the name
suggest, **on-open** logic is only executed when the form is opened
whereas **on-change** logic is always executed whenever a change happens
in the whole form. When selecting **on-open logic** either at the
instrument/form level or in the section editor, the following screen
appears. The interface allows JavaScript logic to be incorporated into
the instrument.

###  (Skip) Logic Examples

**You want to skip an entire section:**

Navigate to and select the "on-change" at the instrument/form level.
This logic will not work if you insert it in a section (it must be
defined on form level)

In this example, the section gets skipped based on responses from a
previous item, e.g., if the respondent answered negatively to a previous
question "Do you have children?". Note that the sectionID is provided in
Tangerine in the section details as shown below. Form level skip logic
is used to present or hide an entire section page to the user. This is
very useful when managing a workflow and you need to display some
sections but hide others according to the selected option for a
question. For example, you can show a certain section only for grade 1
and hide it if grade 2 is selected.

<img src="./media/image70.png" width="570">


> if(getValue(\'children\') == \'1\')

{sectionEnable(\'item\_1\')}

> else
>
> {sectionDisable(\'item\_1\')}

**You want to hide a set of items based on responses to an item in a
previous section:**

Navigate to and select the "on-open" at the section level.

In this example several items in this section are hidden based on the
participant's response to the item about the child's schooling
experience in a previous section.

> if(getValue(\'school\') == \'1\')
>
> {itemShow(\'grade\')
>
> itemShow('repeatedgrade')
>
> itemShow('dropout')}
>
> else
>
> {itemHide(\'grade\')
>
> itemHide('repeatedgrade')
>
> itemHide('dropout')}

**You want to hide a set of items based on responses to two items in a
previous section:**

Navigate to and select the "on-open" at the section level.

In this example the item "teachers\_name" should only be shown if the
participant's previous response to "teacher\_available" was yes = 1
**AND** if the participant' previous response to "class\_selected" was
"1".

> if(getValue(\' teacher\_available\') === \'1\' &&
> getValue(\'class\_selected\') === \'1\' )
>
> {itemShow(\'teachers\_name\')}
>
> else
>
> {itemHide(\'teachers\_name\')}

The Logic interface offer syntax highlighting. This is handy when you
have errors in your code. Below is an example of an error and sample
message.


<img src="./media/image71.png" width="570">


### Logic at section level

At the section level, the logic editor can be accessed by editing the
**Section Details** clicking the pen icon on the right of the blue bar
(where one can also rename the section).


<img src="./media/image67.png" width="570">






### Skip logic with grid specific functions

You may be in the situation where you are required to perform a skip
based on some results from a grid. We provide four functions that you
can use in your skip logic to show or hide questions or sections based
on the results of a grid.

**Showing a question based on the number of attempted items on a grid**

If you'd like to hide a question when the number of attempted items on a
particular grid is over a certain threshold you can make use of the
'numberOfItemsAttempted(input)' function. If your grid variable is
'letter\_sound' and the question you want to skip is 'Q\_1' then in the
question Q\_1 I can insert the below skip logic(under Show If) to show
it only when the number of attempted items on the grid is greater than
10

> numberOfItemsAttempted(inputs.letter\_sound) \> 10

**Showing a question based on the number of correct items of a grid**

Sometimes it may be the case where you want to show a question only if
there are a certain N items on the grid answered correctly. In those
cases, we make use of the 'numberOfCorrectItems(input)' function. If
your grid variable is 'letter\_sound' and the question you want to skip
is 'Q\_1' then in the question Q\_1 I can insert the below skip
logic(under Show If) to show this question only when the number of
correct items on the grid is greater than 0

> numberOfCorrectItems(inputs.letter\_sound) \> 0

**Show a question only if the grid did not auto stop**

If you have set the autostop value of a grid with variable name
'letter\_sound' and you want to show a question only when the grid did
not discontinue due to a triggered auto stop, then you can insert the
below logic into the question's Show If field:

> inputs.letter\_sound.gridAutoStopped

The use of the '!' gives us the opposite of the result returned by the
function. If the grid stopped the result will be true. When we use the
'!' in front of the function, it means that, when the grid did not stop
we want a positive answer hence show the question.

**Show a question based on the words per minute read on a grid**

It may happen that you need to show a question only to advanced
students. In those cases, we make use of the function
'itemsPerMinute(input)' This function returns the number of items per
minute read by the student. We can use it, just as before, in the Show
If input field of a question, like so:

itemsPerMinute(inputs.letter\_sound) \> 35

This call will force a question to be displayed only when the rate of
reading was higher than 35 workds per minute.

**NOTE:** All of the above functions can also be used to show or a hide
an entire section page.