class QuestionPrintView extends Backbone.View

#  className: "question buttonset"

  initialize: (options) ->
    @model = options.model

    @answer   = {}
    @name     = @model.escape("name").replace /[^A-Za-z0-9_]/g, "-"
    @type     = @model.get "type"
    @options  = @model.get "options"
    @notAsked = options.notAsked
    @isObservation = options.isObservation
    @parent = options.parent


    if @model.get("skippable") == "true" || @model.get("skippable") == true
      @isValid = true
      @skipped = true
    else
      @isValid = false
      @skipped = false
    
    if @notAsked == true
      @isValid = true
      @updateResult()
    
  update: (event) ->
    @updateResult()
    @updateValidity()
    @trigger "answer", event, @model.get("order")

  render: ->

    @$el.attr "id", "question-#{@name}"

    unless @notAsked

      if @parent.format is "stimuli"
        @$el.html "
          <div class='stimuli-question'>#{@model.get 'prompt'}</div>
        "

      else if @parent.format is "backup"
        @$el.html "
          <div class='backup-question'>
            <p>
              #{@model.get 'prompt'}
              #{ if @model.get('hint') isnt "" then "(#{@model.get 'hint'})" else ""}
            </p>
            #{
              if @model.get('type') is "open"
                "<table>
                  <tr>
                    <td class='print-question-label'></td> 
                    <td>
                      <div class='free-text'></div>
                    </td>
                  </tr>
                </table>"
              else
                _.map(@model.get('options'), (option) =>
                  "
                    <div class='backup-question-checkbox-label'>
                      <span class='checkbox'>&nbsp;</span>
                      <span class='print-question-label'><span class='print-question-option'>#{option.label}<span></span> 
                    </div>
                  "
                ).join("")
            }
            </table>
          </div>
        "

      else if @parent.format is "metadata"
        @$el.html "
          <tr>
            #{
              _("name, prompt, type, hint".split(/, */)).map( (attribute) =>
                "
                  <td>#{@model.get attribute}</td>
                "
              ).join("")
            }
              <td>
                #{
                  _.map(@model.get('options'), (option) ->
                    "#{option.value} \"#{option.label}\" "
                  ).join("")
                }
              </td>
          </tr>
        "


      else if @parent.format is "content"

        @$el.html "
          <table class='print-content question-attributes'>
            #{
              _("prompt, name, hint, type, skipLogic, skippable, customValidationCode, customValidationMessage".split(/, */)).map( (attribute) =>
                "
                  <tr>
                    <td class='question-attribute'>#{attribute.underscore().titleize()}</td>
                    <td>#{@model.get attribute}</td>
                  </tr>
                "
              ).join("")
            }
            <tr>
              <td class='question-attribute'>Action on Display</td>
              <td><pre style='font-size:80%'>#{@model.get("displayCode") || ""}</pre></td>
            </tr>
            <tr>
              <td>Options</td>
              <td>
                <!-- Hail Flying Spaghetti Monster, Please forgive me for my nested table -->
                <table class='print-content question-options'>
                  <tbody>
                    <tr>
                      <td>Label</td>
                      <td>Value</td>
                    </tr>
                    #{
                      _.map(@model.get('options'), (option) ->
                        "
                          <tr>
                            <td>#{option.label}</td>
                            <td>#{option.value}</td>
                          </tr>
                        "
                      ).join("")
                    }
                  </tbody>
                </table>
              </td>
            </tr>
          </table>
        "

    else
      @$el.hide()


    @trigger "rendered"
  
