# How to create a workflow for changing a Case's location
Using a combination of a `<tangy-location>` input on a form and some logic in the same form's `on-submit` hook, you can empower users to reassign a Case to a new location. In the Case Module's Content Set we have a "Change Location of Case" Case Event Definition, a "Change Location of Case" Event Form, and corresponding "Change Location of Case" Form. We'll use that Content Set as our example. 

The form could be in any event, or even it's own event as it is in the Case Module content set. The important part is in the form you place the `<tangy-location>` for selecting a new locatoin to assign the case to. The following shows the markup of a form that uses the `caseService.changeLocation()` API to change the location of a Case given the value selected in the `<tangy-location>` input.

```html
<tangy-form title="Change location of case" id="change-location-of-case"
  on-submit="
    caseService.changeLocation(inputs.new_location_assignment.value)
  "
>
  <tangy-form-item id="item1">
    <tangy-location label="Choose a location to assign this case to." name="new_location_assignment" required></tangy-location>
  </tangy-form-item>
</tangy-form>
```

