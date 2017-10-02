class StudentEditView extends Backbone.View

  className: "StudentEditView"

  events:
    'click .done' : 'done'
    'click .back' : 'back'

  initialize: ( options ) ->
    @student = options.student
    @klasses = options.klasses

  done: ->
    klassId = @$el.find("#klass_select option:selected").attr("data-id")
    klassId = null if klassId == "null"
    @student.set
      name    : @$el.find("#name").val()
      gender  : @$el.find("#gender").val()
      age     : @$el.find("#age").val()
      klassId : klassId
    @student.save()
    @back()

  back: ->
    window.history.back()

  render: ->
    name   = @student.get("name")   || ""
    gender = @student.get("gender") || ""
    age    = @student.get("age")    || ""

    klassId = @student.get("klassId")
    html = "
    <h1>#{t('edit student')}</h1>
    <button class='back navigation'>#{t('back')}</button><br>
    <div class='info_box'>
      <div class='label_value'>
        <label for='name'>Full name</label>
        <input id='name' value='#{name}'>
      </div>
      <div class='label_value'>
        <label for='gender'>#{t('gender')}</label>
        <input id='gender' value='#{gender}'>
      </div>
      <div class='label_value'>
        <label for='age'>#{t('age')}</label>
        <input id='age' value='#{age}'>
      </div>
      <div class='label_value'>
        <label for='klass_select'>#{t('class')}</label><br>
        <select id='klass_select'>"
    html += "<option data-id='null' #{if klassId == null then "selected='selected'"}>#{t('none')}</option>"
    for klass in @klasses.models
      html += "<option data-id='#{klass.id}' #{if klass.id == klassId then "selected='selected'"}>#{klass.get 'year'} - #{klass.get 'grade'} - #{klass.get 'stream'}</option>"

    html += "
        </select>
      </div>
      <button class='done command'>#{t('done')}</button>
    </div>
    "
    
    @$el.html html
    @trigger "rendered"

