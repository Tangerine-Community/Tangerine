/**
 * Created by alexw on 4/13/2015.
 */
CKEDITOR.plugins.add('extraformattributes', {
  icons: false,
    lang: 'en,fr,es,it,ru',
    init: function(editor) {
        var lang = editor.lang.extraformattributes;
        editor.filter.allow ( {
            textarea: {
                attributes: 'class,id',
                propertiesOnly: true
            },
            input: {
                attributes: 'class,id',
                propertiesOnly: true
            },
            select: {
                attributes: 'class,id',
                propertiesOnly: true
            },
            form: {
                attributes: 'class',
                propertiesOnly: true
            },
            button: {
                attributes: 'class,id',
                propertiesOnly: true
            }
        }, 'formRequired');
        CKEDITOR.on('dialogDefinition', function(ev) {
            var dialogName = ev.data.name;
            var dialogDefinition = ev.data.definition;

            if(dialogName == 'checkbox' ||  dialogName == 'textfield' || dialogName == 'radio') {
                dialogDefinition.addContents( {
                    id: 'formExtraOptions',
                    label: lang.tabLabel,
                    elements: [
                        {
                            id: 'id',
                            type: 'text',
                            label: lang.idLabel,
                            setup: function(element) {
                                var value = element.hasAttribute('id') && element.getAttribute('id');
                                this.setValue(value);
                            },
                            commit: function(data) {
                                var element = data.element,
                                    value = this.getValue();
                                if(value || value=='id') {
                                    element.setAttribute('id', value);
                                } else {
                                    element.removeAttribute('id');
                                }
                            }
                        },
                        {
                            id: 'class',
                            type: 'text',
                            label: lang.classesLabel,
                            setup: function(element) {
                                var value = element.hasAttribute('class') && element.getAttribute('class');
                                this.setValue(value);
                            },
                            commit: function(data) {
                                var element = data.element,
                                    value = this.getValue();
                                if(value) {
                                    element.setAttribute('class', value);
                                } else {
                                    element.removeAttribute('class');
                                }
                            }
                        }
                    ]
                });

            }
            else if(dialogName == 'textarea') {
                dialogDefinition.addContents( {
                    id: 'formExtraOptions',
                    label: lang.tabLabel,
                    elements: [
                        {
                            id: 'id',
                            type: 'text',
                            label: lang.idLabel,
                            setup: function(element) {
                                var value = element.hasAttribute('id') && element.getAttribute('id');
                                this.setValue(value);
                            },
                            commit: function(element) {
                                var value = this.getValue();
                                if(value) {
                                    element.setAttribute('id', value);
                                } else {
                                    element.removeAttribute('id');
                                }
                            }
                        },
                        {
                            id: 'class',
                            type: 'text',
                            label: lang.classesLabel,
                            setup: function(element) {
                                var value = element.hasAttribute('class') && element.getAttribute('class');
                                this.setValue(value);
                            },
                            commit: function(element) {
                                var value = this.getValue();
                                if(value) {
                                    element.setAttribute('class', value);
                                } else {
                                    element.removeAttribute('class');
                                }
                            }
                        }
                    ]
                });
            }
            else if(dialogName == 'select') {
                dialogDefinition.addContents( {
                    id: 'formExtraOptions',
                    label: lang.tabLabel,
                    elements: [
                        {
                            id: 'id',
                            type: 'text',
                            label: lang.idLabel,
                            setup: function(name, element) {
                                if(name == 'clear') {
                                    this.setValue('');
                                } else if(name == 'select') {
                                    var value = element.hasAttribute('id') && element.getAttribute('id');
                                    this.setValue(value);
                                }

                            },
                            commit: function(element) {
                                var value = this.getValue();
                                if(value) {
                                    element.setAttribute('id', value);
                                } else {
                                    element.removeAttribute('id');
                                }
                            }
                        },
                        {
                            id: 'class',
                            type: 'text',
                            label: lang.classesLabel,
                            setup: function(name, element) {

                                if(name == 'clear') {
                                    this.setValue('');
                                } else if(name == 'select') {
                                    var value = element.hasAttribute('class') && element.getAttribute('class');
                                    this.setValue(value);
                                }
                            },
                            commit: function(element) {
                                var value = this.getValue();
                                if(value) {
                                    element.setAttribute('class', value);
                                } else {
                                    element.removeAttribute('class');
                                }
                            }
                        }
                    ]
                });
            }
            else if(dialogName == 'form') {
                dialogDefinition.addContents( {
                    id: 'formExtraOptions',
                    label: lang.tabLabel,
                    elements: [
                        {
                            id: 'class',
                            type: 'text',
                            label: lang.classesLabel,
                            setup: function(element) {
                                var value = element.hasAttribute( 'class' ) && element.getAttribute( 'class' );
                                this.setValue(value);
                            },
                            commit: function(element) {
                                var value = this.getValue();
                                console.log(value);
                                if(value) {
                                    element.setAttribute('class', value);
                                } else {
                                    element.removeAttribute('class');
                                }
                            }
                        }
                    ]
                });
            }
            else if(dialogName == 'button') {
                dialogDefinition.addContents( {
                    id: 'formExtraOptions',
                    label: lang.tabLabel,
                    elements: [
                        {
                            id: 'id',
                            type: 'text',
                            label: lang.idLabel,
                            setup: function(element) {
                                var value = element.hasAttribute( 'id' ) && element.getAttribute( 'id' );
                                this.setValue(value);
                            },
                            commit: function(element) {
                                var value = this.getValue();
                                console.log(value);
                                if(value) {
                                    element.setAttribute('id', value);
                                } else {
                                    element.removeAttribute('id');
                                }
                            }
                        },
                        {
                            id: 'class',
                            type: 'text',
                            label: lang.classesLabel,
                            setup: function(element) {
                                var value = element.hasAttribute( 'class' ) && element.getAttribute( 'class' );
                                this.setValue(value);
                            },
                            commit: function(element) {
                                var value = this.getValue();
                                console.log(value);
                                if(value) {
                                    element.setAttribute('class', value);
                                } else {
                                    element.removeAttribute('class');
                                }
                            }
                        }
                    ]
                });
            }
        });
    }

})
