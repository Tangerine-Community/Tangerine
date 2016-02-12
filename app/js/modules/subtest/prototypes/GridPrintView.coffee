class GridPrintView extends Backbone.View

  className: "grid_prototype"

  initialize: (options) ->
    @model         = @options.model
    @parent        = @options.parent

  render: ->
    switch @format
      when "content" then @renderContent()
      when "stimuli" then @renderStimuli()
      when "backup"  then @renderBackup()
    @parent.trigger "rendered", @

  
  renderStimuli: ->
    @$el.html "
      <div id='#{@model.get "_id"}' class='print-page stimulus-grid'>
        <table>
          <tr>
            #{
              index = 0
              _.map(@model.get("items"), (item) =>
                index += 1
                itemText = "<td class='item'>#{item}</td>"
                if index % @model.get("columns") is 0 and index isnt @model.get("items").length then itemText += "</tr><tr>" else ""
                itemText
              ).join("")
            }
          </tr>
        </table>
      </div>
    "

    _.delay =>
      overflow = 100
      incrementAmount = 3
      console.log "TARGET: " + $("##{@model.get "_id"}")[0].scrollHeight
      while $("##{@model.get "_id"}")[0].scrollWidth > $("##{@model.get "_id"} table").innerWidth() and  $("##{@model.get "_id"}")[0].scrollHeight > $("##{@model.get "_id"} table").innerHeight()
        console.log $("##{@model.get "_id"} table").innerHeight()
        break if (overflow-=1) is 0

        currentSize = $("##{@model.get "_id"} td").css("font-size")
        # Increase by incrementAmount
        $("##{@model.get "_id"} td").css("font-size", "#{parseInt(currentSize)+incrementAmount}px")
      currentSize = $("##{@model.get "_id"} td").css("font-size")
      $("##{@model.get "_id"} td").css("font-size", "#{parseInt(currentSize)-2*(incrementAmount)}px")
    ,1000

  renderContent: ->
    fields = "autostop
    captureAfterSeconds
    captureItemAtTime
    columns
    endOfLine
    fontSize
    layoutMode
    order
    randomize
    timer
    variableName"

    fields = fields.split(/\ +/)

    @$el.html "
      Properties:<br/>
      <table>
      #{
        _.map(fields, (field) =>
          "<tr><td>#{field}</td><td>#{@model.get field}</td></tr>"
        ).join("")
      }
      </table>
      Items:<br/>
      #{
        _.map(@model.get("items"), (item) ->
          item
        ).join(", ")
      }
    "
    
  renderBackup: ->

    @$el.html "
        <table class='print-grid'>
          <tr>
            #{
              index = 0
              _.map(@model.get("items"), (item) =>
                index += 1
                itemText = "<td class='item'>#{item}</td>"

                console.log @model.get("columns")
                if index % @model.get("columns") is 0 and index isnt @model.get("items").length then itemText += "</tr><tr>" else ""
                itemText
              ).join("")
            }
          </tr>
        </table>

        <table class='marking-table'>
          <tr>
            #{
              if @model.get("timer") isnt ""
                "
                  <td style='vertical-align:middle'>Time Remaining</td><td class='marking-area'></td>
                "
              else
                "
                "
            }
          </tr>
          <tr>
            #{
              if @model.get("autostop")
                "
                  <td style='vertical-align:middle'>Autostop?</td><td><span class='checkbox'></span></td>
                "
              else
                "
                "
            }
          </tr>
        </table>
      </div>
    "
    
