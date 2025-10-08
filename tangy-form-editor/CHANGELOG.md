# CHANGELOG

## v7.22.0

- Add tangy-audio-recording-nlp-widget
- Bump tangy-form to 4.50.2

## v7.21.3, v7.21.4, v7.21.5, v7.21.6, v7.21.7

- Bump tangy-form to 4.49.4 to enabel custom style of tangy-radio-block background color
- Bump tangy-form to 4.49.5 to use tangy-form-item background color for tangy-radio-block label
- Bump tangy-form to 4.49.6 to convert webm to wav for tangy-audio-recording
- Bump tangy-form to 4.49.7 to fix resource leaks with tangy-audio-recording
- Bump tangy-form to 4.49.8 to prevent double click of tangy-audio-recording buttons

## v7.21.0, v7.21.1, v7.21.2

- Bump tangy-form to 4.49.1, 4.49.2, 4.49.3 with Tangy Audio Recording with Visualization
- Introduce autoStopMode config and UI for both TangyTimedWidget and TangyUntimedGridWidget, allowing selection between "first" and "consecutive" modes for auto-stop behavior.

## v7.20.2

- Bump tangy-form to 4.48.2 with fixes to Tangy Audio Recording and Playback widgets

## v7.20.1

- Bump tangy-form to 4.48.1 with fixes to Tangy Audio Recording and Playback widgets

## v7.20.0

- Bump tangy-form to 4.48.0

## v7.19.0

- Create Tangy Audio Recording and Tangy Audio Playback widgets
- Bump tangy-form to 4.47.0

## v7.18.2

- Bump tangy-form to 4.46.1

## v7.18.1

- Bump tangy-form to 4.46.0

## v7.18.0

- Add editor widgets for Tangy Prompt Box and updates to Tangy Radio Blocks

## v7.17.1 to v7.17.6

- Fix multiple location list selection to tangy-location-widget

## v7.17.0

- Add multiple location list selection to tangy-location-widget
- Bump tangy-form to 4.42.0

## v7.16.2
- Bumped tangy-form to 4.41.1.

## v7.16.1
- Updated url for file-list-component.

## v7.16.0
- Bumped versions for important libs including tangy-form, polymer-cli, and webpack.

## v7.15.4
- fix(custom-scoring): Add editing on reopen [#353](https://github.com/Tangerine-Community/tangy-form-editor/pull/353)
- fix(tangy-editor): Full Screen Nav Buttons alignment [#352](https://github.com/Tangerine-Community/tangy-form-editor/pull/352)
- Bump tangy-form to 4.38.2

## v7.15.3
- fix(section-copy): Copy sections including the contents [#350](https://github.com/Tangerine-Community/tangy-form-editor/pull/350)
- fix(scoring-section): Inputs previously selected are lost [#349](https://github.com/Tangerine-Community/tangy-form-editor/pull/349)
- fix(custom-scoring): reflect properties to attribute and offload custom script evaluation to client [#348](https://github.com/Tangerine-Community/tangy-form-editor/pull/348)
- Bump js-beautify from 1.14.6 to 1.14.7 [#347](https://github.com/Tangerine-Community/tangy-form-editor/pull/347)

## v7.15.2
- fix(video-capture): Allow users to toggle record-audio and persist the changes [#351](https://github.com/Tangerine-Community/tangy-form-editor/pull/351)
- Bump tangy-form to v4.38.1

## v7.15.1
- fix(cycle-sequences): User defined Cycle Sequences index should begin at 1 PR: [#231](https://github.com/Tangerine-Community/tangy-form-editor/pull/231)
- Bump tangy-form to v4.38.0
- Bump prismjs from 1.25.0 to 1.27.0
- Bump @polymer/polymer from 3.4.1 to 3.5.1

## v7.15.0
- fix(copying-sections): Copy sections including the contents. PR: [#345](https://github.com/Tangerine-Community/tangy-form-editor/pull/345)
- feat(scoring-section): Allow users to enter custom JavaScript code for calculating scores PR: [#344](https://github.com/Tangerine-Community/tangy-form-editor/pull/344)
- fix(tangy-form-editor): Persist changes when on-open and on-change are cleared. [#343](https://github.com/Tangerine-Community/tangy-form-editor/pull/343)
- Bump tangy-form from 4.37.0 to 4.37.1 [#342](https://github.com/Tangerine-Community/tangy-form-editor/pull/342)
- fix(text-update): Change link text from 'Use front camera' to 'Record Audio' [#341](https://github.com/Tangerine-Community/tangy-form-editor/pull/341)

## v7.14.11
- Persist list of fields for scoring in editor. Issue: [#340](https://github.com/Tangerine-Community/tangy-form-editor/pull/340)

## v7.14.10
- Add option to record audio when using `tangy-video-capture PR:[#333](https://github.com/Tangerine-Community/tangy-form-editor/pull/333)
- Updates to libs: mwc-fab, mwc-button, js-beautify, mwc-icon, terser, moment, tangy-form.

## v7.14.9
- Adds a checkbox labelled "This section includes scoring in section header" which opens a list of toggles of the fields in the form that will be scored if selected. PR: [#336](https://github.com/Tangerine-Community/tangy-form-editor/pull/336) Issue: [#1021](https://github.com/Tangerine-Community/Tangerine/issues/1021)

## v7.14.8
- Add Video Capture input warning text [#3376](https://github.com/Tangerine-Community/Tangerine/issues/3376)

## v7.14.7
- Add checkbox to edit confirmNo for tangy-consent element.

## v7.14.6
- Bump tangy-form to v4.36.1.
- Added instructions to related editor widgets about using photo/video capture elements in APK's and PWA's.

## v7.14.5
- Fix package-lock issue.

## v7.14.4
- Bump tangy-form to v4.34.5.

## v7.14.3
- Bump tangy-form to v4.34.4.

## v7.14.2
- Replaced suffix with postfix to be compatible with tangy-form for tangy-keyboard-input. 
- Bump tangy-form to 4.34.3.

## v7.14.1
- Bump tangy-form to v4.34.2.

## v7.14.0
- Added widget for 'tangy-video-capture'. Bump tangy-form to v4.34.1.

## v7.13.2
- Fix URLs in package-lock to use git+https instead of git+ssh.

## v7.13.1
- Add 'suffix' property inout for keyboard input widget.
- Bump tangy-form to v4.34.0.

## v7.13.0
- Add radio blocks and keyboard input widgets.

## v7.12.0
- Bump tangy-form to v4.31.0.
- Add support for configuring fullscreen-nav-align attribute on tangy-form.
- Add additional clarity on labels for fullscreen mode options
- Disable form preview when allowing fullscreen mode because it causes a confusing UX when editing forms.
- Add support for editing fullscreen-inline attribute on tangy-form. 

## v7.11.0
- Bump tangy-form to v4.30.0 and add support for open-in-fullscreen attribute.

## v7.10.5
- Bump tangy-form to v4.29.4

## v7.10.4
- Bump tangy-form to v4.29.3

## v7.10.3
- Bump tangy-form to v4.29.2

## v7.10.2
- Fix package-lock.json.

## v7.10.1
- Bump tangy-form to v4.29.1.

## v7.10.0
- Bump tangy-form to v4.29.0

## v7.9.7
- Fix breaking builds on Github Action by replacing dependency protocol of `git://` with `https://`.

## v7.9.6
- Fix validation logic when editing timed grids https://github.com/Tangerine-Community/Tangerine/issues/3130
- Bump tangy-form to v4.28.3.

## v7.9.5
- Bump tangy-form to v4.28.2.

## v7.9.4
- Updated package-lock.json

## v7.9.3
- Implement support for on-resubmit logic in tangy-form so that it won't be removed when edited: [#3017](https://github.com/Tangerine-Community/Tangerine/issues/3017)
- Update tangy-form to 4.28.0

## v7.9.2
- NPM build error fix.

## v7.9.1
- Rerelease due to merge conflict issue.

## v7.9.0
- Bump tangy-form to v4.27.0

## v7.8.8
- Added instructions for using Cycle Sequences. PR: [#231](https://github.com/Tangerine-Community/tangy-form-editor/pull/231)
- Bump tangy-form to 4.25.11

## v7.8.7
- Added warning for tangy-photo-capture input.

## v7.8.6
- Bump tangy-form to 4.25.9

## v7.8.5
- Fix issues w/ es6 module used in tangy-form. PR: [#213](https://github.com/Tangerine-Community/tangy-form-editor/pull/213)

## v7.8.4
- Combine build and publish actions into one so result of build is published.

## v7.8.3
- Fix bundled builds of tangy-form-editor that are built and published by github actions. Looks like the bundle has been stuck back in June 2020.

## v7.8.2
- Added photo capture widget to add input selector UI

## v7.8.1
- Updated dependencies based on Dependabot advice.

## v7.8.0

-  Added support for editing the  `tangy-photo-capture` component, which saves data as `jpeg` with `base64` encoding.
-  It attempts to take the picture with the highest possible quality and then resizes it with best practice resizing algorithms (using the built-in canvas resizer is poor quality). By default, it tries to keep the size below 256kb, but this can be changed to any arbitrary size using the max-size-in-kb attribute.
  **Example**
```html
 <template>
    <tangy-photo-capture name="test-photo" max-size-in-kb='128'></tangy-photo-capture>
</template>
```

## v7.7.5
- Reverted juicy-ace-editor import

## v7.7.4
- Reverted package choices for dr-niels-paper-expansion-panel and juicy-ace-edito to see if config change to GH Action workflow will use older url's.

## v7.7.3
- Switched to juicy-ace-editor-es6 to work around GH Action issues.

## v7.7.2
- Changed package urls for juicy-ace-editor and dr-niels-paper-expansion-panel to fix caused issue in GH Actions for npm ci

## v7.7.1
- Changed protocol to git+https in package.json to fix caused issue in GH Actions for npm ci

## v7.7.0
- Add validation to ensure captureItemAt is less than duration( Tangerine-Community/Tangerine#2294) - https://github.com/Tangerine-Community/tangy-form-editor/pull/181
- Labels for checkboxes and radio buttons should allow for HTML markup - https://github.com/Tangerine-Community/tangy-form-editor/pull/178
- Allow for setting cycle-sequences(Tangerine-Community/Tangerine#1603) - Part of Tangerine-Community/tangy-form#212


## v7.6.8
- Fix bump tangy-form to v4.23.3.

## v7.6.7
- Bump tangy-form to v4.23.3.

## v7.6.6
- Bump tangy-form to v4.23.1. 

## v7.6.5
- Bump tangy-form to v4.21.3.

## v7.6.4
- Improve functionality of `duplicate entire section` - PR: [173](https://github.com/Tangerine-Community/tangy-form-editor/pull/173)

## v7.6.3
- fix issue with package-lock.json.

## v7.6.2
- Bump tangy-form to v4.21.2.

## v7.6.1
- Bump tangy-form to v4.21.1.

## v7.6.0
- Bump tangy-form to v4.21.0.

## v7.5.3
- Make Repeatable Group namespace required and validate it. 
- Ensure Repeatable Group template does not start out as "undefined". 

## v7.5.2
- Bump tangy-form to v4.20.1.

## v7.5.1
- Fix icon for repeatable html section.

## v7.5.0
- Add support for editing <tangy-input-groups> to provide a repeatable section in a form https://github.com/Tangerine-Community/tangy-form-editor/pull/148

## v7.4.0
- Allow for duplication of entire section #142

## v7.3.0
- Bump tangy-form to v4.18.0.
- Add tangy-gate widget to support the new `<tangy-gate>` input.

## v7.2.5
- fix issue with package-lock.json. Minor doc update.

## v7.2.4
- Bump tangy-form to 4.17.10.

## v7.2.3
- fix issue with package-lock.json.

## v7.2.2
- Bump tangy-form to v4.17.9.

## v7.2.1
- Refactor showIf downcast to write show-if, not tangy-if. 
- Bump tangy-form to v4.17.8.

## v7.2.0
- Bump tangy-form to v4.17.7.
- Add support for hide-show-if, but add functionality to show-if and skip-if editors if there is already logic on the form. 

## v7.1.3
- Bump tangy-form to v4.17.6

## v7.1.2
- Bump tangy-form to v4.17.5

## v7.1.1
- Fix node package info for supporting releases from Github Actions.

## v7.1.0
- Bump tangy-form to v4.17.3 for new APIs related to getting and setting data.
- Implement github actions for publishing to NPM. Note updates to RELEASE-INSTRUCTIONS.md.

## v7.0.3
- Bump tangy-form to v4.16.0, which provides support for 'identifier' property on all tangy-form inputs.

## v7.0.2
- Fix background coloring of tangy-input https://github.com/Tangerine-Community/Tangerine/issues/2157 
- Fix use of hide-skip-if causing skip-if editor to be shown when adding an input https://github.com/Tangerine-Community/Tangerine/issues/2158

## v7.0.1
- Replace use of bug prone `calendar_today` icon with event icon.

## v7.0.0
- Add support for additional attributes to downcast and upcast, including ones that are unimplemented in the editor UI. Examples include `discrepancy-if`, `discrepancy-text`, `dont-show-if`.
- Major refactor of UI when editing in widgets. Now features a tabbed interface separating functional areas into categories of "question", "conditional display", "validation", and "advanced".
- Support for editing now consistent labels/questions number/etc as of tangy-form v4.15.0.
- Bump tangy-form to v4.15.0.

## v6.15.2
- Bump tangy-form to v4.14.1. 

## v6.15.1
- Bump tangy-form to v4.13.1. 

## v6.15.0
- Upgrade tangy-form to v4.13.0.

## v6.14.4
- Upgrade tangy-form to v4.12.3 to fix https://github.com/Tangerine-Community/Tangerine/issues/2090

## v6.14.3
- Bump tangy-form to 4.12.2 for more support in building sortable list.

## v6.14.2
- Removed @polymer/sortable-list dependency, which is already provided by tangy-form.

## v6.14.1
- Bump tangy-form to v4.12.1.

## v6.14.0
- Bump tangy-form to v4.12.0. This enables sortable tangy-list which gives us sortable radiobutton and checkbox group options.

## v6.13.6
- Fix issue on some implementations causing form titles to not save when duplicate variables are detected.

## v6.13.5
- Bumpt tangy-form to v4.11.5 to fix build errors related to underscore.

## v6.13.4
- Bump tangy-form to v4.11.3

## v6.13.1
- Bump tangy-form to v4.11.1

## v6.13.0
- Add support for hiding the `skip-if` editors by adding a `hide-skip-if` attribute to `<tangy-form-editor>`. This is a convenience for projects that want to opt-in to using `skip-if`. https://github.com/Tangerine-Community/tangy-form-editor/pull/106 

## v6.12.1
- In some situations such as a tabs implementation, the `<tangy-form-editor>` element may "connect" to the DOM more than once causing errors. We now only instantiate when the ready hook is called which ensures this only happens once thus fixing situations such as tabs where this element is used.

## v6.12.0
- Add support for modifying form level "record first open times" on items.
- Bump tangy-form to v4.11.0

## v6.11.2
- Bump tangy-form to v4.10.4

## v6.11.1
- Bump tangy-form to correct version, v4.10.2

## v6.11.0
- Bump tangy-form to v4.9.0
- Add support for editing input skip-if attribute.
- Add support for editing mutually-exclusive attribute on tangy-checkboxes options.

## v6.10.1
- Bump tangy-form to v4.7.1.

## v6.10.0
- Add support for editing labels on location elements.
- Bump tangy-form to v4.7.0.

## v6.9.2
- Bump tangy-form to v4.6.3.

## v6.9.1
- Bump tangy-form to v4.6.2.

## v6.9.0
- Add support for detecting duplicate variable names on form save.
- When a user clicks the top level "save" button, a new `tangy-form-editor-save` event dispatches.
- Add support for EFtouch required-all attribute.
- Refactor EFtouch no-corrections to be disable-after-selection.
- Refactor EFtouch multi-select and go-next-on-selection for new API.

## v6.8.1
- Bump tangy-form to v4.6.1

## v6.8.0
- Bump tangy-form to v4.6.0

## v6.7.2
- Fix broken allowed-pattern setting in text, number, and acasi widgets.
  - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1770

## v6.7.1
- Fix broken allowed-pattern and inner-label attribute settings in tangy-text-widget.
  - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1770

## v6.7.0
- Bump tangy-form to v4.5.0

## v6.6.1
- Bump tangy-form to v4.4.1

## v6.6.0
- Bump tangy-form to v4.4.0

## v6.5.9
- Upgrade tangy-form to v4.3.9.

## v6.5.8
- Upgrade tangy-form to v4.3.8.

## v6.5.7
- Upgrade tangy-form to v4.3.7.

## v6.5.6
- Upgrade tangy-form to v4.3.6.

## v6.5.5
- Fix common label attribute error-text by removing error-message and invalid-message usage.

## v6.5.4
- Fix resuming the use of incorrect-threshold attribute on tangy-form-item.
- Bump tangy-form to v4.3.4.

## v6.5.3
- Fix broken resuming of hide-next-button on item.
- Fix rendering and upcasting of tangy-form-item's incorrect-threshold attribute.

## v6.5.2
- Fix missing build.

## v6.5.1
- Fix missing build.

## v6.5.0
- New "Capture Item at" setting in tangy-timed. https://github.com/Tangerine-Community/tangy-form-editor/pull/85
- Upgrade to tangy-form v4.3.3. https://github.com/Tangerine-Community/tangy-form/releases/tag/v4.3.3

## v6.4.2
- Upgrade tangy-form to v4.3.2.

## v6.4.1
- Fix strange spacing for tangy partial date icon by switching icons.
- Add missing support for common label attribute of question-number.
- Fix saving of "exit clicks" setting.

## v6.4.0
- Features
  - Support for new elements and attributes in `tangy-form` v4.3.0. https://github.com/Tangerine-Community/tangy-form/blob/master/CHANGELOG.md#v430
- Fixes
  - Fix regex to allow for only valid variable names. 2 or more characters, begin with alpha, no spaces, periods, allow _ no dash
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1566, https://github.com/Tangerine-Community/Tangerine/issues/1558, https://github.com/Tangerine-Community/Tangerine/issues/1461
    - PR: https://github.com/Tangerine-Community/tangy-form-editor/pull/77

## v6.3.1
- Fix issue causing a checkbox to have a blank label if not placing label inline.

## v6.3.0
- Added support for modifying `exit-clicks` attribute on tangy-form; this is used in conjunction with fullscreen mode.

## v6.2.1
- Bump `tangy-form` version to `v4.1.1` for API change in tangy-select, EFTouch auto-progress work, and tangy-select test regression fix.

## v6.2.0
- Added autoStop input for untimed-grid-widget. [#65](https://github.com/Tangerine-Community/tangy-form-editor/pull/65)
- Removed display of secondaryLabel in renderPrint(). [#67](https://github.com/Tangerine-Community/tangy-form-editor/pull/67) There was an non-breaking API change in tangy-form - secondaryLabel changed to optionSelectLabel in tangy-select. 

## v6.1.0
- New email input option.
- Fix issue causing tangy-if and valid-if logic to be lost on GPS inputs [#62](https://github.com/Tangerine-Community/tangy-form-editor/pull/62) 
- New widgets to support additional inputs are now easier to write and maintain with the addition of attribute helper API [#64](https://github.com/Tangerine-Community/tangy-form-editor/pull/64)

## v6.0.0
- Upgrade to tangy-form v4.0.0 which includes breaking changes for form content. See details in the [tangy-form CHANGELOG](https://github.com/Tangerine-Community/tangy-form/blob/master/CHANGELOG.md#v400).

## v5.24.0
- Bump `tangy-form` version to `v3.23.0` for `inputs.VARIABE_NAME` access in `valid-if` logic.

## v5.23.2
- Fix for tnagy partial date editing.

## v5.23.1
- Increment tangy-form by patch version to receive some updates that will help with editing `<tangy-partial-date>`.

## v5.23.0
- Add option for adding partial date inputs.

## v5.22.0
- Add an Image option for inserting content into forms using the new file list selector. [#58](https://github.com/Tangerine-Community/tangy-form-editor/pull/58) 

## v5.21.0
- Implement usage of endpoint and file-list-select element for selecting files. [#57](https://github.com/Tangerine-Community/tangy-form-editor/pull/57)

## v5.20.0
- Add ACASI widget, support for incorrect-threshold in tangy-form-item, and 'correct' attribute in tangy-radio-buttons [#56](https://github.com/Tangerine-Community/tangy-form-editor/pull/56)

## v5.19.0
- Add new eftouch features [#55](https://github.com/Tangerine-Community/tangy-form-editor/pull/55)

## v5.18.1
- Fix breaking date/number/time widgets [#54](https://github.com/Tangerine-Community/tangy-form-editor/pull/54)

## v5.18.0
- Change numbering of tangy-timed and tangy-untimed-grid options to start from 1 instead of 0.

## v5.17.0
- Added optionFontSize input for tangy-timed and tangy-untimed-grid widgets.
- Increase tangy-form version to 3.16.0 to support new optionFontSize property in tangy-form.

## v5.16.1
- Fix bug that created duplicate elements when editing a tangy-box element. 
- Enable saving the whole form when using the html editor

## v5.16.0
- Increase tangy-form version to v3.15.0

## v5.15.0
- Now when there is an error in any of your custom logic, during preview an error message will appear with an approximation to where the issue is.

## v5.14.0
- Add "on submit" logic editor [#46](https://github.com/Tangerine-Community/tangy-form-editor/pull/46)

## v5.13.2
- Remove stray button with no functionality on item details editor.
- Remove reference to clicking a + icon to add inputs.

## v5.13.1
- Add additional UI color improvements left out of last release.

## v5.13.0
- UI Color improvements. https://github.com/Tangerine-Community/tangy-form-editor/pull/44

## v5.12.0
- Add support for translations using tangy-translation

## v5.11.3
- Add support for missing show-labels attribute on tangy-timed.

## v5.11.0
- Add editors for <tangy-consent> and <tangy-untimed-grid>

## v5.10.0
- Add support for <tangy-untimed-grid>

## v5.9.0
- Add widget Copy feature.

## v5.8.0
- Add support for editing `<tangy-form-widget>`.

## v5.7.0
- Add ability to work with `<tangy-qr>` elements for scanning QR Codes. 

## v5.6.0
- Increase tangy-form version to v3.8.0

## v5.5.1
- Fix issue where if you remove an input from an item and then click back, the item is not saved.
- Bump tangy-form to v3.7.1 to fix long tangy lists that are cut off. 

## v5.5.0
- Add hint text to all Widget edit screens.
- Sanitize input of variable names to ensure they don't break forms.

## v5.4.2
- Enforce consistent usage of styles by utilizing CSS variables.

## v5.4.1
- Enforce consistent usage of styles by utilizing CSS variables.

## v5.4.0
- New 'Valid if' on all widgets.
- Set rows and mark all rows on tangy-timed.
- Fix some widgets having issues with tangy-if.
- Fix tangy location widget's filter by global setting.

## v5.3.1
- Convert both text nodes and unclaimed elements by widgets to tangy-box widgets.
- Fix a bug where tangy-code would end up removing its value if not edited.
- Change "Back to Forms Listing" to "Back to Items Listing".
- Fix undefined values for tangy-timed options and remove unused label on tangy-timed.

## v5.3.0
- bug fixes
  - Dragging Add Widget before Submitting it closes the widget without save https://github.com/Tangerine-Community/Tangerine/issues/1283
  - Unclosed tags in html container can break form https://github.com/Tangerine-Community/Tangerine/issues/1289
  - time on grids cannot be changes and is always 60 seconds https://github.com/Tangerine-Community/Tangerine/issues/1301
  - Min and Max for input number cannot be saved through the interface https://github.com/Tangerine-Community/Tangerine/issues/1297
  - `undefined` should not be the default value in on-change/on-open editor https://github.com/Tangerine-Community/Tangerine/issues/1317
  - If you use a double quote in on change logic the form breaks https://github.com/Tangerine-Community/Tangerine/issues/1185
- Most widgets now have a "hint" field you can add.

## v5.2.0
- CSS improvements and general consistency improvements around save buttons.
- Added ability to edit metadata related output of a tangy-location element.

## v5.1.0
- `<tangy-form-editor print>` will show the form in print mode now. Each widget has an additional `renderPrint` method they can implement to provide markup for the print view.

## v5.0.0
- An entirely new Item editor experience replacing CKEditor.
- Editing a top level form now places "on-change" and "on-open" in an expandable "adanced" section.
- Now support for adding the "fullscreen" attribute to forms that editors want to add the tangy-form fullscreen experience to.
- Support for editing `<tangy-eftouch>` elements.

## v4.10.0
- added score fields and created Advanced tab for them in the tangy-timed plugin.

## v4.9.0
- Add support for filterByGlobal in the tangy-location plugin

## v4.8.0
- Bumped to tangy-form v2.9.0 which adds more elements that we'll make plugins for later.

## v4.7.0
- Bumped to tangy-form v2.6.0 which makes which space more compact in forms.

## v4.6.6
- CKEDITOR dialogs allowed variable name to be characters that would break tangy-form. Now there is validation for allowed characters. 

## v4.6.5
- Minor update to tangy-form that fixes editing of tangy-timed

## v4.6.0
- Update tangy-form.

## v4.5.0
- Feature: Add support for editing min and max of tangy-input

## v4.4.7
- Bug fix: Grids are not rendered in assessments #1039 https://github.com/Tangerine-Community/Tangerine/issues/1039

## v4.4.2
- Improvements for categories feature.
- Dispatch change event only when user clicks save button.

## v4.4.0
- Add ability to set value and label in options for tangy-checkoxes and tangy-radiobuttons

## v4.3.0
- Item editor now has cancel and save buttons with more logical behavior.
- tangy-form version bumped to v2.2.7.

## v4.2.3
- Make tangy-select button in ckeditor look like a select button, not a radiobutton.

## v4.2.0
- Fix an issue that was causing tangy-timed output to be missing value attributes of option elements.
- Add tangy-if field to all plugins for skip logic inline not in on-change and on-open.

## v4.1.0
- Add support for adding `right-to-left` and `hide-back-button` attributes to `<tangy-form-item>`.

## v4.0.0
- Breaking Change: Now emits `tangy-form-editor-change` event instead of `change` event.
- Feature: Can now mark items to be included on the summary tab after form completion.
- Bug: Clicking a checkbox in ckeditor would result in that checkbox being checked in the form on load. It was decided this is undesirable behavior. All values are set to "" by default.
