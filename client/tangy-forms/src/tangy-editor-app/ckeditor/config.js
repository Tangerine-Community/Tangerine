/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
  /*
  var dtd = CKEDITOR.dtd,
            tagName;
			dtd['tangy-section'] = { '#': 1 };
			// Register oembed element as allowed child, in each tag that can contain a div.
			for ( tagName in dtd ) {
					if ( dtd[ tagName ].div ) {
							dtd[ tagName ]['tangy-section'] = 1;
					}
			}


			dtd['tangy-hide-if'] = { '#': 1 };
			// Register oembed element as allowed child, in each tag that can contain a div.
			for ( tagName in dtd ) {
					if ( dtd[ tagName ].div ) {
							dtd[ tagName ]['tangy-hide-if'] = 1;
					}
			}
  */
  config.allowedContent = true
	// %REMOVE_START%
	// The configuration options below are needed when running CKEditor from source files.
	config.plugins = 'dialogui,dialog,about,a11yhelp,dialogadvtab,basicstyles,bidi,blockquote,button,toolbar,notification,clipboard,panelbutton,panel,floatpanel,colorbutton,colordialog,templates,menu,contextmenu,copyformatting,div,resize,elementspath,enterkey,entities,popup,filebrowser,find,fakeobjects,flash,floatingspace,listblock,richcombo,font,forms,format,horizontalrule,htmlwriter,iframe,wysiwygarea,image,indent,indentblock,indentlist,smiley,justify,menubutton,language,link,list,liststyle,magicline,maximize,newpage,pagebreak,pastetext,pastefromword,preview,print,removeformat,save,selectall,showblocks,showborders,sourcearea,specialchar,scayt,stylescombo,tab,table,tabletools,tableselection,undo,wsc,lineutils,widgetselection,widget,extraformattributes,label';
	config.skin = 'moono-lisa';
	// %REMOVE_END%

	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';

  config.extraPlugins = 'tangy-radio-buttons,tangy-checkboxes,tangy-input,tangy-location,tangy-timed,tangy-checkbox,tangy-gps'
};
