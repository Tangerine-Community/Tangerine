import "@polymer/paper-card/paper-card.js";
import "@polymer/paper-button/paper-button.js";
import "tangy-form/input/tangy-select.js";
import { TangyBaseWidget } from "../tangy-base-widget.js";

class TangyAcasiWidget extends TangyBaseWidget {
  get claimElement() {
    return "tangy-acasi";
  }

  get defaultConfig() {
    return {
      ...this.defaultConfigCoreAttributes(),
      ...this.defaultConfigQuestionAttributes(),
      ...this.defaultConfigConditionalAttributes(),
      ...this.defaultConfigValidationAttributes(),
      ...this.defaultConfigAdvancedAttributes(),
      ...this.defaultConfigUnimplementedAttributes(),
      label: "",
      hintText: "",
      type: "text",
      allowedPattern: "",
      images:
        "./assets/images/never.png,./assets/images/once.png,./assets/images/few.png,./assets/images/many.png,./assets/images/dont_know.png",
      touchsrc:
        "./assets/sounds/never_Eng.mp3,./assets/sounds/once_Eng.mp3,./assets/sounds/fewtimes_Eng.mp3,./assets/sounds/manytimes_Eng.mp3,./assets/sounds/noresponse_Eng.mp3",
      introsrc: "",
      transitionsrc: "./assets/sounds/swish.mp3",
    };
  }

  upcast(config, element) {
    // @TODO We have to do that final thing for tangyIf because it's not declared a prop in TangyInput.props thus won't get picked up by TangyInput.getProps().
    return {
      ...config,
      ...element.getProps(),
      ...this.upcastCoreAttributes(config, element),
      ...this.upcastQuestionAttributes(config, element),
      ...this.upcastConditionalAttributes(config, element),
      ...this.upcastValidationAttributes(config, element),
      ...this.upcastAdvancedAttributes(config, element),
      ...this.upcastUnimplementedAttributes(config, element),
      ...{
        allowedPattern: element.getAttribute("allowed-pattern"),
        images: element.getAttribute("images"),
        touchsrc: element.getAttribute("touchsrc"),
        introsrc: element.hasAttribute("introsrc")
          ? element.getAttribute("introsrc")
          : "",
        transitionsrc: element.getAttribute("transitionsrc"),
      },
    };
  }

  downcast(config) {
    return `
      <tangy-acasi 
        ${this.downcastCoreAttributes(config)}
        ${this.downcastQuestionAttributes(config)}
        ${this.downcastConditionalAttributes(config)}
        ${this.downcastValidationAttributes(config)}
        ${this.downcastAdvancedAttributes(config)}
        ${this.downcastUnimplementedAttributes(config)}
        type="text"
        allowed-pattern="${config.allowedPattern}"
        ${
          config.images === ""
            ? ""
            : `images="${config.images.replace(/"/g, "&quot;")}"`
        }
        ${
          config.touchsrc === ""
            ? ""
            : `touchsrc="${config.touchsrc.replace(/"/g, "&quot;")}"`
        }
        ${
          config.introsrc === ""
            ? ""
            : `introsrc="${config.introsrc.replace(/"/g, "&quot;")}"`
        }
        ${
          config.transitionsrc === ""
            ? ""
            : `transitionsrc="${config.transitionsrc.replace(/"/g, "&quot;")}"`
        }
      ></tangy-acasi>
    `;
  }

  renderPrint(config) {
    return `
    <table>
      <tr><td><strong>Prompt:</strong></td><td>${config.label}</td></tr>
      <tr><td><strong>Variable Name:</strong></td><td>${config.name}</td></tr>
      <tr><td><strong>Hint:</strong></td><td>${config.hintText}</td></tr>
      <tr><td><strong>Type:</strong></td><td>${config.type}</td></tr>
      <tr><td><strong>Error Message:</strong></td><td>${config.errorText}</td></tr>
      <tr><td><strong>Allowed Pattern:</strong></td><td>${config.allowedPattern}</td></tr>
      <tr><td><strong>Private:</strong></td><td>${config.private}</td></tr>
      <tr><td><strong>Required:</strong></td><td>${config.required}</td></tr>
      <tr><td><strong>Disabled:</strong></td><td>${config.disabled}</td></tr>
      <tr><td><strong>Hidden:</strong></td><td>${config.hidden}</td></tr>
      <tr><td><strong>Images:</strong></td><td>${config.images}</td></tr>
      <tr><td><strong>Touchsrc:</strong></td><td>${config.touchsrc}</td></tr>
      <tr><td><strong>Introsrc:</strong></td><td>${config.introsrc}</td></tr>
      <tr><td><strong>Transitionsrc:</strong></td><td>${config.transitionsrc}</td></tr>
    </table>
    <hr/>
    `;
  }

  renderInfo(config) {
    const icon = (this.shadowRoot.querySelector(
      "#icon"
    ).innerHTML = `<span class="header-text"><mwc-icon>speaker</mwc-icon><span>`);
    const name = (this.shadowRoot.querySelector(
      "#name"
    ).innerHTML = `<span class="header-text">${config.name}</span>`);
    return `${icon} ${name} ${this.downcast(config)}`;
  }

  renderEdit(config) {
    const action = config.name ? "Edit" : "Add";
    return `
      <h2>${action} ACASI</h2>
      <tangy-form id="tangy-acasii-widget">
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
                  <tangy-input
                    name="allowed_pattern"
                    inner-label="Allowed pattern"
                    hint-text="Optional Javascript RegExp pattern to validate text (e.g. minimum length of 5 characters would be [a-zA-Z]{5,})"
                    value="${config.allowedPattern}">
                  </tangy-input>
                  <h2>Media Elements</h2>
                  <p>Paths: Images should use the format: "./assets/images/image.png". Sounds should take the format "./assets/sounds/sound.mp3"</p>
                  <h3>Page Loading Sound</h3>
                  <tangy-input
                    name="introsrc"
                    inner-label="Path to audio file that plays when the page loads"
                    hint-text="Enter the path to the audio file that plays when the page loads."
                    value="${config.introsrc}">
                    </tangy-input>
                    <h3>Defaults</h3>
                    <p>You may not need to change any of the following fields:</p>
                  <tangy-input
                    name="images"
                    inner-label="Path to images"
                    hint-text="Enter the path to the images, comma-separated."
                    value="${config.images}">
                    </tangy-input>
                  <tangy-input
                    name="touchsrc"
                    inner-label="Path to each audio file"
                    hint-text="Enter the paths to each audio file, comma-separated."
                    value="${config.touchsrc}">
                  </tangy-input>
                  <tangy-input
                    name="transitionsrc"
                    inner-label="Transition sound - the path to the audio file that plays when transitioning to a new page"
                    hint-text="Enter the Transition sound - the path to the audio file that plays when transitioning to a new page."
                    value="${config.transitionsrc}">
                  </tangy-input>
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
      ...config,
      ...this.onSubmitCoreAttributes(config, formEl),
      ...this.onSubmitQuestionAttributes(config, formEl),
      ...this.onSubmitConditionalAttributes(config, formEl),
      ...this.onSubmitValidationAttributes(config, formEl),
      ...this.onSubmitAdvancedAttributes(config, formEl),
      ...this.onSubmitUnimplementedAttributes(config, formEl),
      allowedPattern: formEl.response.items[0].inputs.find(
        (input) => input.name === "allowed_pattern"
      ).value,
      images: formEl.response.items[0].inputs.find(
        (input) => input.name === "images"
      ).value,
      touchsrc: formEl.response.items[0].inputs.find(
        (input) => input.name === "touchsrc"
      ).value,
      introsrc: formEl.response.items[0].inputs.find(
        (input) => input.name === "introsrc"
      ).value,
      transitionsrc: formEl.response.items[0].inputs.find(
        (input) => input.name === "transitionsrc"
      ).value,
    };
  }
}

window.customElements.define("tangy-acasi-widget", TangyAcasiWidget);
window.tangyFormEditorWidgets.define(
  "tangy-acasi-widget",
  "tangy-acasi",
  TangyAcasiWidget
);
