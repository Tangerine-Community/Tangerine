# Validation

Tangerine provides the option to check the validity of an input field. Navigate to the "Valid if" field in the Item Editor.

When we tap the Validation tab, we see that here we can enter logic to validate a question based on previous or current input. For the number input type we can also directly enter min and max values. For all validation we also have the option to specify a default error message. 

Inputs that are common for all validation screens are:

Warn-if: this input allows you to define logic to issue a warning if the condition is true. A warning validation means that clicking Next or Submit will fail the first time the user clicks it but will allow the user to continue on the second trial

Warning Text: this is the text displayed to the user when a warning condition is triggered

Valid if: this input allows you to define logic to issue an error if the condition is true. A valid if logic means that clicking Next or Submit will fail when the condition is met and the user is forced to correct the input

Error text: this is the text displayed to the user when a validation error is triggered

All warning and validation logic can make use of the getValue function but also you can access the current input's value by referring to  input.value. In many cases we also use the parseInt function to convert the text input to a number. 

In the below example you see an input defined which will trigger a validation if the value is great then 5, Between 5 and 7 it is only a warning message, meaning that the user can proceed if they click Next/Submit again but if the value is greater then 7 the user has to correct the input. 

<img src="../media/validation01.png" width="570">




The easiest validation is for number type of inputs. There we can directly specify the minimum and maximum values for the number that we can accept. 

I will add an age input of type number. Then on the Validation tab i have defined min and max values, as well as error text. 


<img src="../media/validation02.png" width="570">



I want to add one more validation to my stu_number variable, making sure it is exactly 6 characters long. For this I will use input.value.length == 6 

Here is how this looks in student number input. 
<img src="../media/validation03.png" width="570">



## Question/ Input Validation Examples
If, for example, the value entered into an "INPUT-NUMBER" field should have 9 or more characters, enter the following into "Valid if" for this item:
    
    :::javascript
    input.value.length > 9


<img src="../media/add_input.png" width="570">


Tangerine also allow you to compare the value entered in the current item to a value entered for another, earlier item. This might be the case, e.g. for attendance when observing a classroom. That is, when recording attendance, the number of children present should not exceed the number of children enrolled. Assume that a relevant variable name of the earlier item was "boys_enrolled" and the current items is about the boys present, this might be the validation logic to enter under "Valid if" for boys_present.

    :::javascript
    parseInt(input.value) <= inputs.boys_enrolled.value

<img src="../media/prior_valid.png" width="570">


If you want to validate that a number input is in between a particular range but also allow a 'No Reply' answer, use the below validation rule:

    :::javascript
    input.value >= 0 
    && input.value <= 10 
    || input.value == 999

Here we make sure that the user can only enter numbers between 0 and 10 but also 999 as a reply to this question.

You can now use the Mutually Exclusive option on the checkbox edit page to achieve the same functionality.

!!!Deprecated
If you have a list of checkboxes with the option No (value 0), NA (value 888), and some other options, and you'd like to make sure that the assessor cannot select the options No or the option NA along with other available options you need to implement a rule like the one below. The variable name in the below example is TQ1

    :::javascript
    (!getValue('TQ1').includes('888') && !getValue('TQ1').includes('0')) 
    || (getValue('TQ1').includes('888') 
    || getValue('TQ1').includes('0')) 
    && getValue('TQ1').length == 1