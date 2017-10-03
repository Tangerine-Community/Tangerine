class AssessmentPrintView extends Backbone.View

  className: "AssessmentPrintView"
  
  initialize: (options) ->
    @abortAssessment = false
    @index = 0
    @model = options.model
    @format = options.format

    Tangerine.activity = "assessment print"
    @subtestViews = []
    @model.subtests.sort()
    @model.subtests.each ( subtest ) =>
      subtestView = new SubtestPrintView
        model  : subtest
        parent : @
        format : @format
      subtestView.on "rendered", ( view ) =>
        view?.afterRender?()
      @subtestViews.push subtestView
  
  render: ->
    if @model.subtests.length == 0
      @$el.append "<h1>Oops...</h1><p>This assessment is blank. Perhaps you meant to add some subtests.</p>"
    else
      @$el.addClass("format-#{@format}").append "
        <style>
          @page :right { @bottom-right-corner {
            content: counter(page) \" of \" counter(pages);
          }}
          table.print-metadata td{
            border: solid black 1px;
          }
          table.print-content.question-attributes{
            margin: 10px;
          }
          table.print-content.question-options{
            margin-bottom: 5px;
          }
          table.print-content{
            border: solid black 1px;
          }
          table.print-content td{
            border: solid black 1px;
          }
          .AssessmentPrintView #prototype_wrapper .print-page.content {
            height: auto;
          }
        </style>
        <div class='print-page #{@format}'>
          <h2>#{@model.get("name").titleize()}</h2>
          <h3>
            #{
              if @model.has "updated"
                "Last Updated: #{moment(@model.get "updated")}"
              else
                ""
            }
          </h3>
          <table class='marking-table'>
            <tr>
              <td style='vertical-align:middle'>Enumerator Name</td><td class='marking-area'></td>
            </tr>
          </table>
        </div>
        <hr/>
      "
      _.each @subtestViews , (subtestView) =>

        subtestView.render()
        @$el.append subtestView.el

    @trigger "rendered"

  afterRender: =>
    _.delay () ->
      $('#navigation').hide()
      $('#footer').hide()
     ,1000
