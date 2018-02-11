/**
 * Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * Licensed under the terms of the MIT License (see LICENSE.md).
 */

// Note: This automatic widget to dialog window binding (the fact that every field is set up from the widget
// and is committed to the widget) is only possible when the dialog is opened by the Widgets System
// (i.e. the widgetDef.dialog property is set).
// When you are opening the dialog window by yourself, you need to take care of this by yourself too.

CKEDITOR.dialog.add( 'tangy-hide-if', function( editor ) {
	return {
		title: 'Edit Tangy Hide If',
		minWidth: 200,
		minHeight: 100,
		contents: [
			{
				id: 'info',
				elements: [
					{
						id: 'condition',
						type: 'text',
						label: 'Condition',
						width: '50px',
						setup: function( widget ) {
							this.setValue( widget.data.condition );
						},
						commit: function( widget ) {
							widget.setData( 'condition', this.getValue() );
						}
					}
				]
			}
		]
	};
} );
