module.exports = {
  _id: '_design/tangy-reporting',
  version: '1',
  views: {
    resultsByGroupFormId: {
      map: function (doc) {
        if (doc.formId) {
          const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const startUnixtime = new Date(doc.startUnixtime);
          const key = doc.formId + '_' + startUnixtime.getFullYear() + '_' + MONTHS[startUnixtime.getMonth()];
          //The emmitted value is in the form "formId" i.e `formId` and also "formId_2018_May" i.e `formId_Year_Month`
          emit(doc.formId);
          emit(key);
        }
      }.toString()
    }
  }
}