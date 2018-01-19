# tangy-media-overlay

## Description

This custom element displays a maximize button that floats. When the user clicks this button an image in a lightbox is displayed.

The code for the image's path uses vars in the form (date, etc) to create the url.

Example - collect data using a radio button (select one of 3 cats), take the value, compute the url, and display the cat

Styling - keep it simple and functional, need to be able to zoom in on it. cover the screen with the image is fine.
Tap to close the window

Custom widget name: <tangy-media-overlay>
Properties
- on-open
- position (bottom left, bottom-right, top-left, top-right

## Using this element:

To display the "View Media Display" button at the top of the page, this tag should be the first one on your page.
Enter "top-left" or "top-right" as the position.

To display the "View Media Display" button at the bottom of the page, this tag should be the last one on your page.
Enter "bottom-left" or "bottom-right" as the position.


```
  <tangy-media-overlay on-open="getValue('fruit') + '/' + getValue('week')" position="top-right"></tangy-media-overlay>
```
