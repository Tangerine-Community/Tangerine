var AssessmentImportView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

AssessmentImportView = (function(superClass) {
  extend(AssessmentImportView, superClass);

  function AssessmentImportView() {
    this.updateProgress = bind(this.updateProgress, this);
    this.updateActivity = bind(this.updateActivity, this);
    this.updateFromActiveTasks = bind(this.updateFromActiveTasks, this);
    this["import"] = bind(this["import"], this);
    return AssessmentImportView.__super__.constructor.apply(this, arguments);
  }

  AssessmentImportView.prototype.className = "AssessmentImportView";

  AssessmentImportView.prototype.events = {
    'click .import': 'import',
    'click .back': 'back',
    'click .verify': 'verify',
    'click .group_import': 'groupImport'
  };

  AssessmentImportView.prototype.groupImport = function() {
    return $.ajax({
      url: Tangerine.settings.urlView("local", "byDKey"),
      type: "POST",
      contentType: "application/json",
      dataType: "json",
      data: "{}",
      success: (function(_this) {
        return function(data) {
          var datum, i, keyList, len, ref;
          keyList = [];
          ref = data.rows;
          for (i = 0, len = ref.length; i < len; i++) {
            datum = ref[i];
            keyList.push(datum.key);
          }
          keyList = _.uniq(keyList);
          return $.ajax({
            url: Tangerine.settings.urlView("group", "assessmentsNotArchived"),
            dataType: "jsonp",
            success: function(data) {
              var dKeys, doc, newAssessment;
              dKeys = _.compact((function() {
                var j, len1, ref1, results;
                ref1 = data.rows;
                results = [];
                for (j = 0, len1 = ref1.length; j < len1; j++) {
                  doc = ref1[j];
                  results.push(doc.id.substr(-5, 5));
                }
                return results;
              })()).concat(keyList).join(" ");
              newAssessment = new Assessment;
              newAssessment.on("status", _this.updateActivity);
              return newAssessment.updateFromServer(dKeys);
            },
            error: function(a, b) {
              return Utils.midAlert("Import error");
            }
          });
        };
      })(this)
    });
  };

  AssessmentImportView.prototype.verify = function() {
    return Tangerine.user.ghostLogin(Tangerine.settings.upUser, Tangerine.settings.upPass);
  };

  AssessmentImportView.prototype.initialize = function(options) {
    this.noun = options.noun;
    this.connectionVerified = true;
    this.docsRemaining = 0;
    this.serverStatus = "Ok";
    this.updateServerStatus();
    return this.render();
  };

  AssessmentImportView.prototype.updateServerStatus = function() {
    return this.$el.find("#server_connection").html(this.serverStatus);
  };

  AssessmentImportView.prototype.back = function() {
    Tangerine.router.landing();
    return false;
  };

  AssessmentImportView.prototype["import"] = function() {
    var dKey, selectedGroup;
    dKey = this.$el.find("#d_key").val();
    selectedGroup = this.$el.find("select#group option:selected").attr('data-group') || "";
    if (selectedGroup === "NONE") {
      return Utils.midAlert("Please select a group.");
    }
    this.newAssessment = new Assessment;
    this.newAssessment.on("status", this.updateActivity);
    this.updateActivity();
    if (selectedGroup === "IrisCouch") {
      this.newAssessment.updateFromIrisCouch(dKey);
    } else {
      this.newAssessment.updateFromServer(dKey, selectedGroup);
    }
    return this.activeTaskInterval = 2;
  };

  AssessmentImportView.prototype.updateFromActiveTasks = function() {
    return $.couch.activeTasks({
      success: (function(_this) {
        return function(tasks) {
          var i, len, results, task;
          results = [];
          for (i = 0, len = tasks.length; i < len; i++) {
            task = tasks[i];
            if (task.type.toLowerCase() === "replication") {
              if (!_.isEmpty(task.status)) {
                _this.activity = task.status;
              }
              results.push(_this.updateProgress());
            } else {
              results.push(void 0);
            }
          }
          return results;
        };
      })(this)
    });
  };

  AssessmentImportView.prototype.updateActivity = function(status, message) {
    var changes, failed, failures, headline, read, written, writtenPlural;
    if (message != null) {
      read = written = failed = 0;
      read = message.docs_read;
      written = message.docs_written;
      failed = message.doc_write_failures;
      if (written !== 1) {
        writtenPlural = "s";
      }
      if (failed !== 0) {
        failures = "<b>" + failed + "</b> failures<br>";
      }
      if ((message.no_changes != null) && message.no_changes === true) {
        changes = "No changes";
      }
    }
    this.$el.find(".status").fadeIn(250);
    this.activity = "";
    if (status === "import lookup") {
      this.activity = "Finding " + this.noun;
    } else if (status === "import success") {
      clearInterval(this.activeTaskInterval);
      headline = "Import successful";
      if (read === 0) {
        headline = "Nothing imported";
      }
      this.activity = headline + "<br> <b>" + written + "</b> document" + (writtenPlural || '') + " written<br> " + (failures || '') + " " + (changes || '');
      this.updateProgress(null);
    } else if (status === "import error") {
      clearInterval(this.activeTaskInterval);
      this.activity = "Import error: " + JSON.stringify(message);
    }
    return this.updateProgress();
  };

  AssessmentImportView.prototype.updateProgress = function(key, callback) {
    var progressHTML, ref, value;
    if (callback == null) {
      callback = $.noop;
    }
    if (key != null) {
      if (this.importList[key] != null) {
        this.importList[key]++;
      } else {
        this.importList[key] = 1;
      }
    }
    progressHTML = "<table>";
    ref = this.importList;
    for (key in ref) {
      value = ref[key];
      progressHTML += "<tr><td>" + (key.titleize().pluralize()) + "</td><td>" + value + "</td></tr>";
    }
    if (this.activity != null) {
      progressHTML += "<tr><td colspan='2'>" + this.activity + "</td></tr>";
    }
    progressHTML += "</table>";
    this.$el.find("#progress").html(progressHTML);
    return callback();
  };

  AssessmentImportView.prototype.render = function() {
    var groupSelector, importStep;
    groupSelector = "<select id='group'> <option data-group='NONE' selected='selected'>Please select a group</option> " + (Tangerine.user.groups().admin.map(function(group) {
      return "<option data-group='" + (_.escape(group)) + "'>" + group + "</option>";
    }).join('')) + " </select>";
    if (!this.connectionVerified) {
      importStep = "<section> <p>Please wait while your connection is verified.</p> <button class='command verify'>Try now</button> <p><small>Note: If verification fails, press back to return to previous screen and please try again when internet connectivity is better.</small></p> </section>";
    } else {
      importStep = "<div class='question'> <label for='d_key'>Download keys</label> <input id='d_key' value=''> " + (groupSelector || '') + "<br> <button class='import command'>Import</button> <br> <small>Server connection: <span id='server_connection'>" + this.serverStatus + "</span></small> </div> <div class='confirmation status'> <h2>Status<h2> <div class='info_box' id='progress'></div> </div>";
    }
    this.$el.html("<button class='back navigation'>Back</button> <h1>Tangerine Central Import</h1> " + importStep);
    return this.trigger("rendered");
  };

  AssessmentImportView.prototype.onClose = function() {
    return clearTimeout(this.timer);
  };

  return AssessmentImportView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2Vzc21lbnQvQXNzZXNzbWVudEltcG9ydFZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsb0JBQUE7RUFBQTs7OztBQUFNOzs7Ozs7Ozs7OztpQ0FFSixTQUFBLEdBQVc7O2lDQUVYLE1BQUEsR0FDRTtJQUFBLGVBQUEsRUFBa0IsUUFBbEI7SUFDQSxhQUFBLEVBQWtCLE1BRGxCO0lBRUEsZUFBQSxFQUFrQixRQUZsQjtJQUdBLHFCQUFBLEVBQXdCLGFBSHhCOzs7aUNBS0YsV0FBQSxHQUFhLFNBQUE7V0FFWCxDQUFDLENBQUMsSUFBRixDQUNFO01BQUEsR0FBQSxFQUFLLFNBQVMsQ0FBQyxRQUFRLENBQUMsT0FBbkIsQ0FBMkIsT0FBM0IsRUFBb0MsUUFBcEMsQ0FBTDtNQUNBLElBQUEsRUFBTSxNQUROO01BRUEsV0FBQSxFQUFhLGtCQUZiO01BR0EsUUFBQSxFQUFVLE1BSFY7TUFJQSxJQUFBLEVBQU0sSUFKTjtNQUtBLE9BQUEsRUFBUyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsSUFBRDtBQUNQLGNBQUE7VUFBQSxPQUFBLEdBQVU7QUFDVjtBQUFBLGVBQUEscUNBQUE7O1lBQ0UsT0FBTyxDQUFDLElBQVIsQ0FBYSxLQUFLLENBQUMsR0FBbkI7QUFERjtVQUVBLE9BQUEsR0FBVSxDQUFDLENBQUMsSUFBRixDQUFPLE9BQVA7aUJBRVYsQ0FBQyxDQUFDLElBQUYsQ0FDRTtZQUFBLEdBQUEsRUFBSyxTQUFTLENBQUMsUUFBUSxDQUFDLE9BQW5CLENBQTJCLE9BQTNCLEVBQW9DLHdCQUFwQyxDQUFMO1lBQ0EsUUFBQSxFQUFVLE9BRFY7WUFFQSxPQUFBLEVBQVMsU0FBQyxJQUFEO0FBQ1Asa0JBQUE7Y0FBQSxLQUFBLEdBQVEsQ0FBQyxDQUFDLE9BQUY7O0FBQVU7QUFBQTtxQkFBQSx3Q0FBQTs7K0JBQUEsR0FBRyxDQUFDLEVBQUUsQ0FBQyxNQUFQLENBQWMsQ0FBQyxDQUFmLEVBQWtCLENBQWxCO0FBQUE7O2tC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Q0FBZ0gsRUFBaEgsQ0FBRCxDQUhXLEdBRzBHO0lBSTFILElBQUcsQ0FBSSxJQUFDLENBQUEsa0JBQVI7TUFDRSxVQUFBLEdBQWEsbVJBRGY7S0FBQSxNQUFBO01BU0UsVUFBQSxHQUFhLDhGQUFBLEdBS1IsQ0FBQyxhQUFBLElBQWlCLEVBQWxCLENBTFEsR0FLYSxrSEFMYixHQU9nRCxJQUFDLENBQUEsWUFQakQsR0FPOEQsNEhBaEI3RTs7SUF3QkEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsa0ZBQUEsR0FNTixVQU5KO1dBVUEsSUFBQyxDQUFBLE9BQUQsQ0FBUyxVQUFUO0VBN0NNOztpQ0ErQ1IsT0FBQSxHQUFTLFNBQUE7V0FDUCxZQUFBLENBQWEsSUFBQyxDQUFBLEtBQWQ7RUFETzs7OztHQXJNd0IsUUFBUSxDQUFDIiwiZmlsZSI6ImFzc2Vzc21lbnQvQXNzZXNzbWVudEltcG9ydFZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBBc3Nlc3NtZW50SW1wb3J0VmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWU6IFwiQXNzZXNzbWVudEltcG9ydFZpZXdcIlxuXG4gIGV2ZW50czpcbiAgICAnY2xpY2sgLmltcG9ydCcgOiAnaW1wb3J0J1xuICAgICdjbGljayAuYmFjaycgICA6ICdiYWNrJ1xuICAgICdjbGljayAudmVyaWZ5JyA6ICd2ZXJpZnknXG4gICAgJ2NsaWNrIC5ncm91cF9pbXBvcnQnIDogJ2dyb3VwSW1wb3J0J1xuXG4gIGdyb3VwSW1wb3J0OiAtPlxuXG4gICAgJC5hamF4XG4gICAgICB1cmw6IFRhbmdlcmluZS5zZXR0aW5ncy51cmxWaWV3KFwibG9jYWxcIiwgXCJieURLZXlcIiksXG4gICAgICB0eXBlOiBcIlBPU1RcIlxuICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiXG4gICAgICBkYXRhVHlwZTogXCJqc29uXCJcbiAgICAgIGRhdGE6IFwie31cIlxuICAgICAgc3VjY2VzczogKGRhdGEpID0+XG4gICAgICAgIGtleUxpc3QgPSBbXVxuICAgICAgICBmb3IgZGF0dW0gaW4gZGF0YS5yb3dzXG4gICAgICAgICAga2V5TGlzdC5wdXNoIGRhdHVtLmtleVxuICAgICAgICBrZXlMaXN0ID0gXy51bmlxKGtleUxpc3QpXG5cbiAgICAgICAgJC5hamF4XG4gICAgICAgICAgdXJsOiBUYW5nZXJpbmUuc2V0dGluZ3MudXJsVmlldyBcImdyb3VwXCIsIFwiYXNzZXNzbWVudHNOb3RBcmNoaXZlZFwiXG4gICAgICAgICAgZGF0YVR5cGU6IFwianNvbnBcIlxuICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PlxuICAgICAgICAgICAgZEtleXMgPSBfLmNvbXBhY3QoZG9jLmlkLnN1YnN0cigtNSwgNSkgZm9yIGRvYyBpbiBkYXRhLnJvd3MpLmNvbmNhdChrZXlMaXN0KS5qb2luKFwiIFwiKVxuICAgICAgICAgICAgbmV3QXNzZXNzbWVudCA9IG5ldyBBc3Nlc3NtZW50XG4gICAgICAgICAgICBuZXdBc3Nlc3NtZW50Lm9uIFwic3RhdHVzXCIsIEB1cGRhdGVBY3Rpdml0eVxuICAgICAgICAgICAgbmV3QXNzZXNzbWVudC51cGRhdGVGcm9tU2VydmVyIGRLZXlzXG4gICAgICAgICAgZXJyb3I6IChhLCBiKSAtPlxuICAgICAgICAgICAgVXRpbHMubWlkQWxlcnQgXCJJbXBvcnQgZXJyb3JcIiBcblxuICB2ZXJpZnk6IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIuZ2hvc3RMb2dpbiBUYW5nZXJpbmUuc2V0dGluZ3MudXBVc2VyLCBUYW5nZXJpbmUuc2V0dGluZ3MudXBQYXNzXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgQG5vdW4gPSBvcHRpb25zLm5vdW5cblxuICAgIEBjb25uZWN0aW9uVmVyaWZpZWQgPSB0cnVlXG5cbiAgICBAZG9jc1JlbWFpbmluZyA9IDBcblxuICAgICMgdGhlcmUgd2FzIGEgbG90IG9mIHNlcnZlciBjb25uZWN0aW9uIGNoZWNraW5nIGhlcmVcbiAgICAjIGNhbiBwcm9iYWJseSBnZXQgcmlkIG9mIG1vcmUgY29kZSAvIG1hcmt1cCBvbiBhbm90aGVyIHBhc3NcblxuICAgIEBzZXJ2ZXJTdGF0dXMgPSBcIk9rXCJcbiAgICBAdXBkYXRlU2VydmVyU3RhdHVzKClcblxuICAgIEByZW5kZXIoKVxuXG5cbiAgdXBkYXRlU2VydmVyU3RhdHVzOiAtPlxuICAgIEAkZWwuZmluZChcIiNzZXJ2ZXJfY29ubmVjdGlvblwiKS5odG1sIEBzZXJ2ZXJTdGF0dXNcblxuICBiYWNrOiAtPlxuICAgIFRhbmdlcmluZS5yb3V0ZXIubGFuZGluZygpXG4gICAgZmFsc2VcblxuICBpbXBvcnQ6ID0+XG5cbiAgICBkS2V5ID0gQCRlbC5maW5kKFwiI2Rfa2V5XCIpLnZhbCgpXG5cbiAgICBzZWxlY3RlZEdyb3VwID0gQCRlbC5maW5kKFwic2VsZWN0I2dyb3VwIG9wdGlvbjpzZWxlY3RlZFwiKS5hdHRyKCdkYXRhLWdyb3VwJykgfHwgXCJcIlxuXG4gICAgcmV0dXJuIFV0aWxzLm1pZEFsZXJ0IFwiUGxlYXNlIHNlbGVjdCBhIGdyb3VwLlwiIGlmIHNlbGVjdGVkR3JvdXAgPT0gXCJOT05FXCJcblxuICAgIEBuZXdBc3Nlc3NtZW50ID0gbmV3IEFzc2Vzc21lbnRcbiAgICBAbmV3QXNzZXNzbWVudC5vbiBcInN0YXR1c1wiLCBAdXBkYXRlQWN0aXZpdHlcbiAgICBAdXBkYXRlQWN0aXZpdHkoKVxuXG4gICAgaWYgc2VsZWN0ZWRHcm91cCA9PSBcIklyaXNDb3VjaFwiXG4gICAgICBAbmV3QXNzZXNzbWVudC51cGRhdGVGcm9tSXJpc0NvdWNoIGRLZXlcbiAgICBlbHNlXG4gICAgICBAbmV3QXNzZXNzbWVudC51cGRhdGVGcm9tU2VydmVyIGRLZXksIHNlbGVjdGVkR3JvdXBcblxuICAgIEBhY3RpdmVUYXNrSW50ZXJ2YWwgPSAyIyBzZXRJbnRlcnZhbCBAdXBkYXRlRnJvbUFjdGl2ZVRhc2tzLCAzMDAwXG5cblxuICB1cGRhdGVGcm9tQWN0aXZlVGFza3M6ID0+XG4gICAgJC5jb3VjaC5hY3RpdmVUYXNrc1xuICAgICAgc3VjY2VzczogKHRhc2tzKSA9PlxuICAgICAgICBmb3IgdGFzayBpbiB0YXNrc1xuICAgICAgICAgIGlmIHRhc2sudHlwZS50b0xvd2VyQ2FzZSgpID09IFwicmVwbGljYXRpb25cIlxuICAgICAgICAgICAgaWYgbm90IF8uaXNFbXB0eSh0YXNrLnN0YXR1cykgdGhlbiBAYWN0aXZpdHkgPSB0YXNrLnN0YXR1c1xuICAgICAgICAgICAgQHVwZGF0ZVByb2dyZXNzKClcblxuXG4gIHVwZGF0ZUFjdGl2aXR5OiAoc3RhdHVzLCBtZXNzYWdlKSA9PlxuXG4gICAgaWYgbWVzc2FnZT9cbiAgICAgIHJlYWQgPSB3cml0dGVuID0gZmFpbGVkID0gMFxuXG4gICAgICByZWFkICAgID0gbWVzc2FnZS5kb2NzX3JlYWRcbiAgICAgIHdyaXR0ZW4gPSBtZXNzYWdlLmRvY3Nfd3JpdHRlblxuICAgICAgZmFpbGVkICA9IG1lc3NhZ2UuZG9jX3dyaXRlX2ZhaWx1cmVzXG5cbiAgICAgIHdyaXR0ZW5QbHVyYWwgPSBcInNcIiBpZiB3cml0dGVuICE9IDFcblxuICAgICAgZmFpbHVyZXMgPSBcIlxuICAgICAgICA8Yj4je2ZhaWxlZH08L2I+IGZhaWx1cmVzPGJyPlxuICAgICAgXCIgaWYgZmFpbGVkICE9IDBcblxuICAgICAgY2hhbmdlcyA9IFwiTm8gY2hhbmdlc1wiIGlmIG1lc3NhZ2Uubm9fY2hhbmdlcz8gJiYgbWVzc2FnZS5ub19jaGFuZ2VzID09IHRydWVcblxuICAgIEAkZWwuZmluZChcIi5zdGF0dXNcIikuZmFkZUluKDI1MClcblxuICAgIEBhY3Rpdml0eSA9IFwiXCJcbiAgICBpZiBzdGF0dXMgPT0gXCJpbXBvcnQgbG9va3VwXCJcbiAgICAgIEBhY3Rpdml0eSA9IFwiRmluZGluZyAje0Bub3VufVwiXG4gICAgZWxzZSBpZiBzdGF0dXMgPT0gXCJpbXBvcnQgc3VjY2Vzc1wiXG4gICAgICBjbGVhckludGVydmFsIEBhY3RpdmVUYXNrSW50ZXJ2YWxcbiAgICAgIGhlYWRsaW5lID0gXCJJbXBvcnQgc3VjY2Vzc2Z1bFwiXG4gICAgICBoZWFkbGluZSA9IFwiTm90aGluZyBpbXBvcnRlZFwiIGlmIHJlYWQgPT0gMFxuICAgICAgQGFjdGl2aXR5ID0gXCIje2hlYWRsaW5lfTxicj5cbiAgICAgICAgPGI+I3t3cml0dGVufTwvYj4gZG9jdW1lbnQje3dyaXR0ZW5QbHVyYWwgfHwgJyd9IHdyaXR0ZW48YnI+XG4gICAgICAgICN7ZmFpbHVyZXMgfHwgJyd9XG4gICAgICAgICN7Y2hhbmdlcyB8fCAnJ31cbiAgICAgIFwiXG4gICAgICBAdXBkYXRlUHJvZ3Jlc3MgbnVsbFxuICAgIGVsc2UgaWYgc3RhdHVzID09IFwiaW1wb3J0IGVycm9yXCJcbiAgICAgIGNsZWFySW50ZXJ2YWwgQGFjdGl2ZVRhc2tJbnRlcnZhbFxuICAgICAgQGFjdGl2aXR5ID0gXCJJbXBvcnQgZXJyb3I6IFwiICsgSlNPTi5zdHJpbmdpZnkobWVzc2FnZSlcblxuICAgIEB1cGRhdGVQcm9ncmVzcygpXG5cbiAgdXBkYXRlUHJvZ3Jlc3M6IChrZXksIGNhbGxiYWNrPSQubm9vcCkgPT5cblxuICAgIGlmIGtleT9cbiAgICAgIGlmIEBpbXBvcnRMaXN0W2tleV0/XG4gICAgICAgIEBpbXBvcnRMaXN0W2tleV0rK1xuICAgICAgZWxzZVxuICAgICAgICBAaW1wb3J0TGlzdFtrZXldID0gMVxuXG4gICAgcHJvZ3Jlc3NIVE1MID0gXCI8dGFibGU+XCJcblxuICAgIGZvciBrZXksIHZhbHVlIG9mIEBpbXBvcnRMaXN0XG4gICAgICBwcm9ncmVzc0hUTUwgKz0gXCI8dHI+PHRkPiN7a2V5LnRpdGxlaXplKCkucGx1cmFsaXplKCl9PC90ZD48dGQ+I3t2YWx1ZX08L3RkPjwvdHI+XCJcblxuICAgIGlmIEBhY3Rpdml0eT9cbiAgICAgIHByb2dyZXNzSFRNTCArPSBcIjx0cj48dGQgY29sc3Bhbj0nMic+I3tAYWN0aXZpdHl9PC90ZD48L3RyPlwiXG5cbiAgICBwcm9ncmVzc0hUTUwgKz0gXCI8L3RhYmxlPlwiXG5cbiAgICBAJGVsLmZpbmQoXCIjcHJvZ3Jlc3NcIikuaHRtbCBwcm9ncmVzc0hUTUxcblxuICAgIGNhbGxiYWNrKClcblxuICByZW5kZXI6IC0+XG5cblxuXG4gICAgZ3JvdXBTZWxlY3RvciA9IFwiXG4gICAgICA8c2VsZWN0IGlkPSdncm91cCc+XG4gICAgICAgIDxvcHRpb24gZGF0YS1ncm91cD0nTk9ORScgc2VsZWN0ZWQ9J3NlbGVjdGVkJz5QbGVhc2Ugc2VsZWN0IGEgZ3JvdXA8L29wdGlvbj5cbiAgICAgICAgI3tUYW5nZXJpbmUudXNlci5ncm91cHMoKS5hZG1pbi5tYXAoIChncm91cCkgLT4gXCI8b3B0aW9uIGRhdGEtZ3JvdXA9JyN7Xy5lc2NhcGUoZ3JvdXApfSc+I3tncm91cH08L29wdGlvbj5cIikuam9pbignJyl9XG4gICAgICA8L3NlbGVjdD5cbiAgICBcIlxuXG4gICAgaWYgbm90IEBjb25uZWN0aW9uVmVyaWZpZWRcbiAgICAgIGltcG9ydFN0ZXAgPSBcIlxuICAgICAgICA8c2VjdGlvbj5cbiAgICAgICAgICA8cD5QbGVhc2Ugd2FpdCB3aGlsZSB5b3VyIGNvbm5lY3Rpb24gaXMgdmVyaWZpZWQuPC9wPlxuICAgICAgICAgIDxidXR0b24gY2xhc3M9J2NvbW1hbmQgdmVyaWZ5Jz5Ucnkgbm93PC9idXR0b24+XG4gICAgICAgICAgPHA+PHNtYWxsPk5vdGU6IElmIHZlcmlmaWNhdGlvbiBmYWlscywgcHJlc3MgYmFjayB0byByZXR1cm4gdG8gcHJldmlvdXMgc2NyZWVuIGFuZCBwbGVhc2UgdHJ5IGFnYWluIHdoZW4gaW50ZXJuZXQgY29ubmVjdGl2aXR5IGlzIGJldHRlci48L3NtYWxsPjwvcD5cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgXCJcbiAgICBlbHNlXG4gICAgICBpbXBvcnRTdGVwID0gXCJcbiAgICAgICAgPGRpdiBjbGFzcz0ncXVlc3Rpb24nPlxuICAgICAgICAgIDxsYWJlbCBmb3I9J2Rfa2V5Jz5Eb3dubG9hZCBrZXlzPC9sYWJlbD5cblxuICAgICAgICAgIDxpbnB1dCBpZD0nZF9rZXknIHZhbHVlPScnPlxuICAgICAgICAgICN7Z3JvdXBTZWxlY3RvciB8fCAnJ308YnI+XG4gICAgICAgICAgPGJ1dHRvbiBjbGFzcz0naW1wb3J0IGNvbW1hbmQnPkltcG9ydDwvYnV0dG9uPiA8YnI+XG4gICAgICAgICAgPHNtYWxsPlNlcnZlciBjb25uZWN0aW9uOiA8c3BhbiBpZD0nc2VydmVyX2Nvbm5lY3Rpb24nPiN7QHNlcnZlclN0YXR1c308L3NwYW4+PC9zbWFsbD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9J2NvbmZpcm1hdGlvbiBzdGF0dXMnPlxuICAgICAgICAgIDxoMj5TdGF0dXM8aDI+XG4gICAgICAgICAgPGRpdiBjbGFzcz0naW5mb19ib3gnIGlkPSdwcm9ncmVzcyc+PC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgXCJcblxuICAgIEAkZWwuaHRtbCBcIlxuXG4gICAgICA8YnV0dG9uIGNsYXNzPSdiYWNrIG5hdmlnYXRpb24nPkJhY2s8L2J1dHRvbj5cblxuICAgICAgPGgxPlRhbmdlcmluZSBDZW50cmFsIEltcG9ydDwvaDE+XG5cbiAgICAgICN7aW1wb3J0U3RlcH1cblxuICAgIFwiXG5cbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcblxuICBvbkNsb3NlOiAtPlxuICAgIGNsZWFyVGltZW91dCBAdGltZXJcbiJdfQ==
