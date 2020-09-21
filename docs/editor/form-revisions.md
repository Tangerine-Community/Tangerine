# Form Revisions

Here's an example of what form.json could look like with support for form revisions.

```json
{
"id" : "form-1",
"title" : "Form 1",
"src" : "./assets/form-1/form.html",
"revision": 4,
"revisions": [
  {
    "id": 1,
    "src" : "./assets/form-1/1.html"
  },
  {
    "id": 2,
    "src" : "./assets/form-1/2.html"
  },
  {
    "id": 3,
    "src" : "./assets/form-1/3.html"
  }
]
}
```

When creating a new version of a form, copy the currently deployed version (form.html) as ${revision}.html and the new 
version as form.html. Increment the revision number. Add a new revision object to the revisions array with the path to the 
previous version and its id.

The `revision` number is the number of revisions + 1.
