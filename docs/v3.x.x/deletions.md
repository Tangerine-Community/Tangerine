# Deletions in Tangerine

We're archiving records instead of deleting them in Tangerine by setting `archive:true` on the root of the doc and filtering queries by `&& !archive`.

For most queries, you simply must simply append  `&& !archive` to the query in order to ensure your views filter for the archive flag.

Sample view that filters by archive:

```
    responsesByClassIdCurriculumId: {
      map: function (doc) {
        if (doc.hasOwnProperty('collection') && doc.collection === 'TangyFormResponse' && !doc.archive) {
          if (doc.hasOwnProperty('metadata') && doc.metadata.studentRegistrationDoc.classId) {
            // console.log("matching: " + doc.metadata.studentRegistrationDoc.classId)
             emit([doc.metadata.studentRegistrationDoc.classId, doc.form.id], true);
          }
        }
      }.toString()
    },
```


Sample function to archive some records:

```
  async archiveStudent(column) {
    let studentId = column.id
    console.log("Archiving student:" + studentId)
    let deleteConfirmed = confirm(_TRANSLATE("Delete this student?"));
    if (deleteConfirmed) {
      try {
        let responses = await this.classViewService.getResponsesByStudentId(studentId)
        for (const response of responses as any[] ) {
          response.doc.archive = true;
          let lastModified = Date.now();
          response.doc.lastModified = lastModified
          const archiveResult = await this.classViewService.saveResponse(response.doc)
          console.log("archiveResult: " + archiveResult)
        }
        let result = await this.dashboardService.archiveStudentRegistration(studentId)
        console.log("result: " + result)
      } catch (e) {
        console.log("Error deleting student: " + e)
        return false;
      }
    }
  }
```
