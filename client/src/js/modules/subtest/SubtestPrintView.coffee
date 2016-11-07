class SubtestPrintView extends Backbone.View

  className : "SubtestPrintView"

  initialize: (options) ->
    @protoViews  = Tangerine.config.prototypeViews
    @model       = options.model
    @parent      = options.parent
    @format      = options.format

    @prototypeRendered = false

  render: ->
      
    enumeratorHelp = if (@model.get("enumeratorHelp") || "") != "" then "<div class='enumerator_help_print'>#{@model.get 'enumeratorHelp'}</div>" else ""
    studentDialog  = if (@model.get("studentDialog")  || "") != "" then "<div class='student_dialog_print'>#{@model.get 'studentDialog'}</div>" else ""
    skipButton = "<button class='skip navigation'>Skip</button>"
    skippable = @model.getBoolean("skippable")

    if @format is "content"

      @$el.html "
        <h2>#{@model.get 'name'}</h2>
        #{
          displayCode = @model.get 'displayCode'
          if displayCode? and displayCode isnt ""
            "Subtest Action on Display:<pre style='font-size:80%'>#{displayCode}</pre>"
          else
            ""
        }
        Enumerator Help:<br/>
        #{enumeratorHelp}
        Student Dialog:<br/>
        #{studentDialog}
        <div class='format-#{@format}' id='prototype_wrapper'></div>
        <hr/>
      "

    else if @format is "backup"
      @$el.html "
        <div class='subtest-title'>#{@model.get "name"}</div>
        <div class='student-dialog'>#{studentDialog}</div>
        <div class='format-#{@format}' id='prototype_wrapper'></div>
        <hr/>
      "

    else
      @$el.append "
        <div class='format-#{@format}' id='prototype_wrapper'></div>
      "
  
    # Use prototype specific views here
    console.log @model.get('prototype').humanize() + 'PrintView'

    @prototypeView = new window[@model.get('prototype').humanize() + 'PrintView']
      model: @model
      parent: @
    @prototypeView.on "rendered",    => @trigger "rendered"
    @prototypeView.on "subRendered", => @trigger "subRendered"
    @prototypeView.setElement(@$el.find('#prototype_wrapper'))
    @prototypeView.format = @format
    @prototypeView.render()
    @prototypeRendered = true

    @trigger "rendered"
