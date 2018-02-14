CKEDITOR.plugins.add( 'tangy-checkbox', {
	requires: 'widget',
	icons: 'tangy-checkbox',
	init: function( editor ) {
		CKEDITOR.dialog.add( 'tangy-checkbox', this.path + 'dialogs/tangy-checkbox.js' );
		editor.widgets.add( 'tangy-checkbox', {
			allowedContent:
				'div(!tangy-checkbox,align-left,align-right,align-center){width};' +
				'div(!tangy-checkbox-content); h2(!tangy-checkbox-title); tangy-section();',
			requiredContent: 'div(tangy-checkbox)',
			template:
				'<tangy-checkbox></tangy-checkbox>',
			button: 'Create a tangy-checkbox',
			dialog: 'tangy-checkbox',
			upcast: function( element ) {
				return element.name == 'tangy-checkbox' ;
			},
			init: function() {
				this.setData('label', this.element.$.label)
				this.setData('name', this.element.$.name)
				if (this.element.$.required) {
					this.setData('required', 'required')
				} else {
					this.setData('required', 'not-required')
				}
			},
			data: function() {
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
