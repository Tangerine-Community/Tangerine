import "@polymer/paper-card/paper-card.js";
import "@polymer/paper-button/paper-button.js";
import "tangy-form/input/tangy-audio-playback.js";
import "tangy-form/input/tangy-checkbox.js";
import { TangyBaseWidget } from "../tangy-base-widget.js";

class TangyAudioPlaybackWidget extends TangyBaseWidget {
  get claimElement() {
    return "tangy-audio-playback";
  }

  get defaultConfig() {
    return {
      ...this.defaultConfigCoreAttributes(),
      ...this.defaultConfigQuestionAttributes(),
      ...this.defaultConfigConditionalAttributes(),
      ...this.defaultConfigValidationAttributes(),
      ...this.defaultConfigAdvancedAttributes(),
      ...this.defaultConfigUnimplementedAttributes(),
      src: "",
      controls: true,
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
      hideOutput: element.hasAttribute("controls"),
    };
  }

  downcast(config) {
    return `
      <tangy-audio-playback 
        ${this.downcastCoreAttributes(config)}
        ${this.downcastQuestionAttributes(config)}
        ${this.downcastConditionalAttributes(config)}
        ${this.downcastValidationAttributes(config)}
        ${this.downcastAdvancedAttributes(config)}
        ${this.downcastUnimplementedAttributes(config)}
        ${config.controls ? "controls" : ""}
        ${config.src ? `src="${config.src}"` : ""}
      >
      </tangy-audio-playback>
    `;
  }

  renderPrint(config) {
    return `
    <table>
      <tr><td><strong>Variable Name:</strong></td><td>${config.name}</td></tr>
      <tr><td><strong>Required:</strong></td><td>${config.required}</td></tr>
      <tr><td><strong>Disabled:</strong></td><td>${config.disabled}</td></tr>
      <tr><td><strong>Hidden:</strong></td><td>${config.hidden}</td></tr>
      <tr><td><strong>Audio Source:</strong></td><td>${config.src}</td></tr>
      <tr><td><strong>Controls:</strong></td><td>${config.controls}</td></tr>
    </table>
    <hr/>
    `;
  }

  renderInfo(config) {
    const icon = (this.shadowRoot.querySelector(
      "#icon"
    ).innerHTML = `<span class="header-text"><mwc-icon>play_arrow</mwc-icon><span>`);
    const name = (this.shadowRoot.querySelector(
      "#name"
    ).innerHTML = `<span class="header-text">${config.name}</span>`);
    return `${icon} ${name} ${this.downcast(config)}`;
  }

  renderEdit(config) {
    const action = config.name ? "Edit" : "Add";
    return `
      <h2>${action} Audio Playback</h2>
      <tangy-form id="tangy-audio-playback">
        <tangy-form-item>
          <template>
            <paper-tabs selected="0">
                <paper-tab>Question</paper-tab>
                <paper-tab>Conditional Display</paper-tab>
                <paper-tab>Validation</paper-tab>
                <paper-tab>Advanced</paper-tab>
            </paper-tabs>
            <iron-pages selected="">
              <div>
                  ${this.renderEditCoreAttributes(config)}
                  ${this.renderEditQuestionAttributes(config)}
                  <tangy-input name="src" type="string" inner-label="Audio source" value="${config.src}"></tangy-input>
                  <tangy-toggle name="controls" help-text="Show Audio Playback Controls? (default: true)"${config.controls ? 'value="on"' : ''}>Show Audio Playback Controls?
                  </tangy-toggle>
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
      src:  formEl.values["src"],
      controls: !!formEl.inputs.find(e=>e.name==='controls').value,
    };
  }
}

window.customElements.define(
  "tangy-audio-playback-widget",
  TangyAudioPlaybackWidget
);
window.tangyFormEditorWidgets.define(
  "tangy-audio-playback-widget",
  "tangy-audio-playback",
  TangyAudioPlaybackWidget
);
