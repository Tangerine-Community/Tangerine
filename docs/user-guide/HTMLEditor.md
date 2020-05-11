The Instrument/Form HTML Editor
===============================

The Form HTML Editor provides a high-level interface to the form
creation or modification of an entire instrument or form. We suggest
avoiding this interface unless familiar with JavaScript, CSS and HTML5.
This view allows direct editing of instrument properties for advanced
users.


<img src="./media/image74.png" width="570">


Here you see the structure of a form in Tangerine. From this advanced view you can modify any element on the form.

- Change any of the form or section events: on-open, on-change, on-submit
- Change any of the form elements, or quick copy paste them.
- Copy an entire form's content for safekeeping.
- Change a section ID
- Copy a form from one Tangerine instance to another. Here you must change the form id to match that of the destination form id

Things to keep in mind if you decide to modify your forms directly from here:

- Never use double quotes in event logic.
- Never use double quotes in validation or skip logic rules
- Always create a copy of the form before you start editing
