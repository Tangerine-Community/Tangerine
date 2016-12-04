AvEditView = Backbone.View.extend

  className: 'av-edit-view'

  events:
    'change #auto-progress'           : 'updateAutoProgress'
    'change #auto-progress-immediate' : 'updateAutoProgressImmediate'
    'change #keep-controls'           : 'updateKeepControls'
    'change #correctable'             : 'updateCorrectable'

    'change #transition-comment' : 'updateTransitionComment'
    'change #transition-delay'   : 'updateTransitionDelay'

    'change #time-limit'         : 'updateTimeLimit'
    'change #warning-time'       : 'updateWarningTime'
    'change #warning-message'    : 'updateWarningMessage'
    'change #highlight-previous' : 'updateHighlightPrevious'

    'change .asset-value'     : 'changeAssetMapValue'
    'click .remove-asset'     : 'removeAsset'

    'change #display-sound'        : 'uploadDisplaySound'
    'click #remove-display-sound' : 'removeDisplaySound'

    'click button.layout-add-row'       : 'addRow'
    'click button.layout-remove-row'    : 'removeRow'
    'click button.layout-add-column'    : 'addColumn'
    'click button.layout-remove-column' : 'removeColumn'
    'change select.layout-cell-content' : 'updateCellContent'
    'change select.layout-cell-align' : 'updateCellAlign'

    'change input.layout-column-width'  : 'updateColumnWidth'
    'change input.layout-row-height'    : 'updateRowHeight'



  initialize: (options) ->
    @model = options.model
    @subtest = options.subtest

  updateHighlightPrevious: ->
    @model.set('highlightPrevious', @$el.find('#highlight-previous').val() || '')

  updateAutoProgress: ->
    @model.set('autoProgress', @$el.find("#auto-progress").is(":checked"))

  updateKeepControls: ->
    @model.set('keepControls', @$el.find("#keep-controls").is(":checked"))

  updateCorrectable: ->
    @model.set('correctable', @$el.find("#correctable").is(":checked"))

  updateAutoProgressImmediate: ->
    @model.set('autoProgressImmediate', @$el.find("#auto-progress-immediate").is(":checked"))

  updateTransitionComment: ->
    @model.set('transitionComment', @$el.find('#transition-comment').val())

  updateTransitionDelay: ->
    @model.set('transitionDelay', @getNumber('#transition-delay'))

  updateTimeLimit: ->
    @model.set('timeLimit', @getNumber('#time-limit'))

  updateWarningTime: ->
    @model.set('warningTime', @getNumber('#warning-time'))

  updateWarningMessage: ->
    @model.set('warningMessage', @getString('#warning-message'))


  save: ->
    # attributes are handled independently and immediately
    # most editors @model.set everything

  addRow: (e) ->
    layout = @model.layout()
    layout.rows.push({height:10,columns:[]})
    @model.layout(layout)
    @renderLayoutEditor()

  removeRow: (e) ->
    row = @getNumber e, 'data-row'
    layout = @model.layout()
    layout.rows.splice(row, 1)
    @model.layout layout
    @renderLayoutEditor()

  addColumn: (e) ->
    row = @getNumber e, 'data-row'
    layout = @model.layout()
    layout.rows[row].columns = [] unless layout.rows[row].columns?
    layout.rows[row].columns.push({width:10,content:null, align:null})
    @renderLayoutEditor()


  removeColumn: (e) ->
    column = @getNumber e, 'data-column'
    row = @getNumber e, 'data-row'
    layout = @model.layout()
    layout.rows[row].columns.splice(column, 1)
    @model.layout layout
    @renderLayoutEditor()

  updateCellContent: (e) ->
    row    = @getNumber e, 'data-row'
    column = @getNumber e, 'data-column'

    if @getString(e) is "none"
      value = null
    else
      value  = @getNumber e

    layout = @model.layout()
    layout.rows[row].columns[column].content = value
    @updateGridPreview()


  updateCellAlign: (e) ->
    row    = @getNumber e, 'data-row'
    column = @getNumber e, 'data-column'

    if @getString(e) is "none"
      value = null
    else
      value  = @getNumber e

    layout = @model.layout()
    layout.rows[row].columns[column].align = value
    @updateGridPreview()


  updateColumnWidth: (e) ->
    row    = @getNumber e, 'data-row'
    column = @getNumber e, 'data-column'
    value  = @getNumber e
    layout = @model.layout()
    layout.rows[row].columns[column].width = value
    @model.layout layout
    @updateGridPreview()


  updateRowHeight: (e) ->
    row    = @getNumber e, 'data-row'
    value  = @getNumber e
    layout = @model.layout()
    layout.rows[row].height = value
    @model.layout layout
    @updateGridPreview()

  changeAssetMapValue: (e) ->
    index = @getNumber e, 'data-index'
    value = @getString e

    assetMap = @model.getObject('assetMap', {})
    assetMap[index] = value
    @model.set('assetMap', assetMap)

    @saveQuestion()

  # save question. called when an asset is changed. Seems important to save then.
  saveQuestion: ->
    @model.save null,
      success: =>
        Utils.midAlert "Question saved"
        @updateGridPreview()

  removeAsset: (e) ->
    index = @getNumber e, 'data-index'

    assets = @model.getArray('assets')
    assets.splice(index, 1)
    @model.set('assets', assets)

    @saveQuestion()
    # update screen
    @renderAssetManager()


  renderAssetManager: ->

    assets = @subtest.getArray('assets')
    assetMap = @model.getObject('assetMap')
    if assets.length is 0
      listHtml = '<p>Nothing uploaded yet.</p>'
    else
      listHtml = assets.map((el, i) ->
        "<tr>
          <td><div class='av-image-container'><img class='asset-thumb' src='data:#{el.type};base64,#{el.imgData}'></div></td>
          <td>#{_(el.name).escape()}</td>
          <td><input class='asset-value' data-index='#{i}' value='#{_(assetMap[i]||'').escape()}' placeholder='No value'></td>
        </tr>"
      , @).join('')

      listHtml = "
        <table id='asset-table'>
          <tr><th>Thumbnail</th><th>Name</th><th>Value</th></tr>
          #{listHtml}
        </table>
      "

    @$el.find('#asset-manager').html "
      <section>
      <h3>Assets</h3>
        #{listHtml}
      </section>
    "
    @resizeAssetThumbs()

  resizeAssetThumbs: ->
    @$el.find('img.asset-thumb').on 'load', () ->
      ratio  = $(@).width() / $(@).height()
      pratio = $(@).parent().width() / $(@).parent().height()

      if (ratio < pratio)
        css = width:'auto', height:'100%'
      else
        css = width:'100%', height:'auto'

      $(@).css(css)

      if (ratio < pratio)
        $(@).parent().width($(@).width())
      else
        $(@).parent().height($(@).height())


  # returns HTMl for the editor
  htmlEditor: ->

    # go through each row
    return (@model.layout().rows.map (row, y) =>
      return "<div>Row #{y+1}
      <label class='av-input-box'>Height <input size='3' style='width: auto;' class='layout-row-height' data-row='#{y}' value='#{row.height}'>%</label>
      <button data-row='#{y}' class='layout-remove-row command'>Remove row</button>
      <button class='layout-add-column command' data-row='#{y}'>Add column</button></div>" +
      ((row.columns||[]).map (col, x) =>

        return "
          <div style='margin-left:10px;display: block;'>
            <label class='av-input-box'>Width <input size='3' style='width: auto;' class='layout-column-width' data-row='#{y}' data-column='#{x}' value='#{col.width}'>%</label>
            #{@htmlCellContentSelector(x, y)}
            #{@htmlCellAlignSelector(x, y)}
            <button data-row='#{y}' data-column='#{x}' class='layout-remove-column command'>Remove</button>
          </div>"
      ).join('') # end of columns map
    ).join('') # end of rows map

  htmlCellContentSelector: (x,y) ->
    content = @model.layout().rows[y].columns[x].content

    optionsHtml = @subtest.getArray('assets').map ( el, i ) ->
      selected = 'selected' if content is i
      "<option value='#{i}' #{selected||''}>#{el.name}</option>"

    noneSelected = if content is null then 'selected' else ''
    optionsHtml = "<option value='none' #{noneSelected}>none</option>" + optionsHtml

    return "
      <select class='layout-cell-content' data-row='#{y}' data-column='#{x}'>#{optionsHtml}</select>
    "

  htmlCellAlignSelector: (x,y) ->
    alignment = @model.layout().rows[y].columns[x].align

    optionsHtml = Question.AV_ALIGNMENT.map ( el, i ) ->
      selected = 'selected' if alignment is i
      "<option value='#{i}' #{selected||''}>#{el}</option>"

    noneSelected = if content is null then 'selected' else ''
    optionsHtml = "<option value='none' #{noneSelected}>none</option>" + optionsHtml

    return "
      <select class='layout-cell-align' data-row='#{y}' data-column='#{x}'>#{optionsHtml}</select>
    "

  renderLayoutEditor: ->
    layout  = @model.layout()

    @$el.find('#layout-editor').html "
      <h3>Grid editor</h3>
      <button class='command layout-add-row'>Add row</button>
      <section>#{@htmlEditor()}</section>
      <h3>Preview</h3>
      <section id='grid-preview' style='height:480px;width:640px;'></section>
    "
    @updateGridPreview()
    return

  htmlGridPreview: ->
    #
    # Generate preview
    #
    previewGridHtml = ""

    assetMap = @model.getObject('assetMap')
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

  uploadDisplaySound: (e) ->
    files = e.target.files
    file = files[0]

    if files && file
      reader = new FileReader()

      reader.onload = (readerEvt) =>

        sound64 = btoa(readerEvt.target.result)

        @model.save
          displaySound :
            data : sound64
            type : file.type
            name : file.name
        ,
          success: =>
            Utils.midAlert "Subtest saved."
            @renderDisplaySound()

      reader.readAsBinaryString(file)

  removeDisplaySound: ->
    @model.unset('displaySound').save null,
      success: =>
        @renderDisplaySound()

  renderDisplaySound: ->
    audio = @model.getObject('displaySound',{name:'None'})
    @$el.find('#display-sound-container').html "
      <div class='menu_box'>
        <label style='display:block;'>#{audio.name}</label>
        <audio src='data:#{audio.type};base64,#{audio.data}' controls></audio>
        <input id='display-sound' type='file'>
        <button id='remove-display-sound' class='command'>Remove</button>
      </div>
    "



  render: ->

    transitionComment = @model.getEscapedString('transitionComment')
    transitionDelay = @model.getNumber('transitionDelay', 350)

    autoProgress          = @model.getBoolean('autoProgress')
    autoProgressImmediate = @model.getBoolean('autoProgressImmediate')
    keepControls          = @model.getBoolean('keepControls')
    correctable           = @model.getBoolean('correctable')

    timeLimit      = @model.getNumber('timeLimit')
    warningTime    = @model.getNumber('warningTime')
    warningMessage = @model.getEscapedString('warningMessage')

    highlightPrevious = @model.getEscapedString('highlightPrevious')


    @$el.html "
        <div class='label_value'>
          <label for='display-sound' title='Sound to be played when the question is displayed.'>Display sound</label>
          <div id='display-sound-container'></div>
        </div>
        <table>
          <tr>
            <td><label for='time-limit' title='The amount of time (in ms) that the participant will be given before the task moves to the next screen automatically. 0 means disabled.'>Time limit</label></td>
            <td><input id='time-limit' type='number' value='#{timeLimit}'></td>
          </tr>
          <tr>
            <td><label for='warning-time' title='The amount of time (in ms) given before a warning message appears. 0 means disabled.'>Warning time</label></td>
            <td><input id='warning-time' type='number' value='#{warningTime}'></td>
          </tr>
          <tr>
            <td><label for='warning-message' title='A message given after the warning time expires.'>Warning message</label></td>
            <td><input id='warning-message' type='text' value='#{warningMessage}'></td>
          </tr>
          <tr>
            <td><label for='auto-progress' title='Automatically progress to the next screen for a valid answer.'>Auto progress</label></td>
            <td><input id='auto-progress' type='checkbox' #{'checked' if autoProgress}></td>
          </tr>
          <tr>
            <td><label for='auto-progress-immediate' title='Automatically progress immediately without a delay.'>Auto progress immediately</label></td>
            <td><input id='auto-progress-immediate' type='checkbox' #{'checked' if autoProgressImmediate}></td>
          </tr>
          <tr>
            <td><label for='keep-controls' title='Override setting to display next button.'>Keep controls</label></td>
            <td><input id='keep-controls' type='checkbox' #{'checked' if keepControls}></td>
          </tr>
          <tr>
            <td><label for='correctable' title='Allow users to correct their answers.'>Correctable</label></td>
            <td><input id='correctable' type='checkbox' #{'checked' if correctable}></td>
          </tr>
          <tr>
            <td><label for='transition-comment' title='Message shown when there is a valid answer.'>Transition comment</label></td>
            <td><input id='transition-comment' type='text' value='#{transitionComment}'></td>
          </tr>
          <tr>
            <td><label for='transition-delay' title='Time in milliseconds to wait before progressing to the next screen after a valid answer. Default is 350. If Auto Progress Immediately is selected, it will override this setting.'>Transition delay</label></td>
            <td><input id='transition-delay' type='text' value='#{transitionDelay}'></td>
          </tr>
          <tr>
            <td><label for='highlight-previous' title='Highlight the asset with the same value as this variable.'>Highlight previous</label></td>
            <td><input id='highlight-previous' type='text' value='#{highlightPrevious}'></td>
          </tr>

          <tr><td></td></tr>
        </table>
      <div id='asset-manager'></div>
      <div id='layout-editor'></div>
    "

    @renderAssetManager()
    @renderLayoutEditor()
    @renderDisplaySound()

  # Utility to get the value or attribute contained in a dom element.
  # See: @getNumber and @getString
  getAttribute: (target, attribute) ->
    itsAjQueryEvent = target instanceof jQuery.Event
    itsADomElement  = target instanceof Node
    itsAString      = _(target).isString()

    $target = if itsAjQueryEvent
      $(target.target)
    else if itsADomElement
      $(target)
    else if itsAString
      @$el.find(target)

    return $target.val() unless attribute?
    return $target.attr(attribute)

  # Utility to get a number from a dom element
  getNumber: (target, attribute) ->
    return Number @getAttribute( target, attribute )

  # Utility to get a string
  # just for consistency, getAttribute always returns a string
  getString: (target, attribute) ->
    return @getAttribute( target, attribute )

