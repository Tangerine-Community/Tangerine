import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '../util/html-element-props.js'
import '../style/tangy-element-styles.js';
import '../style/tangy-common-styles.js'
import '../style/mdc-select-style.js'
import { t } from '../util/t.js'
import moment from 'moment'
import { TangyInputBase } from '../tangy-input-base.js'
/**
 * `tangy-partial-date`
 *
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
export class TangyPartialDate extends TangyInputBase {
  static get template() {
    return html`
    <style include="tangy-element-styles"></style>
    <style include="tangy-common-styles"></style>
    <style include="mdc-select-style"></style>
    <style>
      :host {
        --iron-icon-width: 32px;
        --iron-icon-height: 32px;
      }
      .partial-date-select {
        background-image: url(data:image/svg+xml,%3Csvg%20width%3D%2210px%22%20height%3D%225px%22%20viewBox%3D%227%2010%2010%205%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%3E%0A%20%20%20%20%3Cpolygon%20id%3D%22Shape%22%20stroke%3D%22none%22%20fill%3D%22%230%22%20fill-rule%3D%22evenodd%22%20opacity%3D%220.54%22%20points%3D%227%2010%2012%2015%2017%2010%22%3E%3C%2Fpolygon%3E%0A%3C%2Fsvg%3E);
        background-repeat: no-repeat;
        background-position: right 10px center;
        border-bottom: 1px solid var(--primary-text-color, black);
      }
      .partial-date-format {
        background-image: none;
        margin-top: 20px;
        margin-bottom: 20px;
      }
      .partial-date-float {
        /*float:left;*/
        margin-right:15px;
      }
      .partial-date-headings {
        color: var(--primary-text-color, black);
        font-size: smaller;
        font-weight: normal;
      }
      #errorText {
        padding: 10px 10px 10px 0px;
        font-size: medium;
        font-weight: bold;
        color: var(--error-color);
      }
      :host([invalid]) {
        border: none;
      }
    </style>
    <div class="flex-container m-y-25">
      <div id="qnum-number"></div>
      <div id="qnum-content">
        <div id="container"></div>
      </div>
    </div>
    <div id="warn-text"></div>
    <div id="discrepancy-text"></div>
    `;
  }

  static get is() { return 'tangy-partial-date'; }

  static get properties() {
    return {
      name: {
        type: String,
        value: ''
      },
      value: {
        type: String,
        value: '',
        reflectToAttribute: true,
        observer: 'render'
      },
      hintText: {
        type: String,
        value: '',
        reflectToAttribute: true
      },
      required: {
        type: Boolean,
        value: false
      },
      disabled: {
        type: Boolean,
        value: false,
        reflectToAttribute: true,
        observer: 'render'
      },
      label: {
        type: String,
        value: '',
        reflectToAttribute: true
      },
      hidden: {
        type: Boolean,
        value: false
      },
      skipped: {
        type: Boolean,
        value: false,
        observer: 'onSkippedChange',
        reflectToAttribute: true
      },
      invalid: {
        type: Boolean,
        value: false,
        observer: 'render',
        reflectToAttribute: true
      },
     hasWarning: {
        type: Boolean,
        value: false,
        observer: 'onWarnChange',
        reflectToAttribute: true
      },
      hasDiscrepancy: {
        type: Boolean,
        value: false,
        observer: 'onDiscrepancyChange',
        reflectToAttribute: true
      },
      incomplete: {
        type: Boolean,
        value: true
      },
      minYear: {
        type: Number,
        value: 0,
        observer: 'render',
        reflectToAttribute: true
      },
      maxYear: {
        type: Number,
        value: 0,
        observer: 'render',
        reflectToAttribute: true
      },
      allowUnknownDay: {
        type: Boolean,
        observer: 'render',
        reflectToAttribute: true
      },
      allowUnknownMonth: {
        type: Boolean,
        observer: 'render',
        reflectToAttribute: true
      },
      allowUnknownYear: {
        type: Boolean,
        observer: 'render',
        reflectToAttribute: true
      },
      numericMonth: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      disallowFutureDate: {
        type: Boolean,
        observer: 'render',
        reflectToAttribute: true
      },
      showTodayButton: {
        type: Boolean,
        observer: 'render',
        reflectToAttribute: true
      },
      errorText: {
        type: String,
        value: '',
        observer: 'render'
      },
      missingDateErrorText: {
        type: String,
        value: '',
        observer: 'render',
        reflectToAttribute: true
      },
      invalidDateErrorText: {
        type: String,
        value: '',
        observer: 'render',
        reflectToAttribute: true
      },
      futureDateErrorText: {
        type: String,
        value: '',
        observer: 'render',
        reflectToAttribute: true
      },
      questionNumber: {
        type: String,
        value: "",
        observer: 'render',
        reflectToAttribute: true
      },
      warnText: {
        type: String,
        value: '',
        reflectToAttribute: true
      },
      discrepancyText: {
        type: String,
        value: '',
        reflectToAttribute: true
      },
      identifier: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      }
    }
  }

  connectedCallback() {
    super.connectedCallback()
    this.missingDateErrorText = this.missingDateErrorText === '' ? t("The date is missing. Please enter a valid date.") : this.missingDateErrorText
    this.invalidDateErrorText = this.invalidDateErrorText === '' ? t("The date is not valid. Please enter a valid date.") : this.invalidDateErrorText
    this.futureDateErrorText = this.futureDateErrorText === '' ? t("The date cannot be in the future. Please enter a date that is on or before today.") : this.futureDateErrorText
    this.render()
  }
  
  render() {

     const months = [
      t('January'),
      t('February'),
      t('March'),
      t('April'),
      t('May'),
      t('June'),
      t('July'),
      t('August'),
      t('September'),
      t('October'),
      t('November'),
      t('December')
    ];
    const days = Array.from({length: 31}, (x,i) => i+1);
    const years = Array.from({length: parseInt(this.maxYear) - parseInt(this.minYear) + 1}, (x,i) => parseInt(this.minYear) + i);
    const unknownText = t("Unknown");
    this.allowUnknownDay && days.push(99);
    this.allowUnknownMonth && months.push(unknownText);
    this.allowUnknownYear && years.push(9999);

    this.$['qnum-number'].innerHTML = `<label>${this.questionNumber}</label>`;
    this.$.container.innerHTML = `
      <label for="group">${this.label}</label>
      <label class="hint-text">${this.hintText}</label>
      <div class="mdc-select partial-date-format">
        <div class='partial-date-float'>
          <label for='day' class='partial-date-headings'>${t('Day')}:</label>
          <select class="mdc-select__surface partial-date-select" name="day" value="${this.value}" ${this.disabled ? 'disabled' : ''}>
            <option value="" default selected disabled></option>
            ${days.map((day, i) => `
              <option value="${day}">
                ${(day === 99 ? t("Unknown") : day)}
              </option>
            `)}
          </select>
        </div>
        <div class='partial-date-float'>
          <label for='month' class='partial-date-headings'>${t('Month')}:</label>
          <select class="mdc-select__surface partial-date-select" name="month" value="${this.value}" ${this.disabled ? 'disabled' : ''}>
            <option value="" default selected disabled></option>
            ${months.map((month, i) => `
              <option value="${(month === unknownText ? 99 : months.indexOf(month) + 1)}">
                ${(this.numericMonth ? (month === unknownText ? unknownText : months.indexOf(month) + 1) : (month === unknownText ? unknownText : month))}
              </option>
            `)}    
          </select>
        </div>
        <div class='partial-date-float'>
          <label for='year' class='partial-date-headings'>${t('Year')}:</label>
            <select class="mdc-select__surface partial-date-select" name="year" value="${this.value}" ${this.disabled ? 'disabled' : ''}>
              <option value="" default selected disabled></option>
              ${years.map((year, i) => `
                <option value="${year}">
                ${(year === 9999 ? t("Unknown") : year)}
                </option>
              `)}
            </select>
        </div>  
        
        <paper-button style="align-self:flex-end;" id="resetButton">
            <iron-icon icon="refresh"></iron-icon>&nbsp;
          </paper-button>
          
        ${(this.showTodayButton ? ` 
          <paper-button style="align-self:flex-end;" id="today" on-click="setToday" ${this.disabled ? 'disabled' : ''}>
            <iron-icon icon="query-builder"></iron-icon>&nbsp;
            ${t('Today')}
          </paper-button>` : '' 
        )}
      </div>
      ${this.invalid && this.errorText && !this.internalErrorText ? `
        <div id="error-text">
          <iron-icon icon="error"></iron-icon>
            <div>${this.errorText}</div>
        </div>      
      ` : ''}
      ${this.invalid && this.internalErrorText ? `
        <div id="error-text">
          <iron-icon icon="error"></iron-icon>
            <div>${this.internalErrorText}</div>
        </div>      
      ` : ''}
    `
    if (this.showTodayButton) {
      this._onClickListener = this
        .shadowRoot
        .querySelector('#today')
        .addEventListener('click', this.onTodayClick.bind(this))
    }
    this._onClickListener = this
      .shadowRoot
      .querySelector('#resetButton')
      .addEventListener('click', this.onResetClick.bind(this));
    this._onChangeListener = this
      .shadowRoot
      .querySelector('select[name="day"]')
      .addEventListener('change', this.onChange.bind(this));
    this._onChangeListener = this
      .shadowRoot
      .querySelector('select[name="month"]')
      .addEventListener('change', this.onChange.bind(this));
    this._onChangeListener = this
      .shadowRoot
      .querySelector('select[name="year"]')
      .addEventListener('change', this.onChange.bind(this));
    this.dispatchEvent(new CustomEvent('render'))
    if (this.value !== '') {
      const dateValue = this.value;
      this.shadowRoot.querySelector("select[name='day']").value = this.unpad(dateValue.split("-")[2]);
      this.shadowRoot.querySelector("select[name='month']").value = this.unpad(dateValue.split("-")[1]);
      this.shadowRoot.querySelector("select[name='year']").value = dateValue.split("-")[0];  
    }
  }

  onTodayClick(event) {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    this.value = year + '-' + month + '-' + day;
    this.shadowRoot.querySelector("select[name='day']").value = year;
    this.shadowRoot.querySelector("select[name='month']").value = month;
    this.shadowRoot.querySelector("select[name='year']").value = day;

    this.render();

    this.dispatchEvent(new CustomEvent('change'));
  }

  onChange(event) {
    this.value =  this.shadowRoot.querySelector("select[name='year']").value + '-' +
                  this.pad(this.shadowRoot.querySelector("select[name='month']").value,2) + '-' +
                  this.pad(this.shadowRoot.querySelector("select[name='day']").value,2);
    console.log("Date value updated to " + this.value);          
    this.dispatchEvent(new CustomEvent('change'));
  }

  validate() {
    if (this.required && !this.hidden && !this.disabled && !this.value) {
      this.internalErrorText = this.missingDateErrorText;
      this.invalid = true;
      return false;
    }
    if (!this.required && this.value === '')
      return true
    if (!this.isValidDate(this.value)) {
      this.internalErrorText = this.invalidDateErrorText;
      this.invalid = true;
      return false;
    }
    if (this.disallowFutureDate && this.isFutureDate(this.value)) {
      this.internalErrorText = this.futureDateErrorText;
      this.invalid = true;
      return false;
    }
    this.internalErrorText = "";
    this.invalid = false;
    return true;
  }

  pad(a,b) {
    if (a !== '') {
      return(1e15+a+"").slice(-b);
    } else {
      return '';
    }
  }

  unpad(a) {
    return +a;
  }

  isFutureDate(dateValue) {
    const today = new Date();
    const enteredDay = parseInt(this.unpad(dateValue.split("-")[2]));
    const enteredMonth = parseInt(this.unpad(dateValue.split("-")[1]));
    const enteredYear = parseInt(dateValue.split("-")[0]); 
    if (enteredDay !== 99 && enteredMonth !== 99 && enteredYear !== 9999) {
      const fullDate = new Date(enteredYear, enteredMonth - 1, enteredDay);
      if (fullDate > today) {
        return true;
      } else {
        return false;
      }
    }
    if (enteredMonth !== 99 && enteredYear !== 9999) {
      const imputedDate = new Date(enteredYear, enteredMonth - 1, 1);
      if (imputedDate > today) {
        return true;
      } else {
        return false;
      }
    }
    if (enteredYear !== 9999) {
      const imputedDate = new Date(enteredYear, 0, 1);
      if (imputedDate > today) {
        return true;
      } else {
        return false;
      }
    }
    return false;
 
  }

  isValidDate(str) {
    var parts = str.split('-');
    if (parts.length < 3)
      return false;
    else {
      var day = parseInt(parts[2]);
      var month = parseInt(parts[1]);
      var year = parseInt(parts[0]);
      if (isNaN(day) || isNaN(month) || isNaN(year)) {
          return false;
      }
      if (day < 1 || year < 1)
          return false;
      if((month>12||month<1) & month !== 99)
          return false;
      if ((month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) && day > 31 && day !== 99)
          return false;
      if ((month == 4 || month == 6 || month == 9 || month == 11 ) && day > 30 & day !== 99)
          return false;
      if (month == 2) {
        if (day === 99)
          return true;
        if (((year % 4) == 0 && (year % 100) != 0) || ((year % 400) == 0 && (year % 100) == 0)) {
            if (day > 29)
                return false;
        } else {
            if (day > 28)
                return false;
        }      
      }
      return true;
    }
  }
  
  onDiscrepancyChange(value) {
    this.shadowRoot.querySelector('#discrepancy-text').innerHTML = this.hasDiscrepancy
      ? `<iron-icon icon="flag"></iron-icon> <div> ${ this.hasAttribute('discrepancy-text') ? this.getAttribute('discrepancy-text') : ''} </div>`
      : ''
  }

  onWarnChange(value) {
    this.shadowRoot.querySelector('#warn-text').innerHTML = this.hasWarning
      ? `<iron-icon icon="warning"></iron-icon> <div> ${ this.hasAttribute('warn-text') ? this.getAttribute('warn-text') : ''} </div>`
      : ''
  }

  onSkippedChange(newValue, oldValue) {
    if (newValue === true) {
      this.value = this.constructor.properties.value.value
      this.render()
    }
  }

  _transformValueToMoment(value) {
    const [year, month, day] = value.split('-')
    let date = null
    if (year === '9999' || year === '') {
      // Need at least a year to calculate.
      return null 
    } else if (month === '99' || month === '') {
      // We don't have a month, just have a year to go off of.
      date = moment(year, 'YYYY')
    } else if (day === '99' || day === '') {
      // We don't have a day, go off of year and month.
      date = moment(`${year}-${month}`, 'YYYY-MM')
    } else {
      date = moment(`${year}-${month}-${day}`, 'YYYY-MM-DD')
    }
    return date
  }

  getValueAsMoment() {
    return this._transformValueToMoment(this.value)
  }

  diff(units = 'days', endString = '', startString = '', asFloat = true) {
    const end = moment(endString)
    const start = startString 
      ? this._transformValueToMoment(startString)
      : this.getValueAsMoment()
    if (!start || !end) {
      return null
    }
    return end.diff(start, units, asFloat)
  }

  onResetClick() {
    this.reset()
  }

  reset() {
    this.value = ''
  }

}

window.customElements.define(TangyPartialDate.is, TangyPartialDate);
