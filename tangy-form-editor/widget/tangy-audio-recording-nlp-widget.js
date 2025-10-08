import "@polymer/paper-card/paper-card.js";
import "@polymer/paper-button/paper-button.js";
import "tangy-form/input/tangy-audio-recording.js";
import "tangy-form/input/tangy-audio-recording-nlp.js";
import "tangy-form/input/tangy-checkbox.js";
import { TangyBaseWidget } from "../tangy-base-widget.js";

class TangyAudioRecordingNlpWidget extends TangyBaseWidget {
  get claimElement() {
    return "tangy-audio-recording-nlp";
  }

  get defaultConfig() {
    return {
      ...this.defaultConfigCoreAttributes(),
      ...this.defaultConfigQuestionAttributes(),
      ...this.defaultConfigConditionalAttributes(),
      ...this.defaultConfigValidationAttributes(),
      ...this.defaultConfigAdvancedAttributes(),
      ...this.defaultConfigUnimplementedAttributes(),
      
    };
  }

  tangyAudioRecordingSiblingNames() {
    const tangyAudioRecordingSiblings = this.parentElement ? this.parentElement.querySelectorAll("tangy-audio-recording") : null;
    const tangyAudioRecordingSiblingNames = tangyAudioRecordingSiblings ? Array.from(tangyAudioRecordingSiblings).map((sibling) => sibling.getAttribute("name")) : [];
    return tangyAudioRecordingSiblingNames;
  }

  afterRenderEdit() {}

  upcast(config, element) {
    return {
      ...this.upcastCoreAttributes(config, element),
      ...this.upcastQuestionAttributes(config, element),
      ...this.upcastConditionalAttributes(config, element),
      ...this.upcastValidationAttributes(config, element),
      ...this.upcastAdvancedAttributes(config, element),
      ...this.upcastUnimplementedAttributes(config, element),
      ...element.getProps(),
      nlpModelUrl: element.getAttribute("nlp-model-url"),
      stimuli: element.getAttribute("stimuli"),
      language: element.getAttribute("language"),
      audioRecordingInputName: element.getAttribute("audio-recording-input-name"), 
    };
  }

  downcast(config) {
    return `
      <tangy-audio-recording-nlp
        ${this.downcastCoreAttributes(config)}
        ${this.downcastQuestionAttributes(config)}
        ${this.downcastConditionalAttributes(config)}
        ${this.downcastValidationAttributes(config)}
        ${this.downcastAdvancedAttributes(config)}
        ${this.downcastUnimplementedAttributes(config)}
        ${config.nlpModelUrl ? `nlp-model-url="${config.nlpModelUrl}"` : ""}
        ${config.stimuli ? `stimuli="${config.stimuli}"` : ""}
        ${config.language ? `language="${config.language}"` : ""}
        ${config.audioRecordingInputName ? `audio-recording-input-name="${config.audioRecordingInputName}"` : ""}
      >
      </tangy-audio-recording-nlp>
    `;
  }

  renderPrint(config) {
    return `
    <table>
      <tr><td><strong>Variable Name:</strong></td><td>${config.name}</td></tr>
      <tr><td><strong>Required:</strong></td><td>${config.required}</td></tr>
      <tr><td><strong>Disabled:</strong></td><td>${config.disabled}</td></tr>
      <tr><td><strong>Hidden:</strong></td><td>${config.hidden}</td></tr>
    </table>
    <hr/>
    `;
  }

  renderInfo(config) {
    const icon = (this.shadowRoot.querySelector(
      "#icon"
    ).innerHTML = `<span class="header-text"><mwc-icon>settings_voice</mwc-icon><span>`);
    const name = (this.shadowRoot.querySelector(
      "#name"
    ).innerHTML = `<span class="header-text">${config.name}</span>`);
    return `${icon} ${name} ${this.downcast(config)}`;
  }

  renderEdit(config) {
    const action = config.name ? "Edit" : "Add";
    const tangyAudioRecordingSiblingNames = this.tangyAudioRecordingSiblingNames();
    return `
      <h2>${action} Audio Recording</h2>
      
      <tangy-form id="tangy-audio-recording-nlp">
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
                  <tangy-input type='text' name='nlpModelUrl' label='NLP Model URL' value='${config.nlpModelUrl || ""}' hint-text='Enter the URL of the NLP model endpoint.' required></tangy-input>
                  <tangy-input type='text' name='stimuli' label='Stimuli' value='${config.stimuli || ""}' hint-text='Enter the stimuli text for the audio recording.' required></tangy-input>
                  <tangy-radio-buttons name='language' label='Language' hint-text='Select the language for the feedback.'>
                   <option value='en' ${config.language === 'en' ? 'active' : ''}>English</option>
                   <option value='sw' ${config.language === 'sw' ? 'active' : ''}>Swahili</option>
                  </tangy-radio-buttons>
                  <tangy-select class="audio-recording-select" name="audioRecordingInputSelect" hint-text="Select a tangy-audio-recording input to use." label="Connected Audio Recording" value="${config.audioRecordingInputName || ''}" required>
                      ${tangyAudioRecordingSiblingNames ? tangyAudioRecordingSiblingNames.map((name) => {
                        return `<option value="${name}">${name}</option>`;
                      }) : ''}
                  </tangy-select>
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
    const languageArray = formEl.getValue('language');
    let language = 'en';
    if (Array.isArray(languageArray) && languageArray.length === 1) {
      language = languageArray[0];
    }
    return {
      ...this.onSubmitCoreAttributes(config, formEl),
      ...this.onSubmitQuestionAttributes(config, formEl),
      ...this.onSubmitConditionalAttributes(config, formEl),
      ...this.onSubmitValidationAttributes(config, formEl),
      ...this.onSubmitAdvancedAttributes(config, formEl),
      ...this.onSubmitUnimplementedAttributes(config, formEl),
      nlpModelUrl: formEl.getValue('nlpModelUrl').trim(),
      stimuli: formEl.getValue('stimuli').trim(),
      language: language,
      audioRecordingInputName: formEl.getValue('audioRecordingInputSelect').trim()
    };
  }
}

window.customElements.define("tangy-audio-recording-nlp-widget", TangyAudioRecordingNlpWidget);
window.tangyFormEditorWidgets.define(
  "tangy-audio-recording-nlp-widget",
  "tangy-audio-recording-nlp",
  TangyAudioRecordingNlpWidget
);
