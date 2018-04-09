/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	
	// %REMOVE_START%
	// The configuration options below are needed when running CKEditor from source files.
	// config.plugins = 'dialogui,dialog,about,a11yhelp,basicstyles,blockquote,notification,button,toolbar,clipboard,panel,floatpanel,menu,contextmenu,resize,elementspath,enterkey,entities,popup,filebrowser,floatingspace,listblock,richcombo,format,horizontalrule,htmlwriter,wysiwygarea,image,indent,indentlist,fakeobjects,link,list,magicline,maximize,pastetext,pastefromword,removeformat,showborders,sourcearea,specialchar,menubutton,scayt,stylescombo,tab,table,tabletools,tableselection,undo,lineutils,widgetselection,widget,filetools,notificationaggregator,uploadwidget,uploadimage,wsc,sourcedialog';
	config.plugins = 'dialogui,dialog,about,a11yhelp,basicstyles,blockquote,notification,button,toolbar,clipboard,panel,floatpanel,menu,contextmenu,resize,elementspath,enterkey,entities,popup,filebrowser,floatingspace,listblock,richcombo,format,htmlwriter,wysiwygarea,indent,indentlist,fakeobjects,list,magicline,maximize,pastetext,pastefromword,removeformat,showborders,sourcearea,menubutton,stylescombo,tab,table,tabletools,tableselection,undo,lineutils,widgetselection,widget,filetools,notificationaggregator,uploadwidget';
	config.skin = 'moono-lisa';
	// %REMOVE_END%

	// Define changes to default configuration here.
	// For complete reference see:
	// http://docs.ckeditor.com/#!/api/CKEDITOR.config

  config.toolbar = [
    { name: 'clipboard', items: [ 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo' ] },
    { name: 'tangerine', items: [ 'Tangy-checkbox', 'Tangy-checkboxes', 'Tangy-radio-buttons', 'Tangy-input', 'Tangy-location', 'Tangy-gps', 'Tangy-timed','Tangy-acasi'] },
    { name: 'tools', items: [ 'Maximize' ] },
    { name: 'document', items: [ 'Source' ] },
    '/',
    { name: 'basicstyles', items: [ 'Bold', 'Italic', 'Strike', '-', 'RemoveFormat' ] },
    { name: 'paragraph', items: [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-'] },
    { name: 'fancy', items: [ 'Table' ] },
    { name: 'styles', items: [ 'Styles', 'Format' ] },
    { name: 'about', items: [ 'About' ] }
  ];

	// Remove some buttons provided by the standard plugins, which are
	// not needed in the Standard(s) toolbar.
	config.removeButtons = 'Underline,Subscript,Superscript,sourcedialog';

	// Set the most common block elements.
	// config.format_tags = 'p;h1;h2;h3;pre';

	// Simplify the dialog windows.
	config.removeDialogTabs = 'image:advanced;link:advanced';

  config.allowedContent = true;

  // Show toolbar on startup (optional).
  config.startupFocus = true;

  config.extraPlugins = 'tangy-checkbox,tangy-checkboxes,tangy-radio-buttons,tangy-input,tangy-location,tangy-gps,tangy-timed,tangy-acasi'
  // config.extraPlugins = 'tangy-radio-buttons,tangy-checkboxes,tangy-input,tangy-location,tangy-timed,tangy-gps'

};
