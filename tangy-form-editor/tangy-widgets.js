class TangyFormEditorWidgets {
  constructor() {
    this.widgets = []
  }
  define(widgetName, claimElement, widgetClass) {
    this.widgets.push({
      widgetName,
      claimElement,
      widgetClass
    })
  }
}

// Protect against this being declared more than once and thus possibly overriding some declared widgets.
if (!window.tangyFormEditorWidgets) {
  window.tangyFormEditorWidgets = new TangyFormEditorWidgets()
}