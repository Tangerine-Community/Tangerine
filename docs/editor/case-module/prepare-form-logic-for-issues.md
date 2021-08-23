# Preparing form logic for compatibility with Issues

Issues is a server level feature in Tangerine that allows privileged users to make proposals on changes to Form Responses. When a user is proposing changes, the system unlocks an already completed form. Form Developers must be careful when writing logic they only expect to be ran once in a form.

For example, setting a "caseOpenedOn" variable in the `on-open` of a form. When a form is reopened in an Issue, the logic could potentially overwrite the "caseOpenedOn" variable using the current date of the proposed change.  


```html
<tangy-form
    on-open="
        T.case.setVariable('caseOpenedOn', moment.now())
    "
>
``` 

This can be remedied by using the `T.case.isIssueContext()` helper function to ensure our variable setting does not happen in a reopen in the issue context.

```html
<tangy-form
    on-open="
        if (!T.case.isIssueContext()) {
            T.case.setVariable('caseOpenedOn', moment.now())
        }
    "
>
```

The same is true if you have any `<tangy-form-item>` level `on-open` or `on-change` logic that should not run in when being modified in an Issue. However, writing `<tangy-form>` logic for `on-submit` is a little different because `on-submit` code will not run when in the Issue context. Instead, if some code does need to run, place it in the `on-resubmit` code for a `<tangy-form>`.

Note in the following example how we only set `caseOpenedOn` in `on-submit`. This ensure this variable will only be set once. However, note how put the setting of `firstName` and `lastName` in the `on-resubmit`. This ensures that if the proposed change to this Form Response changes the `firstName` or `lastName` values, the Case will be updated to reflect this proposed change.

```html
<tangy-form
    on-submit="
        T.case.setVariable('caseOpenedOn', moment.now())
        T.case.setVariable('firstName', getValue('firstName'))
        T.case.setVariable('lastName', getValue('firstName'))
    "
    on-resubmit="
        T.case.setVariable('firstName', getValue('firstName'))
        T.case.setVariable('lastName', getValue('firstName'))
    "
>

```

There are also many input types such as GPS and Signature where it often does not make sense to recollect data upon submitting a proposal on an Issue. Consider adding `disable-if="T.case.isIssueContext()"` to these inputs.

```html
<tangy-gps name="gps" disable-if="T.case.isIssueContext()"></tangy-gps>
<tangy-signature name="signature" disable-if="T.case.isIssueContext()"></tangy-signature>
```

