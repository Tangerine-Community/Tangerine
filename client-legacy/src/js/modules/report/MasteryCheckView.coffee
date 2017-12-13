class MasteryCheckView extends Backbone.View

  className : "MasteryCheckView"

  events :
    "click .back" : "goBack"
    
  goBack: -> history.back()

  initialize: (options) ->

    @subtests = options.subtests
    @results  = options.results
    @student  = options.student
    @klass    = options.klass

    @resultsByPart = @results.indexBy "part"

    @lastPart = Math.max.apply(@, @results.pluck("part"))
    @lastPart = 0 if not isFinite(@lastPart)

  render: ->

    html = "
      <h1>Mastery check report</h1>
      <h2>Student #{@student.get("name")}</h2>
    "

    #
    # Empty warning
    #
    htmlWarning = "<p>No test data for this type of report. Return to the <a href='#class'>class menu</a> and click the <img src='images/icon_run.png'> icon to collect data.</p>"

    if @results.length == 0
      @$el.html "
        #{html}
        #{htmlWarning}
      "
      @trigger "rendered"
      return



    html += "<table>"
    for part in [1..@lastPart]

      if not @resultsByPart[part]? then continue
      html += "
        <tr><th>Assessment #{part}</th></tr>
        <tr>"

      for result in @resultsByPart[part]
        subtestName = @subtests.get(result.get('subtestId')).get('name')
        html += "
          <td>
            #{result.get("itemType").titleize()} correct<br>
            #{subtestName}
          </td>
          <td>#{result.get("correct")}/#{result.get("total")}</td>"
      
    html += "
    </table>
    <button class='navigation back'>#{t('back')}</button>
    "
    @$el.html html

    @trigger "rendered"
