CKEDITOR.plugins.add( 'label', {
    icons: 'label',
    init: function( editor ) {

        editor.addCommand( 'label', new CKEDITOR.dialogCommand( 'labelDialog', {
    allowedContent: 'label'
} ) );

        editor.ui.addButton( 'Label', {
            label: 'Insert label Field',
icon: this.path + 'icons/label.png',
            command: 'label',
            toolbar: 'form'
        });

        if ( editor.contextMenu ) {
            editor.addMenuGroup( 'labelGroup' );
            editor.addMenuItem( 'labelItem', {
                label: 'Edit label',
                icon: this.path + 'icons/label.png',
                command: 'label',
                group: 'labelGroup'
            });

            editor.contextMenu.addListener( function( element ) {
                if ( element.getAscendant( 'label', true ) ) {
                    return { labelItem: CKEDITOR.TRISTATE_OFF };
                }
            });
        }

        CKEDITOR.dialog.add( 'labelDialog', this.path + 'dialogs/label.js' );
    }
});
