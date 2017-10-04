class Feedback extends Backbone.ParentModel

  url : "feedback"

  Child           : Critique
  ChildCollection : Critiques


class Feedbacks extends Backbone.Collection

  model : Feedback
  url : "feedback"

