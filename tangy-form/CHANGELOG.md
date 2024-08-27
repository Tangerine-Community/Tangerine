# CHANGELOG

## v4.45.3

Fix undefined access of input without tagName

## v4.45.2

Fix check for 'readOnly' input metadata

## v4.45.1

Fix typo in function name

## v4.45.0

At times we may need to disable some components when form is unlocked A good example is the tangy-gps component

Add disabled property and readOnly property

For example: `this.unlockFormResponses? this.formEl.unlock({disableComponents:['TANGY-GPS']}): null`

Refs [Tangerine-Community/Tangerine#3703](https://github.com/Tangerine-Community/Tangerine/issues/3703)
Part of [Tangerine-Community/Tangerine#3719](https://github.com/Tangerine-Community/Tangerine/pull/3719)


## v4.44.0, v4.43.0, v4.43.1, v4.43.2

__Tangerine Radio Blocks__

The `tangy-radio-blocks` element is a single-select input that shows a set of `tangy-radio-block` options. Each option has a label, image, and border that identifies the option. The set of `tangy-radio-block` options appears in either a vertical or horizontal list based on the `columns` attribute. 

This update adds a `sound` attribute to `tangy-radio-block` that takes a path to an audio file. When the image in the option is clicked, the audio will play. 

```html
<tangy-radio-blocks name="moving_windows_comp_02" label="What does Kofi like to do?" orientation="rows" class="" style="" required="">
    <option value="0" image="./assets/images/ms-talk2.png" sound="assets/sounds/letters_silent_rcomp_01_Tie_her_shoes.mp3">Tie her shoes</option>
    <option value="1" image="./assets/images/ms-talk2.png" sound="assets/sounds/letters_silent_rcomp_01_Visit_the_city.mp3">Visit the city</option>
    <option value="2" image="./assets/images/ms-talk2.png" sound="assets/sounds/letters_silent_rcomp_01_Run.mp3">Run</option>
    <option value="3" image="./assets/images/ms-talk2.png" sound="assets/sounds/letters_silent_rcomp_01_Get_up_early.mp3">Get up early</option>
</tangy-radio-blocks>
```

__Tangerine Prompt__

The new `tangy-prompt-box` input type helps form designers create content sets that interacts with the user through a set of auto-playing sound files. The prompt in the [tangy-radio-blocks-lists demo](./demo/tangy-radio-blocks-lists.html) reads some instructions and then prompts the user by playing the audio associated with the options in a `tangy-radio-blocks` input. This provides a tool for the user to build a self administered assessment. 

The `tangy-prompt-box` input adds two attributes `playOnOpen` which takes a list of option values. When set, the options in the attribute list will play when the input is shown. Also, the attribute `prompt-for` can be set on one or more options with the value of the name of a `tangy-radio-blocks` input. When clicked, the prompt will play it's own `sound`, then loop through the `sound` attributes in the `tangy-radio-blocks`. It will also change the border color to provide both an audio and visual cue. 

Review the example code below. When the `tangy-form-item` opens the prompt box with play the audio for "instructions" and "help". Then, because of the `prompt-for` attribute is set to `moving_windows_comp_02`, it will play sound files in all of the options in the `tangy-radio-blocks` input. If the `help` option in the `tangy-prompt-box` is clicked, it will play it's own sound and then sounds in the prompt box.

```html
<tangy-form>
  <tangy-form-item>
    <tangy-prompt-box name="moving_windows_comp_02_prompt" play-on-open="0,1" justify-content="flex-start">
        <option value="0" id="instructions" label="prompt" sound="assets/sounds/letters_moving_windows_comp_help.mp3" image="./assets/images/instructions.png"></option>
        <option value="1" id="help" label="insturctions" prompt-for="moving_windows_comp_02" sound="assets/sounds/letters_moving_windows_comp_02_What_does_Kofi_like_to_do.mp3" image="./assets/images/ms-talk2.png"></option>
    </tangy-prompt-box>
    <tangy-radio-blocks name="moving_windows_comp_02" label="What does Kofi like to do?" orientation="rows" class="" style="" required="">
        <option value="0" image="./assets/images/ms-talk2.png" sound="assets/sounds/letters_silent_rcomp_01_Tie_her_shoes.mp3">Tie her shoes</option>
        <option value="1" image="./assets/images/ms-talk2.png" sound="assets/sounds/letters_silent_rcomp_01_Visit_the_city.mp3">Visit the city</option>
        <option value="2" image="./assets/images/ms-talk2.png" sound="assets/sounds/letters_silent_rcomp_01_Run.mp3">Run</option>
        <option value="3" image="./assets/images/ms-talk2.png" sound="assets/sounds/letters_silent_rcomp_01_Get_up_early.mp3">Get up early</option>
    </tangy-radio-blocks>
  </tangy-form-item>
</tangy-form>
```

## v4.42.0

- Add selected tangy-location labels to the input value for reporting outputs

## v4.41.1
- Removed (unsupported) wct-browser-legacy, which has dependencies that are critical security risks. Tested using https://github.com/Polymer/tools/tree/master/packages/web-component-tester for tests, which has less risk, but still some issues. Tests currently throw errors. The web-component-tester lib is now in package.json devDependencies.
- Added config file for npm-package-json-lint, which lints package.json.
- Removed iron-icon from package.json - is a dep of iron-icons.

## v4.40.0
- Add 'archived' flag to tangy inputs to allow archiving and unarchiving of form responses

## v4.39.3
- Fix "Cannot read properties of null (reading 'getTracks')" error. Commit [8e4c7c4446161dbafc8c115f788916cba1f1e0e4](https://github.com/Tangerine-Community/tangy-form/commit/8e4c7c4446161dbafc8c115f788916cba1f1e0e4)

## v4.39.2
- fixed poor logic for noVideoConstraints property (tangy-video-capture).

## v4.39.1
- fixed bug (extra bracket) with tangy-video-capture, commit #f53a353697e8dc02e83802b01bb05aa05f9648f9

## v4.39.0
- fix(tangy-untimed-grid): Add tangy element styles to allow skipping of untimed grid. [#384](https://github.com/Tangerine-Community/tangy-form/pull/384)
- Fix bad API use in tangy-video-capture - fixed constraints for video and audio when using `noVideoConstraints` and `frontCamera` properties. [#380](https://github.com/Tangerine-Community/tangy-form/pull/380)
- Bump json5 from 1.0.1 to 1.0.2 [#385](https://github.com/Tangerine-Community/tangy-form/pull/385)
- Bump lit from 2.4.0 to 2.6.1 [#388](https://github.com/Tangerine-Community/tangy-form/pull/388)
- Bump devtools-detect from 4.0.0 to 4.0.1 [#382](https://github.com/Tangerine-Community/tangy-form/pull/382)
- Bump decode-uri-component from 0.2.0 to 0.2.2 [#381](https://github.com/Tangerine-Community/tangy-form/pull/381)
- Many updates to core packages. 
- If running on a Mac with the M1 processor, you must run `node node_modules/polymer-cli/node_modules/wd/scripts/build-browser-scripts.js`
  in order to avoid the error `cli runtime exception: Error: Cannot find module '../build/safe-execute'` when testing with `npm test`.

## v4.38.3
- fix(record-audio): Request permissions for recording audio [#375](https://github.com/Tangerine-Community/tangy-form/pull/375)

## v4.38.2
- fix(custom-scoring): Add custom scoring logic property [#372](https://github.com/Tangerine-Community/tangy-form/pull/372)
- Upgrade lit to v2.4.0 and signature_pad to v4.1.0.
- Updated tangy-gate custom element to use new lit version. 

## v4.38.1
- Set init property values for frontCamera and noVideoConstraints to false for tangy-video-capture.

## v4.38.0
- Bump the following dependencies: polymer, prismjs, translation-web-component, webcomponentsjs, redux, signature_pad

## v4.37.1
- Add protection to scoring if no inputs are defined

## v4.37.0
- Add automatic scoring functionality for sections that have the `scoring-section` property set. PR: [364](https://github.com/Tangerine-Community/tangy-form/pull/364)
- Allow users to record audio when capturing video. The new 'recordAudio' attribute to tangy-video-capture input adds audio to the video capture. PR: [#363](https://github.com/Tangerine-Community/tangy-form/pull/363)
- Updates to the following libs: terser, moment, xzing.

## v4.36.3
- Tangy keyboard required attribute is not respected [#3395](https://github.com/Tangerine-Community/Tangerine/issues/3395)
- Fix border rule [#362](https://github.com/Tangerine-Community/tangy-form/pull/362)

## v4.36.2
- Additional space removal. [#347](https://github.com/Tangerine-Community/tangy-form/pull/347)
- CSS changes for generalization [#355](https://github.com/Tangerine-Community/tangy-form/pull/355)
- Remove forced height; hold open input-container to avoid weird growing [#360](https://github.com/Tangerine-Community/tangy-form/pull/360)

## v4.36.1
- Enable grids to be hidden based on skip logic [#1391](https://github.com/Tangerine-Community/Tangerine/issues/1391)

## v4.36.0
- Add confirmation to consent form if 'No' selected before the form is closed [#3025](https://github.com/Tangerine-Community/Tangerine/issues/3025). Activate this feature using the new property: `confirm-no="true"`.

## v4.35.1
- Set value for <tangy-photo-capture> input to image url before dispatching TANGY_MEDIA_UPDATE event. 

## v4.35.0
- The <tangy-photo-capture> input may now save to the file system. It uses the same TANGY_MEDIA_UPDATE event as tangy-video-capture.
  In the consuming application, cancel the event (event.preventDefault()) if you wish it to use the original behaviour of saving to the local Pouchdb instance. See the ./demo/tangy-photo-capture.html example for implementation details.

## v4.34.5
- Add getValueAsMoment helper function [#325](https://github.com/Tangerine-Community/tangy-form/pull/325)

## v4.34.4
- Allow items behind card-actions to be tapped. [#340](https://github.com/Tangerine-Community/tangy-form/pull/340)
- Remove extra space at top [#339](https://github.com/Tangerine-Community/tangy-form/pull/339)
- Updates to libs in package.json: devtools-detect, image-blob-reduce, and signature_pad

## v4.34.3
- Fixed configuration options for tangy-video-capture, including issue [Default Codec for tangy-video-capture is not read from input settings #3333](https://github.com/Tangerine-Community/Tangerine/issues/3333)

## v4.34.2
- Improved UX for 'tangy-video-capture' by consolidating the record and save buttons into a single button. Also added some CSS borders around the video to indicate recording active, recording stopped, and playback. 

## v4.34.1
- Added 'dataType' property and removed unused properties from 'tangy-video-capture'.

## v4.34.0
- Add postfix property to tangy-keyboard-input. Also add highlight to value entered. PR: [#333](https://github.com/Tangerine-Community/tangy-form/pull/333)

## v4.33.2
- Dispatch a `TANGY_MEDIA_UPDATE` event when `<tangy-video-capture>` value is updated. This will be useful when saving media files to the server.

## v4.33.1
- Fix URL for sortable dependency to be git+https instead of git+ssh.

## v4.33.0
- Add new input `<tangy-video-capture>`. Takes the following properties:
  - frontCamera: Boolean. Whether to use the front camera or the back camera. Default is `true`. 
  - noVideoConstraints: Boolean. Whether to force use of front or back camera. If true, chooses the first available source.  Default is `true`. 
  - codec: String. The codec to use. Default is 'video/webm;codecs=vp9,opus' - AKA webm vp9. It is possible the device may not support all of these codecs. Other potential codecs:
    - video/webm;codecs=vp8,opus
    - video/webm;codecs=h264,opus
  - videoWidth: Number. The width of the video. Default is `1280`.
  - videoHeight: Number. The height of the video. Default is `720`.

## v4.32.1
- Fix URL for sortable dependency to be https instead of `git://`.

## v4.32.0
- Add new inputs `<tangy-keyboard-input>` and `<tangy-radio-blocks>`.

## v4.31.0
- Add support for `fullscreen-inline` attribute on `<tangy-form>` to do fullscreen just in app without Fullscreen API. (https://github.com/Tangerine-Community/tangy-form/commit/c5bdecbe36b8efccea362f7a158e2acc33f8526c)
- Add support for `full-screen-nav-align` attribute on `<tangy-form>` for aligning the fullscreen nav to top or bottom. Example: `<tangy-form full-screen-nav-align="bottom">`  (https://github.com/Tangerine-Community/tangy-form/commit/7aaae3fcd3822413de523afa1abe5c931ce04ab3)
- Provide CSS variables for action buttons when positions top or bottom in fullscreen. (https://github.com/Tangerine-Community/tangy-form/commit/a14cf6d1d434d41402c930025c5483f0d157080d, https://github.com/Tangerine-Community/tangy-form/commit/30b19ef7a0ffa0932c719c5a1781ea8d146f0441)
- Hide tangy form item checkmarks when in fullscreen mode. (https://github.com/Tangerine-Community/tangy-form/commit/2f3da4a7e9e92ca78b56ee74766cac75b69e6a17)

## v4.30.0
- Add support for opening a form in fullscreen mode. Add `open-in-fullscreen` attribute to `<tangy-form>`.

## v4.29.4
- When viewing a completed form response, all tangy-templates now appear regardless of any previously evaluated directive because state like `skipped` has not been saved in form responses. This version makes tangy-template even more dynamic by evaluating directives on tangy-template even when in a completed form response.

## v4.29.3
- Fix: Tangy Template should display rendered template when being reviewed in a submitted form response https://github.com/Tangerine-Community/tangy-form/pull/311

## v4.29.2
- Fix: Tangy Template elements all say "false" if using environment variables like caseService and T [#3203](https://github.com/Tangerine-Community/Tangerine/issues/3203)

## v4.29.1
- Remove imports in TangyInputBase that are breaking builds

## v4.29.0
- Add ability to inject localized variables for use in Tangy Form logic [#292](https://github.com/Tangerine-Community/tangy-form/pull/292)
- Add support for optional `window.useShrinker` flag that will cause only modified properties on inputs to be captured [#210](https://github.com/Tangerine-Community/tangy-form/pull/210)

## v4.28.3
- When using Cycle Sequences, the Cycle Sequence used is now stashed in the form response for reference later in data analysis. https://github.com/Tangerine-Community/tangy-form/pull/282
- Merged a number of Dependabot dependencies PRs.

## v4.28.2
- Fix issue causing tangy-input-groups to not resume correctly.

## v4.28.1
- Fix `on-change` logic not called when changing a value in some `tangy-input-group`. (https://github.com/Tangerine-Community/tangy-form/pull/280)

## v4.28.0
- Add support for changing the translation of form controls without reloading the page using the `<t-t>` AKA `<t-translate>` element from the `translation-web-component` library.
- `<t-number>` added from the `trasnlation-web-component` library for translating numbers in content.

## v4.27.0
- Add support for leaving out an index in a cycle sequence, effectively causing it to be skipped. https://github.com/Tangerine-Community/tangy-form/pull/279

## v4.26.0
- Add support for configuring compression on `<tangy-photo-capture>`. eg.` <tangy-photo-capture compression="0.05"></tangy-photo-capture>`

## v4.25.14
- Fix "Camera not released after photo taken with `<tangy-photo-capture>`". Camera is now released when going to the next page or leaving a form. 

## v4.25.13
 - Fixed bug in cancelledBeforeSubmit for 'before-submit' event

## v4.25.12
 - Implemented a new 'before-submit' event to tangy-form in order to listen to events before the 'submit' event is dispatched.

## v4.25.11
- User defined Cycle Sequences index should begin at 1 PR:[#269](https://github.com/Tangerine-Community/tangy-form/pull/269).

## v4.25.10
- Defined Cycle of sequences (randomization) breaks Preview and form Play from Tablet [#2714](https://github.com/Tangerine-Community/Tangerine/issues/2714). fix(tangy-form): Reset index after reaching the last cycle index PR: [#234](https://github.com/Tangerine-Community/tangy-form/pull/234)

## v4.25.9
- tangy-photo-capture: Disabled the switcher due to issues with Android 9. Reduced the image preview to 75%.

## v4.25.8
- tangy-photo-capture: Integrate Capture and Saving (Accept) into a single step. 

## v4.25.7
- tangy-photo-capture: Hiding display of video when viewing a record in order to see the captured image.

## v4.25.6
- Implemented a switcher for front and back cameras for the tangy-photo-capture input. PR: [#247](https://github.com/Tangerine-Community/tangy-form/pull/247)

## v4.25.5
- The tangy-photo-capture input now uses the rear camera to capture images. 

## v4.25.4
- Changes to enabled 'npm run build' to complete successfully: Update webpack to work with es6 [#244](https://github.com/Tangerine-Community/tangy-form/pull/244)

## v4.25.3
- Revert to package-lock lockfileVersion to 1.

## v4.25.2
- Fix Intermediate grid capture timer should stop when grid is stopped manually/ or autostop is triggered [#2724](https://github.com/Tangerine-Community/Tangerine/issues/2724)

## v4.25.1
- Declare this package as a module so that it can be imported into node.js projects.


## v4.25.0
* Updated `photo-capure` component. 
* Data is saved as `jpeg` with `base64` encoding
* It attemps to take the picture with the highest possible quality and then resizes it with best practice resizing algorithms (using the built-in canvas resizer is poor quality). By default it tries to keep the size below 256kb, but this can be changed to any arbitrary size using the max-size-in-kb attribute.
**Example**
```html
 <template>
    <tangy-photo-capture name="test-photo" max-size-in-kb='128'></tangy-photo-capture>
</template>
```

## v4.24.0
Allow users to define custom sequence for the execution in tangy-form - Tangerine-Community/Tangerine#1603
Sections are separated by new lines while Items are comma separated
Part of Tangerine-Community/tangy-form-editor#177

## v4.23.3
- Grid autostop last item attempted default: (loe: low) https://github.com/Tangerine-Community/Tangerine/issues/2467, PR: https://github.com/Tangerine-Community/tangy-form/pull/206
- Grid auto stop: https://github.com/Tangerine-Community/Tangerine/issues/2559, PR: https://github.com/Tangerine-Community/tangy-form/pull/206
- [Grid restart doesn't clear out intermediate capture variable #2661](https://github.com/Tangerine-Community/Tangerine/issues/2661) https://github.com/Tangerine-Community/tangy-form/pull/211

## v4.23.2
- Sort tangy-location options by label. 

## v4.23.1
- Add `sectionEnable` function back to tangy-form.

## v4.23.0
- Add new `skip()` and `unskip()` helper function for skipping `<tangy-form-item>`. Functions are available in `on-change` at the `<tangy-form>` level. Example: `<tangy-form on-change="skip('item2')>`.
- Fix "Open All" feature when there is a skipped `<tangy-form-item>`

## v4.22.1
- Add missing "Open All" feature.

## v4.22.0
- Add an "Open All" button to a completed form response.

## v4.21.3
- Fixes dynamically set level tangy location not resuming correctly [#202](https://github.com/Tangerine-Community/tangy-form/pull/202)

## v4.21.2
- Fixes when a form is unlocked, the first item's `on-open` was not running after unlocking. 

## v4.21.1
- The current ethiopian date widget shows the previous month when the 'Today' button is clicked. The cause is that Date() returns an index to the current month, not the number of that month (for example February is '1'). This fix adds one to the index before converting to an ethiopian date.
- Fixes a spelling mistake in the transfromValueMoment function.

## v4.21.0
- Add support for events on tangy-form: `resubmit`, `after-resubmit`, `after-submit`. 
  - `submit` event no longer calls after unlocking and submitting a form, `resubmit` is called. This ensures `on-submit` hook logic is only ever called once, not again after unlock. To run logic after an unlock, add logic to `on-resubmit`.
  - `after-resubmit` and `after-submit` are called after submit and resubmit have finished and response is marked complete. If you are saving a Tangy Form Response into a database, this would be the correct event to listen for otherwise the form response would have a complete flag set to false.

## v4.20.1
- Make `<tangy-ethio-date>` and `<tangy-partial-date>` fire a change event when the today button is clicked

## v4.20.0
- Support for `<tangy-ethio-date>` input that exposes a Date Picker that validates for the Ethiopian Calendar.

## v4.19.1
- Fix issue with #warn-text div displaying when empty in tangy-select and tangy-location.

## v4.19.0
- New `warn-background-color` and `warn-color` css vars
- Alignment of required asterix.

## v4.18.0
- New `Loc.getLineage()` function for calculating the tree of location nodes given a location node ID
- New `<tangy-gate>` input for blocking UI until the Tangy Gate's value is set to true. This is useful for preventing users from proceeding when a complex condition is being run in an `on-change` or when asynchronous database code is running and we need a way to tell the user to hang out while it completes.

## v4.17.10
- Fix: abandons drawing boundary box when unable to identify all corners of scanned QR code.
- Updated "@zxing/library": "^0.17.1",
- Set width of canvas to 340px to reduce load on tablets.

## v4.17.9
- Fix: switch observer on hintText from render to fix issue with mutually exclusive checkboxes.

## v4.17.8
- Refactor tangy-if hook on inputs to apply the skipped attribute as opposed to the hidden attribute.

## v4.17.7
- Refactor show-if hook on inputs to apply the skipped attribute as opposed to the hidden attribute.

## v4.17.6
- Fix: hint-text is missing from many inputs when using TangyForm.getMeta() [#149](https://github.com/Tangerine-Community/tangy-form/pull/149)

## v4.17.5
- Fix: Mark entire line of grid as incorrect cannot be undone [#1651](https://github.com/Tangerine-Community/Tangerine/issues/1651)
- Fix: Autostop is not triggered when marking the entire lineas incorrect [#1869](https://github.com/Tangerine-Community/Tangerine/issues/1869) 

## v4.17.4
- Fix typescript definition for helpers.js.

## v4.17.3
- Fix unlocking of inputs that exist in the data but not in the meta, for example with tangy-input-groups. 

## v4.17.2
- Fix broken npm release due to change in release process.

## v4.17.0
- Add TangyFormResponseModel.get(), TangyFormResponseModel.set(), and Get/Set factories for shorthand get() and set() methods in helpers.js. https://github.com/Tangerine-Community/tangy-form/pull/143

## v4.16.0
- Added 'identifier' property to all inputs.

## v4.15.4
- Remove npm test from github action, seem to need an extra install for chrome or something. 

## v4.15.3
- Firefox test env is not installing correctly, fall back on chrome tests.

## v4.15.2
- Add package-lock.json to make npm ci command happy.

## v4.15.1
- Set up release process on Github Actions.

## v4.15.0
- Added a `<tangy-toggle>` element based on material toggle switches.
- Standardize output across inputs around question number and label.
- Additional CSS variables exposed. `--tangy-form-widget--margin`, `--tangy-form-item--paper-card--header`, `--tangy-form-item--paper-card-content--padding`.

## v4.14.1
- Fixed `error TS1039: Initializers are not allowed in ambient contexts.` with .d.ts typescript file for TangyFormResponseModel

## v4.14.0
- Default for TangyFormResponseModel is type:'response'
- Worked on tangy-qr to stop the plugin when cancelled or disconnected.
- Updated @zxing/library" to "^0.17.0

## v4.13.1
- Make initial collecting of meta data of a tangy-form more safe to avoid race conditions of uninitialized tangy-form-item elements. 

## v4.13.0
- Add wct-browser-legacy back as it's no longer breaking npm install.
- Add TangyForm.unlock() API for unlocking a completed form response.
- Add improvements to TangyForm.getMeta() to ensure it delivers original state.

## v4.12.3
- Ensure that items in a tangy-list stack in rows not rows and columns.

## v4.12.2
- Fixes for importing sortable-list to make it compatible in more bundling environments.

## v4.12.1
- Changed package for sortable-list - a dependency for `<tangy-list>` - to newer version. 

## v4.12.0
- Add support for sorting items in a `<tangy-list>` https://github.com/Tangerine-Community/tangy-form/pull/131

## v4.11.5
- Fixes
  - Fix `Uncaught TypeError: Cannot read property '_' of undefined` error experienced in some build environments by removing the Underscore dependency.

## v4.11.4
- Fixes
  - Removed render observer from tangy-radio-buttons - should speed up loading. 
  
## v4.11.3
- Fixes
  - Removed logging of missing translation strings - this logging created too much clutter in the logs. 
  
## v4.11.2
- Fixes
  - Fixed Required inputs in a hidden tangy-input-group should not prevent going next [#1879](https://github.com/Tangerine-Community/Tangerine/issues/1879)

## v4.11.1
- Fixes
  - Fixed Form Response should not save on every keystroke, causes performance issues [#1918](https://github.com/Tangerine-Community/Tangerine/issues/1918)
  - Fixed cannot proceed in form with optional Partial Date. [#1882](https://github.com/Tangerine-Community/Tangerine/issues/1882)
  - Fixed Required inputs in a hidden tangy-input-group should not prevent going next [#1879](https://github.com/Tangerine-Community/Tangerine/issues/1879)
  
## v4.11.0
- New
  - Record item first Open times. [#118](https://github.com/Tangerine-Community/tangy-form/pull/118/)
  - Add TangyPartialDate.diff function to help with calculating relative times from partial dates. [#116](https://github.com/Tangerine-Community/tangy-form/pull/116)
- Fixes
  - Fix endUnixTime not showing up in csv. [#115](https://github.com/Tangerine-Community/tangy-form/pull/115)
  - If time runs out on grids, the last attempted item must not be marked automatically. [#114](https://github.com/Tangerine-Community/tangy-form/pull/114)

## v4.10.4
- Fix issue where skipped or hidden items would still take up space. This comes at the sacrifice of losing the animation. Until CSS support animating display none this we'll have to do without the animation.

## v4.10.3
- Fix issue causing inputs skipped and disabled to overlap other content.

## v4.10.2
- Fix issue causing markup to be pruned from tangy-template templates.
- Fix issue causing skipped inputs to be validated, thus blocking going next when they are required and empty in value. 

## v4.10.1
- Fix bug in tangy-template causing greater and less than expressions to become HTML encoded thus breaking templates.

## v4.10.0
- Add `dont-skip-if` attribute to complement `skip-if` attribute directive.

## v4.9.0
- Add `skip-if` attribute and helpers. Similar to `hide-if` and `inputHide()`, but resets value of input when applied.
  - Example: https://github.com/Tangerine-Community/tangy-form/blob/master/docs/cookbook.md#skip-a-question-based-on-input-in-another-question
  - PR: https://github.com/Tangerine-Community/tangy-form/pull/113
- Add support for `mutually-exclusive` attribute on options in tangy-checkboxes. When enabled on an option, when that option is selected it will remove any prior option selections. 
  - Example: https://github.com/Tangerine-Community/tangy-form/blob/master/docs/cookbook.md#indicate-a-mutually-exclusive-option-in-a-checkboxes-group-such-as-none-of-the-above
  - PR: https://github.com/Tangerine-Community/tangy-form/pull/112
  
## v4.8.1
- Add missing typings for TangyFormResponseModel for compatibility with TypeScript projects.

## v4.8.0
- Add support for attributes on all inputs: discrepancy-text, has-discrepancy, warn-text, has-warning.
  - PR: https://github.com/Tangerine-Community/tangy-form/pull/111
  - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1760
- Fix: Ensure inputs in tangy-input-groups are validated.

## v4.7.1
- Fix bug in tangy-location resulting in bad behavior when not defining show-levels attribute.

## v4.7.0
- Add support for label attribute on `<tangy-location>`. 

## v4.6.3
- Fix TangyLocation.value setting from markup.

## v4.6.2
- Fix dynamic reassignment of TangyLocation.showLevels to make sure value is reset.

## v4.6.1
- On `<tangy-timed>` when using auto stop, return the property instead of the instead of the truthfulness of the value which is always false.

## v4.6.0
- Refactor for `<tangy-eftouch>`.
  - `<tangy-eftouch multi-select go-next-on-selection="2">` should become `<tangy-eftouch multi-select="2" go-next-on-selection>`. This allows for expanding functionality of being able to use multi-select without go-next-on-selection but still limit the number of choices the user can make minus the transition.
  - `no-corrections` has been deprecated for new `disable-after-selection` attribute. When used with `multi-select`, the number of selections are still limited by the setting on `multi-select`, but changing selection is not allowed.
  - The `required` attribute when used with `multi-select` will only require just one value selected. If you need form example 2 selections to be valid, you can combine `required-all multi-select="2"`. 
  - We have an API change where we used to have `TangyEftouch.value.selection` was sometimes a string when not using `multi-select` and then when using `multi-select`, is was an array of strings. Now `TangyEftouch.value.selection` will always be an array of strings.

## v4.5.4
- Fix extra white space around checkboxes https://github.com/Tangerine-Community/Tangerine/issues/1690

## v4.5.3
- Fix longstanding bug where nav bar when complete would show if no summary item.

## v4.5.2
- Fix 'selected value label' text in tangy-select and tangy-location when in dark mode.

## v4.5.1
- Use --primary-text-color variable in TangyPartialDate

## v4.5.0
- Add variables: --tangy-hint-text--font-size, --tangy-required-indicator--font-size, --tangy-required-indicator--font-size, --tangy-required-indicator--font-size, --tangy-form-item--background-color and dark-mode.html demo

## v4.4.1
- Fix CSS causing icons next/back icons to dissappear and also for next/back translations to overun.
- Fix translations for `<tangy-partial-date>`'s error message defaults.

## v4.4.0
- Add support for a `disable-if` attribute, similar to `show-if` but for disabling items.
- Fixes for `<tangy-input>` so that if disabled and required it does not block proceeing on a form. 
- Error logging functionality designed for editor use was blocking errors from the Javascript Console, this is now fixed.

## v4.3.9
- Add the property "value" when the row marker is clicked for each of the buttons - csv reports
    - PR: https://github.com/Tangerine-Community/tangy-form/pull/103

## v4.3.8
- fix auto-stop to enable revealing of hidden radio buttons when a correction is made.
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1519
    - PR: https://github.com/Tangerine-Community/tangy-form/pull/102

## v4.3.7
- Fix missing indication that required field was not filled out. https://github.com/Tangerine-Community/Tangerine/issues/1701

## v4.3.6
- Fixed auto-stop for radio buttons bug bug. Limit hideInputsUponThreshhold to tangy-radio-buttons inputs. No longer need to call hideInputsUponThreshhold in on-change event when using incorrect-threshold in tangy-radio-buttons.
 - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1519
 - PR: https://github.com/Tangerine-Community/tangy-form/pull/100

## v4.3.5
- In tangy-timed, ensure gitVarItemAtTime and gridVarTimeIntermediateCaptured is saved into the form response.

## v4.3.4
- Roll back rem setting in tangy-timed to em for button font size. 

## v4.3.3
- Vertical center for tangy-toggle-button contents / tangy-timed items. https://github.com/Tangerine-Community/tangy-form/commit/c677ffb2620343fa993509d875e6418ea6757205
- Fixes for saving and resuming `<tangy-checkboxes-dynamic>`. https://github.com/Tangerine-Community/tangy-form/pull/98

## v4.3.2
- Make oversized tangy-timed grids gracefully handle overflow with overflow scroll setting.

## v4.3.1
- Fix font setting for tangy-toggle-button font sizes in tangy-timed
- Check if captureItemAt is defined in tangy-timed.
- Fix use of no-correction on tangy-eftouch to not allow any selection after first.

## v4.3.0
- Features
  - Improvements and support on all inputs for `error-text`, `hint-text`, `question-number`, and  content translations.
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1655
    - PR: https://github.com/Tangerine-Community/tangy-form/pull/88, https://github.com/Tangerine-Community/tangy-form/pull/86
  - Add support to `<tangy-qr>` for scanning data matrix codes.
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1653
    - PR: https://github.com/Tangerine-Community/tangy-form/pull/87
  - New "Capture Item at N Seconds" feature for `<tangy-timed>` will prompt Data Collector to mark which item the child last read after a specific amount of time.
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1586
    - PR: https://github.com/Tangerine-Community/tangy-form/pull/95
  - New `goTo('itemID')` helper function to navigate users to a specific item given some item level `on-change` logic.
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1652
    - PR: https://github.com/Tangerine-Community/tangy-form/pull/92
  - New `<tangy-signature>` input for capturing signatures.
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1656 
    - PR: https://github.com/Tangerine-Community/tangy-form/pull/90
  - Visibility of labels and/or icons on item navigation now configurable with `<tangy-form-item hide-nav-icons>` and `<tangy-form-item hide-nav-labels>`. 
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1682 
    - PR: https://github.com/Tangerine-Community/tangy-form/pull/73
- Fixes
  - Fix performance issues caused by needless TangyForm.on-change events from firing when they don't need to.
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1656
    - PR: https://github.com/Tangerine-Community/tangy-form/pull/89
  - Fix data collector reviews completed fullscreen form 
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1629
    - PR: https://github.com/Tangerine-Community/tangy-form/pull/75
  - `<tangy-eftouch auto-progress>` now distinguishes between going next on the time limit and going next on a number of selections. The API is now `<tangy-eftouch go-next-on-selection=2>` for going next on 2 selection and `<tangy-eftouch go-next-on-time-limit>` for going next on the time limit. 
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1597
    - PR: https://github.com/Tangerine-Community/tangy-form/pull/84
  - `<tangy-eftouch>` content is now more likely to fit above the fold, not overlap with content above it, be more consistent on smaller screens, and also adapt to screen size changes. 
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1591, https://github.com/Tangerine-Community/Tangerine/issues/1587
    - PR: https://github.com/Tangerine-Community/tangy-form/pull/79
  - `<tangy-eftouch>` suffered from going to next item twice due to time limit and selection being made at in a close window. This is now fixed. 
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1596
    - PR: https://github.com/Tangerine-Community/tangy-form/pull/76
  - Fix Partial Date validation and for disabled attribute not reflecting 
    - Issue: https://github.com/Tangerine-Community/Tangerine/issues/1683
    - PR: https://github.com/Tangerine-Community/tangy-form/pull/71

## v4.2.0
- Added the exit-clicks attribute to tangy-form and tangy-form-item, which is for the number of times a user must click the exit fullscreen button before that mode is deactivated. 

## v4.1.1
- Fix tangy-select test regression and work on EFTouch transition sound plays only on auto-progress [#137](https://github.com/Tangerine-Community/Tangerine/issues/1371)

## v4.1.0
- API change in tangy-select - use of secondaryLabel is supported but deprecated; Use optionSelectLabel instead. 
  
## v4.0.0
- Enable content of a form to be styled from the parent document. [#64](https://github.com/Tangerine-Community/tangy-form/pull/64)

  __Upgrade instructions__:
This is considered to be a major release because some users' forms would look into a form item's contents using `tangyFormItemEl.shadowRoot.querySelector(...)`. The contents of the form can now be accessed at `tangyFormItemEl.querySelector(...)`. If you have any use of `shadowRoot` in our form content, beware. The advantage of moving this content out of the shadow DOM is that you can now style it directly from your app.

## v3.23.0
- Add ability to reference inputs.NAME in valid-if attributes. [#65](https://github.com/Tangerine-Community/tangy-form/pull/65)

## v3.22.1
- Fix resuming a `<tangy-parial-date>` and use of boolean attributes. [#62](https://github.com/Tangerine-Community/tangy-form/pull/62)

## v3.22.0
- Add new `<tangy-partial-date>` input for capturing partial dates. See `demo/partial-date-demo.html` for a demo.

## v3.21.0
- Add support for distributing bundles in `dist/bundle.js`.

## v3.20.0
- Adding variables so that the select element may be styled. [#50](https://github.com/Tangerine-Community/tangy-form/pull/50)

## v3.19.0
- Add validate function to tangy-acasi input in order to enable 'required' feature.

## v3.18.0
- Add support for autostop in tangy-radio-buttons and path changes for the tangy-acasi widget [#49](https://github.com/Tangerine-Community/tangy-form/pull/49)
  - Autostop is implemented by using the hideInputsUponThreshhold helper, which takes a tangy-form-item element and compares the number of correct radio button answers to the value in its incorrect-threshold attribute.
    
    Usage: `<tangy-form-item id="item1" incorrect-threshold="2">`
  - A new "correct" attribute has been added to tangy-list-item to store the correct value.
    
    Usage: 
    ```
    <tangy-radio-buttons name="fruit_selection2" label="What is your favorite fruit?">
      <option name="tangerine">Tangerine</option>
      <option name="cherry" correct>Cherry</option>
    </tangy-radio-buttons>
    ```

## v3.17.0
- Add support for eftouch multi-select attribute and multiple values of correct options [#48](https://github.com/Tangerine-Community/tangy-form/pull/48)

## v3.16.1
- Fix adding of `<option>` elements to `<tangy-select>` after first load. [#46](https://github.com/Tangerine-Community/tangy-form/pull/46)

## v3.16.0
- Exposed option-font-size attribute to tangy-timed and tangy-untimed.
  Usage: <tangy-timed required columns="3" duration=80 name="class1_term2" option-font-size="5">
  Sets the host font-size in tangy-toggle-button. using the --tangy-toggle-button-font-size custom CSS property.

## v3.15.1
- Fix bug that prevents tangy-form-item from validating when it has nested elements.

## v3.15.0
- Added `numberOfItemsAttempted`, `numberOfCorrectItems`, `numberOfIncorrectItems`, and `gridAutoStopped` to `exposeHelperFunctions`.

## v3.14.0
- Added `cancel` and `scanning` events to `<tangy-qr>`.

## v3.13.0
- Add safe eval of custom logic, error message notifications, and finally remove support for deprecated use of form tags. https://github.com/Tangerine-Community/tangy-form/pull/41
- Add new helper convention that if a tangy-form has a tangy-location input with a name of location, cache that data at FormResponse.location. https://github.com/Tangerine-Community/tangy-form/pull/41

## v3.12.2
- In some contexts, section is a more appropriate helper function term than item, and item is a more appropriate term than input. These are now available in corresponding places.
- A bug on tangy-input using type="number" was causing them to immediately become invalid when empty.

## v3.12.1
- Make more helper functions available to valid-if (More tests for tangy-if and valid-if [#38](https://github.com/Tangerine-Community/tangy-form/pull/38)).

## v3.12.0
- Add <tangy-consent> widget

## v3.11.0
- Add <tangy-untimed-grid> widget

## v3.10.2
- Fix infinite loop in tangy-input value setting that was causing other parts of tangy-form to quietly fail.
- Fix broken min and max validation for tangy-input, also type=date

## v3.10.1
- Fixed issue where some `hint-text` and `label` attributes with markup would show escaped.

## v3.10.0
- Include the `<t-lang>` web component by default for providing form translations. 
- Allow use of `<t-lang>` in `<tangy-select>` option labels.
- Allow HTML in tangy-input's label and hint text. Allow use of <t-lang> for translations in placeholder, innerLabel and error message.

## v3.9.1
- New `<tangy-template>` element evaluates a JS string literal in the context of tangy-form-item's `on-change`. 

## v3.8.0
- Add additional grid helper functions https://github.com/Tangerine-Community/tangy-form/pull/33

## v3.7.1
- Fix bug that was causing tall elements to get cut off.

## v3.7.0
- Fix TangyTimed.validate() to prevent getting stuck on non-required tangy-timed. 
- Add `placeholder` and `inner-label` attributes to tangy-input for overiding the default `Enter your response to above question here.`.

## v3.6.0
- New `<tangy-timed row-markers>` attribute allows you to mark entire rows on a grid. https://github.com/Tangerine-Community/Tangerine/issues/1333
- Fixed `<tangy-timed columns=4>` attribute. Some situations the columns would not add up correctly.
- Fixed automatic selection of last attempted when hitting auto-stop https://github.com/Tangerine-Community/Tangerine/issues/1327
- New `valid-if` attribute on all inputs enables ability to define custom validation logic per input. https://github.com/Tangerine-Community/Tangerine/issues/1319
- `on-change` now fires after invalid submit allowing for custom validation messages (see new example). https://github.com/Tangerine-Community/Tangerine/issues/1326
- Fix tangy-if setting Object.hidden to true having an affect via reflect to attribute. https://github.com/Tangerine-Community/Tangerine/issues/1330

## v3.5.0
- New `<tangy-qr>` input for capturing QR data. https://github.com/Tangerine-Community/tangy-form/pull/30
- New `hint-text` attribute you can add to most inputs. https://github.com/Tangerine-Community/tangy-form/pull/29
- New `auto-stop` attribute for `<tangy-timed>` will automatically stop if the first x number of attempts are marked. https://github.com/Tangerine-Community/tangy-form/pull/28


## v3.4.1
- Add convenience methods to disable inputs and item buttons - an easy way to display form results:
  - enableItemReadOnly() - disables the inputs in the form (disableItemReadOnly() to re-enable the inputs)
  - hideItemButtons() - hides the Open/Close buttons (showItemButtons() to show them again)

## v3.4.0
- `<tangy-location show-meta-data>` attribute now shows meta data about a location when selected. You can also add an inline JS template string. https://github.com/Tangerine-Community/tangy-form/pull/13#issuecomment-454157413

## v3.3.2
- Fix an bug in Loc.unflatten() where it would return an object with circular references.

## v3.3.1
- Optimize Loc helper methods to avoid callstack limits when working with large location lists.
- Fix tangy-checkbox applying of labels to no longer prevent markup from being used.

## v3.3.0
- Add `<tangy-list>` element for allowing users to currate lists of inputs in an item. This is an alternative to `<tangy-input-groups>` and may replace it in the future.

## v3.2.0
- Add `<tangy-checkboxes-dynamic>` input element for loading the options of tangy-checkboxes using a json file.

## v3.1.0
- New `<tangy-photo-capture>` input element for capturing photos on forms.
- Fix a bug where values set during on-open would be overridden with previous set values.
- Made safer resuming responses when the items in the form no longer match.
- EFTouch option positioning improvements.

## v3.0.0
- You no longer have to include all of the tangy input elements in your build. You define which ones you use by importing then individually. See README.md for more details.
- Overall code organization refactor. We now place input elements in the input folder, shared style files in the style folder, and some utilities in the util folder.
- Tests are no longer all in one file. They are split out into files that match up with their related components into a specific "suite". All suites can be run by starting with `npm start` and then opening `http://localhost:8081/test/`. Click on a suite and it will run just the tests for that suite. Handy when you are doing TDD and don't want to wait for other suites to run.
- tangy-form theme is now customizeable in your application. See README for details.

## v2.11.0
- `<tangy-form-item>` will now have a `is-dirty` attribute when it has changes that have not yet been saved.

## v2.9.0
- Added `<tangy-input-groups>` as an alternative to `<tangy-cards>`. We will deprecate tangy cards.

## v2.8.1
- Loc.filterById now includes decendents by default.

## v2.8.0
- New APIs: TangyFormResponseModel.inputs, TangyFormResponseModel.inputsByName, Loc.filterById, TangyLocation.filterBy
- You can now `<tangy-location filter-by="school1,school4"></tangy-location>` to limit what is available for selection.
- You can now `<tangy-location filter-by-global></tangy-location>` to limit what is available for selection when `window.tangyLocations` is defined.

## v2.7.0
- Add tangy-cards element for arbitrary number of input groups.

## v2.6.1
- Adjust position of `*` on required elements.

## v2.6.0
- Reduced whitespace to make forms more compact.

## v2.5.0
- tangy-timed controls now with smarter positioning for situations where it may be edited or multiple tangy-timed on one page.

## v2.4.2
- tangy-timed font sizes were too small. Increased to 1.5em.

## v2.4.1
- Fixed attributes for hiding things when using tangy-gps.

## v2.4.0
- Default primary color has been updated to match that of Tangerine Client.
- Tabs when selected are highlighted with secondary color to match behavior of Tangerine Client.

## v2.3.0
- Add support for min and max attributes on tangy-input.

## v2.2.8
- Fixed issue where XMLHttpRequests in cordova apps using CHCP would not use status code leading to tangy-location elements not loading correctly.
