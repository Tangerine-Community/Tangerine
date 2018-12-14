// window.onload = init;

// function init() {
// 	console.log('Function init is running');
// 	document.getElementById('mySelect').onclick = addMyClass;
// }

// function addMyClass(){
// 	var classString = this.className;
// 	var newClass = classString.concat(" turnBlue");
// 	this.className = newClass;
// }

/*window.onload = init;

function init() {
	console.log('Function init is running');
	document.getElementById('mySelect').onclick = addMyClass;
}

function addMyClass(){
	var classString = this.className;
	var newClass = classString.concat(" turnBlue");
	this.className = newClass;
}*/


  function MaterialSelect(element) {
  'use strict';

  this.element_ = element;
  this.maxRows = this.Constant_.NO_MAX_ROWS;
  // Initialize instance.
  this.init();
}

MaterialSelect.prototype.Constant_ = {
  NO_MAX_ROWS: -1,
  MAX_ROWS_ATTRIBUTE: 'maxrows'
};

MaterialSelect.prototype.CssClasses_ = {
  LABEL: 'mdl-textfield__label',
  INPUT: 'mdl-select__input',
  IS_DIRTY: 'is-dirty',
  IS_FOCUSED: 'is-focused',
  IS_DISABLED: 'is-disabled',
  IS_INVALID: 'is-invalid',
  IS_UPGRADED: 'is-upgraded'
};

MaterialSelect.prototype.onKeyDown_ = function(event) {
  'use strict';

  var currentRowCount = event.target.value.split('\n').length;
  if (event.keyCode === 13) {
    if (currentRowCount >= this.maxRows) {
      event.preventDefault();
    }
  }
};

MaterialSelect.prototype.onFocus_ = function(event) {
  'use strict';

  this.element_.classList.add(this.CssClasses_.IS_FOCUSED);
};

MaterialSelect.prototype.onBlur_ = function(event) {
  'use strict';

  this.element_.classList.remove(this.CssClasses_.IS_FOCUSED);
};

MaterialSelect.prototype.updateClasses_ = function() {
  'use strict';
  this.checkDisabled();
  this.checkValidity();
  this.checkDirty();
};

MaterialSelect.prototype.checkDisabled = function() {
  'use strict';
  if (this.input_.disabled) {
    this.element_.classList.add(this.CssClasses_.IS_DISABLED);
  } else {
    this.element_.classList.remove(this.CssClasses_.IS_DISABLED);
  }
};

MaterialSelect.prototype.checkValidity = function() {
  'use strict';
  if (this.input_.validity.valid) {
    this.element_.classList.remove(this.CssClasses_.IS_INVALID);
  } else {
    this.element_.classList.add(this.CssClasses_.IS_INVALID);
  }
};

MaterialSelect.prototype.checkDirty = function() {
  'use strict';
  if (this.input_.value && this.input_.value.length > 0) {
    this.element_.classList.add(this.CssClasses_.IS_DIRTY);
  } else {
    this.element_.classList.remove(this.CssClasses_.IS_DIRTY);
  }
};

MaterialSelect.prototype.disable = function() {
  'use strict';

  this.input_.disabled = true;
  this.updateClasses_();
};

MaterialSelect.prototype.enable = function() {
  'use strict';

  this.input_.disabled = false;
  this.updateClasses_();
};

MaterialSelect.prototype.change = function(value) {
  'use strict';

  if (value) {
    this.input_.value = value;
  }
  this.updateClasses_();
};

MaterialSelect.prototype.init = function() {
  'use strict';

  if (this.element_) {
    this.label_ = this.element_.querySelector('.' + this.CssClasses_.LABEL);
    this.input_ = this.element_.querySelector('.' + this.CssClasses_.INPUT);

    if (this.input_) {
      if (this.input_.hasAttribute(this.Constant_.MAX_ROWS_ATTRIBUTE)) {
        this.maxRows = parseInt(this.input_.getAttribute(
            this.Constant_.MAX_ROWS_ATTRIBUTE), 10);
        if (isNaN(this.maxRows)) {
          this.maxRows = this.Constant_.NO_MAX_ROWS;
        }
      }

      this.boundUpdateClassesHandler = this.updateClasses_.bind(this);
      this.boundFocusHandler = this.onFocus_.bind(this);
      this.boundBlurHandler = this.onBlur_.bind(this);
      this.input_.addEventListener('input', this.boundUpdateClassesHandler);
      this.input_.addEventListener('focus', this.boundFocusHandler);
      this.input_.addEventListener('blur', this.boundBlurHandler);

      if (this.maxRows !== this.Constant_.NO_MAX_ROWS) {
        // TODO: This should handle pasting multi line text.
        // Currently doesn't.
        this.boundKeyDownHandler = this.onKeyDown_.bind(this);
        this.input_.addEventListener('keydown', this.boundKeyDownHandler);
      }

      this.updateClasses_();
      this.element_.classList.add(this.CssClasses_.IS_UPGRADED);
    }
  }
};

MaterialSelect.prototype.mdlDowngrade_ = function() {
  'use strict';
  this.input_.removeEventListener('input', this.boundUpdateClassesHandler);
  this.input_.removeEventListener('focus', this.boundFocusHandler);
  this.input_.removeEventListener('blur', this.boundBlurHandler);
  if (this.boundKeyDownHandler) {
    this.input_.removeEventListener('keydown', this.boundKeyDownHandler);
  }
};

// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({
  constructor: MaterialSelect,
  classAsString: 'MaterialSelect',
  cssClass: 'mdl-js-select',
  widget: true
});