# Adding Sections and Question to a Form

To add a new section to your instrument, hit "ADD SECTION".

<img src="../media/add_section.png" width="100">

The interface allows a drag-and-drop feature which enables reordering of the sections already created. The order in which the sections are listed, is the same as the sequence of screens that will be shown on the tablet when the tablet user is filling in the form.

## Section Editor
Upon adding a new section, or selecting to "EDIT" your instrument section, you will see the section editor screen below.

<img src="../media/sectionEditor.png" width="570">

If this is a new section, you might give it a new name from the section header. Click the pen icon on the right of the blue bar and overwrite the "title". Or any other of the configuration options. Then hit SUBMIT to save your edits.

<img src="../media/sectionEditor.gif" width="570">

## Section Options

Each one of the sections has some options that you can control:

Show this section in the summary at the end -- mark only if this section is the last one, and if you have coded some summary/feedback otherwise leave unchecked.

Hide the back button -- checking this option will remove the Back button from the section when rendered on the tablet.

Hide the next button -- hides the Next button on a section. Sometimes advancing the page may depend on the selection of an item, just like it is on some EF inputs. Generally, you keep this unchecked.

right-to-left orientation -- switches the position of the Back and Next buttons for RTL languages.

Hide navigation labels -- Hides the label from the Back and Next buttons so that it becomes an arrow.

Hide navigation icons -- Hides the arrow from the back and Next buttons. If both this and the above are checked you will only see an orange button without labels and text.

The on-open and on-change events allow you to insert complex skip logic or other custom code

Threshold: Number of incorrect answers before disabling remaining questions -- This option is used in conjunction with radio button questions only. Set it to the number of consecutive incorrect replies before the test is discontinued. You must mark an option in the radio button group as Correct for this to work. Only one correct option per question can be defined.



<img src="../media/insertButton.png" width="100">

To add an item to your instrument section, click

This opens the item type selection interface.

<img src="../media/itemInterface.png" width="570">

These elements are subdivided into groups of item types (e.g., inputs, location, lists, misc):

## Inputs

`TEXT`: This item type is a standard numbers and letters field

`NUMBER`: This item type opens up the number keyboard on the tablet and doesn't allow any other non-number characters to be inserted here

`EMAIL`: This item type includes automtaic validation for email entry

`ON-SCREEE-KEYBOARD`: This item type opens a keyboard with custom keys, that is the only source for data entry for this input. The keyboard is shown on the screen above the display of the text

## Date and time

`DATE`: This item type renders a calendar widget on the tablet

`TIME`: This item type displays a clock hour selection on the tablet

`PARTIAL DATE`: This item type displays a partial date input where parts of the date can be left empty.

`EHTIOPIAN DATE`: This item type displays a partial date input, with the Ethiopian calendar,  where parts of the date can be left empty.

## Lists

`CHECKBOX`: This item type allows for multiple answers to be selected from a list of options

`CHECKBOX GROUP`: Allows for multiple answer options to be selected from a group of options

`DROPDOWN (select)`: This item type allows for a single answer selection for longer lists

`RADIO BUTTONS`: This item type only allows for a single answer selection from a list of answer options

`RADIO BLOCKS`: This item type only allows for a single answer selection from a list of answer options. It shows the input with larger buttons, including text, image, or even audio attached to them

## Toggles

`CHECKBOX`: This item type only allows for the answer to be on or off

`TOGGLE BUTTON`: This item type only allows for the answer to be on or off

## Location

`GPS`: This item type automatically collects GPS coordinates of the tablet

`LOCATION`: The location item type requires a list of locations, e.g. school names by district and region to be imported to the Tangerine editor. Check out the location list section

## Content Display

`IMAGE: The item allows you to select an image already uploaded by the media library and present it to the user on a particular section.

`PHOTO CAPTURE`: This item type allows the user to take a photograph and attach it to the form.

`VIDEO CAPTURE`: This item type allows the user to take a video and attach it to the form.

`HTML CONTENT CONTAINER`: This item type allows for flexible integration of headers, help text, or transition messages that do not require any user input or response. We use this item type in Tangerine:Teach to insert instructions for each assessment for the teacher.

`HTML TEMPLATE`: This item type allows you to enter HTML code and variable value replacement code. Use ${} to enclose any code.

`REPEATABLE HTML GROUP`: This item type allows you to create a repeatable group of questions. Think of this as adding another row to a table. When the user clicks Add Another the same variables are duplicated, and the user can continue data entry. We use this item for an unknow number of variables. 

## Miscellaneous

`SIGNATURE`: this input type allows you to capture a signature by the assessor.

`CONSENT`: This item is a special function for participant consent. If the participants responds that no consent is given, the form will be closed, and data saved accordingly.

`QR CODE SCANNER`: This item allows scanning of a QR and Data Matrix codes. Tangerine will capture and save the target info (e.g., URL).

`EF TOUCH`: This item type is to assess children's executive functions, including working memory, inhibitory control, and cognitive flexibility (requires RTI manual support to upload your images and sounds).

`ACASI`: This item type allows the use of audio and image files in the assessment. It was designed to be used for self-evaluation.

`TIMED GRID`: This item type facilitates timed assessment approaches, e.g., to assess letter sound knowledge, oral reading fluency or math operations.

`UNTIMED GRID`: This item type facilitates assessment approaches that are not timed, but require many items, e.g., oral counting, untimed reading comprehension tasks, etc.

`CONDITIONAL GATE`: This item type of item is highly technical and can be used to confirm that a condition evaluated to true before continuing. At this moment this is only used in the case module implementation of Tangerine.  

Depending on the element chosen, an interface for providing more detail on the item being rendered/created is presented in the Item Editor.

