class Teachers extends Backbone.Collection
  model : Teacher
  url : "teacher"
  pouch:
    viewOptions:
      key : 'teacher'
