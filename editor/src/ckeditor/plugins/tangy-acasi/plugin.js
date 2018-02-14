CKEDITOR.plugins.add( 'tangy-timed', {
	requires: 'widget',
	icons: 'tangy-acasi',
	init: function( editor ) {
		CKEDITOR.dialog.add( 'tangy-acasi', this.path + 'dialogs/tangy-acasi.js' );
		editor.widgets.add( 'tangy-acasi', {
			allowedContent:
				'div(!tangy-acasi,align-left,align-right,align-center){width};' +
				'div(!tangy-acasi-content); h2(!tangy-acasi-title); tangy-section();',
			requiredContent: 'div(tangy-acasi)',
			template:
				'<tangy-acasi></tangy-acasi>',
			button: 'Create a tangy-acasi widget',
			dialog: 'tangy-acasi',
			upcast: function( element ) {
				return element.name == 'tangy-acasi' ;
			},
			init: function() {
        this.setData('formId', this.element.$.formId)
        this.setData('on-change', this.element.$.onChange)
				this.setData('intro-src', this.element.$.introSrc)
				this.setData('name', this.element.$.name)

				let optionEls = this.element.$.querySelectorAll('option')
				let optionsString = ''
				optionEls.forEach(optionEl => optionsString += `${optionEl.innerText} `)
				this.setData('options', optionsString)
			},
			data: function() {
				this.element.$.setAttribute('columns', this.data.columns)
				this.element.$.setAttribute('duration', this.data.duration)
				this.element.$.setAttribute('name', this.data.name)
				// if (this.data.required === 'required') {
				// 	this.element.$.setAttribute('required', true)
				// } else {
				// 	this.element.$.removeAttribute('required')
				// }
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
