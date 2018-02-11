CKEDITOR.dialog.add( 'labelDialog', function( editor ) {
    return {
        title: 'label Properties',
        minWidth: 400,
        minHeight: 200,

        contents: [
            {
                id: 'tab-basic',
                label: 'Basic Settings',
                elements: [
                    {
                        type: 'text',
                        id: 'label',
                        label: 'Label Text',
                        validate: CKEDITOR.dialog.validate.notEmpty( "Label Text field cannot be empty." ),

                        setup: function( element ) {
                            this.setValue( element.getText() );
                        },

                        commit: function( element ) {
                            element.setText( this.getValue() );
                        }
                    },
                    {
                        type: 'text',
                        id: 'for',
                        label: 'For (Form field name)',
                        validate: CKEDITOR.dialog.validate.notEmpty( "For field cannot be empty." ),

                        setup: function( element ) {
                            this.setValue( element.getAttribute( "for" ) );
                        },

                        commit: function( element ) {
                            element.setAttribute( "for", this.getValue() );
                        }
                    }
                ]
            },

            {
                id: 'tab-adv',
                label: 'Advanced Settings',
                elements: [
                    {
                        type: 'text',
                        id: 'class',
                        label: 'CSS Classes',

                        setup: function( element ) {
                            this.setValue( element.getAttribute( "class" ) );
                        },

                        commit: function ( element ) {
                            var clss = this.getValue();
                            if ( clss )
                                element.setAttribute( 'class', clss );
                            else if ( !this.insertMode )
                                element.removeAttribute( 'class' );
                        }
                    },
{
                        type: 'text',
                        id: 'style',
                        label: 'CSS Styles',

                        setup: function( element ) {
                            this.setValue( element.getAttribute( "style" ) );
                        },

                        commit: function ( element ) {
                            var styl = this.getValue();
                            if ( styl )
                                element.setAttribute( 'style', styl );
                            else if ( !this.insertMode )
                                element.removeAttribute( 'style' );
                        }
                    }
                ]
            }
        ],

        onShow: function() {
            var selection = editor.getSelection();
            var element = selection.getStartElement();

            if ( element )
                element = element.getAscendant( 'label', true );

            if ( !element || element.getName() != 'label' ) {
                element = editor.document.createElement( 'label' );
                this.insertMode = true;
            }
            else
                this.insertMode = false;

            this.element = element;
            if ( !this.insertMode )
                this.setupContent( this.element );
        },

        onOk: function() {
            var dialog = this;
            var label = this.element;
            this.commitContent( label );

            if ( this.insertMode )
                editor.insertElement( label );
        }
    };
});
