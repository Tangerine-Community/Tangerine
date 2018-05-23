CKEDITOR.dialog.add( 'tangy-input', function( editor ) {
	return {
		title: 'Edit Tangy Form',
		minWidth: 200,
		minHeight: 100,
		contents: [
			{
				id: 'info',
				elements: [
					{
						id: 'type',
						type: 'select',
						label: 'Type',
						width: '100%',
						items: [
							[ 'text', 'text' ],
							[ 'number', 'number' ],
							[ 'email', 'email' ],
							[ 'date', 'date' ],
							[ 'time', 'time' ],
							[ 'password', 'password' ],
						],
						setup: function( widget ) {
							this.setValue( widget.data.type );
						},
						commit: function( widget ) {
							widget.setData( 'type', this.getValue() );
						}
					},
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
						id: 'label',
						type: 'text',
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
