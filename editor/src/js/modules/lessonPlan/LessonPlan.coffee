class LessonPlan extends Backbone.Model

  url: 'lessonPlan'


# Hijacked success() for later
# fetchs all subtests for the assessment
  fetch: (options) =>
    console.log("Fetching LessonPlans"  )
    oldSuccess = options.success
    options.success = (model) =>
      allSubtests = new Subtests
      allSubtests.fetch
        key: "s" + @id
        success: (collection) =>
          @subtests = collection
          @subtests.ensureOrder()
          oldSuccess? @

    Assessment.__super__.fetch.call @, options

  isActive: -> return not @isArchived()

  isArchived: ->
    archived = @get("archived")
    return archived == "true" or archived == true
