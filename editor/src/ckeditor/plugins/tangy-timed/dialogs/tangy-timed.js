CKEDITOR.dialog.add( 'tangy-timed', function( editor ) {
	return {
		title: 'Edit a Grid Test',
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
						id: 'duration',
						type: 'text',
						label: 'duration in seconds',
						width: '100%',
						setup: function( widget ) {
							this.setValue( widget.data.duration );
						},
						commit: function( widget ) {
							widget.setData( 'duration', this.getValue() );
						}
					},
					{
						id: 'columns',
						type: 'text',
						label: 'columns',
						width: '100%',
						setup: function( widget ) {
							this.setValue( widget.data.columns );
						},
						commit: function( widget ) {
							widget.setData( 'columns', this.getValue() );
						}
					}
				]
			}
		]
	};
} );
