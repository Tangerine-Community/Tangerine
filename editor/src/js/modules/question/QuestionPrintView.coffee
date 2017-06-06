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

  htmlGridPreview: ->
#
# Generate preview
#
    previewGridHtml = ""

    assetMap = @model.getObject('assetMap')
    @subtest = @parent.model
    assets = @subtest.getArray('assets')

    @model.layout().rows.forEach (row, i) ->

      rowHtml = ''

      row.columns.forEach (cell, i) ->
        asset = assets[cell.content] || {}

        if cell.content != null
          imgHtml = "<img class='preview-thumb' src='data:#{asset.type};base64,#{asset.imgData}'>"
        else
          imgHtml = "<br>No image<img src='' class='preview-thumb'>"

        if cell.align != null
          textAlign = "text-align: #{Question.AV_ALIGNMENT[cell.align]}"
        else
          textAlign = ''

        rowHtml += "<div style='margin:0; position:relative; z-index: 999; display: inline-block; box-sizing: border-box; border:solid red 1px; height:#{480*(row.height/100)}px;width:#{640*(cell.width/100)}px; overflow:hidden; #{textAlign}'> <span class='dimension-overylay width-overlay'>Width #{cell.width}% <br> #{asset.name || ''}<br>#{assetMap[cell.content]||''}</span> #{imgHtml}</div>"
      previewGridHtml += "<div style='border: 1px green solid; display:block; overflow:hidden; height:#{480*(row.height/100)}px'><span class='dimension-overylay' style='z-index:9999;'>Row Height #{row.height}%</span>#{rowHtml}</div>"
    return previewGridHtml

  updateGridPreview: ->

    @$el.find("#grid-preview").html @htmlGridPreview()
    @resizeAvImages()
#@$el.find('img.preview-thumb').each ->
#  $(@).on 'load', ->
#    ratio  = $(@).width() / $(@).height()
#    pratio = $(@).parent.width() / $(@).parent().height()
#
#        css = width:'100%', height:'auto'
#        css = width:'auto', height:'100%' if (ratio < pratio)
#        $(@).css(css)

  resizeAvImages: ->
    self = @
    @$el.find('img.preview-thumb').each ->
      self.resizeImage(@)

  resizeImage: (img) ->
    if $(img).width() == 0
      return setTimeout( (=> @resizeImage(img)) , 5)
    ratio  = $(img).width() / $(img).height()
    pratio = $(img).parent().width() / $(img).parent().height()
    css = width:'100%', height:'auto'
    css = width:'auto', height:'100%' if (ratio < pratio)
    $(img).css(css)

  render: =>

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
              ["name", "prompt", "type", "hint", "linkedGridScore"].map( (attribute) =>
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
          <h3>Question Layout</h3>
          <section id='grid-preview' style='height:480px;width:900px;'></section>
        "
        if @type is 'av'
          @updateGridPreview()

    else
      @$el.hide()


    @trigger "rendered"
  
