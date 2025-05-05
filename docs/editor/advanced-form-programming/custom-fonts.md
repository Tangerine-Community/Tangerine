# Adding custom fonts to your forms

You may be in a situation where you want to add a custom fonts to your form to make things easier for the assessor or to cater for situation when the source form is not in UTF format. There are two ways you can use custom fonts in Tangerine

- Apply custom fonts in `custom-styles.css` file in your group's client folder (if you have access to the file system)
- Apply custom scripts in your form’s on-open event to load the font and use them in Advanced tab on the question input edit screen

!!! note
    Tangerine renders automatically all UTF-8 font. If you are using a non UTF compatible font you may need to apply a custom font solution or convert your source document from non UTF font to a UTF font. 

## Add custom font to some form inputs 

Most of the time you will not have access to the custom-styles.css file and you have to apply a different solution. Here we use custom fonts in 3 steps. 

- Upload the font file to you Media Library folder in group
- Add the code in the form's on-open event to load the custom font in that form
- Add custom style in your input to instruct Tangerine to style this input using the font

Open the Media Library and upload your font file. In this example we use a file `nuer.woff`. The extension of the file may differ depending on your source.

You need to customize those lines of code and add them to the on-open of the form:

```
var newStyle = document.createElement('style');
newStyle.appendChild(document.createTextNode(
`@font-face {font-family: nuer; src: url('assets/media/nuer.woff) format('woff');}`));
document.head.appendChild(newStyle);
```

In the above we map the **nuer** font to the file the file `nuer.woff` already uploaded in the media library. Then we also indicate the format `format('woff')` - you can update this to fit your font file format.

Now open your form and expand the Advanced settings->on-open 

<img src="../../assets/customFont1.png" width="570">

Now in your form you'd have to add custom style for each input. There are two main code snippets that you can use. One is for an HTML containers and grids and the other for inputs/radio buttons/checkboxes.

- HTML Containers/Grids use:

`font-family: 'nuer' !important;` - update the nuer to the value you used for mapping in the first line of the script in the on-change event.

- Inputs/Radio-buttons/Checkboxes
  
`--paper-font-common-base_-_font-family: 'nuer' !important;` - again here update the nuer to the correct value

Now add the corresponding code to your input's Advanced->CSS Style on the interface.

<img src="../../assets/customFont2.png" width="570">


## Add custom font using custom-styles.css file

under your data/groups/group-GROUP_ID/client folder you will see that there is a file `custom-styles.css` custom styles can be added to this file and those will be loaded automatically in your all forms in that group. We use this to customize the interface in the Self-Administered EGRA/EGMA tools 

For a full file go to [Custom-styles.css](https://github.com/ICTatRTI/SE-tools/blob/main/client/custom-styles.css)

All interface customizations in this file are loaded automatically and apply to all forms in the group. From here you can control not only the form’s font but also the buttons style, background, and other adjustments. 

```
@font-face {
  font-family: Andika;
  src: url('./media/Andika-Regular.ttf');
}

tangy-form-item {
  --paper-font-common-base_-_font-family: Andika;
  --tangy-form-item--background-color: transparent;
  /* all nav buttons */
  --fullscreen-nav--color: transparent;
  --fullscreen-nav--background-color: #ffbf09 !important;
  --fullscreen-nav--background-size: cover;
  --fullscreen-nav--height: 6.5rem;
  --fullscreen-nav--width: 6.5rem;
  --fullscreen-nav--border-radius: 0.5rem;
  --fullscreen-nav--padding: 0.1rem 0.75rem;
  --fullscreen-nav--border: #ffbf09 solid 0.125rem;
  /* back button  
  --fullscreen-nav-align-bottom--back--display: none; */
 --fullscreen-nav-align-bottom--back---back-transform: scaleX(-1); 
  --fullscreen-nav-align-bottom--back--background-image: url('./assets/images/back.png');
  --fullscreen-nav-align-bottom--back--bottom: 20px;
  --fullscreen-nav-align-bottom--back--right: 10px;
  /* next button */
  --fullscreen-nav-align-bottom--next--background-image: url('./assets/images/next.svg');
  --fullscreen-nav-align-bottom--next--bottom: 20px;
  --fullscreen-nav-align-bottom--next--right: 10px;
  /* complete buton */
  --fullscreen-nav-align-bottom--complete--background-image: url('./assets/images/next.svg');
  --fullscreen-nav-align-bottom--complete--bottom: 20px;
  --fullscreen-nav-align-bottom--complete--right: 10px;
}

tangy-keyboard-input {
  --bottom-spacer-height: 130px;
}
```

