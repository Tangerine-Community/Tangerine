import "@polymer/paper-card/paper-card.js";
import "@polymer/paper-button/paper-button.js";
import "tangy-form/input/tangy-select.js";
import { TangyBaseWidget } from "../tangy-base-widget.js";
class TangyGateWidget extends TangyBaseWidget {
  get claimElement() {
    return "tangy-gate";
  }

  upcast(config, element) {
    return {
      ...this.upcastCoreAttributes(config, element),
      ...this.upcastConditionalAttributes(config, element),
      ...this.upcastValidationAttributes(config, element),
      ...this.upcastAdvancedAttributes(config, element),
      ...this.upcastUnimplementedAttributes(config, element),
      ...{
        success: element.hasAttribute('success')
          ? element.getAttribute('success')
          : '',
        inProgress: element.hasAttribute('inprogress')
          ? element.getAttribute('inprogress')
          : '',
        invisible: element.hasAttribute('invisible')
      }
    };
  }

  downcast(config) {
    return `
      <tangy-gate 
        ${this.downcastCoreAttributes(config)}
        ${this.downcastConditionalAttributes(config)}
        ${this.downcastValidationAttributes(config)}
        ${this.downcastAdvancedAttributes(config)}
        ${this.downcastUnimplementedAttributes(config)}
        success="${config.success ? config.success : ''}"
        inprogress="${config.inProgress ? config.inProgress : ''}"
        ${config.invisible ? 'invisible' : ''}
      ></tangy-gate>
    `;
  }

  renderInfo(config) {
    const icon = (this.shadowRoot.querySelector(
      "#icon"
    ).innerHTML = `<span class="header-text"><mwc-icon>fence</mwc-icon><span>`);
    const name = (this.shadowRoot.querySelector(
      "#name"
    ).innerHTML = `<span class="header-text">${config.name}</span>`);
    return `${icon} ${name} ${this.downcast(config)}`;
  }

  renderEdit(config) {
    const action = config.name ? "Edit" : "Add";
    if (config.success === 'undefined') {

    debugger
    }
    return `
      <h2>${action} gate</h2>
      <tangy-form id="tangy-toggle">
        <tangy-form-item>
          <template>
            <paper-tabs selected="0">
                <paper-tab>Info</paper-tab>
                <paper-tab>Conditional Display</paper-tab>
                <paper-tab>Validation</paper-tab>
                <paper-tab>Advanced</paper-tab>
            </paper-tabs>
            <iron-pages selected="">
                <div>
                  ${this.renderEditCoreAttributes(config)}
                  <h3 style="margin-top: 15px;">Messaging</h3>
                  <tangy-input
                    name="inprogress"
                    inner-label="In progress message"
                    value="${config.inProgress ? config.inProgress : ''}"
                  >
                  </tangy-input>
                  <tangy-input
                    name="success"
                    inner-label="Success message"
                    value="${config.success ? config.success : ''}"
                  >
                  </tangy-input>
                  <tangy-checkbox
                    name="invisible"
                    label="Invisible"
                    value="${config.invisible ? 'on' : ''}"
                  >
                  </tangy-checkbox>
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
      ...this.onSubmitConditionalAttributes(config, formEl),
      ...this.onSubmitValidationAttributes(config, formEl),
      ...this.onSubmitAdvancedAttributes(config, formEl),
      ...this.onSubmitUnimplementedAttributes(config, formEl),
      inProgress: formEl.response.items[0].inputs.find(
        (input) => input.name === "inprogress"
      ).value,
      success: formEl.response.items[0].inputs.find(
        (input) => input.name === "success"
      ).value,
      invisible: formEl.response.items[0].inputs.find(input => input.name === 'invisible').value
        ? true
        : false
    };
  }

}

window.customElements.define("tangy-gate-widget", TangyGateWidget);
window.tangyFormEditorWidgets.define(
  "tangy-gate-widget",
  "tangy-gate",
  TangyGateWidget
);
