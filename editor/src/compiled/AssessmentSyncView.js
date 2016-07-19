var AssessmentSyncView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

AssessmentSyncView = (function(superClass) {
  extend(AssessmentSyncView, superClass);

  function AssessmentSyncView() {
    this.ensureCredentials = bind(this.ensureCredentials, this);
    this.verifyTimeout = bind(this.verifyTimeout, this);
    this.onVerifySuccess = bind(this.onVerifySuccess, this);
    this.getDocIds = bind(this.getDocIds, this);
    this.upload = bind(this.upload, this);
    this.download = bind(this.download, this);
    return AssessmentSyncView.__super__.constructor.apply(this, arguments);
  }

  AssessmentSyncView.prototype.className = "AssessmentSyncView";

  AssessmentSyncView.prototype.events = {
    "click .back": "goBack",
    "click .show_details": "showDetails",
    "click .keep": "keep",
    "click .show_login": "showLogin",
    "click .login": "login",
    "click .download": "download",
    "click .upload": "upload"
  };

  AssessmentSyncView.prototype.download = function() {
    var groupDB, localDB;
    this.ensureCredentials();
    groupDB = Tangerine.settings.urlDB("group").replace(/\/\/(.*)@/, "//" + this.user + ":" + this.pass + "@");
    localDB = Tangerine.settings.urlDB("local");
    return this.getDocIds((function(_this) {
      return function(docIds) {
        return $.couch.replicate(groupDB, localDB, {
          success: function(response) {
            Utils.midAlert("Download success");
            return _this.updateConflicts();
          },
          error: function(a, b) {
            return Utils.midAlert("Pull Error<br>" + a + " " + b);
          }
        }, {
          doc_ids: docIds
        });
      };
    })(this));
  };

  AssessmentSyncView.prototype.upload = function() {
    var groupDB, localDB;
    this.ensureCredentials();
    groupDB = Tangerine.settings.urlDB("group").replace(/\/\/(.*)@/, "//" + this.user + ":" + this.pass + "@");
    localDB = Tangerine.settings.urlDB("local");
    return this.getDocIds((function(_this) {
      return function(docIds) {
        return $.couch.replicate(localDB, groupDB, {
          success: function(response) {
            Utils.midAlert("Upload success");
            return _this.updateConflicts();
          },
          error: function(a, b) {
            return Utils.midAlert("Pull Error<br>" + a + " " + b);
          }
        }, {
          doc_ids: docIds
        });
      };
    })(this));
  };

  AssessmentSyncView.prototype.getDocIds = function(callback) {
    var groupDB, groupDKey, localDKey, targetDB;
    groupDB = Tangerine.settings.urlDB("group").replace(/\/\/(.*)@/, "//");
    targetDB = Tangerine.settings.urlDB("local");
    localDKey = Tangerine.settings.urlView("local", "byDKey");
    groupDKey = (Tangerine.settings.location.group.db + Tangerine.settings.couch.view + "byDKey").replace(/\/\/(.*)@/, "//");
    return $.ajax({
      url: groupDKey,
      type: "GET",
      dataType: "jsonp",
      data: {
        keys: JSON.stringify([this.dKey])
      },
      error: (function(_this) {
        return function(a, b) {
          return Utils.midAlert("Pull error<br>" + a + " " + b);
        };
      })(this),
      success: (function(_this) {
        return function(data) {
          var datum, docList, i, len, ref;
          docList = [];
          ref = data.rows;
          for (i = 0, len = ref.length; i < len; i++) {
            datum = ref[i];
            docList.push(datum.id);
          }
          return $.ajax({
            url: localDKey,
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({
              keys: [_this.dKey]
            }),
            error: function(a, b) {
              return Utils.midAlert("Pull error<br>" + a + " " + b);
            },
            success: function(data) {
              var j, len1, ref1;
              ref1 = data.rows;
              for (j = 0, len1 = ref1.length; j < len1; j++) {
                datum = ref1[j];
                docList.push(datum.id);
              }
              docList = _.uniq(docList);
              return callback(docList);
            }
          });
        };
      })(this)
    });
  };

  AssessmentSyncView.prototype.showLogin = function() {
    this.$el.find("#user").val("");
    this.$el.find("#pass").val("");
    this.$el.find(".login_box").toggleClass("confirmation");
    return this.$el.find(".show_login").toggle();
  };

  AssessmentSyncView.prototype.onVerifySuccess = function() {
    clearTimeout(this.timer);
    this.connectionVerified = true;
    this.$el.find("#connection").html("Ok");
    this.$el.find(".show_login").toggle();
    return this.$el.find(".loads").removeClass("confirmation");
  };

  AssessmentSyncView.prototype.login = function() {
    this.user = this.$el.find("#user").val();
    this.pass = this.$el.find("#pass").val();
    Tangerine.settings.save({
      "server_user": this.user,
      "server_pass": this.pass
    });
    return Tangerine.user.ghostLogin(this.user, this.pass);
  };

  AssessmentSyncView.prototype.verifyTimeout = function() {
    this.$el.find("#connection").html(this.loginButton({
      status: "<br>Failed. Check connection or try again."
    }));
    this.$el.find(".loads").addClass("confirmation");
    return this.removeCredentials();
  };

  AssessmentSyncView.prototype.keep = function(event) {
    var $target, doc, docId, docRev, docsById, i, j, len, len1, onComplete, ref, ref1, results;
    if (!confirm("This will permanently remove the other versions, are you sure?")) {
      return;
    }
    this.deletedCount = 0;
    this.toDeleteCount = 0;
    $target = $(event.target);
    docId = $target.attr("data-docId");
    docRev = $target.attr("data-docRev");
    docsById = _.indexBy("_id", this.loadedDocs);
    onComplete = (function(_this) {
      return function(response) {
        _this.deletedCount++;
        if (_this.deletedCount === _this.toDeleteCount) {
          return _this.updateConflicts();
        }
      };
    })(this);
    ref = docsById[docId];
    for (i = 0, len = ref.length; i < len; i++) {
      doc = ref[i];
      if (doc._rev !== docRev) {
        this.toDeleteCount++;
      }
    }
    ref1 = docsById[docId];
    results = [];
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      doc = ref1[j];
      if (doc._rev === docRev) {
        continue;
      }
      results.push(Tangerine.$db.removeDoc({
        "_id": doc._id,
        "_rev": doc._rev
      }, {
        success: (function(_this) {
          return function(response) {
            return onComplete(response);
          };
        })(this),
        error: (function(_this) {
          return function(a, b) {
            return Utils.alert("Error<br>" + a + "<br>" + b);
          };
        })(this)
      }));
    }
    return results;
  };

  AssessmentSyncView.prototype.showDetails = function(event) {
    var $target, docRev;
    $target = $(event.target);
    docRev = $target.attr("data-docRev");
    return this.$el.find("#table_" + docRev).toggleClass("confirmation");
  };

  AssessmentSyncView.prototype.initialize = function(options) {
    this.readyTemplates();
    this.docList = [];
    this.assessment = options.assessment;
    this.dKey = this.assessment.id.substr(-5, 5);
    this.connectionVerified = false;
    this.timer = setTimeout(this.verifyTimeout, 20 * 1000);
    return this.ensureCredentials();
  };

  AssessmentSyncView.prototype.ensureCredentials = function() {
    if (Tangerine.settings.get("server_user") && Tangerine.settings.get("server_pass")) {
      this.user = Tangerine.settings.get("server_user");
      return this.pass = Tangerine.settings.get("server_pass");
    }
  };

  AssessmentSyncView.prototype.goBack = function() {
    return Tangerine.router.landing();
  };

  AssessmentSyncView.prototype.render = function() {
    var connectionBox, name;
    name = this.assessment.getEscapedString("name");
    if (Tangerine.settings.getBoolean("satelliteMode")) {
      connectionBox = "<div class='info_box grey'> Server connection<br> <span id='connection'>" + (this.loginButton({
        status: "Checking..."
      })) + "</span> </div>";
    }
    this.$el.html("<button class='back navigation'>Back</button> <h1>Assessment Sync</h1> <h2>" + name + "</h2> " + (connectionBox || "") + " <br> <div class='loads confirmation'> <div class='menu_box'> <button class='command upload'>Upload</button><br> <button class='command download'>Download</button> </div> </div> <h2>Conflicts</h2> <div id='conflicts'></div>");
    this.updateConflicts();
    return this.trigger("rendered");
  };

  AssessmentSyncView.prototype.afterRender = function() {
    if (this.user && this.pass) {
      return $.ajax({
        url: Tangerine.settings.urlView("group", "byDKey").replace(/\/\/(.*)@/, "//" + this.user + ":" + this.pass + "@"),
        dataType: "jsonp",
        data: {
          keys: ["testtest"]
        },
        timeout: 15000,
        success: (function(_this) {
          return function() {
            clearTimeout(_this.timer);
            return _this.onVerifySuccess();
          };
        })(this)
      });
    } else {
      clearTimeout(this.timer);
      return this.verifyTimeout();
    }
  };

  AssessmentSyncView.prototype.updateConflicts = function() {
    Utils.working(true);
    Tangerine.$db.view(Tangerine.design_doc + "/conflictsByDKey", {
      error: function(a, b) {
        Utils.midAlert("Error<br>" + a + "<br>" + b);
        return Utils.working(false);
      },
      success: (function(_this) {
        return function(response) {
          var i, len, onComplete, row, rows;
          Utils.working(false);
          if (response.rows.length === 0) {
            _this.$el.find("#conflicts").html("<div class='grey'>None</div>");
            return;
          }
          _this.loadedDocs = [];
          rows = _.pluck(response.rows, "value");
          onComplete = function(oneDoc) {
            var combined, differences, doc, docCount, docId, docsById, hKey, html, i, j, key, len, len1, presentables, rev, revCount, total, value;
            _this.loadedDocs.push(oneDoc);
            total = rows.length;
            if (_this.loadedDocs.length !== total) {
              return;
            }
            html = "";
            docsById = _.indexBy("_id", _this.loadedDocs);
            docCount = 1;
            for (docId in docsById) {
              doc = docsById[docId];
              html += "<b>Document Conflict " + docCount + " " + (doc[0].collection.capitalize()) + "</b>";
              combined = {};
              for (i = 0, len = doc.length; i < len; i++) {
                rev = doc[i];
                for (key in rev) {
                  value = rev[key];
                  if (combined[key] == null) {
                    combined[key] = [];
                  }
                  combined[key].push(JSON.stringify(value));
                }
              }
              differences = [];
              for (key in combined) {
                value = combined[key];
                if (_.uniq(value).length > 1) {
                  differences.push(key);
                }
              }
              revCount = 1;
              for (j = 0, len1 = doc.length; j < len1; j++) {
                rev = doc[j];
                presentables = {};
                for (key in rev) {
                  value = rev[key];
                  if (key === '_rev' || key === '_id' || key === 'hash' || key === 'updated' || key === 'editedBy' || key === "assessmentId" || key === "curriculumId") {
                    continue;
                  }
                  presentables[key] = value;
                }
                html += "<div class='menu_box'> <h3>Version " + (revCount++) + "</h3> <table class='conflict_table'> <tr><td><b>" + rev.name + "</b></td><td><button class='command keep' data-docId='" + rev._id + "' data-docRev='" + rev._rev + "'>Keep</button></td></tr> <tr><th>Updated</th><td>" + rev.updated + "</td></tr> <tr><th>Edited by</th><td>" + rev.editedBy + "</td></tr> </table> <button class='command show_details' data-docRev='" + rev._rev + "'>Show details</button> <table class='confirmation conflict_table' id='table_" + rev._rev + "'>";
                for (key in presentables) {
                  value = presentables[key];
                  hKey = indexOf.call(differences, key) >= 0 ? "<b class='conflict_key'>" + key + "</b>" : key;
                  html += "<tr><th>" + hKey + "</th><td>" + (JSON.stringify(value)) + "</td></tr>";
                }
                html += "</table> </div>";
              }
              docCount++;
            }
            return _this.$el.find("#conflicts").html(html);
          };
          for (i = 0, len = rows.length; i < len; i++) {
            row = rows[i];
            $.ajax({
              url: "/" + Tangerine.db_name + "/" + row._id + "?rev=" + row._rev,
              type: "get",
              dataType: "json",
              success: function(doc) {
                return onComplete(doc);
              }
            });
          }
        };
      })(this)
    });
    return {};
  };

  AssessmentSyncView.prototype.onClose = function() {
    return clearTimeout(this.timer);
  };

  AssessmentSyncView.prototype.removeCredentials = function() {
    Tangerine.settings.unset("server_user");
    Tangerine.settings.unset("server_pass");
    return Tangerine.settings.save();
  };

  AssessmentSyncView.prototype.readyTemplates = function() {
    return this.loginButton = _.template("{{status}} <button class='command show_login'>Login</button><br> <div class='confirmation login_box'> <div> <label for='user'>Username</label><input id='user' type='text'><br> <label for='pass'>Password</label><input id='pass' type='password'> <button class='command login'>Login</button> </div> </div>");
  };

  return AssessmentSyncView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2Vzc21lbnQvQXNzZXNzbWVudFN5bmNWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGtCQUFBO0VBQUE7Ozs7O0FBQU07Ozs7Ozs7Ozs7Ozs7K0JBRUosU0FBQSxHQUFXOzsrQkFFWCxNQUFBLEdBQ0U7SUFBQSxhQUFBLEVBQWdCLFFBQWhCO0lBQ0EscUJBQUEsRUFBd0IsYUFEeEI7SUFFQSxhQUFBLEVBQWdCLE1BRmhCO0lBR0EsbUJBQUEsRUFBc0IsV0FIdEI7SUFJQSxjQUFBLEVBQWlCLE9BSmpCO0lBS0EsaUJBQUEsRUFBb0IsVUFMcEI7SUFNQSxlQUFBLEVBQWtCLFFBTmxCOzs7K0JBUUYsUUFBQSxHQUFVLFNBQUE7QUFFUixRQUFBO0lBQUEsSUFBQyxDQUFBLGlCQUFELENBQUE7SUFFQSxPQUFBLEdBQVUsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFuQixDQUF5QixPQUF6QixDQUFpQyxDQUFDLE9BQWxDLENBQTBDLFdBQTFDLEVBQXNELElBQUEsR0FBSyxJQUFDLENBQUEsSUFBTixHQUFXLEdBQVgsR0FBYyxJQUFDLENBQUEsSUFBZixHQUFvQixHQUExRTtJQUNWLE9BQUEsR0FBVSxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQW5CLENBQXlCLE9BQXpCO1dBRVYsSUFBQyxDQUFBLFNBQUQsQ0FBVyxDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUUsTUFBRjtlQUVULENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUixDQUNFLE9BREYsRUFFRSxPQUZGLEVBR0k7VUFBQSxPQUFBLEVBQVMsU0FBQyxRQUFEO1lBQ1AsS0FBSyxDQUFDLFFBQU4sQ0FBZSxrQkFBZjttQkFDQSxLQUFDLENBQUEsZUFBRCxDQUFBO1VBRk8sQ0FBVDtVQUdBLEtBQUEsRUFBTyxTQUFDLENBQUQsRUFBSSxDQUFKO21CQUFlLEtBQUssQ0FBQyxRQUFOLENBQWUsZ0JBQUEsR0FBaUIsQ0FBakIsR0FBbUIsR0FBbkIsR0FBc0IsQ0FBckM7VUFBZixDQUhQ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VWUsUUFBUSxDQUFDIiwiZmlsZSI6ImFzc2Vzc21lbnQvQXNzZXNzbWVudFN5bmNWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgQXNzZXNzbWVudFN5bmNWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZTogXCJBc3Nlc3NtZW50U3luY1ZpZXdcIlxuXG4gIGV2ZW50czpcbiAgICBcImNsaWNrIC5iYWNrXCIgOiBcImdvQmFja1wiXG4gICAgXCJjbGljayAuc2hvd19kZXRhaWxzXCIgOiBcInNob3dEZXRhaWxzXCJcbiAgICBcImNsaWNrIC5rZWVwXCIgOiBcImtlZXBcIlxuICAgIFwiY2xpY2sgLnNob3dfbG9naW5cIiA6IFwic2hvd0xvZ2luXCJcbiAgICBcImNsaWNrIC5sb2dpblwiIDogXCJsb2dpblwiXG4gICAgXCJjbGljayAuZG93bmxvYWRcIiA6IFwiZG93bmxvYWRcIlxuICAgIFwiY2xpY2sgLnVwbG9hZFwiIDogXCJ1cGxvYWRcIlxuXG4gIGRvd25sb2FkOiA9PlxuXG4gICAgQGVuc3VyZUNyZWRlbnRpYWxzKClcblxuICAgIGdyb3VwREIgPSBUYW5nZXJpbmUuc2V0dGluZ3MudXJsREIoXCJncm91cFwiKS5yZXBsYWNlKC9cXC9cXC8oLiopQC8sXCIvLyN7QHVzZXJ9OiN7QHBhc3N9QFwiKVxuICAgIGxvY2FsREIgPSBUYW5nZXJpbmUuc2V0dGluZ3MudXJsREIoXCJsb2NhbFwiKVxuXG4gICAgQGdldERvY0lkcyAoIGRvY0lkcyApID0+XG5cbiAgICAgICQuY291Y2gucmVwbGljYXRlKFxuICAgICAgICBncm91cERCLCAjIGZyb21cbiAgICAgICAgbG9jYWxEQiwgIyB0b1xuICAgICAgICAgIHN1Y2Nlc3M6IChyZXNwb25zZSk9PlxuICAgICAgICAgICAgVXRpbHMubWlkQWxlcnQgXCJEb3dubG9hZCBzdWNjZXNzXCJcbiAgICAgICAgICAgIEB1cGRhdGVDb25mbGljdHMoKVxuICAgICAgICAgIGVycm9yOiAoYSwgYikgICAgICA9PiBVdGlscy5taWRBbGVydCBcIlB1bGwgRXJyb3I8YnI+I3thfSAje2J9XCJcbiAgICAgICAgLFxuICAgICAgICAgIGRvY19pZHM6IGRvY0lkc1xuICAgICAgKVxuXG5cbiAgdXBsb2FkOiA9PlxuXG4gICAgQGVuc3VyZUNyZWRlbnRpYWxzKClcblxuICAgIGdyb3VwREIgPSBUYW5nZXJpbmUuc2V0dGluZ3MudXJsREIoXCJncm91cFwiKS5yZXBsYWNlKC9cXC9cXC8oLiopQC8sXCIvLyN7QHVzZXJ9OiN7QHBhc3N9QFwiKVxuICAgIGxvY2FsREIgPSBUYW5nZXJpbmUuc2V0dGluZ3MudXJsREIoXCJsb2NhbFwiKVxuXG4gICAgQGdldERvY0lkcyAoIGRvY0lkcyApID0+XG5cbiAgICAgICQuY291Y2gucmVwbGljYXRlKFxuICAgICAgICBsb2NhbERCLCAjIGZyb21cbiAgICAgICAgZ3JvdXBEQiwgIyB0b1xuICAgICAgICAgIHN1Y2Nlc3M6IChyZXNwb25zZSk9PlxuICAgICAgICAgICAgVXRpbHMubWlkQWxlcnQgXCJVcGxvYWQgc3VjY2Vzc1wiXG4gICAgICAgICAgICBAdXBkYXRlQ29uZmxpY3RzKClcbiAgICAgICAgICBlcnJvcjogKGEsIGIpICAgICAgPT4gVXRpbHMubWlkQWxlcnQgXCJQdWxsIEVycm9yPGJyPiN7YX0gI3tifVwiXG4gICAgICAgICxcbiAgICAgICAgICBkb2NfaWRzOiBkb2NJZHNcbiAgICAgIClcblxuICBnZXREb2NJZHM6IChjYWxsYmFjaykgPT5cblxuICAgIGdyb3VwREIgPSBUYW5nZXJpbmUuc2V0dGluZ3MudXJsREIoXCJncm91cFwiKS5yZXBsYWNlKC9cXC9cXC8oLiopQC8sXCIvL1wiKVxuICAgIHRhcmdldERCID0gVGFuZ2VyaW5lLnNldHRpbmdzLnVybERCKFwibG9jYWxcIilcblxuICAgIGxvY2FsREtleSA9IFRhbmdlcmluZS5zZXR0aW5ncy51cmxWaWV3KFwibG9jYWxcIiwgXCJieURLZXlcIilcbiAgICBncm91cERLZXkgPSAoVGFuZ2VyaW5lLnNldHRpbmdzLmxvY2F0aW9uLmdyb3VwLmRiK1RhbmdlcmluZS5zZXR0aW5ncy5jb3VjaC52aWV3ICsgXCJieURLZXlcIikucmVwbGFjZSgvXFwvXFwvKC4qKUAvLFwiLy9cIilcblxuICAgICQuYWpheFxuICAgICAgdXJsOiBncm91cERLZXlcbiAgICAgIHR5cGU6IFwiR0VUXCJcbiAgICAgIGRhdGFUeXBlOiBcImpzb25wXCJcbiAgICAgIGRhdGE6IGtleXM6IEpTT04uc3RyaW5naWZ5KFtAZEtleV0pXG4gICAgICBlcnJvcjogKGEsIGIpID0+IFV0aWxzLm1pZEFsZXJ0IFwiUHVsbCBlcnJvcjxicj4je2F9ICN7Yn1cIlxuICAgICAgc3VjY2VzczogKGRhdGEpID0+XG4gICAgICAgIGRvY0xpc3QgPSBbXVxuICAgICAgICBmb3IgZGF0dW0gaW4gZGF0YS5yb3dzXG4gICAgICAgICAgZG9jTGlzdC5wdXNoIGRhdHVtLmlkXG5cbiAgICAgICAgJC5hamF4XG4gICAgICAgICAgdXJsOiBsb2NhbERLZXlcbiAgICAgICAgICB0eXBlOiBcIlBPU1RcIlxuICAgICAgICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIlxuICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KGtleXM6W0BkS2V5XSlcbiAgICAgICAgICBlcnJvcjogKGEsIGIpID0+IFV0aWxzLm1pZEFsZXJ0IFwiUHVsbCBlcnJvcjxicj4je2F9ICN7Yn1cIlxuICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PlxuICAgICAgICAgICAgZm9yIGRhdHVtIGluIGRhdGEucm93c1xuICAgICAgICAgICAgICBkb2NMaXN0LnB1c2ggZGF0dW0uaWRcbiAgICAgICAgICAgIGRvY0xpc3QgPSBfLnVuaXEoZG9jTGlzdClcbiAgICAgICAgICAgIGNhbGxiYWNrIGRvY0xpc3RcblxuXG4gIHNob3dMb2dpbjogLT5cbiAgICBAJGVsLmZpbmQoXCIjdXNlclwiKS52YWwoXCJcIilcbiAgICBAJGVsLmZpbmQoXCIjcGFzc1wiKS52YWwoXCJcIilcbiAgICBAJGVsLmZpbmQoXCIubG9naW5fYm94XCIpLnRvZ2dsZUNsYXNzIFwiY29uZmlybWF0aW9uXCJcbiAgICBAJGVsLmZpbmQoXCIuc2hvd19sb2dpblwiKS50b2dnbGUoKVxuXG4gIG9uVmVyaWZ5U3VjY2VzczogPT5cbiAgICBjbGVhclRpbWVvdXQgQHRpbWVyXG4gICAgQGNvbm5lY3Rpb25WZXJpZmllZCA9IHRydWVcbiAgICBAJGVsLmZpbmQoXCIjY29ubmVjdGlvblwiKS5odG1sKFwiT2tcIilcbiAgICBAJGVsLmZpbmQoXCIuc2hvd19sb2dpblwiKS50b2dnbGUoKVxuXG4gICAgQCRlbC5maW5kKFwiLmxvYWRzXCIpLnJlbW92ZUNsYXNzKFwiY29uZmlybWF0aW9uXCIpXG5cbiAgbG9naW46IC0+XG4gICAgQHVzZXIgPSBAJGVsLmZpbmQoXCIjdXNlclwiKS52YWwoKVxuICAgIEBwYXNzID0gQCRlbC5maW5kKFwiI3Bhc3NcIikudmFsKClcbiAgICBUYW5nZXJpbmUuc2V0dGluZ3Muc2F2ZVxuICAgICAgXCJzZXJ2ZXJfdXNlclwiIDogQHVzZXJcbiAgICAgIFwic2VydmVyX3Bhc3NcIiA6IEBwYXNzXG5cbiAgICBUYW5nZXJpbmUudXNlci5naG9zdExvZ2luKEB1c2VyLCBAcGFzcylcblxuICB2ZXJpZnlUaW1lb3V0OiA9PlxuICAgIEAkZWwuZmluZChcIiNjb25uZWN0aW9uXCIpLmh0bWwgQGxvZ2luQnV0dG9uKHN0YXR1czpcIjxicj5GYWlsZWQuIENoZWNrIGNvbm5lY3Rpb24gb3IgdHJ5IGFnYWluLlwiKVxuICAgIEAkZWwuZmluZChcIi5sb2Fkc1wiKS5hZGRDbGFzcyhcImNvbmZpcm1hdGlvblwiKVxuICAgIEByZW1vdmVDcmVkZW50aWFscygpXG5cbiAga2VlcDogKGV2ZW50KSAtPlxuXG4gICAgcmV0dXJuIHVubGVzcyBjb25maXJtIFwiVGhpcyB3aWxsIHBlcm1hbmVudGx5IHJlbW92ZSB0aGUgb3RoZXIgdmVyc2lvbnMsIGFyZSB5b3Ugc3VyZT9cIlxuXG4gICAgQGRlbGV0ZWRDb3VudCA9IDBcbiAgICBAdG9EZWxldGVDb3VudCA9IDBcbiAgICAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpXG5cbiAgICBkb2NJZCAgPSAkdGFyZ2V0LmF0dHIoXCJkYXRhLWRvY0lkXCIpXG4gICAgZG9jUmV2ID0gJHRhcmdldC5hdHRyKFwiZGF0YS1kb2NSZXZcIilcblxuICAgIGRvY3NCeUlkID0gXy5pbmRleEJ5IFwiX2lkXCIsIEBsb2FkZWREb2NzXG5cbiAgICBvbkNvbXBsZXRlID0gKHJlc3BvbnNlKSA9PlxuICAgICAgQGRlbGV0ZWRDb3VudCsrXG5cbiAgICAgIEB1cGRhdGVDb25mbGljdHMoKSBpZiBAZGVsZXRlZENvdW50ID09IEB0b0RlbGV0ZUNvdW50XG5cbiAgICBmb3IgZG9jIGluIGRvY3NCeUlkW2RvY0lkXVxuICAgICAgQHRvRGVsZXRlQ291bnQrKyB1bmxlc3MgZG9jLl9yZXYgPT0gZG9jUmV2XG5cbiAgICBmb3IgZG9jIGluIGRvY3NCeUlkW2RvY0lkXVxuXG4gICAgICBjb250aW51ZSBpZiBkb2MuX3JldiA9PSBkb2NSZXZcblxuICAgICAgVGFuZ2VyaW5lLiRkYi5yZW1vdmVEb2NcbiAgICAgICAgXCJfaWRcIiAgOiBkb2MuX2lkXG4gICAgICAgIFwiX3JldlwiIDogZG9jLl9yZXZcbiAgICAgICxcbiAgICAgICAgc3VjY2VzczogKHJlc3BvbnNlKSA9PiBvbkNvbXBsZXRlIHJlc3BvbnNlXG4gICAgICAgIGVycm9yOiAoYSwgYikgPT5cbiAgICAgICAgICBVdGlscy5hbGVydCBcIkVycm9yPGJyPiN7YX08YnI+I3tifVwiXG5cbiAgc2hvd0RldGFpbHM6IChldmVudCkgLT5cbiAgICAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpXG4gICAgZG9jUmV2ID0gJHRhcmdldC5hdHRyKFwiZGF0YS1kb2NSZXZcIilcbiAgICBAJGVsLmZpbmQoXCIjdGFibGVfI3tkb2NSZXZ9XCIpLnRvZ2dsZUNsYXNzIFwiY29uZmlybWF0aW9uXCJcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cblxuICAgIEByZWFkeVRlbXBsYXRlcygpXG5cbiAgICBAZG9jTGlzdCA9IFtdXG5cbiAgICBAYXNzZXNzbWVudCA9IG9wdGlvbnMuYXNzZXNzbWVudFxuXG4gICAgQGRLZXkgPSBAYXNzZXNzbWVudC5pZC5zdWJzdHIoLTUsIDUpXG5cbiAgICBAY29ubmVjdGlvblZlcmlmaWVkID0gZmFsc2VcblxuICAgIEB0aW1lciA9IHNldFRpbWVvdXQgQHZlcmlmeVRpbWVvdXQsIDIwICogMTAwMFxuXG4gICAgQGVuc3VyZUNyZWRlbnRpYWxzKClcblxuXG4gIGVuc3VyZUNyZWRlbnRpYWxzOiA9PlxuICAgIGlmIFRhbmdlcmluZS5zZXR0aW5ncy5nZXQoXCJzZXJ2ZXJfdXNlclwiKSAmJiBUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KFwic2VydmVyX3Bhc3NcIilcbiAgICAgIEB1c2VyID0gVGFuZ2VyaW5lLnNldHRpbmdzLmdldChcInNlcnZlcl91c2VyXCIpXG4gICAgICBAcGFzcyA9IFRhbmdlcmluZS5zZXR0aW5ncy5nZXQoXCJzZXJ2ZXJfcGFzc1wiKVxuXG5cbiAgZ29CYWNrOiAtPlxuICAgIFRhbmdlcmluZS5yb3V0ZXIubGFuZGluZygpXG5cbiAgcmVuZGVyOiAtPlxuXG4gICAgbmFtZSA9IEBhc3Nlc3NtZW50LmdldEVzY2FwZWRTdHJpbmcoXCJuYW1lXCIpXG5cbiAgICBjb25uZWN0aW9uQm94ID0gXCJcbiAgICAgIDxkaXYgY2xhc3M9J2luZm9fYm94IGdyZXknPlxuICAgICAgICBTZXJ2ZXIgY29ubmVjdGlvbjxicj5cbiAgICAgICAgPHNwYW4gaWQ9J2Nvbm5lY3Rpb24nPiN7QGxvZ2luQnV0dG9uKHtzdGF0dXM6XCJDaGVja2luZy4uLlwifSl9PC9zcGFuPlxuICAgICAgPC9kaXY+XG4gICAgXCIgaWYgVGFuZ2VyaW5lLnNldHRpbmdzLmdldEJvb2xlYW4oXCJzYXRlbGxpdGVNb2RlXCIpXG5cbiAgICBAJGVsLmh0bWwgXCJcblxuICAgICAgPGJ1dHRvbiBjbGFzcz0nYmFjayBuYXZpZ2F0aW9uJz5CYWNrPC9idXR0b24+XG5cbiAgICAgIDxoMT5Bc3Nlc3NtZW50IFN5bmM8L2gxPlxuXG4gICAgICA8aDI+I3tuYW1lfTwvaDI+XG5cbiAgICAgICN7Y29ubmVjdGlvbkJveCB8fCBcIlwifVxuICAgICAgPGJyPlxuICAgICAgPGRpdiBjbGFzcz0nbG9hZHMgY29uZmlybWF0aW9uJz5cbiAgICAgICAgPGRpdiBjbGFzcz0nbWVudV9ib3gnPlxuICAgICAgICAgIDxidXR0b24gY2xhc3M9J2NvbW1hbmQgdXBsb2FkJz5VcGxvYWQ8L2J1dHRvbj48YnI+XG4gICAgICAgICAgPGJ1dHRvbiBjbGFzcz0nY29tbWFuZCBkb3dubG9hZCc+RG93bmxvYWQ8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxoMj5Db25mbGljdHM8L2gyPlxuICAgICAgPGRpdiBpZD0nY29uZmxpY3RzJz48L2Rpdj5cblxuICAgIFwiXG5cbiAgICBAdXBkYXRlQ29uZmxpY3RzKClcblxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuXG4gIGFmdGVyUmVuZGVyOiAtPlxuICAgIGlmIEB1c2VyIGFuZCBAcGFzc1xuICAgICAgJC5hamF4XG4gICAgICAgIHVybDogVGFuZ2VyaW5lLnNldHRpbmdzLnVybFZpZXcoXCJncm91cFwiLCBcImJ5REtleVwiKS5yZXBsYWNlKC9cXC9cXC8oLiopQC8sXCIvLyN7QHVzZXJ9OiN7QHBhc3N9QFwiKVxuICAgICAgICBkYXRhVHlwZTogXCJqc29ucFwiXG4gICAgICAgIGRhdGE6IGtleXM6IFtcInRlc3R0ZXN0XCJdXG4gICAgICAgIHRpbWVvdXQ6IDE1MDAwXG4gICAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgICAgY2xlYXJUaW1lb3V0IEB0aW1lclxuICAgICAgICAgIEBvblZlcmlmeVN1Y2Nlc3MoKVxuICAgIGVsc2VcbiAgICAgIGNsZWFyVGltZW91dCBAdGltZXJcbiAgICAgIEB2ZXJpZnlUaW1lb3V0KClcblxuXG4gIHVwZGF0ZUNvbmZsaWN0czogLT5cblxuICAgIFV0aWxzLndvcmtpbmcgdHJ1ZVxuICAgIFRhbmdlcmluZS4kZGIudmlldyBcIiN7VGFuZ2VyaW5lLmRlc2lnbl9kb2N9L2NvbmZsaWN0c0J5REtleVwiLFxuICAgICAgZXJyb3I6IChhLCBiKSAtPiBVdGlscy5taWRBbGVydCBcIkVycm9yPGJyPiN7YX08YnI+I3tifVwiOyBVdGlscy53b3JraW5nIGZhbHNlXG4gICAgICBzdWNjZXNzOiAocmVzcG9uc2UpID0+XG4gICAgICAgIFV0aWxzLndvcmtpbmcgZmFsc2VcblxuICAgICAgICBpZiByZXNwb25zZS5yb3dzLmxlbmd0aCA9PSAwXG4gICAgICAgICAgQCRlbC5maW5kKFwiI2NvbmZsaWN0c1wiKS5odG1sIFwiPGRpdiBjbGFzcz0nZ3JleSc+Tm9uZTwvZGl2PlwiXG4gICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgQGxvYWRlZERvY3MgPSBbXVxuXG4gICAgICAgIHJvd3MgPSBfLnBsdWNrKHJlc3BvbnNlLnJvd3MsIFwidmFsdWVcIilcblxuICAgICAgICBvbkNvbXBsZXRlID0gKG9uZURvYykgPT5cbiAgICAgICAgICBAbG9hZGVkRG9jcy5wdXNoIG9uZURvY1xuICAgICAgICAgIHRvdGFsID0gcm93cy5sZW5ndGhcbiAgICAgICAgICByZXR1cm4gdW5sZXNzIEBsb2FkZWREb2NzLmxlbmd0aCA9PSB0b3RhbFxuXG4gICAgICAgICAgaHRtbCA9IFwiXCJcbiAgICAgICAgICBkb2NzQnlJZCA9IF8uaW5kZXhCeSBcIl9pZFwiLCBAbG9hZGVkRG9jc1xuXG4gICAgICAgICAgZG9jQ291bnQgPSAxXG4gICAgICAgICAgZm9yIGRvY0lkLCBkb2Mgb2YgZG9jc0J5SWRcblxuICAgICAgICAgICAgaHRtbCArPSBcIlxuICAgICAgICAgICAgICA8Yj5Eb2N1bWVudCBDb25mbGljdCAje2RvY0NvdW50fSAje2RvY1swXS5jb2xsZWN0aW9uLmNhcGl0YWxpemUoKX08L2I+XG4gICAgICAgICAgICBcIlxuXG4gICAgICAgICAgICBjb21iaW5lZCA9IHt9XG4gICAgICAgICAgICBmb3IgcmV2IGluIGRvY1xuICAgICAgICAgICAgICBmb3Iga2V5LCB2YWx1ZSBvZiByZXZcbiAgICAgICAgICAgICAgICBjb21iaW5lZFtrZXldID0gW10gaWYgbm90IGNvbWJpbmVkW2tleV0/XG4gICAgICAgICAgICAgICAgY29tYmluZWRba2V5XS5wdXNoIEpTT04uc3RyaW5naWZ5KHZhbHVlKVxuXG4gICAgICAgICAgICBkaWZmZXJlbmNlcyA9IFtdXG4gICAgICAgICAgICBmb3Iga2V5LCB2YWx1ZSBvZiBjb21iaW5lZFxuICAgICAgICAgICAgICBkaWZmZXJlbmNlcy5wdXNoKGtleSkgaWYgXy51bmlxKHZhbHVlKS5sZW5ndGggPiAxXG5cbiAgICAgICAgICAgIHJldkNvdW50ID0gMVxuICAgICAgICAgICAgZm9yIHJldiBpbiBkb2NcbiAgICAgICAgICAgICAgcHJlc2VudGFibGVzID0ge31cbiAgICAgICAgICAgICAgZm9yIGtleSwgdmFsdWUgb2YgcmV2XG4gICAgICAgICAgICAgICAgY29udGludWUgaWYga2V5IGluIFsnX3JldicsICdfaWQnLCdoYXNoJywndXBkYXRlZCcsJ2VkaXRlZEJ5JywgXCJhc3Nlc3NtZW50SWRcIiwgXCJjdXJyaWN1bHVtSWRcIl1cbiAgICAgICAgICAgICAgICBwcmVzZW50YWJsZXNba2V5XSA9IHZhbHVlXG4gICAgICAgICAgICAgIGh0bWwgKz0gXCJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz0nbWVudV9ib3gnPlxuICAgICAgICAgICAgICAgIDxoMz5WZXJzaW9uICN7cmV2Q291bnQrK308L2gzPlxuICAgICAgICAgICAgICAgIDx0YWJsZSBjbGFzcz0nY29uZmxpY3RfdGFibGUnPlxuICAgICAgICAgICAgICAgICAgPHRyPjx0ZD48Yj4je3Jldi5uYW1lfTwvYj48L3RkPjx0ZD48YnV0dG9uIGNsYXNzPSdjb21tYW5kIGtlZXAnIGRhdGEtZG9jSWQ9JyN7cmV2Ll9pZH0nIGRhdGEtZG9jUmV2PScje3Jldi5fcmV2fSc+S2VlcDwvYnV0dG9uPjwvdGQ+PC90cj5cbiAgICAgICAgICAgICAgICAgIDx0cj48dGg+VXBkYXRlZDwvdGg+PHRkPiN7cmV2LnVwZGF0ZWR9PC90ZD48L3RyPlxuICAgICAgICAgICAgICAgICAgPHRyPjx0aD5FZGl0ZWQgYnk8L3RoPjx0ZD4je3Jldi5lZGl0ZWRCeX08L3RkPjwvdHI+XG4gICAgICAgICAgICAgICAgPC90YWJsZT5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSdjb21tYW5kIHNob3dfZGV0YWlscycgZGF0YS1kb2NSZXY9JyN7cmV2Ll9yZXZ9Jz5TaG93IGRldGFpbHM8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8dGFibGUgY2xhc3M9J2NvbmZpcm1hdGlvbiBjb25mbGljdF90YWJsZScgaWQ9J3RhYmxlXyN7cmV2Ll9yZXZ9Jz5cbiAgICAgICAgICAgICAgICBcIlxuICAgICAgICAgICAgICBmb3Iga2V5LCB2YWx1ZSBvZiBwcmVzZW50YWJsZXNcbiAgICAgICAgICAgICAgICBoS2V5ID1cbiAgICAgICAgICAgICAgICAgIGlmIGtleSBpbiBkaWZmZXJlbmNlc1xuICAgICAgICAgICAgICAgICAgICBcIjxiIGNsYXNzPSdjb25mbGljdF9rZXknPiN7a2V5fTwvYj5cIlxuICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBrZXlcbiAgICAgICAgICAgICAgICBodG1sICs9IFwiPHRyPjx0aD4je2hLZXl9PC90aD48dGQ+I3tKU09OLnN0cmluZ2lmeSh2YWx1ZSl9PC90ZD48L3RyPlwiXG4gICAgICAgICAgICAgIGh0bWwgKz0gXCJcbiAgICAgICAgICAgICAgICA8L3RhYmxlPlxuICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICBcIlxuXG5cbiAgICAgICAgICAgIGRvY0NvdW50KytcblxuICAgICAgICAgIEAkZWwuZmluZChcIiNjb25mbGljdHNcIikuaHRtbCBodG1sXG5cbiAgICAgICAgZm9yIHJvdyBpbiByb3dzXG4gICAgICAgICAgJC5hamF4XG4gICAgICAgICAgICB1cmw6IFwiLyN7VGFuZ2VyaW5lLmRiX25hbWV9LyN7cm93Ll9pZH0/cmV2PSN7cm93Ll9yZXZ9XCJcbiAgICAgICAgICAgIHR5cGU6IFwiZ2V0XCJcbiAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgICAgICAgc3VjY2VzczogKGRvYykgLT4gb25Db21wbGV0ZSBkb2NcblxuXG4gICAgICAgIHJldHVyblxuXG5cbiAgICByZXR1cm4ge31cblxuICBvbkNsb3NlOiAtPlxuICAgIGNsZWFyVGltZW91dCBAdGltZXJcblxuICByZW1vdmVDcmVkZW50aWFsczogLT5cbiAgICBUYW5nZXJpbmUuc2V0dGluZ3MudW5zZXQoXCJzZXJ2ZXJfdXNlclwiKVxuICAgIFRhbmdlcmluZS5zZXR0aW5ncy51bnNldChcInNlcnZlcl9wYXNzXCIpXG4gICAgVGFuZ2VyaW5lLnNldHRpbmdzLnNhdmUoKVxuXG4gIHJlYWR5VGVtcGxhdGVzOiAtPlxuICAgIEBsb2dpbkJ1dHRvbiA9IF8udGVtcGxhdGUoXCJ7e3N0YXR1c319XG4gICAgPGJ1dHRvbiBjbGFzcz0nY29tbWFuZCBzaG93X2xvZ2luJz5Mb2dpbjwvYnV0dG9uPjxicj5cbiAgICA8ZGl2IGNsYXNzPSdjb25maXJtYXRpb24gbG9naW5fYm94Jz5cbiAgICAgIDxkaXY+XG4gICAgICAgIDxsYWJlbCBmb3I9J3VzZXInPlVzZXJuYW1lPC9sYWJlbD48aW5wdXQgaWQ9J3VzZXInIHR5cGU9J3RleHQnPjxicj5cbiAgICAgICAgPGxhYmVsIGZvcj0ncGFzcyc+UGFzc3dvcmQ8L2xhYmVsPjxpbnB1dCBpZD0ncGFzcycgdHlwZT0ncGFzc3dvcmQnPlxuICAgICAgICA8YnV0dG9uIGNsYXNzPSdjb21tYW5kIGxvZ2luJz5Mb2dpbjwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIFwiKVxuIl19
