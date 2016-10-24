LessonPlanItemView = Backbone.Marionette.ItemView.extend

# for Backbone.Marionette.CompositeView Composite Model
  template: JST["LessonPlanItemView"],

  className : "LessonPlanItemView"

  initialize: () ->
    _.bindAll(this, "mediaClick");
    @result = new Result
      options:{}
    this.model.result = @result
    @result.set('user',Tangerine.user.name())
    clicks = []
    @result.set('clicks',clicks)
    startTime = moment().format("YYYY-MMM-DD HH:mm:ss")
    @result.set('startTime',startTime)
    @result.set('name',@model.get('name'))
    @result.saveLessonPlan()

  events:
    'click .quit_lp' : 'quit_lp'
    'click .statusIcons' : 'universalUpload'

#  universalUpload: -> console.log("Loadin'")
  universalUpload: -> Utils.universalUpload()


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

#  onRender: () ->
#    console.log("onRender")
#    $('.mediaClick').on('play', () ->
#      console.log("play")
#    )

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

  quit_lp: () ->
    console.log("I'm quitting.")
    timestamp = moment().format("YYYY-MMM-DD HH:mm:ss")
    @result.set('stopTime',timestamp)
    @result.saveLessonPlan()

  mediaClick: (e) ->
    id = e.target.id
    console.log("I'm mediaClick for: " + id)
    timestamp = moment().format("YYYY-MMM-DD HH:mm:ss")
    click =
      media:id
      timestamp:timestamp
    clicks = @result.get('clicks')
    clicks.push(click)
#    console.log("clicks: " + JSON.stringify(clicks))
    @result.saveLessonPlan()


#  select: (subjectName, grade, week, day) ->
#
#    subject = Tangerine.enum.iSubjects[subjectName]
#
#    menu = Tangerine.MenuView
#    menu.updateSubject()
#    menu.$subject.val(subjectName)
#    menu.onSubjectChange()
#    menu.$grade.val(grade)
#    menu.onGradeChange()
#    menu.$week.val(week)
#    menu.onWeekChange()
#    menu.$day.val(day)
#
#    @lesson.fetch subject, grade, week, day, =>
#      @render()


