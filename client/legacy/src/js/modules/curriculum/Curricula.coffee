class Curricula extends Backbone.Collection

  url : "curriculum"
  model : Curriculum
  pouch:
    viewOptions:
      key : 'curriculum'
