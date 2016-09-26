(doc) ->

  if doc.collection is "lessonPlan"
    emit [doc.lessonPlan_subject, doc.lessonPlan_grade, doc.lessonPlan_week, doc.lessonPlan_day], null


