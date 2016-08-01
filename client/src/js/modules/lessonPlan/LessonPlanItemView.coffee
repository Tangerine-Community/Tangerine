LessonPlanItemView = Backbone.Marionette.ItemView.extend

# for Backbone.Marionette.CompositeView Composite Model
  template: JST["LessonPlanItemView"],

  onBeforeRender: () ->
    console.log("onBeforeRender")
    if @model.get("lessonPlan_subject") == '1'
      lessonPlan_subject_full = 'English'
    else
      lessonPlan_subject_full = 'Kiswahili'
    @model.set("lessonPlan_subject_full", lessonPlan_subject_full)
