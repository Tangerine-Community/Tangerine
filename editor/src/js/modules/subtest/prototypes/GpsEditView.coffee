class GpsEditView extends Backbone.View

  className : "GpsEditView"

  initialize: ( options ) ->
    @model = options.model
    @parent = options.parent

  render: -> # do nothing
    simpleMode = @model.get('simpleMode')
    @$el.html "
      <div class='label_value'>
        <label>Simple Mode</label><br>
        <div class='menu_box'>
          <div id='simple_mode_radio' class='buttonset'>
            <label for='simple_mode_true'>Yes</label><input name='simple_mode' type='radio' value='true' id='simple_mode_true' #{'checked' if simpleMode}>
            <label for='simple_mode_false'>No</label><input name='simple_mode' type='radio' value='false' id='simple_mode_false' #{'checked' if not simpleMode}>
          </div>
        </div>
      </div>
    "

  save: ->
    # simple_mode_true will always be the state of simpleMode.
    simpleModeState = $(this.$el.find('#simple_mode_true')[0]).is(':checked')
    @model.set('simpleMode', simpleModeState)
  
  isValid: -> true
