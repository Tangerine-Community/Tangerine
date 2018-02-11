/**
 * Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * Licensed under the terms of the MIT License (see LICENSE.md).
 *
 * Simple CKEditor Widget (Part 2).
 *
 * Created out of the CKEditor Widget SDK:
 * http://docs.ckeditor.com/#!/guide/widget_sdk_tutorial_2
 */

// Register the plugin within the editor.
CKEDITOR.plugins.add( 'tangy-hide-if', {
	// This plugin requires the Widgets System defined in the 'widget' plugin.
	requires: 'widget',

	// Register the icon used for the toolbar button. It must be the same
	// as the name of the widget.
	icons: 'tangy-hide-if',

	// The plugin initialization logic goes inside this method.
	init: function( editor ) {
		// Register the editing dialog.
		CKEDITOR.dialog.add( 'tangy-hide-if', this.path + 'dialogs/tangy-hide-if.js' );

		// Register the tangy-hide-if widget.
		editor.widgets.add( 'tangy-hide-if', {
			// Allow all HTML elements, classes, and styles that this widget requires.
			// Read more about the Advanced Content Filter here:
			// * http://docs.ckeditor.com/#!/guide/dev_advanced_content_filter
			// * http://docs.ckeditor.com/#!/guide/plugin_sdk_integration_with_acf
			allowedContent:
				'div(!tangy-hide-if,align-left,align-right,align-center){width};' +
				'div(!tangy-hide-if-content); h2(!tangy-hide-if-title)',

			// Minimum HTML which is required by this widget to work.
			requiredContent: 'div(tangy-hide-if)',

			// Define two nested editable areas.
			editables: {
				content: {
					selector: '.content',
					// allowedContent: 'p br ul ol li strong em tangy-hide-if'
				}
			},

			// Define the template of a new Simple Box widget.
			// The template will be used when creating new instances of the Simple Box widget.
			template:
				'<tangy-hide-if condition="false"> <div class="content">Add form elements...' +
				'</div></tangy-hide-if>',

			// Define the label for a widget toolbar button which will be automatically
			// created by the Widgets System. This button will insert a new widget instance
			// created from the template defined above, or will edit selected widget
			// (see second part of this tutorial to learn about editing widgets).
			//
			// Note: In order to be able to translate your widget you should use the
			// editor.lang.tangy-hide-if.* property. A string was used directly here to simplify this tutorial.
			button: 'Create a tangy-hide-if',

			// Set the widget dialog window name. This enables the automatic widget-dialog binding.
			// This dialog window will be opened when creating a new widget or editing an existing one.
			dialog: 'tangy-hide-if',

			// Check the elements that need to be converted to widgets.
			//
			// Note: The "element" argument is an instance of http://docs.ckeditor.com/#!/api/CKEDITOR.htmlParser.element
			// so it is not a real DOM element yet. This is caused by the fact that upcasting is performed
			// during data processing which is done on DOM represented by JavaScript objects.
			upcast: function( element ) {
				// Return "true" (that element needs to converted to a widget)
				// for all "tangy-hide-if" elements.
				return element.name == 'tangy-hide-if' ;
			},
			downcast: function( element ) {
      },

			// When a widget is being initialized for editing, we need to read the the condition property and set to data 
			init: function() {
				var condition = this.element.getAttribute('condition');
				if ( condition ) {
					this.setData( 'condition', condition );
        }
        // It may be in a state that causes it to hide when editiing, force it to show.
        this.element.setAttribute('condition', 'false')

			},

			// Listen on the widget#data event which is fired every time the widget data changes
			// and updates the widget's view.
			// Data may be changed by using the widget.setData() method, which we use in the
			// Simple Box dialog window.
			data: function() {
        // TODO: Should happen on destroy?
        this.element.setAttribute('condition', this.data.condition)
			}
		} );
	}
} );
