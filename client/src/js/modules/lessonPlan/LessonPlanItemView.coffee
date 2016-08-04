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

#    // Serialize the model or collection for the view. If a model is
#    // found, the view's `serializeModel` is called. If a collection is found,
#    // each model in the collection is serialized by calling
#    // the view's `serializeCollection` and put into an `items` array in
#    // the resulting data. If both are found, defaults to the model.
#    // You can override the `serializeData` method in your own view definition,
#    // to provide custom serialization for your view's data.

#       Adds a serialized elements to the lessonPlan.
  serializeData: () ->
    if (!this.model && !this.collection)
      return {}

    args = [this.model || this.collection]
    if (arguments.length)
      args.push.apply(args, arguments);

    if (@model)
      elements = this.model.elements.toJSON()
      for element in elements
        do (element) ->
          if element.element == 'media'
            typeArr = element.fileType.split("/")
            typename = typeArr[0]
            element[typename] = typename
      lessonPlan = @serializeModel.apply(@, args);
      lessonPlan.elements = elements
      return lessonPlan
    else
      return {
        items: @serializeCollection.apply(@, args)
      };


