import "@polymer/paper-card/paper-card.js";
import "@polymer/paper-button/paper-button.js";
import "tangy-form/tangy-form.js";
import "tangy-form/input/tangy-radio-buttons.js";
import "tangy-form/input/tangy-input.js";
import "tangy-form/input/tangy-checkbox.js";
import { TangyBaseWidget } from "../tangy-base-widget.js";

class TangyRadioButtonsWidget extends TangyBaseWidget {
  get claimElement() {
    return "tangy-radio-buttons";
  }

  get defaultConfig() {
    return {
      ...this.defaultConfigCoreAttributes(),
      ...this.defaultConfigQuestionAttributes(),
      ...this.defaultConfigConditionalAttributes(),
      ...this.defaultConfigValidationAttributes(),
      ...this.defaultConfigAdvancedAttributes(),
      ...this.defaultConfigUnimplementedAttributes(),
      options: [],
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
      options: [...element.querySelectorAll("option")].map((option) => {
        return {
          value: option.getAttribute("value"),
          label: option.innerHTML,
          correct: option.hasAttribute("correct"),
        };
      }),
    };
  }

  downcast(config) {
    return `
      <tangy-radio-buttons
        ${this.downcastCoreAttributes(config)}
        ${this.downcastQuestionAttributes(config)}
        ${this.downcastConditionalAttributes(config)}
        ${this.downcastValidationAttributes(config)}
        ${this.downcastAdvancedAttributes(config)}
        ${this.downcastUnimplementedAttributes(config)}
      >
        ${config.options
          .map(
            (option) => `
          <option value="${option.value}" ${option.correct ? "correct" : ""} >${
              option.label
            }</option>
        `
          )
          .join("")}
      </tangy-radio-buttons>
    `;
  }

  renderPrint(config) {
    let keyValuePairs = "";
    config.options.map((option) => {
      keyValuePairs += `<li>${option.value}: ${option.label} ${
        option.correct ? "correct" : ""
      }</li>`;
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
    ).innerHTML = `<span class="header-text"><mwc-icon>filter_center_focus</mwc-icon><span>`);
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
      <h3>${action} Radio Buttons</h3>
      <tangy-form id="tangy-radio-buttons">
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
                  
                <h2>Options</h2>
                <p>Click the "Correct" property for options that are the correct answer. This property is used with the Section Detail's Threshold property.</p>
                <tangy-list name="options">
                  <template type="tangy-list/new-item">
                    <tangy-input name="value" allowed-pattern="[a-zA-Z0-9\-_]" hint-text="Enter the variable value of the radio button" inner-label="Value" type="text"></tangy-input>
                    <tangy-input name="label" hint-text="Enter the display label of the radio button" inner-label="Label" type="text"></tangy-input>
                    <tangy-checkbox name="correct" hint-text="Select if this is the correct answer."  label="Correct" ></tangy-checkbox>
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
                          <tangy-checkbox name="correct" hint-text="Select if this is the correct answer."  label="Correct"  value="${
                            option.correct ? "on" : ""
                          }"></tangy-checkbox>
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
      options: formEl.values.options.map((item) =>
        item.reduce((acc, input) => {
          return { ...acc, [input.name]: input.value };
        }, {})
      ),
    };
  }
}

window.customElements.define(
  "tangy-radio-buttons-widget",
  TangyRadioButtonsWidget
);
window.tangyFormEditorWidgets.define(
  "tangy-radio-buttons-widget",
  "tangy-radio-buttons",
  TangyRadioButtonsWidget
);
