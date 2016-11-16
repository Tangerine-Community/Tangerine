class GpsEditView extends Backbone.View

  className : "GpsEditView"

  initialize: ( options ) ->
    @model = options.model
    @parent = options.parent

  render: -> # do nothing
    @$el.html '
      <div class="label_value"> 
        <label>Simple Display Mode</label><br> 
        <div class="menu_box"> 
          <div id="simple_display_mode_radio" class="buttonset ui-buttonset"> 
            <label for="simple_display_mode" class="ui-button ui-widget ui-state-default ui-button-text-only ui-corner-left" role="button" aria-disabled="false">
              <span class="ui-button-text">Yes</span>
            </label>
            <input name="simple_display_mode" type="radio" value="true" id="simple_display_mode_true" undefined="" class="ui-helper-hidden-accessible"> 
            <label for="simple_display_mode_true" class="ui-state-active ui-button ui-widget ui-state-default ui-button-text-only ui-corner-right" role="button" aria-disabled="false">
              <span class="ui-button-text">No</span>
            </label>
            <input name="simple_display_mode_false" type="radio" value="false" id="simple_display_mode_false" checked="" class="ui-helper-hidden-accessible"> 
          </div> 
        </div> 
      </div>
    '

  save: -> # do nothing
  
  isValid: -> true
