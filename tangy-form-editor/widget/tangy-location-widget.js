import "@polymer/paper-card/paper-card.js";
import "@polymer/paper-button/paper-button.js";
import "tangy-form/input/tangy-location.js";
import "tangy-form/input/tangy-checkbox.js";
import { TangyBaseWidget } from "../tangy-base-widget.js";

class TangyLocationWidget extends TangyBaseWidget {

  get claimElement() {
    return "tangy-location";
  }

  get defaultConfig() {
    return {
      ...this.defaultConfigCoreAttributes(),
      ...this.defaultConfigQuestionAttributes(),
      ...this.defaultConfigConditionalAttributes(),
      ...this.defaultConfigValidationAttributes(),
      ...this.defaultConfigAdvancedAttributes(),
      ...this.defaultConfigUnimplementedAttributes(),
      showMetaData: false,
      metaDataTemplate: "",
      filterByGlobal: false,
      showLevels: "",
      locationSrc: "./assets/location-list.json"
    };
  }

  upcast(config, element) {
    return {
      ...config,
      ...element.getProps(),
      ...this.upcastCoreAttributes(config, element),
      ...this.upcastQuestionAttributes(config, element),
      ...this.upcastConditionalAttributes(config, element),
      ...this.upcastValidationAttributes(config, element),
      ...this.upcastAdvancedAttributes(config, element),
      ...this.upcastUnimplementedAttributes(config, element),
      metaDataTemplate: element.innerHTML,
      locationListsMetadata: element.locationListsMetadata
    };
  }

  downcast(config) {
    return `
      <tangy-location 
        ${this.downcastCoreAttributes(config)}
        ${this.downcastQuestionAttributes(config)}
        ${this.downcastConditionalAttributes(config)}
        ${this.downcastValidationAttributes(config)}
        ${this.downcastAdvancedAttributes(config)}
        ${this.downcastUnimplementedAttributes(config)}
        show-levels="${config.showLevels}"
        ${config.filterByGlobal ? "filter-by-global" : ""}
        ${config.showMetaData ? "show-meta-data" : ""}
        location-src=${config.locationSrc}
      >
        ${config.metaDataTemplate}
      </tangy-location>
    `;
  }

  renderPrint(config) {
    return `
    <table>
      <tr><td><strong>Location Levels:</strong></td><td>${config.showLevels}</td></tr>
      <tr><td><strong>Variable Name:</strong></td><td>${config.name}</td></tr>
      <tr><td><strong>Label:</strong></td><td>${config.label}</td></tr>
      <tr><td><strong>Hint:</strong></td><td>${config.hintText}</td></tr>
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
    ).innerHTML = `<span class="header-text"><mwc-icon>location_city</mwc-icon><span>`);
    const name = (this.shadowRoot.querySelector(
      "#name"
    ).innerHTML = `<span class="header-text">${config.name}</span>`);
    return `${icon} ${name} ${this.downcast(config)}`;
  }

  renderEdit(config) {
    const action = config.name ? "Edit" : "Add";
    return `
      <h2>${action} Location</h2>
      <tangy-form id="tangy-input">
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
                  <div class="container">
                    <h3>Select the location list to use for this input</h3>
                    <div>The Default Location List will be used if none is selected</div>
                    <div>Changing the list will clear the entry for Filter by Location</div>
                    <tangy-select class="location-src-select" name="location-src" value="${config.locationSrc}">
                      ${this.renderLocationSourceOptions()}
                    </tangy-select>
                  </div>
                  <div class="container">
                    <h3>Select the checkboxes below to limit the levels that will appear in the list</h3>
                    <div>If none are selected, all levels will appear in the list</div>
                    <tangy-checkboxes class="show-levels-checkboxes" name="showLevels" value='${this.getShowLevelTangyCheckboxesValue()}'>
                      ${this.renderShowLevelsOptions()}
                    </tangy-checkboxes>
                  </div>
                  <div class="container">
                    <h3>Choose which metadata labels will appear in the list</h3>
                    <div>The metadata labels are useful to provide context to the user</div>
                    <tangy-checkbox name="show-meta-data" ${
                      config.showMetaData ? 'value="on"' : ""
                    }>show meta-data</tangy-checkbox>
                    <tangy-input name="meta-data-template" label="Metadata Labels" inner-label="e.g. school,room" value="${config.metaDataTemplate}"></tangy-input>
                  </div>
                  <div class="container">
                    <h3>Check the box to filter the list by the user profile</h3>
                    <tangy-checkbox name="filterByGlobal" ${config.filterByGlobal ? 'value="on"' : ""}>Filter by locations in the user profile?</tangy-checkbox>
                  </div>
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

  afterRenderEdit() {
    this.shadowRoot
      .querySelector("#container")
      .querySelector("tangy-form")
      .querySelector("tangy-form-item")
      .querySelector("iron-pages")
      .querySelector("tangy-select.location-src-select")
      .addEventListener('change', this.onLocationSrcChange.bind(this));
  }

  renderLocationSourceOptions() {
    let options = ''
    let locationListsMetadata = JSON.parse(this.getAttribute('location-lists-metadata'))
    if (locationListsMetadata) {
      for (let location of locationListsMetadata) {
        options = `${options}
        <option value="${this.getLocationAssetsPath(location)}">${location.name}</option>`
      }
    }
    return options;
  }

  renderShowLevelsOptions() {
    let options = ''
    let locationListsMetadata = JSON.parse(this.getAttribute('location-lists-metadata'))
    if (locationListsMetadata) {
      // Using endsWith in the compare is not the best solution
      const locationList = Object.values(locationListsMetadata).find(l => this.getLocationAssetsPath(l) == this._config.locationSrc)
      if (locationList) {
        for (let level of locationList.locationsLevels) {
            options = `${options}
            <option value="${level}">${level}</option>`
        }
      }
    }
    return options;
  }

  onLocationSrcChange(event) {
    // If showLevels is set, we need to clear it when the locationSrc changes 
    // since the levels are probably not in the new locationSrc
    if (event.target.value != this._config.locationSrc) {
      this._config.locationSrc = event.target.value
      this._config.showLevels = ''

      this.updateShowLevelTangyCheckboxes()
    }
  }

  // Updating the tangy checkbox to show the elements associated with the currently selected location
  updateShowLevelTangyCheckboxes() {
    const formEl = this.shadowRoot.querySelector("tangy-form")
    let tangyCheckboxesEl = formEl
      .querySelector("tangy-form-item")
      .querySelector("iron-pages")
      .querySelector("tangy-checkboxes.show-levels-checkboxes")
    
    const values = this.getShowLevelTangyCheckboxesValue()
    // setting the tangy-checkboxes element value triggers a reflect in the input
    // which changes it's internal tangy-checkbox elements
    tangyCheckboxesEl.setAttribute('value', values)

    // The options need to be removed and added here (tangy-checkboxes doesn't do it for us)
    tangyCheckboxesEl.querySelectorAll('option').forEach( option => {
      option.parentElement.removeChild(option)
    })
    tangyCheckboxesEl.innerHTML = this.renderShowLevelsOptions()

    tangyCheckboxesEl.render()

  }

  // converts a comma separated string of values into a tangy-checkboxes value
  getShowLevelTangyCheckboxesValue() {
    let values = []

    let selectedLevels = this._config.showLevels.split(',')
    let locationListsMetadata = JSON.parse(this.getAttribute('location-lists-metadata'))
    if (locationListsMetadata) {
      const locationList = Object.values(locationListsMetadata).find(l => this.getLocationAssetsPath(l) == this._config.locationSrc)
      if (locationList) {
        for (let level of locationList.locationsLevels) {
          values.push(
            {
              "name": level,
              "value": selectedLevels.includes(level) ? "on" : ""
            }
          )
        }
      }
    }

    return JSON.stringify(values)
  }

  // location lists paths need to have './assets' prepended
  getLocationAssetsPath(location) {
    return `./assets/${location.path}`
  }

  // converts a tangy-checkboxes value into a comma separated string of values
  getShowLevelValueString(formEl) {
    let values = []
    let input = formEl.response.items[0].inputs.find(
      (input) => input.name === "showLevels")
    if (input) {
      for (let v of input.value) {
        if (v.value == 'on') {
          values.push(v.name)
        }
      }
    }
    return values.join(',')
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
      locationSrc: 
        formEl.response.items[0].inputs.find(
          (input) => input.name === "location-src"
        ).value,
      filterByGlobal:
        formEl.response.items[0].inputs.find(
          (input) => input.name === "filterByGlobal"
        ).value === "on"
          ? true
          : false,
      showLevels: this.getShowLevelValueString(formEl),
      showMetaData:
        formEl.response.items[0].inputs.find(
          (input) => input.name === "show-meta-data"
        ).value === "on"
          ? true
          : false,
      metaDataTemplate: formEl.response.items[0].inputs.find(
        (input) => input.name === "meta-data-template"
      ).value,
    };
  }
}

window.customElements.define("tangy-location-widget", TangyLocationWidget);
window.tangyFormEditorWidgets.define(
  "tangy-location-widget",
  "tangy-location",
  TangyLocationWidget
);
