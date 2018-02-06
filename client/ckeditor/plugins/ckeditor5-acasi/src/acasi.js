/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global console, window, document */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import imageIcon from '@ckeditor/ckeditor5-core/theme/icons/picker.svg';
import buildModelConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildmodelconverter';
import buildViewConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildviewconverter';
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';
import ViewContainerElement from '@ckeditor/ckeditor5-engine/src/view/containerelement';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import {toWidget} from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import IntroSrcDialog from './introsrcdialog';
import FormDialog from './formdialog';
import {toAcasiWidget, toFormWidget, isAcasiWidgetSelected} from './utils';

export default class Acasi extends Plugin {

  // This getter lets the PluginCollection know that CaptionedImage requires BaseImage.
  static get requires() {
    return [ Widget, IntroSrcDialog, FormDialog ];
    // return [ Widget, IntroSrcDialog ];
  }

  /**
   * @inheritDoc
   */
  static get pluginName() {
    return 'Acasi';
  }

  init() {
    const editor = this.editor;
    const doc = editor.document;
    const schema = doc.schema;
    const data = editor.data;
    const editing = editor.editing;
    const t = editor.t;
    const contextualToolbar = editor.plugins.get( 'ContextualToolbar' );

    // If `ContextualToolbar` plugin is loaded, it should be disabled for images
    // which have their own toolbar to avoid duplication.
    // https://github.com/ckeditor/ckeditor5-image/issues/110
    if ( contextualToolbar ) {
      this.listenTo( contextualToolbar, 'show', evt => {
        if ( isAcasiWidgetSelected( editor.editing.view.selection ) ) {
        evt.stop();
      }
    }, { priority: 'high' } );
    }

    // Configure schema.
    // Debugging schema problems is hard.
    // Sometimes it does not pass a schema check because the attribute is empty.
    // oOr if it is receiving an attribute it doesn't know about.
    // Also - Check ViewConverterBuilder.toElement() if it passes ( !conversionApi.schema.check(
    schema.allow( { name: '$inline', inside: '$root' } );
    schema.allow( { name: '$block', inside: '$root' } );

    // schema.registerItem( 'image' );
    // schema.objects.add( 'image' );

    schema.registerItem( 'figure' );
    // schema.allow( { name: '$inline', inside: 'figure' } );
    schema.allow( { name: 'figure', attributes: [ 'class' ], inside: 'figure' } );
    schema.allow( { name: 'image', attributes: [ 'src' ], inside: 'figure' } );
    schema.objects.add( 'figure' );

    // schema.registerItem( 'paper-radio-button' );
    // schema.allow( { name: 'paper-radio-button', attributes: [ 'name', 'value' ], inside: 'tangy-acasi' } );
    // schema.allow( { name: '$inline', inside: 'paper-radio-button' } );
    // schema.allow( { name: 'image', inside: 'paper-radio-button' } );
    schema.allow( { name: 'figure', attributes: [ 'class' ], inside: 'paper-radio-button' } );
    // schema.objects.add( 'paper-radio-button' );

    schema.registerItem( 'tangy-acasi' );
    schema.allow( { name: 'tangy-acasi', attributes: [ 'intro-src', 'name' ], inside: 'form' } );
    // schema.allow( { name: 'tangy-acasi', inside: '$root' } );
    schema.allow( { name: '$inline', inside: 'tangy-acasi' } );
    schema.allow( { name: 'image', inside: 'tangy-acasi' } );
    schema.allow( { name: 'figure', attributes: [ 'class' ], inside: 'tangy-acasi' } );
    // schema.allow( { name: 'paper-radio-button', inside: 'tangy-acasi' } );
    schema.objects.add( 'tangy-acasi' );

    schema.registerItem( 'form' );
    schema.allow( { name: 'form', inside: '$root' } );
    schema.allow( { name: 'form', attributes: [ 'id', 'on-change' ], inside: '$root' } );
    // schema.allow( { name: 'form', attributes: [ 'id' ], inside: '$root' } );
    schema.allow( { name: '$inline', inside: 'form' } );
    schema.allow( { name: 'image', inside: 'form' } );
    schema.allow( { name: 'figure', attributes: [ 'class' ], inside: 'form' } );
    schema.allow( { name: 'tangy-acasi', inside: 'form' } );
    schema.objects.add( 'form' );

    // Build converter from model element to view element is used to render the getData output for the widget when you create new Elements in the editor.
    buildModelConverter().for( data.modelToView )
      .fromElement( 'form' )
      .toElement( (element) => {
      console.log("data.modelToView form element: ")
    const id = element.item.getAttribute('id')
    const onchange = element.item.getAttribute('on-change')
    let container = new ViewContainerElement( 'form', {'id': id, 'on-change': onchange} );
    // let container = new ViewContainerElement( 'form', {'id': id} );
    return container
  })
    // Build converter from model element to view element is used to render the getData output for the widget when you create new Elements in the editor.
    buildModelConverter().for( data.modelToView )
      .fromElement( 'tangy-acasi' )
      .toElement( (element) => {
      console.log("data.modelToView tangy-acasi element: ")
    const introSrc = element.item.getAttribute('intro-src')
    const name = element.item.getAttribute('name')
    // const name = 'test'
    let container = new ViewContainerElement( 'tangy-acasi', {'intro-src': introSrc, 'name': name} );
    return container
  })
    buildModelConverter().for( data.modelToView )
      .fromElement( 'figure' )
      .toElement( 'figure' )
    // .toElement( (element) => {
    //   const klass = element.item.getAttribute('class')
    //   console.log("data.modelToView figure element: " + klass)
    //   let container = new ViewContainerElement( 'figure', {'class': klass} );
    //   return container
    // })
    // buildModelConverter().for( data.modelToView )
    //   .fromElement( 'paper-radio-button' )
    //   .toElement( (element) => {
    //     console.log("data.modelToView paper-radio-button element: ")
    //     const name = element.item.getAttribute('name')
    //     const value = element.item.getAttribute('value')
    //     let container = new ViewContainerElement( 'paper-radio-button', {'name': name, 'value': value} );
    //     return container
    //   })

    //  Build converter from model element to view element for editing view pipeline. This affects how this element is rendered in the editor.
    buildModelConverter().for( editing.modelToView )
      .fromElement( 'form' )
      .toElement( (element) => {
      console.log("modelToView form element")
    const formContainer = new ViewContainerElement( 'figure', { class: 'tangy-form' } );
    const formWdiget = toFormWidget( 'form', formContainer );
    formWdiget.setAttribute( 'contenteditable', true );
    return formWdiget;
  } );

    buildModelConverter().for( editing.modelToView )
      .fromElement( 'tangy-acasi' )
      .toElement( (element) => {
      console.log("modelToView tangy-acasi element")
    const widgetContainer = new ViewContainerElement( 'figure', { class: 'tangy-acasi' });
    const widget = toAcasiWidget( widgetContainer );
    widget.setAttribute( 'contenteditable', true );
    return widget;
  } );

    // buildModelConverter().for( editing.modelToView )
    //   .fromElement( 'paper-radio-button' )
    //   .toElement( (element) => {
    //     console.log("modelToView paper-radio-button element")
    //     // const imageContainer = new ViewContainerElement( 'radio', { class: 'paper-radio-button' }, toImageWidget(new ViewEmptyElement( 'img' )) );
    //     // const imageContainer = new ViewContainerElement( 'radio', { class: 'paper-radio-button' }, toImageWidget(new ViewElement( 'img' , {'src': 'assets/images/never.png'}) ) );
    //     const imageContainer = new ViewContainerElement( 'radio', { class: 'paper-radio-button' } );
    //     const widget = toWidget( imageContainer );
    //     widget.setAttribute( 'contenteditable', true );
    //     return widget;
    //   } );

    buildModelConverter().for( editing.modelToView )
      .fromElement( 'figure' )
      .toElement( (element) => {
      console.log("modelToView figure element")
    const klass = element.item.getAttribute('class')
    const container = new ViewContainerElement( 'figure', { class: klass } );
    // let container = new ViewContainerElement( 'figure', {'class': klass}, toImageWidget(new ViewEmptyElement( 'img' )) );
    // const widget = toWidget( container );
    // widget.setAttribute( 'contenteditable', true );
    return container;
  } );

    buildViewConverter().for(data.viewToModel).from({
      name: 'form',
      attribute: { id: /./ }
    })
      .toElement( (viewImage) => {
      return new ModelElement('form', {id: viewImage.getAttribute('id')})
    });

    buildViewConverter().for(data.viewToModel).from({
      name: 'tangy-acasi',
      attribute: { 'intro-src': /./ }
    }).toElement(viewImage => {
      return new ModelElement('tangy-acasi', {'intro-src': viewImage.getAttribute('intro-src'), 'name': viewImage.getAttribute('name')})
    });

    // buildViewConverter().for(data.viewToModel).from({
    //   name: 'paper-radio-button',
    //   attribute: { 'name': /./ }
    // }).toElement(viewImage => new ModelElement('paper-radio-button', { 'name': viewImage.getAttribute('name') }));

    buildViewConverter().for(data.viewToModel).from({
      name: 'figure',
      attribute: { 'class': /./ }
    }).toElement(viewImage => new ModelElement('figure', { 'class': viewImage.getAttribute('class') }));

    // Build converter for on-change attribute.
    // Note that by default attribute converters are added with `low` priority.
    // This converter will be thus fired after `convertHoistableImage` converter.
    buildViewConverter().for( data.viewToModel )
      .from( { name: 'form', attribute: { 'on-change': /./ } } )
      .consuming( { attribute: [ 'on-change' ] } )
      .toAttribute( viewForm => ( { key: 'on-change', value: viewForm.getAttribute( 'on-change' ) } ) );

    // buildViewConverter().for( data.viewToModel )
    //   .from( { name: 'paper-radio-button', attribute: { value: /./ } } )
    //   .consuming( { attribute: [ 'value' ] } )
    //   .toAttribute( (viewForm) => {
    //     console.log("converting prb.")
    //     return { key: 'value', value: viewForm.getAttribute( 'value' ) }
    //   } );

    // Add tangy-acasi button to feature components.
    editor.ui.componentFactory.add( 'acasi', locale => {
      const view = new ButtonView(locale);
    view.set({
      label: 'Acasi',
      icon: imageIcon,
      tooltip: true
    });
    // view.bind('isOn', 'isEnabled').to(command, 'value', 'isEnabled');

    // When the acasi button is pressed, display the widget in the editor.
    view.on( 'execute', () => {
      // this.listenTo( view, 'execute', () => {
      let url = prompt( 'Sound URL' );
    if (url == "") {
      url = '../assets/sounds/1.mp3'
    }

    let urlArray = url.split('/')
    let filename = urlArray.slice(-1)[0]
    let filenameArray = filename.split('.')
    let fileIdentifier = filenameArray[0]
    let name = 't_' + fileIdentifier;
    let taName = 'ta_' + fileIdentifier;
    let formName = 'form_' + fileIdentifier;

    console.log("taName: " + taName)

    editor.document.enqueueChanges( () => {
      const imageElement1 = new ModelElement( 'image', { src: '../assets/images/never.png'});
    const imageElement2 = new ModelElement( 'image', { src: '../assets/images/once.png'});
    const imageElement3 = new ModelElement( 'image', { src: '../assets/images/few.png'});
    const imageElement4 = new ModelElement( 'image', { src: '../assets/images/many.png'});

    // const prb1 = new ModelElement( 'paper-radio-button', {'name':name, 'value': 'never'}, [imageElement1])
    // const prb2 = new ModelElement( 'paper-radio-button', {'name':name, 'value': 'once'}, [imageElement2])
    // const prb3 = new ModelElement( 'paper-radio-button', {'name':name, 'value': 'few'}, [imageElement3])
    // const prb4 = new ModelElement( 'paper-radio-button', {'name':name, 'value': 'many'}, [imageElement4])

    // const acasi = new ModelElement( 'tangy-acasi', {'intro-src':url, 'name': taName}, [prb1, prb2, prb3, prb4])
    const acasi = new ModelElement( 'tangy-acasi', {'intro-src':url, 'name': taName}, [imageElement1, imageElement2, imageElement3, imageElement4])
    const form = new ModelElement( 'form', {'id': formName, 'on-change': ''}, [acasi])

    editor.data.insertContent( form, editor.document.selection );
  } );
  });
    return view;
  });
  }

}