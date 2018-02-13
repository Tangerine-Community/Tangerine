/**
 * @license Copyright (c) 2015, Total Web Services. All rights reserved.
 */


CKEDITOR.plugins.add('html5validation', {
	icons: false,
	lang: 'en,fr,es,ru,it',
	init: function(editor) {
		var lang = editor.lang.html5validation;
		editor.filter.allow( {
			textarea: {
				attributes: 'required,pattern',
				propertiesOnly: true
		   },
		   input: {
				attributes: 'required,pattern',
				propertiesOnly: true
			},
			select: { 
				attributes: 'required,pattern',
				propertiesOnly: true
			},
			form: {
				attributes: 'novalidate',
				propertiesOnly: true
			}
		}, 'formRequired' );
		
		CKEDITOR.on('dialogDefinition', function(ev) {
			var dialogName = ev.data.name;
			var dialogDefinition = ev.data.definition;
			
			if(dialogName == 'checkbox' ||  dialogName == 'textfield' || dialogName == 'radio') {
				dialogDefinition.addContents( {
					id: 'formValidationTab',
					label: lang.validationTabTitle,
					elements: [
						{
							id: 'required',
							type: 'checkbox',
							label: lang.requiredLabel,
							setup: function(element) {
								var value = element.hasAttribute('required') && element.getAttribute('required');
								this.setValue(value);
							},
							commit: function(data) {
								var element = data.element,
									value = this.getValue();
								if(value || value=='required') {
									element.setAttribute('required', value);
								} else {
									element.removeAttribute('required');
								}
							}
						},
						{
							id: 'pattern',
							type: 'text',
							label: lang.patternLabel,
							setup: function(element) {
								var value = element.hasAttribute('pattern') && element.getAttribute('pattern');
								this.setValue(value);
							},
							commit: function(data) {
								var element = data.element,
									value = this.getValue();	
								if(value) {
									element.setAttribute('pattern', value);
								} else {
									element.removeAttribute('pattern');
								}
							}
						},
						{
							type: 'html',
							html: lang.sampleTwitterUsername
						},
						{
							type: 'html',
							html: lang.samplePhonePattern
						},
						{
							type: 'html',
							html: lang.sampleZipCode
						},
						{
							type: 'html',
							html: lang.html5patternLink
						}		
					]
				});
			}
			else if(dialogName == 'textarea') {
				dialogDefinition.addContents( {
					id: 'formValidationTab',
					label: lang.validationTabTitle,
					elements: [
						{
							id: 'required',
							type: 'checkbox',
							label: lang.requiredLabel,
							setup: function(element) {
								var value = element.hasAttribute('required') && element.getAttribute('required');
								this.setValue(value);
							},
							commit: function(element) {
								var value = this.getValue();
								if(value) {
									element.setAttribute('required', value);
								} else {
									element.removeAttribute('required');
								}
							}
						},
						{
							id: 'pattern',
							type: 'text',
							label: lang.patternLabel,
							setup: function(element) {
								var value = element.hasAttribute('pattern') && element.getAttribute('pattern');
								this.setValue(value);
							},
							commit: function(element) {
								var value = this.getValue();	
								if(value) {
									element.setAttribute('pattern', value);
								} else {
									element.removeAttribute('pattern');
								}
							}
						},
						{
							type: 'html',
							html: lang.sampleTwitterUsername
						},
						{
							type: 'html',
							html: lang.samplePhonePattern
						},
						{
							type: 'html',
							html: lang.sampleZipCode
						},
						{
							type: 'html',
							html: lang.html5patternLink
						}
					]
				});
			} else if(dialogName == 'select') {
				dialogDefinition.addContents( {
					id: 'formValidationTab',
					label: lang.validationTabTitle,
					elements: [
						{
							id: 'required',
							type: 'checkbox',
							label: lang.requiredLabel,
							setup: function(name, element) {
								if(name == 'clear') {
									this.setValue('');
								} else if(name == 'select') {
									var value = element.hasAttribute('required') && element.getAttribute('required');
									this.setValue(value);
								}
								
							},
							commit: function(element) {
								var value = this.getValue();
								if(value) {
									element.setAttribute('required', value);
								} else {
									element.removeAttribute('required');
								}
							}
						},
						{
							id: 'pattern',
							type: 'text',
							label: lang.patternLabel,
							setup: function(name, element) {
							
								if(name == 'clear') {
									this.setValue('');
								} else if(name == 'select') {
									var value = element.hasAttribute('pattern') && element.getAttribute('pattern');
									this.setValue(value);
								}
							},
							commit: function(element) {
								var value = this.getValue();	
								if(value) {
									element.setAttribute('pattern', value);
								} else {
									element.removeAttribute('pattern');
								}
							}
						},
						{
							type: 'html',
							html: lang.sampleTwitterUsername
						},
						{
							type: 'html',
							html: lang.samplePhonePattern
						},
						{
							type: 'html',
							html: lang.sampleZipCode
						},
						{
							type: 'html',
							html: lang.html5patternLink
						}
					]
				});
			}
			else if(dialogName == 'form') {
				dialogDefinition.addContents( {
					id: 'formValidationTab',
					label: lang.validationTabTitle,
					elements: [
						{
							id: 'novalidate',
							type: 'checkbox',
							label: lang.novalidateLabel,
							setup: function(element) {
								var value = element.hasAttribute( 'novalidate' ) && element.getAttribute( 'novalidate' );
								this.setValue(value);
							},
							commit: function(element) {
								var value = this.getValue();
								console.log(value);
								if(value) {
									element.setAttribute('novalidate', value);
								} else {
									element.removeAttribute('novalidate');
								}
							}
						}
					]
				});
			}
		});
	}
});