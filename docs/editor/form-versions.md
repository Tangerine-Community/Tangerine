# Form Versions

Here's an example of how forms.json looks with support for form versions:

```json
{
"id" : "form-1",
"title" : "Form 1",
"src" : "./assets/form-1/draft.html",
"formVersionId": "3",
"formVersions": [
  {
    "id": "1",
    "src" : "./assets/form-1/1.html"
  },
  {
    "id": "2",
    "src" : "./assets/form-1/2.html"
  },
  {
    "id": "3",
    "src" : "./assets/form-1/3.html"
  }
]
}
```

### Creating a new Form Version

Create a form in editor or manually. Note that editor does not currently add any formVersions data to the form-info object:

```json
{
"id" : "form-1",
"title" : "Form 1",
"src" : "./assets/form-1/draft.html"
}
```

### Making the first release:

1. Add the Version properties (kinda like tagging) so that formResponses can save the versionId.
2. Copy the current draft.html to ${formVersionId}.html - 1.html in this case. (Could be a uuid.html)
3. Update formVersionId to the point to the formVersion id you just created.

```json
{
"id" : "form-1",
"title" : "Form 1",
"src" : "./assets/form-1/draft.html",
"formVersionId": "2",
"formVersions": [
  {
    "id": "1",
    "src" : "./assets/form-1/1.html"
  },
  {
    "id": "2",
    "src" : "./assets/form-1/2.html"
  }
]
}
```

### What is draft.html?

The file draft.html, which is called form.html in legacy versions of Tangerine, is used in editing forms. This is the "current working file" - the draft version of a form. As soon as there is a formVersions list - which is created the first time the app is released for testing or production - the app will use the path to the revision file, renamed to ${formVersionId}.html, for data entry.

### What is formVersionId?

The `formVersionId` is the id property for each formVersion. It changes whenever a new version the form is released for testing or production. The formVersionId also corresponds to the id in its related formVersion in the formVersions array. It signifies the version of the form that was used when creating new formResponses for that release of Tangerine and is saved with the formResponse as formVersionId. 

### Client data entry using this new version of Tangerine

During data entry on client, each formResponse will save the formVersionId as `formResponse.formVersionId`. 

### Making the second release:

1. At this point, add to the revisions array with a new revision object with a unique src and id properties. The name of the src html file could be the same as the id.
2. Copy the current draft.html to the src path of the new revision object. 
3. Update formVersionId to the point to the formVersion id you just created so that formResponses can save the formVersionId.


```json
{
"id" : "form-1",
"title" : "Form 1",
"src" : "./assets/form-1/draft.html",
"formVersionId": "2",
"formVersions": [
  {
    "id": "1",
    "src" : "./assets/form-1/1.html"
  },
{
    "id": "2",
    "src" : "./assets/form-1/2.html"
  }
]
}
```

### Creating a new form - starting fresh in editor or with legacy projects

```json
{
"id" : "form-1",
"title" : "Form 1",
"src" : "./assets/form-1/draft.html"
}
```

Old formResponses do not have the formVersionId defined. If missing:
- if no versions listed, use the formInfo.src
- If formVersions are listed, which one to choose? They may not be sequential. Select the revision marked "legacyOriginal":

```json
{
"id" : "form-1",
"title" : "Form 1",
"src" : "./assets/form-1/draft.html",
"formVersionId": "1",
"formVersions": [
  {
    "id": "1",
    "src" : "./assets/form-1/1.html",
    "legacyOriginal": true
  }
]
}
```

If you have a new project that uses revisions from the start - all formResponses would have the formVersionId property - there is no need to use the legacyOriginal property. 
 
Adding a revision:
Copy the current draft.html to 1.html. Could be a uuid.html
Use the current revisionId as the id for this revision.

```json
{
"id" : "form-1",
"title" : "Form 1",
"src" : "./assets/form-1/draft.html",
"revisionId": "2",
"revisions": [
  {
    "id": "1",
    "src" : "./assets/form-1/1.html"
  },
{
    "id": "2",
    "src" : "./assets/form-1/2.html"
  }
]
}
```

## Tooling

Proposals for tools to help in managing form versions:

- Linter idea - cli that checks if 2 form versions share the same path - makes sure there are no duplicate revision src paths. Check for dupes in formVersion.id and formVersion.src.
- start new dir in tangerine dir called `cli` - this would be the first subcommand of a new cli. This is different from the server cli. tangerine-preview is another command that could be integrated into this new cli. Example - `generate-new-form` creates the scaffolding for a new form and could implement/facilitate the revisions feature.
- Version incrementor - used for releases

## Testing version support

What are the different use-cases that the software must implement to fully support versions? The following list will list each case and the correct source for the form:

- Using the tangerine-preview app and must use the most recent version: formInfo.src
- Viewing a record created in a legacy group with no formVersionId and no formVersions: formInfo.src
- viewing a record created in a legacy group with no formVersionId but does have formVersions using the legacyOriginal flag: legacyVersion.src
- viewing a record created in a legacy group with no formVersionId but does have formVersions without legacyOriginal flag: lawd have mercy! formInfo.src
- viewing a record created in a new group using formVersionId and has formVersions: formVersion.src
- viewing a record created in a new group using formVersionId and does not have formVersions     : formInfo.src


