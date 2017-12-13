class StudentListElementView extends Backbone.View

  className: "student_list_element"
  tagName : "li"

  events :
    'click .edit'          : 'edit'
    'click .remove'        : 'toggleRemove'
    'click .remove_cancel' : 'toggleRemove'
    'click .remove_delete' : 'removeStudent'
  
  initialize: (options) ->
    @student = options.student
    @students = options.students
  
  edit:    -> Tangerine.router.navigate "class/student/#{@student.id}", true
  toggleRemove: -> @$el.find(".remove_confirm, .remove").toggle()
  removeStudent: -> 
    @student.set(klassId : null).save()
    @students.remove(@student)

  render: ->
    @$el.html "
      #{@student.get 'name'}
      #{@student.get 'gender'}
      #{@student.get 'age'}
      <img src='images/icon_edit.png' class='edit' title='Edit'>
      <img src='images/icon_delete.png' class='remove' title='Remove'>
      <div class='remove_confirm confirmation'>
        <div class='menu_box'>
          #{t('remove student')}<br>
          <button class='remove_delete command_red'>#{t('remove')}</button>
          <button class='remove_cancel command'>#{t('cancel')}</button>
        </div>
      </div>
    "
    
    @trigger "rendered"
