# Dynamic Values in Questions

Sometimes you may want to include the respondents name in a next question label. In other words, use the response value of one question for the label of another. 

<img src="../../assets/dynVal1.png" width="570">

If you are updating the label for inputs in the same section as the source question as above use the `on-change` event. For inputs that are on a next section use this next section `on-open` event

## Updating the question label for inputs (text, number, date)

This examples inserts the name stored in variable st_name in the label of the question with variable age.

```
 inputs.age.label = `How old are you ${getValue('st_name')}?`
```

## Updating the question label for radio-buttons and checkboxes

This examples inserts the name stored in variable st_name in the label of the question with variable reading.

```
inputs.reading.$.label.innerText = `Do you like reading ${getValue('st_name')}?`
```

## Examples

This example uses questions in the same section and thus with the on-change event. If the question whose labels are on a next section use this next section's on-open event with the same code.

<img src="../../assets/dynVal2.png" width="570">



