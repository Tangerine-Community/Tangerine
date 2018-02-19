CKEDITOR.plugins.add( 'tangy-acasi', {
	requires: 'widget',
	icons: 'tangy-acasi',
	init: function( editor ) {
		CKEDITOR.dialog.add( 'tangy-acasi', this.path + 'dialogs/tangy-acasi.js' );
		editor.widgets.add( 'tangy-acasi', {
			requiredContent: 'div(tangy-acasi)',
			template:
				'<tangy-acasi></tangy-acasi>',
			button: 'Create a tangy-acasi',
			dialog: 'tangy-acasi',
			upcast: function( element ) {
				return element.name == 'tangy-acasi' ;
			},
			init: function() {
				this.setData('introSrc', this.element.$.introSrc)
				this.setData('transitionSrc', this.element.$.transitionSrc)
				this.setData('name', this.element.$.name)
				this.setData('images', this.element.$.images)
			},
			data: function() {
				this.element.$.setAttribute('introSrc', this.data.introSrc)
				this.element.$.setAttribute('transitionSrc', this.data.transitionSrc)
				this.element.$.setAttribute('name', this.data.name)
				this.element.$.innerHTML = ''
				let images = this.data.images.split(',')
        images.forEach((option, i) => {
					if (option == '') return
					let optionEl = document.createElement('img')
					optionEl.src = option
					this.element.$.appendChild(optionEl)
				})
				// Don't force render if not connected to DOM yet on first create.
				if (this.element.$.shadowRoot) {
					this.element.$.renderOptions()
				}
			}
		} );
	}
} );
