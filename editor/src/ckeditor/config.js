/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here.
	// For complete reference see:
	// http://docs.ckeditor.com/#!/api/CKEDITOR.config

	// The toolbar groups arrangement, optimized for a single toolbar row.
	config.toolbarGroups = [
		{ name: 'document',	   groups: [ 'mode', 'document', 'doctools' ] },
		{ name: 'clipboard',   groups: [ 'clipboard', 'undo' ] },
		{ name: 'editing',     groups: [ 'find', 'selection', 'spellchecker' ] },
		{ name: 'forms' },
		{ name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
		{ name: 'paragraph',   groups: [ 'list', 'indent', 'blocks', 'align', 'bidi' ] },
		{ name: 'links' },
		{ name: 'insert' },
		{ name: 'styles' },
		{ name: 'colors' },
		{ name: 'tools' },
		{ name: 'others' },
		{ name: 'about' }
	];

	// The default plugins included in the basic setup define some buttons that
	// are not needed in a basic editor. They are removed here.
	config.removeButtons = 'Cut,Copy,Paste,Undo,Redo,Anchor,Underline,Strike,Subscript,Superscript';

	// Dialog windows are also simplified.
	config.removeDialogTabs = 'link:advanced';
  config.allowedContent = true;
  // config.autoParagraph = false;
  config.fillEmptyBlocks = false;
  config.ignoreEmptyParagraph = true;
  // Use disableAutoInline when explicitly using CKEDITOR.inline( 'editorDOM' );
  config.disableAutoInline = true;

  // config.enterMode = CKEDITOR.ENTER_BR // pressing the ENTER KEY input <br/>
  // config.shiftEnterMode = CKEDITOR.ENTER_P; //pressing the SHIFT + ENTER KEYS input <p>
  // config.forcePasteAsPlainText = true

  config.extraPlugins = 'tangy-radio-buttons,tangy-checkboxes,tangy-input,tangy-location,tangy-timed,tangy-checkbox,tangy-gps'

  // CKEDITOR.on('instanceReady', function (ev) {
  // 	console.log("ckeditor instanceReady")
  //   var writer = ev.editor.dataProcessor.writer;
  //   // The character sequence to use for every indentation step.
  //   writer.indentationChars = '  ';
  //
  //   var dtd = CKEDITOR.dtd;
  //   // Elements taken as an example are: block-level elements (div or p), list items (li, dd), and table elements (td, tbody).
  //   for (var e in CKEDITOR.tools.extend({}, dtd.$block, dtd.$listItem, dtd.$tableContent)) {
  //     var writer = ev.editor.dataProcessor.writer;
  //     writer.breakBeforeOpen= false
  //     writer.breakAfterOpen= false
  //     writer.breakBeforeClose= false
  //     writer.breakAfterClose= false
  //     // writer.setRules(e, {
  //     //   // Indicates that an element creates indentation on line breaks that it contains.
  //     //   indent: false,
  //     //   // Inserts a line break before a tag.
  //     //   breakBeforeOpen: false,
  //     //   // Inserts a line break after a tag.
  //     //   breakAfterOpen: false,
  //     //   // Inserts a line break before the closing tag.
  //     //   breakBeforeClose: false,
  //     //   // Inserts a line break after the closing tag.
  //     //   breakAfterClose: false
  //     // });
  //   }
  // });
};
