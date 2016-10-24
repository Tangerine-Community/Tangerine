class LocationElement extends Backbone.Form.editors.Base

  # tagName: 'input',

  events:
    change: () ->
      # The 'change' event should be triggered whenever something happens
      # that affects the result of `this.getValue()`.
      this.trigger('change', this)
    focus: () ->
      # The 'focus' event should be triggered whenever an input within
      # this editor becomes the `document.activeElement`.
      this.trigger('focus', this)
      # This call automatically sets `this.hasFocus` to `true`.
    blur: () ->
      # The 'blur' event should be triggered whenever an input within
      # this editor stops being the `document.activeElement`.
      this.trigger('blur', this)
      # This call automatically sets `this.hasFocus` to `false`.

  initialize: (options) ->
    # Call parent constructor
    Backbone.Form.editors.Base.prototype.initialize.call(this, options)

    # Custom setup code.
    # if (this.schema.customParam)
    #  this.doSomething()

  render: () ->
    #window.LocationElementInstance = @
    # TODO: Set values if there is data so this field can be edited.
    #this.setValue(this.value)
    @locView = new LocView
      levels: @schema.levels
    @locView.render()
    @$el.html(@locView.el)
    # this.setValue('foo')

    return this

  getValue: () ->
    return this.locView.value()

  setValue: (value) ->
    this.$el.val(value)

  focus: () ->
    if (this.hasFocus) then return

    # This method call should result in an input within this edior
    # becoming the `document.activeElement`.
    # This, in turn, should result in this editor's `focus` event
    # being triggered, setting `this.hasFocus` to `true`.
    # See above for more detail.
    this.$el.focus()

  blur: () ->
    if (!this.hasFocus) then return

    this.$el.blur()
