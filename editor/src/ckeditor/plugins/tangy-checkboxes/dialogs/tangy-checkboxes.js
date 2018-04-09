CKEDITOR.dialog.add( 'tangy-checkboxes', function( editor ) {
	return {
		title: 'Edit Tangy Radio Buttons',
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
						id: 'options',
						type: 'textarea',
						label: 'Options',
						width: '100%',
						setup: function( widget ) {
							this.setValue( widget.data.options );
						},
						commit: function( widget ) {
							widget.setData( 'options', this.getValue() );
						}
					},
					{
						id: 'label',
						type: 'textarea',
						label: 'label',
						width: '100%',
						setup: function( widget ) {
							this.setValue( widget.data.label );
						},
						commit: function( widget ) {
							widget.setData( 'label', this.getValue() );
						}
					}
				]
			}
		]
	};
} );
