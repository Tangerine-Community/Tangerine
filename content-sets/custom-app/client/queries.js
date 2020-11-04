[
  {
    "id": "registrationResults",
    "version": "1",
    "view": {
      "map": function (doc) {
        if (doc.form && doc.form.id) {
          const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const startUnixtime = new Date(doc.startUnixtime);
          const key = doc.form.id + '_' + startUnixtime.getFullYear() + '_' + MONTHS[startUnixtime.getMonth()];
          //The emmitted value is in the form \"formId\" i.e `formId` and also \"formId_2018_May\" i.e `formId_Year_Month`
          if (doc.form.id === 'registration-role-1') {
            if (T.form.Get(doc, 'consent') === 'yes') {
              return emit(key, [1, 0]);
            } else {
              return emit(key, [0, 1]);
            }
          }
        }
      },
      "reduce": "_sum"
    }
  },
  {
    "id": "shared_responsesByStartUnixTime",
    "version": "1",
    "view": {
      "map": function (doc) {
        if (doc.collection === "TangyFormResponse") {
          return emit(doc.startUnixtime, true);
        }
      }
    }
  }
]
