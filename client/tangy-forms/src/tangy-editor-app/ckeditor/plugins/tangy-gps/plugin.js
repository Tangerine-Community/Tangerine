CKEDITOR.plugins.add( 'tangy-gps', {
	requires: 'widget',
	icons: 'tangy-gps',
	init: function( editor ) {
		CKEDITOR.dialog.add( 'tangy-gps', this.path + 'dialogs/tangy-gps.js' );
		editor.widgets.add( 'tangy-gps', {
			allowedContent:
				'div(!tangy-gps,align-left,align-right,align-center){width};' +
				'div(!tangy-gps-content); h2(!tangy-gps-title); tangy-section();',
			requiredContent: 'div(tangy-gps)',
			template:
				'<tangy-gps></tangy-gps>',
			button: 'Create a tangy-gps',
			dialog: 'tangy-gps',
			upcast: function( element ) {
				return element.name == 'tangy-gps' ;
			},
			init: function() {
				this.setData('name', this.element.$.name)
				if (this.element.$.required) {
					this.setData('required', 'required')
				} else {
					this.setData('required', 'not-required')
				}
			},
			data: function() {
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
