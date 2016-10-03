(doc) ->

  if doc.collection is "lessonPlan"
    emit [doc.lessonPlan_week, doc.lessonPlan_day], null


