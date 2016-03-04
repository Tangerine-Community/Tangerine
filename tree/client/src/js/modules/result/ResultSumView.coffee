class ResultSumView extends Backbone.View

  className : "info_box"

  events:
    'click .details' : 'toggleDetails'

  toggleDetails: ->
    @$el.find('.detail_box').toggle(250)


  i18n: ->
    @text =
      resume    : t("ResultSumView.button.resume")
      noResults : t("ResultSumView.message.no_results")

  initialize: ( options ) ->

    @i18n()

    @result = options.model
    @finishCheck = options.finishCheck
    @finished = if _.last(@result.attributes.subtestData)?.data.end_time? then true else false

    @studentId = ""
    for subtest in @result.attributes.subtestData
      prototype = subtest.prototype
      if prototype == "id"
        @studentId = subtest.data.participant_id
        break

  render: ->
    html = "<div class='detail_box'>"
    html += "<div><a href='#resume/#{@result.get('assessmentId')}/#{@result.id}'><button class='command'>#{@text.resume}</button></a></div>" unless @finished || !@finishCheck
    html += "<table>"
    for datum, i in @result.get("subtestData")
      sum = datum.data.items?.length or Object.keys(datum.data).length
      itemPlural = if sum > 1 then "s" else ""
      html += "<tr><td>#{datum.name}</td><td>#{sum} item#{itemPlural}</td></tr>"
    html += "
      </div>
    "

    @$el.html html

    @trigger "rendered"

