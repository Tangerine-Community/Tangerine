<style>
code {
  white-space : pre-wrap !important;
  word-break: break-word;
}
</style>
# Calculated inputs

Calculated inputs can be created in two steps:

- Create a hidden input to hold the calculation. It should be on the same section as the source inputs or a next section.
- Create formula in the on-change event, of the section containing the calculated input, so that you populate its input.

## Steps

- Create a hidden input on the same section as the source, or any of the following section. Use the on-change event to do the calculation

<img src="../media/calc1.png" width="250">

```
inputs.calculated.value = parseInt(getValue('Variabel1')) + parseInt(getValue('Variabel2')) + parseInt(getValue('Variabel3'))
```
 


- Add the calculation logic to the on-change event of the section
    
In this example my hidden input variable is calculated, and I am summing up 3 other inputs with variables Variable1, Variable2, and Variable3.

<img src="../media/calc2.png" width="500">

Every time the value of any of the three variables changes, the hidden input will update the calculation. This calculated input will be stored in the data and visible in the CSV.

 
 ## Examples
 
You can use similar logic to sum up the number of responses in a radio button group, on the condition that all values for the radio/checkboxes buttons must be numeric. 

```
inputs.calculated.value = parseInt(getValue('Variabel1')) + parseInt(getValue('Variabel2')) + parseInt(getValue('Variabel3'))
```

To sum up a all answers for one checkbox group, you can use similar logic Variabel1:

```
inputs.calculated.value = document.querySelector('tangy-checkboxes[name=Variabel1]').value.reduce((acc, item) => acc + (item?.value === 'on' ? parseInt(item.name, 10) || 0 : 0), 0)

```

To sum up multiple checkbox groups Variabel1 + Variabel2:

```
inputs.calculated.value = document.querySelector('tangy-checkboxes[name=Variabel1]').value.reduce((acc, item) => acc + (item?.value === 'on' ? parseInt(item.name, 10) || 0 : 0), 0) + document.querySelector('tangy-checkboxes[name=Variabel2]').value.reduce((acc, item) => acc + (item?.value === 'on' ? parseInt(item.name, 10) || 0 : 0), 0)

```

