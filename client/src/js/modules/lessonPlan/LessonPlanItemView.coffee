LessonPlanItemView = Backbone.Marionette.ItemView.extend

# for Backbone.Marionette.CompositeView Composite Model
  template: JST["LessonPlanItemView"],

  onBeforeRender: () ->
#    console.log("onBeforeRender")
    @model.set("groupName", Tangerine.settings.get("groupName"))
    if @model.get("lessonPlan_subject") == '1'
      lessonPlan_subject_full = 'Afaan_Oromo'
    else if @model.get("lessonPlan_subject") == '2'
      lessonPlan_subject_full = 'Af_Somali'
    else if @model.get("lessonPlan_subject") == '3'
      lessonPlan_subject_full = 'Amharic'
    else if @model.get("lessonPlan_subject") == '4'
      lessonPlan_subject_full = 'Hadiyyisa'
    else if @model.get("lessonPlan_subject") == '5'
      lessonPlan_subject_full = 'Sidaamu_Afoo'
    else if @model.get("lessonPlan_subject") == '6'
      lessonPlan_subject_full = 'Tigrinya'
    else if @model.get("lessonPlan_subject") == '7'
     lessonPlan_subject_full = 'Wolayttatto'

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
            element.groupName = Tangerine.settings.get("groupName")
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


