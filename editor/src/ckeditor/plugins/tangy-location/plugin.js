CKEDITOR.plugins.add( 'tangy-location', {
	requires: 'widget',
	icons: 'tangy-location',
	init: function( editor ) {
		CKEDITOR.dialog.add( 'tangy-location', this.path + 'dialogs/tangy-location.js' );
		editor.widgets.add( 'tangy-location', {
			allowedContent:
				'div(!tangy-location,align-left,align-right,align-center){width};' +
				'div(!tangy-location-content); h2(!tangy-location-title); tangy-section();',
			requiredContent: 'div(tangy-location)',
			template:
				'<tangy-location></tangy-location>',
			button: 'Create a tangy-location',
			dialog: 'tangy-location',
			upcast: function( element ) {
				return element.name == 'tangy-location' ;
			},
			init: function() {
				this.setData('label', this.element.$.label)
				this.setData('name', this.element.$.name)
				this.setData('showLevels', this.element.$.showLevels)
				if (this.element.$.required) {
					this.setData('required', 'required')
				} else {
					this.setData('required', 'not-required')
				}
			},
			data: function() {
				this.element.$.setAttribute('show-levels', this.data.showLevels)
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
