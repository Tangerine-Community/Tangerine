class LessonPlanEditView extends Backbone.View

  className: "LessonPlanEditView"

  initialize: ( options ) ->
    @model = options.model
    @parent = options.parent

  isValid: -> true

  save: -> # do nothing
  render: ->
    title    = @model.getString("title")
    lesson_text    = @model.getString("lesson_text")
    subject    = @model.getString("subject")
    grade    = @model.getString("grade")
    week    = @model.getString("week")
    day    = @model.getString("day")
    @$el.html "
    <div class='label_value'>
    <label for='title'>LessonPlan Title</label>
          <input id='title' value='#{title}'>
       </div>
    <div class='menu_box'>
    <div class='label_value'>
    <label for='lesson_text' title='Lesson Text. '>LessonPlan Text</label>
            <textarea id='lesson_text'>#{lesson_text}</textarea>
    </div>
       </div>
    <div class='label_value'>
    <label for='subject'>LessonPlan subject</label><br>
            <div class='menu_box'>
              <select id='subject'>
                <option value=''>None</option>
    <option value='1'>Engish</option>
                <option value='2'>Kiswahili</option>
    </select>
            </div>
    </div>
      <div class='label_value'>
      <label for='grade'>LessonPlan Grade</label>
    <input id='grade' value='#{grade}'>
    </div>
      <div class='label_value'>
      <label for='week'>LessonPlan Week</label>
    <input id='week' value='#{week}'>
    </div>
      <div class='label_value'>
      <label for='day'>LessonPlan Day</label>
    <input id='day' value='#{day}'>
    </div>
      "
