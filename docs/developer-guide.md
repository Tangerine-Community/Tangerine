# Developer Guide

## Add a new Class to client
- Add file to `conf.libFiles` array in `client/Gulpfile.js`.
- Add a `<script src=` tag to `client/src/index-dev.html`.

## Add new Class to Editor
- Add file to `conf.fileOrder` array in `editor/Gulpfile.js`.
- Add a `<script src=` tag to `editor/src/index-dev.html`.


## Add new question prototype
- Update `templates.json` to include new entry in `prototypes: {...}` and `subtestTemplates: {...}`
- Update `configuration.template` to include new entry in `prototypeViews: {...}`
