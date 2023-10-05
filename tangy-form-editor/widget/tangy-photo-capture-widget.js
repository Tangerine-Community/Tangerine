import "@polymer/paper-card/paper-card.js";
import "@polymer/paper-button/paper-button.js";
import "tangy-form/input/tangy-photo-capture.js";
import "tangy-form/input/tangy-checkbox.js";
import { TangyBaseWidget } from "../tangy-base-widget.js";

class TangyPhotoCaptureWidget extends TangyBaseWidget {
  get claimElement() {
    return "tangy-photo-capture";
  }

  get defaultConfig() {
    return {
      ...this.defaultConfigCoreAttributes(),
      ...this.defaultConfigQuestionAttributes(),
      ...this.defaultConfigConditionalAttributes(),
      ...this.defaultConfigValidationAttributes(),
      ...this.defaultConfigAdvancedAttributes(),
      ...this.defaultConfigUnimplementedAttributes(),
      hideOutput: false,
      maxSizeInKb: 512
    };
  }

  upcast(config, element) {
    return {
      ...this.upcastCoreAttributes(config, element),
      ...this.upcastQuestionAttributes(config, element),
      ...this.upcastConditionalAttributes(config, element),
      ...this.upcastValidationAttributes(config, element),
      ...this.upcastAdvancedAttributes(config, element),
      ...this.upcastUnimplementedAttributes(config, element),
      ...element.getProps(),
      hideOutput: element.hasAttribute('hide-output'),
    };
  }

  downcast(config) {
    return `
      <tangy-photo-capture 
        ${this.downcastCoreAttributes(config)}
        ${this.downcastQuestionAttributes(config)}
        ${this.downcastConditionalAttributes(config)}
        ${this.downcastValidationAttributes(config)}
        ${this.downcastAdvancedAttributes(config)}
        ${this.downcastUnimplementedAttributes(config)}
        ${config.hideOutput ? 'hide-output' : ""}
        ${config.maxSizeInKb ? `max-size-in-kb="${config.maxSizeInKb}"` : ""}
      >
      </tangy-photo-capture>
    `;
  }

  renderPrint(config) {
    return `
    <table>
      <tr><td><strong>Variable Name:</strong></td><td>${config.name}</td></tr>
      <tr><td><strong>Required:</strong></td><td>${config.required}</td></tr>
      <tr><td><strong>Disabled:</strong></td><td>${config.disabled}</td></tr>
      <tr><td><strong>Hidden:</strong></td><td>${config.hidden}</td></tr>
      <tr><td><strong>HideOutput:</strong></td><td>${config.hideOutput}</td></tr>
      <tr><td><strong>maxSizeInKb:</strong></td><td>${config.maxSizeInKb}</td></tr>
    </table>
    <hr/>
    `;
  }

  renderInfo(config) {
    console.log(config)
    const icon = (this.shadowRoot.querySelector(
      "#icon"
    ).innerHTML = `<span class="header-text"><mwc-icon>filter_center_focus</mwc-icon><span>`);
    const name = (this.shadowRoot.querySelector(
      "#name"
    ).innerHTML = `<span class="header-text">${config.name}</span>`);
    return `${icon} ${name} ${this.downcast(config)}`;
  }

  renderEdit(config) {
    console.log(config)
    const action = config.name ? "Edit" : "Add";
    return `
      <h2>${action} Photo Capture</h2>
      <h3><span style="color:red">Warning!</span> This input is a new feature and has not been tested on many different Android versions. We have tested 
      on a small number of tablets running Android 9 and 10. It is currently preset to use the rear camera. 
      Also be aware that using photo capture on a tablet has an impact on sync time. 
      Image data is large and can cause a significant delay when uploading to the server.
      By default, this element saves to the database. If the deployment target is APK, you may use \`mediaFileStorageLocation:"file"\` in app-config.json to save images as files instead of saving to the database.</h3>
      <tangy-form id="tangy-photo-capture">
        <tangy-form-item>
          <template>
            <paper-tabs selected="0">
                <paper-tab>General</paper-tab>
                <paper-tab>Conditional Display</paper-tab>
                <paper-tab>Validation</paper-tab>
                <paper-tab>Advanced</paper-tab>
            </paper-tabs>
            <iron-pages selected="">
                <div>
                  ${this.renderEditCoreAttributes(config)}
                  ${this.renderEditQuestionAttributes(config)}
                  <tangy-input name="max-size-in-kb" type="number" inner-label="Maximum size in kb" value="${
                      config.maxSizeInKb
                  }"></tangy-input>
                  <tangy-toggle name="hideOutput" help-text="Hide the data output scanned from the Photo Capture widget. This may be useful if you are using a format such as JSON and parsing it out into other items." ${
        config.hideOutput ? 'value="on"' : ''
    }>Hide output</tangy-toggle>
                </div>
                <div>
                  ${this.renderEditConditionalAttributes(config)}
                </div>
                <div>
                  ${this.renderEditValidationAttributes(config)}
                </div>
                <div>
                  ${this.renderEditAdvancedAttributes(config)}
                </div>
            </iron-pages>
          </template>
        </tangy-form-item>
      </tangy-form>
    `;
  }

  onSubmit(config, formEl) {
    return {
      ...this.onSubmitCoreAttributes(config, formEl),
      ...this.onSubmitQuestionAttributes(config, formEl),
      ...this.onSubmitConditionalAttributes(config, formEl),
      ...this.onSubmitValidationAttributes(config, formEl),
      ...this.onSubmitAdvancedAttributes(config, formEl),
      ...this.onSubmitUnimplementedAttributes(config, formEl),
      hideOutput: formEl.values.hideOutput === 'on' ? true : false,
      maxSizeInKb: formEl.values["max-size-in-kb"]
    };
  }
}

window.customElements.define("tangy-photo-capture-widget", TangyPhotoCaptureWidget);
window.tangyFormEditorWidgets.define(
  "tangy-photo-capture-widget",
  "tangy-photo-capture",
  TangyPhotoCaptureWidget
);
