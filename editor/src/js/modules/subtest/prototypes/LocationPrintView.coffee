class LocationPrintView extends Backbone.View

  className: "LocationPrintView"

  initialize: (options) ->
    
    @model  = @options.model
    @parent = @options.parent
    
    @levels = @model.get("levels")       || []
    @locations = @model.get("locations") || []

    if @levels.length == 1 && @levels[0] == ""
      @levels = []
    if @locations.length == 1 && @locations[0] == ""
      @locations = []



  render: ->
    return if @format is "stimuli"

    if @format is "content"

      @$el.html "
        School Locations<br/>
        Levels: #{@levels}<br/>
        Available Locations:<br/>
        #{@locations.join("<br/>")}<br/>
      "

    if @format is "backup"

      @$el.html "
          <table class='marking-table'>
            #{
            _(@levels).map( (locationLevel) ->
              "
                <tr>
                  <td style='vertical-align:middle'>#{locationLevel}</td><td class='marking-area'></td>
                </tr>
              "
            ).join("")
            }
          </table>
      "

    @trigger "rendered"

