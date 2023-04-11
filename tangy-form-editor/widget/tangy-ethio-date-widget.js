import "@polymer/paper-card/paper-card.js";
import "@polymer/paper-button/paper-button.js";
import "tangy-form/tangy-form.js";
import "tangy-form/input/tangy-ethio-date.js";
import "tangy-form/input/tangy-input.js";
import { TangyBaseWidget } from "../tangy-base-widget.js";

class TangyEthioDateWidget extends TangyBaseWidget {
  get claimElement() {
    return "tangy-ethio-date";
  }

  get defaultConfig() {
    return {
      ...this.defaultConfigCoreAttributes(),
      ...this.defaultConfigQuestionAttributes(),
      ...this.defaultConfigConditionalAttributes(),
      ...this.defaultConfigValidationAttributes(),
      ...this.defaultConfigAdvancedAttributes(),
      ...this.defaultConfigUnimplementedAttributes(),
      futureDateErrorText: "",
      missingDateErrorText: "",
      invalidDateErrorText: "",
      minYear: 2010,
      maxYear: 2022,
      disallowFutureDate: false,
      allowUnknownDay: false,
      allowUnknownMonth: false,
      allowUnknownYear: false,
      showTodayButton: true,
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
    };
  }

  downcast(config) {
    return `
      <tangy-ethio-date
        ${this.downcastCoreAttributes(config)}
        ${this.downcastQuestionAttributes(config)}
        ${this.downcastConditionalAttributes(config)}
        ${this.downcastValidationAttributes(config)}
        ${this.downcastAdvancedAttributes(config)}
        ${this.downcastUnimplementedAttributes(config)}
        future-date-error-text="${config.futureDateErrorText}"
        missing-date-error-text="${config.missingDateErrorText}"
        invalid-date-error-text="${config.invalidDateErrorText}"
        min-year="${config.minYear}"
        max-year="${config.maxYear}"
        ${config.showTodayButton ? "show-today-button" : ""}
        ${config.allowUnknownDay ? "allow-unknown-day" : ""}
        ${config.allowUnknownMonth ? "allow-unknown-month" : ""}
        ${config.allowUnknownYear ? "allow-unknown-year" : ""}
        ${config.disallowFutureDate ? "disallow-future-date" : ""}
      >
      </tangy-ethio-date>
    `;
  }
  renderPrint(config) {
    return `
    <table>
      <tr><td><strong>Question number:</strong></td><td>${config.questionNumber}</td></tr>
      <tr><td><strong>Prompt:</strong></td><td>${config.label}</td></tr>
      <tr><td><strong>Variable Name:</strong></td><td>${config.name}</td></tr>
      <tr><td><strong>Hint:</strong></td><td>${config.hintText}</td></tr>
      <tr><td><strong>Required:</strong></td><td>${config.required}</td></tr>
      <tr><td><strong>Disabled:</strong></td><td>${config.disabled}</td></tr>
      <tr><td><strong>Hidden:</strong></td><td>${config.hidden}</td></tr>
      <tr><td><strong>Show today button:</strong></td><td>${config.showTodayButton}</td></tr>
      <tr><td><strong>Allow unknown day:</strong></td><td>${config.allowUnknownDay}</td></tr>
      <tr><td><strong>Allow unknown month:</strong></td><td>${config.allowUnknownMonth}</td></tr>
      <tr><td><strong>Allow unknown year:</strong></td><td>${config.allowUnknownYear}</td></tr>
      <tr><td><strong>Disallow future date:</strong></td><td>${config.disallowFutureDate}</td></tr>
      <tr><td><strong>Invalid date error text:</strong></td><td>${config.invalidDateErrorText}</td></tr>
      <tr><td><strong>Missing date error text:</strong></td><td>${config.missingDateErrorText}</td></tr>
      <tr><td><strong>Future date error text:</strong></td><td>${config.futureDateErrorText}</td></tr>
      <tr><td><strong>Minimum year:</strong></td><td>${config.minYear}</td></tr>
      <tr><td><strong>Maximum year:</strong></td><td>${config.maxYear}</td></tr>\
    </table>
    <hr/>
    `;
  }

  renderInfo(config) {
    const icon = (this.shadowRoot.querySelector(
      "#icon"
    ).innerHTML = `<span class="header-text"><mwc-icon>date_range</mwc-icon><span>`);
    const name = (this.shadowRoot.querySelector(
      "#name"
    ).innerHTML = `<span class="header-text">${config.name}</span>`);
    return `${icon} ${name} ${this.downcast(config)}`;
  }

  renderEdit(config) {
    const action = config.name ? "Edit" : "Add";
    return `
      <h2>${action} Ethiopian Date</h2>
      <tangy-form id="tangy-ethio-date">
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
                  <h3>Date Behavior</h3>
                  <tangy-checkbox
                    name="show-today-button"
                    ${config.showTodayButton ? 'value="on"' : ""}>
                    Show today button
                  </tangy-checkbox>
                  <br>
                  <tangy-checkbox
                    name="allow-unknown-day"
                    ${config.allowUnknownDay ? 'value="on"' : ""}>
                    Allow unknown day
                  </tangy-checkbox>
                  <tangy-checkbox
                    name="allow-unknown-month"
                    ${config.allowUnknownMonth ? 'value="on"' : ""}>
                    Allow unknown month
                  </tangy-checkbox>
                  <tangy-checkbox
                    name="allow-unknown-year" 
                    ${config.allowUnknownYear ? 'value="on"' : ""}>
                    Allow unknown year
                  </tangy-checkbox>
                  <tangy-checkbox
                    name="disallow-future-date"
                    ${config.disallowFutureDate ? 'value="on"' : ""}>
                    Disallow future date
                  </tangy-checkbox>
                </div>
                <div>
                  ${this.renderEditConditionalAttributes(config)}
                </div>
                <div>
                  ${this.renderEditValidationAttributes(config)}
                  <tangy-input
                    name="missing-date-error-text"
                    inner-label="Missing date error text"
                    hint-text="Enter text to be displayed when the date is required but missing."
                    value="${config.missingDateErrorText.replace(
                      /"/g,
                      "&quot;"
                    )}">
                  </tangy-input>
                  <tangy-input
                    name="invalid-date-error-text"
                    inner-label="Invalid date error text"
                    hint-text="Enter text to be displayed when the date is invalid."
                    value="${config.invalidDateErrorText.replace(
                      /"/g,
                      "&quot;"
                    )}">
                  </tangy-input>
                  <tangy-input
                    name="future-date-error-text"
                    inner-label="Future date error text"
                    hint-text="Enter text to be displayed when the date is in the future."
                    value="${config.futureDateErrorText.replace(
                      /"/g,
                      "&quot;"
                    )}">
                  </tangy-input>
                  <tangy-input
                    name="min-year"
                    inner-label="Minimum year"
                    hint-text="Enter minimum year for the dropdowm list."
                    value="${config.minYear}">
                  </tangy-input>
                  <tangy-input
                    name="max-year"
                    inner-label="Maximum year"
                    hint-text="Enter maximum year for the dropdown list."
                    value="${config.maxYear}">
                  </tangy-input>
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
      disallowFutureDate:
        formEl.values["disallow-future-date"] === "on" ? true : false,
      allowUnknownDay:
        formEl.values["allow-unknown-day"] === "on" ? true : false,
      allowUnknownMonth:
        formEl.values["allow-unknown-month"] === "on" ? true : false,
      allowUnknownYear:
        formEl.values["allow-unknown-year"] === "on" ? true : false,
      showTodayButton:
        formEl.values["show-today-button"] === "on" ? true : false,
      minYear: formEl.values["min-year"],
      maxYear: formEl.values["max-year"],
      futureDateErrorText: formEl.values["future-date-error-text"],
      missingDateErrorText: formEl.values["missing-date-error-text"],
      invalidDateErrorText: formEl.values["invalid-date-error-text"],
    };
  }
}

window.customElements.define(
  "tangy-ethio-date-widget",
  TangyEthioDateWidget
);
window.tangyFormEditorWidgets.define(
  "tangy-ethio-date-widget",
  "tangy-ethio-date",
  TangyEthioDateWidget
);
