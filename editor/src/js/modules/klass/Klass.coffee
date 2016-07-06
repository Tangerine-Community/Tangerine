class Klass extends Backbone.Model
  url : "klass"
  
  initialize: ->
    # get students
    # get assessment collection


  destroy: ->

    klassId = @id

    # unlink all students
    allStudents = new Students
    allStudents.fetch
      success: (studentCollection) ->
        students = studentCollection.where "klassId" : klassId
        for student in students
          student.save
            "klassId" : ""

    allResults = new Results
    allResults.fetch
      success: (resultCollection) ->
        results = resultCollection.where "klassId" : klassId
        for result in results
          result.destroy()

    super()

  calcCurrentPart: ->
    milliseconds          = 1000
    millisecondsPerMinute = 60 * milliseconds
    millisecondsPerHour   = 60 * millisecondsPerMinute
    millisecondsPerDay    = 24 * millisecondsPerHour
    millisecondsPerWeek   = 7  * millisecondsPerDay
    return Math.round(((new Date()).getTime() - @get("startDate")) / millisecondsPerWeek)
