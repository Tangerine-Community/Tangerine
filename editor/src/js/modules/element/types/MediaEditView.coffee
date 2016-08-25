class MediaEditView extends Backbone.View

  className : "MediaEditView"

  initialize: ( options ) ->
    @model = options.model
    @parent = options.parent

  isValid: -> true

  save: ->
    @model.set
      "media" : @$el.find("#media").val()

  render: ->
    #media = @model.get("media") || ""
    fileName = @model.get("fileName")
    fileType = @model.get("fileType")
    typeArr = fileType.split("/")
    typeName = typeArr[0]
    mediaString = ''
    if typeName == 'image'
      mediaString = '<img id="media_' +fileName+ '" style="max-width:99%;width:100%;height:auto;" src="/client/lesson_plan_media/' +fileName+ '"/>'
    if typeName == 'audio' || typeName == 'video'
      mediaString = '<' +typeName+ ' controls style="max-width:99%;width:100%;height:auto;" id="media_' +typeName+ '"><source src="/client/lesson_plan_media/' +fileName+ '" type="' +fileType+ '"/></' +typeName+ '>'
    
    @$el.html "
      <div class='label_value'>
        <label for='media'>Media</label>
        #{mediaString}
      </div>
    "
