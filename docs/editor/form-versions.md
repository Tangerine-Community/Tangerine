# Form Versions

Throughout the lifetime of a form, many versions of a form may be deployed. When reviewing form responses collected on a past version of a form, it's important to open that form response using the version of the form it was collected on. When filling out a form response, it helps to think of the form response as a clear plastic sheet that you are writing on over the paper copy of the form. If the questions on that underlying physical form are removed, moved, or new questions are added, the clear plastic sheet you filled out previous form responses on no longer overlays correctly on the updated paper copy of that form.  The consequence of not using Form Versions on a form that changes over time is that when reviewing past data, if 1a question was removed in a future version of a form, it will appear that data collected in the past are now missing that data. There are other scenarios where a form version should be created which we will cover in later sections, but first a simple example.

## Example

### First Release

`forms.json`:
```json
[
  {
    "id" : "form-x",
    "title" : "Form X",
    "src" : "./assets/form-x/form.html",
  }
]
```

`./assets/form-x/form.html`:
```html
<tangy-form id="form-x" title="Form X">
  <tangy-input label="Question A" name="a"></tangy-input>
  <tangy-input label="Question B" name="b"></tangy-input>
</tangy-form>
```

### Second Release

```json
{
  "id" : "form-x",
  "title" : "Form X",
  "src" : "./assets/form-x/form.html",
  "formVersionId": "2",
  "formVersions": [
    {
      "id": "1",
      "src" : "./assets/form-x/1.html"
    },
    {
      "id": "2",
      "src" : "./assets/form-x/2.html"
    }
  ]
}
```

`./assets/form-x/form.html`:
```html
<tangy-form id="form-x" title="Form X">
  <tangy-input label="Question A" name="a"></tangy-input>
</tangy-form>
```

`./assets/form-x/1.html`:
```html
<tangy-form id="form-x" title="Form X">
  <tangy-input label="Question A" name="a"></tangy-input>
  <tangy-input label="Question B" name="b"></tangy-input>
</tangy-form>
```

`./assets/form-x/2.html`:
```html
<tangy-form id="form-x" title="Form X">
  <tangy-input label="Question A" name="a"></tangy-input>
</tangy-form>
```

### Third Release

```json
{
  "id" : "form-x",
  "title" : "Form X",
  "src" : "./assets/form-x/form.html",
  "formVersionId": "3",
  "formVersions": [
    {
      "id": "1",
      "src" : "./assets/form-x/1.html"
    },
    {
      "id": "2",
      "src" : "./assets/form-x/2.html"
    },
    {
      "id": "3",
      "src" : "./assets/form-x/3.html"
    }
  ]
}
```

`./assets/form-x/form.html`:
```html
<tangy-form id="form-x" title="Form X">
  <tangy-input label="Question A" name="a"></tangy-input>
  <tangy-input label="Question C" name="c"></tangy-input>
</tangy-form>
```

`./assets/form-x/1.html`:
```html
<tangy-form id="form-x" title="Form X">
  <tangy-input label="Question A" name="a"></tangy-input>
  <tangy-input label="Question B" name="b"></tangy-input>
</tangy-form>
```

`./assets/form-x/2.html`:
```html
<tangy-form id="form-x" title="Form X">
  <tangy-input label="Question A" name="a"></tangy-input>
</tangy-form>
```

`./assets/form-x/3.html`:
```html
<tangy-form id="form-x" title="Form X">
  <tangy-input label="Question A" name="a"></tangy-input>
  <tangy-input label="Question C" name="c"></tangy-input>
</tangy-form>
```

## When should I create a new Form Version?

Situations when a new Form Version should be created include:

1. New question
2. Removed question
3. Options for a question added or removed.
4. New page
5. Removed page
6. Reordered pages

Situations when a new Form Version can be skipped:
1. Label of a question has changed.
2. Variable marked as required.

## Future Tooling proposals

Proposals for tools to help in managing form versions:

- Linter idea - cli that checks if 2 form versions share the same path - makes sure there are no duplicate revision src paths. Check for dupes in formVersion.id and formVersion.src.
- start new dir in tangerine dir called `cli` - this would be the first subcommand of a new cli. This is different from the server cli. tangerine-preview is another command that could be integrated into this new cli. Example - `generate-new-form` creates the scaffolding for a new form and could implement/facilitate the revisions feature.
- Version incrementor - used for releases

Proposed Testing version support:

What are the different use-cases that the software must implement to fully support versions? The following list will list each case and the correct source for the form:

- Using the tangerine-preview app and must use the most recent version: formInfo.src
- Viewing a record created in a legacy group with no formVersionId and no formVersions: formInfo.src
- viewing a record created in a legacy group with no formVersionId but does have formVersions using the legacyOriginal flag: legacyVersion.src
- viewing a record created in a legacy group with no formVersionId but does have formVersions without legacyOriginal flag: lawd have mercy! formInfo.src
- viewing a record created in a new group using formVersionId and has formVersions: formVersion.src
- viewing a record created in a new group using formVersionId and does not have formVersions     : formInfo.src


