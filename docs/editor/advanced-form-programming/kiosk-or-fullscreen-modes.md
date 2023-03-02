# Kiosk or Fullscreen modes

## Kiosk

Kiosk mode is enabled app-wide by adding `"kioskMode": true` to the group's app-config.json file. This enables the 'Kiosk Mode' item in the menu. 
Clicking this item sets kioskModeEnabled to true and removes the top toolbar. 

The app-config.json property - `exitClicks` - enables admin to set number of clicks to exit kioskMode. Default is 5. User must click the top of the screen 5 times within 2 seconds.

## Fullscreen mode

Fullscreen mode is activated at the form level by setting `"fullscreen": true` in tangy-form editor. The current code employs a workaround to deal with a bug in APK's that prevents exit fullscreen from working 
by using a listener for 'enter-fullscreen' or 'exit-fullscreen' to set this.kioskModeEnabled = true or false, which removes the top bar.