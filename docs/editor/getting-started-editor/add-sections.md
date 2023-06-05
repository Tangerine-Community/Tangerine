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

Threshold: Number of incorrect answers before disabling remaining questions -- This option is used in conjunction with radio button questions only. Set it to the number of consecutive incorrect replies before the test is discontinued. You must mark an option in the radio button group as Correct for this to work. Only one correct option per question can be defined.

<img src="../media/insertButton.png" width="100">


To add an item to your instrument section, click

This opens the item type selection interface.


<img src="../media/itemInterface.png" width="570">


These elements are subdivided into groups of item types (e.g., inputs, location, lists, misc):

## Inputs

INPUT-DATE: This item type renders a calendar widget on the tablet


INPUT-TEXT: This item type is a standard numbers and letters field



INPUT-TIME: This item type displays a clock hour selection on the tablet



INPUT-NUMBER: This item type opens up the number keyboard on the tablet and doesn't allow any other non-number characters to be inserted here



## Location

GPS: This item type automatically collects GPS coordinates of the tablet



LOCATION: The location item type requires a list of locations, e.g. school names by district and region to be imported to the Tangerine editor. Check out the location list section



## Lists

CHECKBOX: This item type allows for multiple answers to be selected from a list of options



CHECKBOX GROUP: Allows for multiple answer options to be selected from a group of options



DROPDOWN (select): This item type allows for a single answer selection for longer lists



RADIO BUTTONS: This item type only allows for a single answer selection from a list of answer options



## Miscellaneous

IMAGE: the image items allows you to select an image already uploaded by the media library and present it to the user on a particular section



SIGNATURE: this input type allows you to capture a signature by the assessor.



HTML CONTENT CONTAINER: This item type allows for flexible integration of headers, help text, or transition messages that do not require any user input or response.



QR CODE SCANNER: This item allows scanning of a QR and Data Matrix codes. Tangerine will capture and save the target info (e.g. URL).



EF TOUCH: This item type is to assess children's executive functions, including working memory, inhibitory control, and cognitive flexibility (requires RTI manual support to upload your images and sounds).



TIMED GRID: This item type facilitates timed assessment approaches, e.g., to assess letter sound knowledge, oral reading fluency or math operations.



UNTIMED GRID: This item type facilitates assessment approaches that are not timed, but require many items, e.g. oral counting, untimed reading comprehension tasks, etc.



CONSENT: This item is a special function for participant consent. If the participants responds that no consent is given, the form will be closed and data saved accordingly.



Depending on the element chosen, an interface for providing more detail on the item being rendered/created is presented in the Item Editor.