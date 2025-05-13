# Custom scripts

## Location of custom scripts
Tangerine offers several places to insert custom script

- Form level - the form's on-change, on-open, on-submit, and on-resubmit events can be used to manipulate the input, load other libraries, fonts or custom functions.
- Section level - like form level events, we can use the section level on-change and on-open events to call custom code
- custom-scripts.js - this file on the file system, is defined per group, and can be used to insert custom code. All functions defined here are available to the form and section events. 
- before-custom-updates.js - this file on the file system, is defined per group, and can be used to insert custom code which executes before an app update
- after-custom-updates.js - this file on the file system, is defined per group, and can be used to insert custom code which execute after an app update

## Examples Custom-scripts.js

!!! note 
    You can define those functions in your form's on-open event and use them across that form.

Set the value of a radio button. When you define this function in custom-scripts file you can call it from your forms as `window.setValueOfRadioButtons(inputs.MyInput, newValue)`

```
window.setValueOfRadioButtons = (input, value) => {
  input.value = input.value.map(button => {
    return{
      ...button,
      value: button.name === value ? 'on' : ''
    }
  })
}
```

Generate a UUID function. Use in on-change or on-open events like so `inputs.myInput.value = window.uuid()`

```
window.uuid = function() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}
```

Generate a today’s date and time that you can set a Date or Time input to. Use in on-change or on-open events like so `inputs.myDateInput.value = window.todayDate()` or `inputs.myTimeInput.value = window.todayTime()`

```
window.todayDate = (x) => {return new Date().toISOString().split('T')[0]}
window.todayTime = (x) => {return new Date().toTimeString().substring(0,5) }
```

