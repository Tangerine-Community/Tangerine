CKEDITOR.plugins.add( 'tangy-timed', {
	requires: 'widget',
	icons: 'tangy-timed',
	init: function( editor ) {
		CKEDITOR.dialog.add( 'tangy-timed', this.path + 'dialogs/tangy-timed.js' );
		editor.widgets.add( 'tangy-timed', {
			allowedContent:
				'div(!tangy-timed,align-left,align-right,align-center){width};' +
				'div(!tangy-timed-content); h2(!tangy-timed-title); tangy-section();',
			requiredContent: 'div(tangy-timed)',
			template:
				'<tangy-timed></tangy-timed>',
			button: 'Create a tangy-timed',
			dialog: 'tangy-timed',
			upcast: function( element ) {
				return element.name == 'tangy-timed' ;
			},
			init: function() {
				this.setData('columns', this.element.$.columns)
				this.setData('duration', this.element.$.duration)
				this.setData('name', this.element.$.name)
				if (this.element.$.required) {
					this.setData('required', 'required')
				} else {
					this.setData('required', 'not-required')
				}
				let optionEls = this.element.$.querySelectorAll('option')
				let optionsString = ''
				optionEls.forEach(optionEl => optionsString += `${optionEl.innerText} `)
				this.setData('options', optionsString)
			},
			data: function() {
				this.element.$.setAttribute('columns', this.data.columns)
				this.element.$.setAttribute('duration', this.data.duration)
				this.element.$.setAttribute('name', this.data.name)
				if (this.data.required === 'required') {
					this.element.$.setAttribute('required', true)
				} else {
					this.element.$.removeAttribute('required')
				}
				this.element.$.innerHTML = ''
				let options = this.data.options.split(' ')
				options.forEach((option, i) => {
					if (option == '') return
					let optionEl = document.createElement('option')
					optionEl.value = i
					optionEl.innerText = option
					this.element.$.appendChild(optionEl)
				})
				// Don't force render if not connected to DOM yet on first create.
				if (this.element.$.shadowRoot) {
					this.element.$.generateGrid()
				}
			}
		} );
	}
} );
