# Validation

Tangerine provides the option to check the validity of an input field. Navigate to the "Valid if" field in the Item Editor.

## Field Validation Examples
If, for example, the value entered into an "INPUT-NUMBER" field should have 9 or more characters, enter the following into "Valid if" for this item:
    
    :::javascript
    input.value.length > 9

![add_input](add_input.png)

Tangerine also allow you to compare the value entered in the current item to a value entered for another, earlier item. This might be the case, e.g. for attendance when observing a classroom. That is, when recording attendance, the number of children present should not exceed the number of children enrolled. Assume that a relevant variable name of the earlier item was "boys_enrolled" and the current items is about the boys present, this might be the validation logic to enter under "Valid if" for boys_present.

    :::javascript
    parseInt(input.value) <= inputs.boys_enrolled.value

![prior_valid](prior_valid.png)

If you want to validate that a number input is in between a particular range but also allow a 'No Reply' answer, use the below validation rule:

    :::javascript
    input.value >= 0 
    && input.value <= 10 
    || input.value == 999

Here we make sure that the user can only enter numbers between 0 and 10 but also 999 as a reply to this question.

If you have a list of checkboxes with the option No (value 0), NA (value 888), and some other options, and you'd like to make sure that the assessor cannot select the options No or the option NA along with other available options you need to implement a rule like the one below. The variable name in the below example is TQ1

    :::javascript
    (!getValue('TQ1').includes('888') && !getValue('TQ1').includes('0')) 
    || (getValue('TQ1').includes('888') 
    || getValue('TQ1').includes('0')) 
    && getValue('TQ1').length == 1