CKEDITOR.plugins.add( 'tangy-checkboxes', {
	requires: 'widget',
	icons: 'tangy-checkboxes',
	init: function( editor ) {
		CKEDITOR.dialog.add( 'tangy-checkboxes', this.path + 'dialogs/tangy-checkboxes.js' );
		editor.widgets.add( 'tangy-checkboxes', {
			allowedContent:
				'div(!tangy-checkboxes,align-left,align-right,align-center){width};' +
				'div(!tangy-checkboxes-content); h2(!tangy-checkboxes-title); tangy-section();',
			requiredContent: 'div(tangy-checkboxes)',
			template:
				'<tangy-checkboxes></tangy-checkboxes>',
			button: 'Create a tangy-checkboxes element',
			dialog: 'tangy-checkboxes',
			upcast: function( element ) {
				return element.name == 'tangy-checkboxes' ;
			},
			init: function() {
				this.setData('label', this.element.$.label)
				this.setData('type', this.element.$.type)
				this.setData('name', this.element.$.name)
				if (this.element.$.required) {
					this.setData('required', 'required')
				} else {
					this.setData('required', 'not-required')
				}
				let optionEls = this.element.$.querySelectorAll('option')
				let optionsString = ''
				optionEls.forEach(optionEl => optionsString += `${optionEl.innerText}\n`)
				this.setData('options', optionsString)
			},
			data: function() {
				this.element.$.setAttribute('type', this.data.type)
				this.element.$.setAttribute('label', this.data.label)
				this.element.$.setAttribute('name', this.data.name)
				if (this.data.required === 'required') {
					this.element.$.setAttribute('required', true)
				} else {
					this.element.$.removeAttribute('required')
				}
				this.element.$.innerHTML = ''
				let options = this.data.options.split('\n')
				options.forEach((option, i) => {
					if (option == '') return
					let optionEl = document.createElement('option')
					optionEl.value = i
					optionEl.innerText = option
					this.element.$.appendChild(optionEl)
				})
				// Don't force render if not connected to DOM yet on first create.
				if (this.element.$.shadowRoot) {
					this.element.$.render()
				}
			}
		} );
	}
} );
