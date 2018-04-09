CKEDITOR.plugins.add( 'tangy-acasi', {
	requires: 'widget',
	icons: 'tangy-acasi',
	init: function( editor ) {
		CKEDITOR.dialog.add( 'tangy-acasi', this.path + 'dialogs/tangy-acasi.js' );
		editor.widgets.add( 'tangy-acasi', {
			template:
				'<tangy-acasi></tangy-acasi>',

			button: 'Create an ACASI widget',
			dialog: 'tangy-acasi',
			upcast: function( element ) {
				return element.name == 'tangy-acasi' ;
			},
			init: function() {
        this.setData('name', this.element.$.name)

        if (this.element.$.getAttribute('introSrc') === null) {
          this.setData('introSrc', this.element.$.introSrc)
        } else {
          let introSrc = this.element.$.getAttribute('introSrc')
          this.setData('introSrc', introSrc)
        }
        if (this.element.$.getAttribute('transitionSrc') === null) {
          this.setData('transitionSrc', this.element.$.transitionSrc)
        } else {
          let transitionSrc = this.element.$.getAttribute('transitionSrc')
          this.setData('transitionSrc', transitionSrc)
        }
        if (this.element.$.getAttribute('touchsrc') === null) {
          this.setData('touchSrc', this.element.$.touchSrc)
        } else {
          let touchSrc = this.element.$.getAttribute('touchsrc')
          this.setData('touchSrc', touchSrc)
        }
        if (this.element.$.getAttribute('images') === null) {
          this.setData('images', this.element.$.images)
        } else {
          let images = this.element.$.getAttribute('images')
          this.setData('images', images)
        }
			},
			data: function() {
				this.element.$.setAttribute('introSrc', this.data.introSrc)
				this.element.$.setAttribute('transitionSrc', this.data.transitionSrc)
				this.element.$.setAttribute('touchSrc', this.data.touchSrc)
				this.element.$.setAttribute('name', this.data.name)
				this.element.$.setAttribute('images', this.data.images)
				// this.element.$.innerHTML = ''
				// let images = this.data.images.split(',')
        // images.forEach((filePath, i) => {
				// 	if (filePath == '') return
				// 	let imageEl = document.createElement('img')
         //  imageEl.src = filePath
         //  imageEl.className = "acasi-image";
				// 	this.element.$.appendChild(imageEl)
				// })
				// Don't force render if not connected to DOM yet on first create.
				if (this.element.$.shadowRoot) {
					this.element.$.renderOptions()
				}
			}
		} );
	}
} );
