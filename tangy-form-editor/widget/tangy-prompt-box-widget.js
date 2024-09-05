import "@polymer/paper-card/paper-card.js";
import "@polymer/paper-button/paper-button.js";
import "tangy-form/tangy-form.js";
import "tangy-form/input/tangy-prompt-box.js";
import "tangy-form/input/tangy-input.js";
import "tangy-form/input/tangy-checkbox.js";
import { TangyBaseWidget } from "../tangy-base-widget.js";

class TangyPromptBoxWidget extends TangyBaseWidget {
  get claimElement() {
    return "tangy-prompt-box";
  }

  get defaultConfig() {
    return {
      ...this.defaultConfigCoreAttributes(),
      ...this.defaultConfigQuestionAttributes(),
      ...this.defaultConfigConditionalAttributes(),
      ...this.defaultConfigValidationAttributes(),
      ...this.defaultConfigAdvancedAttributes(),
      ...this.defaultConfigUnimplementedAttributes(),
      justifyContent: "flex-start",
      options: []
    };
  }

  get tangyRadioBlockSiblingNames() {
    const tangyRadioBlockSiblings = this.parentElement ? this.parentElement.querySelectorAll("tangy-radio-blocks") : null;
    const tangyRadioBlockSiblingNames = tangyRadioBlockSiblings ? Array.from(tangyRadioBlockSiblings).map((sibling) => sibling.getAttribute("name")) : [];
    return tangyRadioBlockSiblingNames;
  }

  upcast(config, element) {
    return {
      ...this.upcastCoreAttributes(config, element),
      ...this.upcastQuestionAttributes(config, element),
      ...this.upcastConditionalAttributes(config, element),
      ...this.upcastValidationAttributes(config, element),
      ...this.upcastAdvancedAttributes(config, element),
      ...this.upcastUnimplementedAttributes(config, element),
      justifyContent: element.getAttribute('justifyContent') || "flex-start",
      options: [...element.querySelectorAll("option")].map((option) => {
        return {
          value: option.getAttribute("value"),
          label: option.innerHTML,
          image: option.getAttribute("image"),
          sound: option.getAttribute("sound"),
          playOnOpen: option.getAttribute("play-on-open"),
          promptFor: option.getAttribute("prompt-for")
        };
      }),
    };
  }

  downcast(config) {
    return `
      <tangy-prompt-box
        ${this.downcastCoreAttributes(config)}
        ${this.downcastQuestionAttributes(config)}
        ${this.downcastConditionalAttributes(config)}
        ${this.downcastValidationAttributes(config)}
        ${this.downcastAdvancedAttributes(config)}
        ${this.downcastUnimplementedAttributes(config)}
        ${config.justifyContent}
      >
        ${config.options
          .map(
            (option) => `
          <option id="${option.value}" value="${option.value}" 
            image="${option.image}" 
            sound="${option.sound}" 
            ${option.promptFor ? `prompt-for="${option.promptFor}"` : ''}
            ${option.playOnOpen ? 'play-on-open="on"' : ''}>
            ${option.label}
          </option>
        `
          )
          .join("")}
      </tangy-prompt-box>
    `;
  }

  renderPrint(config) {
    let keyValuePairs = "";
    config.options.map((option) => {
      keyValuePairs += `<li>${option.value}: ${option.label}</li>`;
    });
    return `
   
    <table>
      <tr><td><strong>Prompt:</strong></td><td>${config.label}</td></tr>
      <tr><td><strong>Variable Name:</strong></td><td>${config.name}</td></tr>
      <tr><td><strong>Hint:</strong></td><td>${config.hintText}</td></tr>
      <tr><td><strong>Required:</strong></td><td>${config.required}</td></tr>
      <tr><td><strong>Disabled:</strong></td><td>${config.disabled}</td></tr>
      <tr><td><strong>Hidden:</strong></td><td>${config.hidden}</td></tr>
      <tr><td><strong>Options:</strong></td><td><ul>${keyValuePairs}</ul></td></tr>
    </table>
    <hr/>
    `;
  }

  renderInfo(config) {
    const icon = (this.shadowRoot.querySelector(
      "#icon"
    ).innerHTML = `<span class="header-text"><mwc-icon>table_rows</mwc-icon><span>`);
    const name = (this.shadowRoot.querySelector(
      "#name"
    ).innerHTML = `<span class="header-text">${config.name}</span>`);
    return `${icon} ${name} ${
      config.options.length > 0 ? this.downcast(config) : ""
    }`;
  }

  renderEdit(config) {
    const action = config.name ? "Edit" : "Add";
    return `
      <h3>${action} Prompt Box</h3>
      <tangy-form id="tangy-prompt-box">
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
                <label for="justifyContent" style="font-weight: bold; font-size: 1.2em;">Display Justification:</label>
                <tangy-select hint-text="Which side should the prompt box appear on?" name="justifyContent" value="${config.justifyContent}">
                  <option value="flex-start">Left</option>
                  <option value="flex-end">Right</option>
                </tangy-select>
                <h2>Options</h2>
                <tangy-list name="options">
                  <template type="tangy-list/new-item">
                    <tangy-input name="value" allowed-pattern="[a-zA-Z0-9\-_]" hint-text="Enter the variable value of the radio button" inner-label="Value" type="text"></tangy-input>
                    <tangy-input name="label" hint-text="Enter the display label of the radio button" inner-label="Label" type="text"></tangy-input>
                    <tangy-checkbox name="playOnOpen" hint-text="Play sound on open" inner-label="Play on Open"></tangy-checkbox>
                    <tangy-input name="image" hint-text="Enter the image URL" inner-label="Image" type="text"></tangy-input>
                    <tangy-input name="sound" hint-text="Enter the sound URL" inner-label="Sound" type="text"></tangy-input>
                    <tangy-select name="promptFor" hint-text="Enter the name of a tangy-radio-blocks variable to prompt" inner-label="Prompt For" type="text">
                      ${this.tangyRadioBlockSiblingNames.map((name) => {
                        return `<option value="${name}">${name}</option>`;
                      })}
                    </tangy-select>
                  </template>
                  ${
                    config.options.length > 0
                      ? `
                    <template type="tangy-list/initial-items">
                      ${config.options
                        .map(
                          (option) => `
                        <tangy-list-item>
                          <tangy-input name="value" allowed-pattern="[a-zA-Z0-9\-_]" hint-text="Enter the variable value of the radio button" inner-label="Value" type="text" value="${
                            option.value
                          }"></tangy-input>
                          <tangy-input name="label" hint-text="Enter the display label of the radio button" inner-label="Label" type="text" value="${
                            option.label
                            .replace(/&/g, "&amp;")
                            .replace(/</g, "&lt;")
                            .replace(/>/g, "&gt;")
                            .replace(/"/g, "&quot;")
                            .replace(/'/g, "&#039;")
                          }"></tangy-input>
                          <tangy-input name="image" hint-text="Enter the image URL" inner-label="Image" type="text" value="${option.image ? option.image : ""}"></tangy-input>
                          <tangy-input name="sound" hint-text="Enter the sound URL" inner-label="Sound" type="text" value="${option.sound ? option.sound : ""}"></tangy-input>
                          <tangy-checkbox name="playOnOpen" hint-text="Play sound on open" value="${option.playOnOpen == "on" ? "on" : ""}"></tangy-checkbox>
                          <tangy-select name="promptFor" warn-if="6 != 7" hint-text="Enter the name of a tangy-radio-blocks variable to prompt" value="${option.promptFor}">
                          ${this.tangyRadioBlockSiblingNames.map((name) => {
                            return `<option value="${name}">${name}</option>`;
                          })}
                        </tangy-select>
                        </tangy-list-item>
                      `
                        )
                        .join("")}
                    </template>
                  `
                      : ""
                  }
                </tangy-list>
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
      justifyContent: formEl.querySelector("tangy-select[name=justifyContent]").value,
      options: formEl.values.options.map((item) =>
        item.reduce((acc, input) => {
          return { ...acc, [input.name]: input.value };
        }, {})
      ),
    };
  }
}

window.customElements.define(
  "tangy-prompt-box-widget",
  TangyPromptBoxWidget
);
window.tangyFormEditorWidgets.define(
  "tangy-prompt-box-widget",
  "tangy-prompt-box",
  TangyPromptBoxWidget
);
