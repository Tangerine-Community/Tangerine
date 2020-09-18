## Content Sets 
Content Sets are groups of forms and configuration you can use as a template for new groups.

## Anatomy of a Content Set

### Version 1 (< Tangerine v3.13.0)
In the root directory of a v1 Content Set, you will find the following:
- `./app-config.json_example` (required)
- `./forms.json` (required)

### Version 2 (> Tangerine v3.13.0)
Starting in Tangerine v3.13.0, the second iteration of Content Sets was launched. In the root directory of a v2 Content Set, you will find the following:

- `./client/` (required): The folder containing content that will be deployed to Tablets.
- `./client/app-config.defaults.json` (required): Defaults to use for `app-config.json`. For example, a Case Module enabled group would have a `"homeUrl"` property with a value of `"case-home"`.
- `./client/forms.json` (required)
- `./editor/` (required): A folder containing assets pertanent to how Editor behaves.
- `./editor/index.html` (required): The file loaded when displaying the Dashboard in a group's Editor.
- `./README.md` (suggested)
- `./docs/` (suggested)

## Creating a new Content Set

## Importing a Content Set into Tangerine

