CKEDITOR.plugins.add( 'tangy-input', {
	requires: 'widget',
	icons: 'tangy-input',
	init: function( editor ) {
		CKEDITOR.dialog.add( 'tangy-input', this.path + 'dialogs/tangy-input.js' );
		editor.widgets.add( 'tangy-input', {
			allowedContent:
				'div(!tangy-input,align-left,align-right,align-center){width};' +
				'div(!tangy-input-content); h2(!tangy-input-title); tangy-section();',
			requiredContent: 'div(tangy-input)',
			template:
				'<tangy-input></tangy-input>',
			button: 'Create a tangy-input',
			dialog: 'tangy-input',
			upcast: function( element ) {
				return element.name == 'tangy-input' ;
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

			}
		} );
	}
} );
