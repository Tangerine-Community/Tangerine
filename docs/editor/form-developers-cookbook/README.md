# The Tangerine Form Developers' Cookbook
Examples of various recipes for Tangerine Forms collected throughout the years. To create your own example, remix the [example](https://form-demos.tangerinecentral.org/tangy-form-example-template) on glitch.com.

## Skip a question based on input in another question
In the following example we ask an additional question about tangerines if the user indicates that they do like tangerines.

[Run example](https://form-demos.tangerinecentral.org/skip-question-based-on-input) 

![skip-question-based-on-input](./skip-question-based-on-input.gif)

## Skip sections based on input
In the following example, wether or not you answer yes or no to the question, you will end up on a different item.

[Run example](https://form-demos.tangerinecentral.org/skip-sections-based-on-input) 

![skip-sections-based-on-input](./skip-sections-based-on-input.gif)

## Valid by number of decimal points
In the following example, we validate user input by number of decimal points.

[Run example](https://form-demos.tangerinecentral.org/valid-by-number-of-decimal-points) 

![valid-by-number-of-decimal-points](valid-by-number-of-decimal-points.gif)

## Valid if greater or less than other input
[Run example](https://form-demos.tangerinecentral.org/valid-if-greater-or-less-than-other-input) 

![valid-if-greater-or-less-than-other-input](valid-if-greater-or-less-than-other-input.gif)

## Allowed date range based on today
[Run example](https://form-demos.tangerinecentral.org/allowed-date-range-based-on-today) 

![allowed-date-range-based-on-today](allowed-date-range-based-on-today.gif)

## Flag choice as discrepancy and/or warning and show or hide content depending
[Run example](https://form-demos.tangerinecentral.org/flag-discrepancy-or-warning-and-hide)

![flag-discrepancy-or-warning-and-hide](flag-discrepancy-or-warning-and-hide.gif)

## Indicate a mutually exclusive option in a checkboxes group such as "None of the above"
In the following example when you make a selection of a fruit and then choose one of the mutually exclusive options, your prior selections will be deselected.

[Run example](https://form-demos.tangerinecentral.org/mutually-exclusive-checkbox-options) 

![Jan-03-2020 13-48-05](https://user-images.githubusercontent.com/156575/71742567-37efed00-2e30-11ea-999c-9afe2e0b9492.gif)

## Capture and show local date and time
Sometimes we want to show the user the local date and time to ensure their time settings are correct. 

[Run example](https://form-demos.tangerinecentral.org/capture-local-date-and-time) 

![tangerine-form-editors-cookbook--capture-local-date-and-time](./tangerine-form-editors-cookbook--capture-local-date-and-time.png)

## Show a timer in an item
Let's say you want to show a timer of how long someone has been on a single item. This calculates the time since item open and displays number of seconds since then in a tangy-box.

[Run example](https://form-demos.tangerinecentral.org/show-a-timer-in-an-item) 

![stop watch](./tangerine-form-editors-cookbook--stop-watch.gif)

## Capture the time between two items
Sometimes we want to know how much time passed between two points in a form. This example captures, the `start_time` variable on the first item, then `end_time` on the last item. Lastly it calculates the length of time.

[Run example](https://form-demos.tangerinecentral.org/capture-the-time-between-two-items) 

![timed items](tangerine-form-editors-cookbook--timed-items.gif)


## Hard checks vs. soft checks
A "hard check" using "valid if" will not allow you to proceed. However a "soft check" using "warn if" will allow you to proceed after confirming.

[Run example](https://form-demos.tangerinecentral.org/soft-checks-vs-hard-checks) 

![soft-checks-vs-hard-checks](./soft-checks-vs-hard-checks.gif)


## Set selected value in radio buttons
In the following example we set the value of a `<tangy-radio-buttons>`.

[Run example](https://form-demos.tangerinecentral.org/set-value-of-tangy-radio-buttons) 

![set-value-of-tangy-radio-buttons](./set-value-of-tangy-radio-buttons.png)


## Dynamically prevent proceeding to next section
In the following example hide the next button given the value of some user input.

[Run example](https://form-demos.tangerinecentral.org/dynamically-prevent-next)
 
![dynamically-prevent-next](./dynamically-prevent-next.gif)

## Proactive input validation 
In the following example we validate an input after focusing on the next input. This approach is more proactive than running the validation logic when clicking next or submit. 

[Run example](https://form-demos.tangerinecentral.org/proactive-input-validation) 

![proactive-input-validation](./proactive-input-validation.gif)

## Content Box with Tabs 
In the following example we display content in a set of tabs.  

[Run example](https://form-demos.tangerinecentral.org/tangy-form-tabs) 

![tangy-form-tabs](./tangy-form-tabs.gif)

## Dynamic Changing of Text Color 
In the following example we change the color of text depending on a user's selection.  

[Run example](https://form-demos.tangerinecentral.org/dynamically-change-text-color) 

![dynamically-change-text-color](./dynamically-change-text-color.gif)

## Use skip-if to reference variable inside tangy-inputs-group
In the following example a `skip-if` refers to an other variable local to the group itself is in. The trick is using backticks around the variable name (not quotes) you are referencing and prepending the variable name you are referencing with `${context.split('.')[0]}.${context.split('.')[1]}.`.  

[Run example](https://form-demos.tangerinecentral.org/skip-if-inside-tangy-inputs-groups) 


![skip-if-inside-tangy-inputs-groups](./skip-if-inside-tangy-inputs-groups.gif)

## Use valid-if to reference variable inside tangy-inputs-group
In the following example a `valid-if` refers to an other variable local to the group itself is in. The trick is using backticks around the variable name (not quotes) you are referencing and prepending the variable name you are referencing with `${input.name.split('.')[0]}.${input.name.split('.')[1]}.`.  Watch out for the gotcha of not using `input.name` instead of `context` like we do in a `skip-if`.

[Run example](https://form-demos.tangerinecentral.org/valid-if-inside-tangy-inputs-groups) 


![skip-if-inside-tangy-inputs-groups](./valid-if-inside-tangy-inputs-groups.gif)

## Dynamic Location Level
In the following example we empower the Data Collector to select which Location Level at which they will provide their answer. This example can also be used in a more advanced way to base the level of location required for entry given some other set of inputs.

[Run example](https://form-demos.tangerinecentral.org/dynamic-location-levels) 


![dynamic-location-levels](./dynamic-location-levels.gif)

## Prevent user from proceeding during asynchronous logic
Sometimes in a form the logic calls for running some code that is asynchronous such as database saves and HTTP calls. As this logic runs, we would like to prevent the user from proceeding in the form. This is a job for a `<tangy-gate>`. Tangy Gate is an input that by default will not allow a user to proceed in a form. The gate can only be "opened" by some form logic that set's that Tangy Gate's variable name's value to `true`. This gives your logic in your forms an opportunity to run asynchronously, blocking the user from proceeding, then when async code is done your code sets the the gate to open.

[Run example](https://form-demos.tangerinecentral.org/tangy-gate-example)  

![dynamic-location-levels](./tangy-gate-example.gif)

