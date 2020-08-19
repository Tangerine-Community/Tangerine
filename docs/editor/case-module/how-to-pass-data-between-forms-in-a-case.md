# How to pass data between Forms in a Case

Let's say you had two forms in a Case, Form X and Form Y. In Form X, you collect the respondent's first name and last name, meanwhile in Form Y you want to confirm the data they entered on Form X.

## Form X
In Form X, we bubble up the `first_name` and `last_name` variables on Form X to the `first_name` and `last_name` variables at the Case level.

```html
<tangy-form
  id="form-x"
  title="Form X"
  on-submit="
    T.case.setVariable('first_name', getValue('first_name'))
    T.case.setVariable('last_name', getValue('last_name'))
  "
>
  <tangy-form-item id="item1">
    <tangy-input name="first_name" label="First name" required>
    <tangy-input name="last_name" label="Last name" required>
  </tangy-form-item>
</tangy-form>
```

## Form Y
In Form Y, we get the Case level variables of `first_name` and `last_name` and set them on the `first_name` and `last_name` inputs. This results in the form loading with the previously entered first and last names already filled out.

```html
<tangy-form id="form-y" title="Form Y">
  <tangy-form-item
    id="item1"
    on-open="
      inputs.first_name.value = T.case.getVariable('first_name')
      inputs.last_name.value = T.case.getVariable('last_name')
    "
  >
    <tangy-input name="first_name" label="Confirm your first name" required>
    <tangy-input name="last_name" label="Confirm your last name" required>
  </tangy-form-item>
</tangy-form>
```




