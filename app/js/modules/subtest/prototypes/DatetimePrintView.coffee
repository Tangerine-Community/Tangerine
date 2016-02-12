class DatetimePrintView extends Backbone.View

  className: "datetime"

  initialize: (options) ->
    @model  = @options.model
    @parent = @options.parent
  
  render: ->
    return if @format is "stimuli"

    if @format is "backup"

      @$el.html "
          <table class='marking-table'>
            #{
            _("Date,Time".split(/,/)).map( (locationLevel) ->
              "
                <tr>
                  <td style='vertical-align:middle'>#{locationLevel}</td><td class='marking-area'></td>
                </tr>
              "
            ).join("")
            }
          </table>
      "

    if @format is "content"
      @$el.html "DateTime"

    @trigger "rendered"
