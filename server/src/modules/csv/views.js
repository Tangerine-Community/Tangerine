module.exports = {
  _id: '_design/tangy-reporting',
  version: '1',
  views: {
    resultsByGroupFormId: {
      map: function (doc) {
        if (doc.formId) {
          const startUnixtime = new Date(doc.startUnixtime);
          const key = doc.formId + '_' + startUnixtime.getFullYear() + '_' + startUnixtime.getMonth();// getMonth returns 0-based index i.e 0,1,2,3,4,5,6,7,8,9,10,11
          //The emitted value is in the form "formId" i.e `formId` and also "formId_2018_0" for Jan i.e `formId_Year_Month` Remember Javascript uses 0-based indexing for months
          emit(doc.formId);
          emit(key);
        }
      }.toString()
    }
  }
}