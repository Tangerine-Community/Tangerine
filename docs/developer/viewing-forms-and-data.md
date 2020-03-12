# Viewing Forms and Form Data

Use TangyFormService to retrieve form definitions and response data:

```js
    this.formResponse = await this.tangyFormService.getResponse(this.eventForm.formResponseId)
    const tangyFormMarkup = await this.tangyFormService.getFormMarkup(this.eventFormDefinition.formId)
```
