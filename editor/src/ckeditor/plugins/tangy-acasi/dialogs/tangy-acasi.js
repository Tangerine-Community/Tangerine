CKEDITOR.dialog.add( 'tangy-acasi', function( editor ) {
	return {
		title: 'Edit an ACASI section.',
		minWidth: 200,
		minHeight: 100,
		contents: [
			{
				id: 'info',
				elements: [
					{
						id: 'required',
						type: 'select',
						label: 'Required',
						width: '100%',
						items: [
							[ 'not-required', 'not-required' ],
							[ 'required', 'required' ],
						],
						setup: function( widget ) {
							this.setValue( widget.data.required );
						},
						commit: function( widget ) {
							widget.setData( 'required', this.getValue() );
						}
					},
					{
						id: 'name',
						type: 'text',
						label: 'Variable Name',
						width: '100%',
						setup: function( widget ) {
							this.setValue( widget.data.name );
						},
						commit: function( widget ) {
							widget.setData( 'name', this.getValue() );
						}
					},
					{
						id: 'images',
						type: 'textarea',
						label: 'Images to display',
						width: '100%',
						setup: function( widget ) {
                this.setValue( widget.data.images );
						},
						commit: function( widget ) {
							widget.setData( 'images', this.getValue() );
						}
					},
					{
						id: 'introSrc',
						type: 'text',
						label: 'Audio file to play when page is loaded',
            'default':'../content/assets/sounds/1.mp3',
						width: '100%',
						setup: function( widget ) {
							this.setValue( widget.data.introSrc );
						},
						commit: function( widget ) {
							widget.setData( 'introSrc', this.getValue() );
						}
					},
					{
						id: 'transitionSrc',
						type: 'text',
						label: 'Transition sound between pages',
						width: '100%',
						setup: function( widget ) {
							this.setValue( widget.data.transitionSrc );
						},
						commit: function( widget ) {
							widget.setData( 'transitionSrc', this.getValue() );
						}
					},
					{
						id: 'touchSrc',
						type: 'textarea',
						label: 'Sound when image is touched',
						width: '100%',
						setup: function( widget ) {
							this.setValue( widget.data.touchSrc );
						},
						commit: function( widget ) {
							widget.setData( 'touchSrc', this.getValue() );
						}
					}
				]
			}
		]
	};
} );
