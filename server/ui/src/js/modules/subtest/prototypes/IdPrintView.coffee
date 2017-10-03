class IdPrintView extends Backbone.View

  className: "id"
  
  initialize: (options) ->

  render: ->
    return if @format is "stimuli"
    if @format is "backup" or @format is "content"

      @$el.html "
          <table class='marking-table'>
            <tr>
              <td style='vertical-align:middle'>#{@model.get "name"}</td><td class='marking-area'></td>
            </tr>
          </table>
      "
    @trigger "rendered"

