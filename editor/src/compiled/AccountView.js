var AccountView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

AccountView = (function(superClass) {
  extend(AccountView, superClass);

  function AccountView() {
    this.renderGroups = bind(this.renderGroups, this);
    return AccountView.__super__.constructor.apply(this, arguments);
  }

  AccountView.prototype.className = "AccountView";

  AccountView.prototype.events = {
    'click .leave': 'leaveGroup',
    'click .join_cancel': 'joinToggle',
    'click .join': 'joinToggle',
    'click .join_group': 'join',
    'click .back': 'goBack',
    'click .update': 'update',
    'click .restart': 'restart',
    'click .send_debug': 'sendDebug',
    "click .edit_in_place": "editInPlace",
    "focusout .editing": "editing",
    "keyup    .editing": "editing",
    "keydown  .editing": "editing",
    'click .change_password': "togglePassword",
    'click .confirm_password': "saveNewPassword"
  };

  AccountView.prototype.togglePassword = function() {
    var $menu;
    $menu = this.$el.find(".password_menu");
    $menu.toggle();
    if ($menu.is(":visible")) {
      return this.$el.find("#new_password").focus().scrollTo();
    }
  };

  AccountView.prototype.saveNewPassword = function() {
    var pass;
    pass = this.$el.find(".new_password").val();
    Tangerine.user.setPassword(pass);
    return Tangerine.user.save(null, {
      success: (function(_this) {
        return function() {
          _this.$el.find(".new_password").val('');
          _this.togglePassword();
          return Utils.midAlert("Password changed");
        };
      })(this)
    });
  };

  AccountView.prototype.sendDebug = function() {
    return Tangerine.$db.view(Tangerine.design_doc + "/byCollection", {
      keys: ["teacher", "klass", "student", "config", "settings"],
      success: function(response) {
        var docId, saveReport;
        docId = "debug-report-" + (Tangerine.settings.get('instanceId'));
        saveReport = function(response, oldRev, docId) {
          var doc;
          if (oldRev == null) {
            oldRev = null;
          }
          doc = {
            _id: docId,
            _rev: oldRev,
            docs: _.pluck(response.rows, "value"),
            collection: "debug_report"
          };
          if (doc._rev == null) {
            delete doc._rev;
          }
          return Tangerine.$db.saveDoc(doc, {
            success: function() {
              return $.couch.replicate(Tangerine.db_name, Tangerine.settings.urlDB("group"), {
                success: function() {
                  return Utils.sticky("Debug report sent", "Ok");
                }
              }, {
                doc_ids: [docId]
              });
            }
          });
        };
        return Tangerine.$db.openDoc(docId, {
          success: function(oldDoc) {
            return saveReport(response, oldDoc._rev, docId);
          },
          error: function(error) {
            return saveReport(response, null, docId);
          }
        });
      }
    });
  };

  AccountView.prototype.update = function() {
    var doResolve;
    doResolve = this.$el.find("#attempt_resolve").is(":checked");
    return Utils.updateTangerine(doResolve);
  };

  AccountView.prototype.restart = function() {
    return Utils.restartTangerine();
  };

  AccountView.prototype.goBack = function() {
    return Tangerine.router.navigate("groups", true);
  };

  AccountView.prototype.joinToggle = function() {
    this.$el.find(".join, .join_confirmation").fadeToggle(0);
    return this.$el.find("#group_name").val("");
  };

  AccountView.prototype.join = function() {
    var group;
    group = this.$el.find("#group_name").val().databaseSafetyDance();
    if (group.length === 0) {
      return;
    }
    return this.user.joinGroup(group, (function(_this) {
      return function() {
        return _this.joinToggle();
      };
    })(this));
  };

  AccountView.prototype.leaveGroup = function(event) {
    var group;
    group = $(event.target).parent().attr('data-group');
    return this.user.leaveGroup(group);
  };

  AccountView.prototype.initialize = function(options) {
    var models;
    this.user = options.user;
    this.teacher = options.teacher;
    models = [];
    if (this.user != null) {
      models.push(this.user);
    }
    if (this.teacher != null) {
      models.push(this.teacher);
    }
    this.models = new Backbone.Collection(models);
    return this.listenTo(this.user, "groups-update", this.renderGroups);
  };

  AccountView.prototype.renderGroups = function() {
    var groupLi, html;
    groupLi = function(group) {
      return "<li data-group='" + (_.escape(group)) + "'>" + group + " <button class='command leave'>Leave</button></li>";
    };
    html = "<ul>";
    html += this.user.groups().admin.map(function(g) {
      return groupLi(g);
    }).join('');
    html += this.user.groups().member.map(function(g) {
      return groupLi(g);
    }).join('');
    html += "</ul>";
    return this.$el.find("#group_wrapper").html(html);
  };

  AccountView.prototype.render = function() {
    var groupSection, html, userEdits;
    groupSection = "<section> <div class='label_value'> <label>Groups</label> <div id='group_wrapper'></div> <button class='command join'>Join or create a group</button> <div class='confirmation join_confirmation'> <div class='menu_box'> <input id='group_name' placeholder='Group name'> <div class='small_grey'>Please be specific.<br> Good examples: malawi_jun_2012, mike_test_group_2012, egra_group_aug-2012<br> Bad examples: group, test, mine</div><br> <button class='command join_group'>Join Group</button> <button class='command join_cancel'>Cancel</button> </div> </div> </section>";
    userEdits = this.getEditableRow({
      key: "email",
      name: "Email"
    }, this.user) + this.getEditableRow({
      key: "first",
      name: "First name"
    }, this.user) + this.getEditableRow({
      key: "last",
      name: "Last name"
    }, this.user);
    html = "<button class='back navigation'>Back</button> <h1>Manage</h1> <section> <h2>Account</h2> <table class='class_table'> <tr> <td style='color:black'>Name</td> <td style='color:black'>" + (this.user.name()) + "</td> </tr> " + (userEdits || '') + " </table> </section> " + (groupSection || "") + " </div>";
    this.$el.html(html);
    this.renderGroups();
    return this.trigger("rendered");
  };

  AccountView.prototype.getEditableRow = function(prop, model) {
    return "<tr><td>" + prop.name + "</td><td>" + (this.getEditable(prop, model)) + "</td></tr>";
  };

  AccountView.prototype.getEditable = function(prop, model) {
    var editOrNot, numberOrNot, value;
    value = prop.key != null ? model.get(prop.key) : "&nbsp;";
    value = prop.escape ? model.escape(prop.key) : value;
    if ((value == null) || _.isEmptyString(value)) {
      value = "not set";
    }
    editOrNot = prop.editable ? "class='edit_in_place'" : "";
    numberOrNot = _.isNumber(value) ? "data-isNumber='true'" : "data-isNumber='false'";
    return "<div class='edit_in_place'><span data-modelId='" + model.id + "' data-key='" + prop.key + "' data-value='" + value + "' data-name='" + prop.name + "' " + editOrNot + " " + numberOrNot + ">" + value + "</div></div>";
  };

  AccountView.prototype.editInPlace = function(event) {
    var $span, $target, $td, $textarea, classes, guid, isNumber, key, margins, model, modelId, name, oldValue, transferVariables;
    if (this.alreadyEditing) {
      return;
    }
    this.alreadyEditing = true;
    $span = $(event.target);
    $td = $span.parent();
    this.$oldSpan = $span.clone();
    if ($span.hasClass("editing")) {
      return;
    }
    guid = Utils.guid();
    key = $span.attr("data-key");
    name = $span.attr("data-name");
    isNumber = $span.attr("data-isNumber") === "true";
    modelId = $span.attr("data-modelId");
    model = this.models.get(modelId);
    oldValue = model.get(key) || "";
    if (oldValue === "not set") {
      oldValue = "";
    }
    $target = $(event.target);
    classes = ($target.attr("class") || "").replace("settings", "");
    margins = $target.css("margin");
    transferVariables = "data-isNumber='" + isNumber + "' data-key='" + key + "' data-modelId='" + modelId + "' ";
    $td.html("<textarea placeholder='" + name + "' id='" + guid + "' rows='" + (1 + oldValue.count("\n")) + "' " + transferVariables + " class='editing " + classes + "' style='margin:" + margins + "' data-name='" + name + "'>" + oldValue + "</textarea>");
    $textarea = $("#" + guid);
    return $textarea.focus();
  };

  AccountView.prototype.editing = function(event) {
    var $target, $td, attributes, isNumber, key, model, modelId, name, newValue, oldValue;
    $target = $(event.target);
    $td = $target.parent();
    if (event.which === 27 || event.type === "focusout") {
      $target.remove();
      $td.html(this.$oldSpan);
      this.alreadyEditing = false;
      return;
    }
    if (!(event.which === 13 && event.type === "keydown")) {
      return true;
    }
    this.alreadyEditing = false;
    key = $target.attr("data-key");
    isNumber = $target.attr("data-isNumber") === "true";
    modelId = $target.attr("data-modelId");
    name = $target.attr("data-name");
    model = this.models.get(modelId);
    oldValue = model.get(key);
    newValue = $target.val();
    newValue = isNumber ? parseInt(newValue) : newValue;
    if (String(newValue) !== String(oldValue)) {
      attributes = {};
      attributes[key] = newValue;
      model.save(attributes, {
        success: (function(_this) {
          return function() {
            Utils.midAlert(name + " saved");
            return model.fetch({
              success: function() {
                if (_this.updateDisplay != null) {
                  return _this.updateDisplay();
                } else {
                  return _this.render();
                }
              }
            });
          };
        })(this),
        error: (function(_this) {
          return function() {
            return model.fetch({
              success: function() {
                if (_this.updateDisplay != null) {
                  _this.updateDisplay();
                } else {
                  _this.render();
                }
                return alert("Please try to save again, it didn't work that time.");
              }
            });
          };
        })(this)
      });
    }
    return false;
  };

  AccountView.prototype.goBack = function() {
    return window.history.back();
  };

  return AccountView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInVzZXIvQWNjb3VudFZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsV0FBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7O3dCQUVKLFNBQUEsR0FBVzs7d0JBRVgsTUFBQSxHQUNFO0lBQUEsY0FBQSxFQUF1QixZQUF2QjtJQUNBLG9CQUFBLEVBQXVCLFlBRHZCO0lBRUEsYUFBQSxFQUF1QixZQUZ2QjtJQUdBLG1CQUFBLEVBQXVCLE1BSHZCO0lBSUEsYUFBQSxFQUF1QixRQUp2QjtJQUtBLGVBQUEsRUFBa0IsUUFMbEI7SUFNQSxnQkFBQSxFQUFtQixTQU5uQjtJQU9BLG1CQUFBLEVBQXNCLFdBUHRCO0lBU0Esc0JBQUEsRUFBMEIsYUFUMUI7SUFVQSxtQkFBQSxFQUFzQixTQVZ0QjtJQVdBLG1CQUFBLEVBQXNCLFNBWHRCO0lBWUEsbUJBQUEsRUFBc0IsU0FadEI7SUFjQSx3QkFBQSxFQUEyQixnQkFkM0I7SUFlQSx5QkFBQSxFQUE0QixpQkFmNUI7Ozt3QkFpQkYsY0FBQSxHQUFnQixTQUFBO0FBQ2QsUUFBQTtJQUFBLEtBQUEsR0FBUSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxnQkFBVjtJQUNSLEtBQUssQ0FBQyxNQUFOLENBQUE7SUFDQSxJQUFHLEtBQUssQ0FBQyxFQUFOLENBQVMsVUFBVCxDQUFIO2FBQ0UsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsZUFBVixDQUEwQixDQUFDLEtBQTNCLENBQUEsQ0FBa0MsQ0FBQyxRQUFuQyxDQUFBLEVBREY7O0VBSGM7O3dCQU9oQixlQUFBLEdBQWlCLFNBQUE7QUFDZixRQUFBO0lBQUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGVBQVYsQ0FBMEIsQ0FBQyxHQUEzQixDQUFBO0lBQ1AsU0FBUyxDQUFDLElBQUksQ0FBQyxXQUFmLENBQTJCLElBQTNCO1dBQ0EsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFmLENBQW9CLElBQXBCLEVB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VDthQURGO1VBREs7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBUlA7T0FERixFQUhGOztBQXdCQSxXQUFPO0VBdkRBOzt3QkF5RFQsTUFBQSxHQUFRLFNBQUE7V0FDTixNQUFNLENBQUMsT0FBTyxDQUFDLElBQWYsQ0FBQTtFQURNOzs7O0dBM1JnQixRQUFRLENBQUMiLCJmaWxlIjoidXNlci9BY2NvdW50Vmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEFjY291bnRWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZTogXCJBY2NvdW50Vmlld1wiXG5cbiAgZXZlbnRzOlxuICAgICdjbGljayAubGVhdmUnICAgICAgIDogJ2xlYXZlR3JvdXAnXG4gICAgJ2NsaWNrIC5qb2luX2NhbmNlbCcgOiAnam9pblRvZ2dsZSdcbiAgICAnY2xpY2sgLmpvaW4nICAgICAgICA6ICdqb2luVG9nZ2xlJ1xuICAgICdjbGljayAuam9pbl9ncm91cCcgIDogJ2pvaW4nXG4gICAgJ2NsaWNrIC5iYWNrJyAgICAgICAgOiAnZ29CYWNrJ1xuICAgICdjbGljayAudXBkYXRlJyA6ICd1cGRhdGUnXG4gICAgJ2NsaWNrIC5yZXN0YXJ0JyA6ICdyZXN0YXJ0J1xuICAgICdjbGljayAuc2VuZF9kZWJ1ZycgOiAnc2VuZERlYnVnJ1xuXG4gICAgXCJjbGljayAuZWRpdF9pbl9wbGFjZVwiICA6IFwiZWRpdEluUGxhY2VcIlxuICAgIFwiZm9jdXNvdXQgLmVkaXRpbmdcIiA6IFwiZWRpdGluZ1wiXG4gICAgXCJrZXl1cCAgICAuZWRpdGluZ1wiIDogXCJlZGl0aW5nXCJcbiAgICBcImtleWRvd24gIC5lZGl0aW5nXCIgOiBcImVkaXRpbmdcIlxuXG4gICAgJ2NsaWNrIC5jaGFuZ2VfcGFzc3dvcmQnIDogXCJ0b2dnbGVQYXNzd29yZFwiXG4gICAgJ2NsaWNrIC5jb25maXJtX3Bhc3N3b3JkJyA6IFwic2F2ZU5ld1Bhc3N3b3JkXCJcblxuICB0b2dnbGVQYXNzd29yZDogLT5cbiAgICAkbWVudSA9IEAkZWwuZmluZChcIi5wYXNzd29yZF9tZW51XCIpXG4gICAgJG1lbnUudG9nZ2xlKClcbiAgICBpZiAkbWVudS5pcyhcIjp2aXNpYmxlXCIpXG4gICAgICBAJGVsLmZpbmQoXCIjbmV3X3Bhc3N3b3JkXCIpLmZvY3VzKCkuc2Nyb2xsVG8oKVxuXG5cbiAgc2F2ZU5ld1Bhc3N3b3JkOiAtPlxuICAgIHBhc3MgPSBAJGVsLmZpbmQoXCIubmV3X3Bhc3N3b3JkXCIpLnZhbCgpXG4gICAgVGFuZ2VyaW5lLnVzZXIuc2V0UGFzc3dvcmQocGFzcylcbiAgICBUYW5nZXJpbmUudXNlci5zYXZlIG51bGwsXG4gICAgICBzdWNjZXNzOiA9PlxuICAgICAgICBAJGVsLmZpbmQoXCIubmV3X3Bhc3N3b3JkXCIpLnZhbCgnJylcbiAgICAgICAgQHRvZ2dsZVBhc3N3b3JkKClcbiAgICAgICAgVXRpbHMubWlkQWxlcnQgXCJQYXNzd29yZCBjaGFuZ2VkXCJcblxuXG4gIHNlbmREZWJ1ZzogLT5cbiAgICBUYW5nZXJpbmUuJGRiLnZpZXcgXCIje1RhbmdlcmluZS5kZXNpZ25fZG9jfS9ieUNvbGxlY3Rpb25cIlxuICAgICxcblxuICAgICAga2V5czogW1widGVhY2hlclwiLCBcImtsYXNzXCIsIFwic3R1ZGVudFwiLCBcImNvbmZpZ1wiLCBcInNldHRpbmdzXCJdXG5cbiAgICAgIHN1Y2Nlc3M6IChyZXNwb25zZSkgLT5cblxuICAgICAgICBkb2NJZCA9IFwiZGVidWctcmVwb3J0LSN7VGFuZ2VyaW5lLnNldHRpbmdzLmdldCgnaW5zdGFuY2VJZCcpfVwiXG5cbiAgICAgICAgc2F2ZVJlcG9ydCA9IChyZXNwb25zZSwgb2xkUmV2ID0gbnVsbCwgZG9jSWQpIC0+XG4gICAgICAgICAgZG9jID1cbiAgICAgICAgICAgIF9pZCAgICAgICAgOiBkb2NJZFxuICAgICAgICAgICAgX3JldiAgICAgICA6IG9sZFJldlxuICAgICAgICAgICAgZG9jcyAgICAgICA6IF8ucGx1Y2socmVzcG9uc2Uucm93cyxcInZhbHVlXCIpXG4gICAgICAgICAgICBjb2xsZWN0aW9uIDogXCJkZWJ1Z19yZXBvcnRcIlxuXG4gICAgICAgICAgZGVsZXRlIGRvYy5fcmV2IHVubGVzcyBkb2MuX3Jldj9cblxuICAgICAgICAgIFRhbmdlcmluZS4kZGIuc2F2ZURvYyBkb2MsXG4gICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAkLmNvdWNoLnJlcGxpY2F0ZSBUYW5nZXJpbmUuZGJfbmFtZSwgVGFuZ2VyaW5lLnNldHRpbmdzLnVybERCKFwiZ3JvdXBcIiksXG4gICAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICAgIFV0aWxzLnN0aWNreSBcIkRlYnVnIHJlcG9ydCBzZW50XCIsIFwiT2tcIlxuICAgICAgICAgICAgICAsXG4gICAgICAgICAgICAgICAgZG9jX2lkczogW2RvY0lkXVxuXG5cbiAgICAgICAgVGFuZ2VyaW5lLiRkYi5vcGVuRG9jIGRvY0lkLFxuICAgICAgICAgIHN1Y2Nlc3M6IChvbGREb2MpIC0+XG4gICAgICAgICAgICBzYXZlUmVwb3J0IHJlc3BvbnNlLCBvbGREb2MuX3JldiwgZG9jSWRcbiAgICAgICAgICBlcnJvcjogKGVycm9yKSAtPlxuICAgICAgICAgICAgc2F2ZVJlcG9ydCByZXNwb25zZSwgbnVsbCwgZG9jSWRcblxuXG4gIHVwZGF0ZTogLT5cbiAgICBkb1Jlc29sdmUgPSBAJGVsLmZpbmQoXCIjYXR0ZW1wdF9yZXNvbHZlXCIpLmlzKFwiOmNoZWNrZWRcIilcblxuICAgIFV0aWxzLnVwZGF0ZVRhbmdlcmluZShkb1Jlc29sdmUpXG5cbiAgcmVzdGFydDogLT5cbiAgICBVdGlscy5yZXN0YXJ0VGFuZ2VyaW5lKClcblxuICBnb0JhY2s6IC0+XG4gICAgVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcImdyb3Vwc1wiLCB0cnVlXG5cbiAgam9pblRvZ2dsZTogLT5cbiAgICBAJGVsLmZpbmQoXCIuam9pbiwgLmpvaW5fY29uZmlybWF0aW9uXCIpLmZhZGVUb2dnbGUoMClcbiAgICBAJGVsLmZpbmQoXCIjZ3JvdXBfbmFtZVwiKS52YWwgXCJcIlxuXG4gIGpvaW46IC0+XG4gICAgZ3JvdXAgPSBAJGVsLmZpbmQoXCIjZ3JvdXBfbmFtZVwiKS52YWwoKS5kYXRhYmFzZVNhZmV0eURhbmNlKClcbiAgICByZXR1cm4gaWYgZ3JvdXAubGVuZ3RoID09IDBcbiAgICBAdXNlci5qb2luR3JvdXAgZ3JvdXAsID0+XG4gICAgICBAam9pblRvZ2dsZSgpXG5cbiAgbGVhdmVHcm91cDogKGV2ZW50KSAtPlxuICAgIGdyb3VwID0gJChldmVudC50YXJnZXQpLnBhcmVudCgpLmF0dHIoJ2RhdGEtZ3JvdXAnKVxuICAgIEB1c2VyLmxlYXZlR3JvdXAgZ3JvdXBcblxuICBpbml0aWFsaXplOiAoIG9wdGlvbnMgKSAtPlxuXG4gICAgQHVzZXIgPSBvcHRpb25zLnVzZXJcbiAgICBAdGVhY2hlciA9IG9wdGlvbnMudGVhY2hlclxuXG4gICAgbW9kZWxzID0gW11cbiAgICBtb2RlbHMucHVzaCBAdXNlciBpZiBAdXNlcj9cbiAgICBtb2RlbHMucHVzaCBAdGVhY2hlciBpZiBAdGVhY2hlcj9cblxuICAgIEBtb2RlbHMgPSBuZXcgQmFja2JvbmUuQ29sbGVjdGlvbihtb2RlbHMpXG4gICAgQGxpc3RlblRvIEB1c2VyLCBcImdyb3Vwcy11cGRhdGVcIiwgQHJlbmRlckdyb3Vwc1xuXG4gIHJlbmRlckdyb3VwczogPT5cbiAgICBncm91cExpID0gKGdyb3VwKSAtPiBcIjxsaSBkYXRhLWdyb3VwPScje18uZXNjYXBlKGdyb3VwKX0nPiN7Z3JvdXB9IDxidXR0b24gY2xhc3M9J2NvbW1hbmQgbGVhdmUnPkxlYXZlPC9idXR0b24+PC9saT5cIlxuICAgIGh0bWwgPSBcIjx1bD5cIlxuICAgIGh0bWwgKz0gQHVzZXIuZ3JvdXBzKCkuYWRtaW4ubWFwKChnKSAtPiBncm91cExpKGcpKS5qb2luKCcnKVxuICAgIGh0bWwgKz0gQHVzZXIuZ3JvdXBzKCkubWVtYmVyLm1hcCgoZykgLT4gZ3JvdXBMaShnKSkuam9pbignJylcbiAgICBodG1sICs9IFwiPC91bD5cIlxuICAgIEAkZWwuZmluZChcIiNncm91cF93cmFwcGVyXCIpLmh0bWwgaHRtbFxuXG4gIHJlbmRlcjogLT5cblxuICAgIGdyb3VwU2VjdGlvbiA9IFwiXG4gICAgICA8c2VjdGlvbj5cbiAgICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICAgIDxsYWJlbD5Hcm91cHM8L2xhYmVsPlxuICAgICAgICAgIDxkaXYgaWQ9J2dyb3VwX3dyYXBwZXInPjwvZGl2PlxuICAgICAgICAgIDxidXR0b24gY2xhc3M9J2NvbW1hbmQgam9pbic+Sm9pbiBvciBjcmVhdGUgYSBncm91cDwvYnV0dG9uPlxuICAgICAgICAgIDxkaXYgY2xhc3M9J2NvbmZpcm1hdGlvbiBqb2luX2NvbmZpcm1hdGlvbic+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPSdtZW51X2JveCc+XG4gICAgICAgICAgICAgIDxpbnB1dCBpZD0nZ3JvdXBfbmFtZScgcGxhY2Vob2xkZXI9J0dyb3VwIG5hbWUnPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSdzbWFsbF9ncmV5Jz5QbGVhc2UgYmUgc3BlY2lmaWMuPGJyPlxuICAgICAgICAgICAgICBHb29kIGV4YW1wbGVzOiBtYWxhd2lfanVuXzIwMTIsIG1pa2VfdGVzdF9ncm91cF8yMDEyLCBlZ3JhX2dyb3VwX2F1Zy0yMDEyPGJyPlxuICAgICAgICAgICAgICBCYWQgZXhhbXBsZXM6IGdyb3VwLCB0ZXN0LCBtaW5lPC9kaXY+PGJyPlxuICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSdjb21tYW5kIGpvaW5fZ3JvdXAnPkpvaW4gR3JvdXA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0nY29tbWFuZCBqb2luX2NhbmNlbCc+Q2FuY2VsPC9idXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgIFwiXG5cbiAgICB1c2VyRWRpdHMgPVxuICAgICAgQGdldEVkaXRhYmxlUm93KHtrZXk6XCJlbWFpbFwiLCBuYW1lOlwiRW1haWxcIn0sIEB1c2VyKSArXG4gICAgICBAZ2V0RWRpdGFibGVSb3coe2tleTpcImZpcnN0XCIsIG5hbWU6XCJGaXJzdCBuYW1lXCJ9LCBAdXNlcikgK1xuICAgICAgQGdldEVkaXRhYmxlUm93KHtrZXk6XCJsYXN0XCIsIG5hbWU6XCJMYXN0IG5hbWVcIn0sIEB1c2VyKVxuXG4gICAgaHRtbCA9IFwiXG4gICAgICA8YnV0dG9uIGNsYXNzPSdiYWNrIG5hdmlnYXRpb24nPkJhY2s8L2J1dHRvbj5cbiAgICAgIDxoMT5NYW5hZ2U8L2gxPlxuXG4gICAgICA8c2VjdGlvbj5cbiAgICAgICAgPGgyPkFjY291bnQ8L2gyPlxuICAgICAgICAgIDx0YWJsZSBjbGFzcz0nY2xhc3NfdGFibGUnPlxuICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICA8dGQgc3R5bGU9J2NvbG9yOmJsYWNrJz5OYW1lPC90ZD5cbiAgICAgICAgICAgICAgPHRkIHN0eWxlPSdjb2xvcjpibGFjayc+I3tAdXNlci5uYW1lKCl9PC90ZD5cbiAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAje3VzZXJFZGl0cyB8fCAnJ31cbiAgICAgICAgICA8L3RhYmxlPlxuICAgICAgPC9zZWN0aW9uPlxuICAgICAgI3tncm91cFNlY3Rpb24gfHwgXCJcIn1cbiAgICAgIDwvZGl2PlxuICAgIFwiXG5cbiAgICBAJGVsLmh0bWwgaHRtbFxuICAgIEByZW5kZXJHcm91cHMoKVxuXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG5cblxuICBnZXRFZGl0YWJsZVJvdzogKHByb3AsIG1vZGVsKSAtPlxuICAgIFwiPHRyPjx0ZD4je3Byb3AubmFtZX08L3RkPjx0ZD4je0BnZXRFZGl0YWJsZShwcm9wLCBtb2RlbCl9PC90ZD48L3RyPlwiXG5cbiAgZ2V0RWRpdGFibGU6IChwcm9wLCBtb2RlbCkgLT5cblxuICAgICMgY29vayB0aGUgdmFsdWVcbiAgICB2YWx1ZSA9IGlmIHByb3Aua2V5PyAgIHRoZW4gbW9kZWwuZ2V0KHByb3Aua2V5KSAgICBlbHNlIFwiJm5ic3A7XCJcbiAgICB2YWx1ZSA9IGlmIHByb3AuZXNjYXBlIHRoZW4gbW9kZWwuZXNjYXBlKHByb3Aua2V5KSBlbHNlIHZhbHVlXG4gICAgdmFsdWUgPSBcIm5vdCBzZXRcIiBpZiBub3QgdmFsdWU/IG9yIF8uaXNFbXB0eVN0cmluZyh2YWx1ZSlcblxuICAgICMgd2hhdCBpcyBpdFxuICAgIGVkaXRPck5vdCAgID0gaWYgcHJvcC5lZGl0YWJsZSB0aGVuIFwiY2xhc3M9J2VkaXRfaW5fcGxhY2UnXCIgZWxzZSBcIlwiXG5cbiAgICBudW1iZXJPck5vdCA9IGlmIF8uaXNOdW1iZXIodmFsdWUpIHRoZW4gXCJkYXRhLWlzTnVtYmVyPSd0cnVlJ1wiIGVsc2UgXCJkYXRhLWlzTnVtYmVyPSdmYWxzZSdcIlxuXG4gICAgcmV0dXJuIFwiPGRpdiBjbGFzcz0nZWRpdF9pbl9wbGFjZSc+PHNwYW4gZGF0YS1tb2RlbElkPScje21vZGVsLmlkfScgZGF0YS1rZXk9JyN7cHJvcC5rZXl9JyBkYXRhLXZhbHVlPScje3ZhbHVlfScgZGF0YS1uYW1lPScje3Byb3AubmFtZX0nICN7ZWRpdE9yTm90fSAje251bWJlck9yTm90fT4je3ZhbHVlfTwvZGl2PjwvZGl2PlwiXG5cblxuICBlZGl0SW5QbGFjZTogKGV2ZW50KSAtPlxuXG4gICAgcmV0dXJuIGlmIEBhbHJlYWR5RWRpdGluZ1xuICAgIEBhbHJlYWR5RWRpdGluZyA9IHRydWVcblxuICAgICMgc2F2ZSBzdGF0ZVxuICAgICMgcmVwbGFjZSB3aXRoIHRleHQgYXJlYVxuICAgICMgb24gc2F2ZSwgc2F2ZSBhbmQgcmUtcmVwbGFjZVxuICAgICRzcGFuID0gJChldmVudC50YXJnZXQpXG5cbiAgICAkdGQgID0gJHNwYW4ucGFyZW50KClcblxuICAgIEAkb2xkU3BhbiA9ICRzcGFuLmNsb25lKClcblxuICAgIHJldHVybiBpZiAkc3Bhbi5oYXNDbGFzcyhcImVkaXRpbmdcIilcblxuICAgIGd1aWQgICAgID0gVXRpbHMuZ3VpZCgpXG5cbiAgICBrZXkgICAgICA9ICRzcGFuLmF0dHIoXCJkYXRhLWtleVwiKVxuICAgIG5hbWUgICAgID0gJHNwYW4uYXR0cihcImRhdGEtbmFtZVwiKVxuICAgIGlzTnVtYmVyID0gJHNwYW4uYXR0cihcImRhdGEtaXNOdW1iZXJcIikgPT0gXCJ0cnVlXCJcblxuICAgIG1vZGVsSWQgID0gJHNwYW4uYXR0cihcImRhdGEtbW9kZWxJZFwiKVxuICAgIG1vZGVsICAgID0gQG1vZGVscy5nZXQobW9kZWxJZClcbiAgICBvbGRWYWx1ZSA9IG1vZGVsLmdldChrZXkpIHx8IFwiXCJcbiAgICBvbGRWYWx1ZSA9IFwiXCIgaWYgb2xkVmFsdWUgPT0gXCJub3Qgc2V0XCJcblxuICAgICR0YXJnZXQgPSAkKGV2ZW50LnRhcmdldClcbiAgICBjbGFzc2VzID0gKCR0YXJnZXQuYXR0cihcImNsYXNzXCIpIHx8IFwiXCIpLnJlcGxhY2UoXCJzZXR0aW5nc1wiLFwiXCIpXG4gICAgbWFyZ2lucyA9ICR0YXJnZXQuY3NzKFwibWFyZ2luXCIpXG5cbiAgICB0cmFuc2ZlclZhcmlhYmxlcyA9IFwiZGF0YS1pc051bWJlcj0nI3tpc051bWJlcn0nIGRhdGEta2V5PScje2tleX0nIGRhdGEtbW9kZWxJZD0nI3ttb2RlbElkfScgXCJcblxuICAgICMgc2V0cyB3aWR0aC9oZWlnaHQgd2l0aCBzdHlsZSBhdHRyaWJ1dGVcbiAgICAkdGQuaHRtbChcIjx0ZXh0YXJlYSBwbGFjZWhvbGRlcj0nI3tuYW1lfScgaWQ9JyN7Z3VpZH0nIHJvd3M9JyN7MStvbGRWYWx1ZS5jb3VudChcIlxcblwiKX0nICN7dHJhbnNmZXJWYXJpYWJsZXN9IGNsYXNzPSdlZGl0aW5nICN7Y2xhc3Nlc30nIHN0eWxlPSdtYXJnaW46I3ttYXJnaW5zfScgZGF0YS1uYW1lPScje25hbWV9Jz4je29sZFZhbHVlfTwvdGV4dGFyZWE+XCIpXG4gICAgIyBzdHlsZT0nd2lkdGg6I3tvbGRXaWR0aH1weDsgaGVpZ2h0OiAje29sZEhlaWdodH1weDsnXG4gICAgJHRleHRhcmVhID0gJChcIiMje2d1aWR9XCIpXG4gICAgJHRleHRhcmVhLmZvY3VzKClcblxuICBlZGl0aW5nOiAoZXZlbnQpIC0+XG5cbiAgICAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpXG4gICAgJHRkID0gJHRhcmdldC5wYXJlbnQoKVxuXG4gICAgaWYgZXZlbnQud2hpY2ggPT0gMjcgb3IgZXZlbnQudHlwZSA9PSBcImZvY3Vzb3V0XCJcbiAgICAgICR0YXJnZXQucmVtb3ZlKClcbiAgICAgICR0ZC5odG1sKEAkb2xkU3BhbilcbiAgICAgIEBhbHJlYWR5RWRpdGluZyA9IGZhbHNlXG4gICAgICByZXR1cm5cblxuICAgICMgYWN0IG5vcm1hbCwgdW5sZXNzIGl0J3MgYW4gZW50ZXIga2V5IG9uIGtleWRvd25cbiAgICByZXR1cm4gdHJ1ZSB1bmxlc3MgZXZlbnQud2hpY2ggPT0gMTMgYW5kIGV2ZW50LnR5cGUgPT0gXCJrZXlkb3duXCJcblxuICAgICNyZXR1cm4gdHJ1ZSBpZiBldmVudC53aGljaCA9PSAxMyBhbmQgZXZlbnQuYWx0S2V5XG5cbiAgICBAYWxyZWFkeUVkaXRpbmcgPSBmYWxzZVxuXG4gICAga2V5ICAgICAgICA9ICR0YXJnZXQuYXR0cihcImRhdGEta2V5XCIpXG4gICAgaXNOdW1iZXIgICA9ICR0YXJnZXQuYXR0cihcImRhdGEtaXNOdW1iZXJcIikgPT0gXCJ0cnVlXCJcblxuICAgIG1vZGVsSWQgICAgPSAkdGFyZ2V0LmF0dHIoXCJkYXRhLW1vZGVsSWRcIilcbiAgICBuYW1lICAgICAgID0gJHRhcmdldC5hdHRyKFwiZGF0YS1uYW1lXCIpXG5cbiAgICBtb2RlbCAgICAgID0gQG1vZGVscy5nZXQobW9kZWxJZClcbiAgICBvbGRWYWx1ZSAgID0gbW9kZWwuZ2V0KGtleSlcblxuICAgIG5ld1ZhbHVlID0gJHRhcmdldC52YWwoKVxuICAgIG5ld1ZhbHVlID0gaWYgaXNOdW1iZXIgdGhlbiBwYXJzZUludChuZXdWYWx1ZSkgZWxzZSBuZXdWYWx1ZVxuXG4gICAgIyBJZiB0aGVyZSB3YXMgYSBjaGFuZ2UsIHNhdmUgaXRcbiAgICBpZiBTdHJpbmcobmV3VmFsdWUpICE9IFN0cmluZyhvbGRWYWx1ZSlcbiAgICAgIGF0dHJpYnV0ZXMgPSB7fVxuICAgICAgYXR0cmlidXRlc1trZXldID0gbmV3VmFsdWVcbiAgICAgIG1vZGVsLnNhdmUgYXR0cmlidXRlcyxcbiAgICAgICAgc3VjY2VzczogPT5cbiAgICAgICAgICBVdGlscy5taWRBbGVydCBcIiN7bmFtZX0gc2F2ZWRcIlxuICAgICAgICAgIG1vZGVsLmZldGNoXG4gICAgICAgICAgICBzdWNjZXNzOiA9PlxuICAgICAgICAgICAgICBpZiBAdXBkYXRlRGlzcGxheT9cbiAgICAgICAgICAgICAgICBAdXBkYXRlRGlzcGxheSgpXG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAcmVuZGVyKClcbiAgICAgICAgZXJyb3I6ID0+XG4gICAgICAgICAgbW9kZWwuZmV0Y2hcbiAgICAgICAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgICAgICAgIGlmIEB1cGRhdGVEaXNwbGF5P1xuICAgICAgICAgICAgICAgIEB1cGRhdGVEaXNwbGF5KClcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEByZW5kZXIoKVxuICAgICAgICAgICAgICAjIGlkZWFsbHkgd2Ugd291bGRuJ3QgaGF2ZSB0byBzYXZlIHRoaXMgYnV0IGNvbmZsaWN0cyBoYXBwZW4gc29tZXRpbWVzXG4gICAgICAgICAgICAgICMgQFRPRE8gbWFrZSB0aGUgbW9kZWwgdHJ5IGFnYWluIHdoZW4gdW5zdWNjZXNzZnVsLlxuICAgICAgICAgICAgICBhbGVydCBcIlBsZWFzZSB0cnkgdG8gc2F2ZSBhZ2FpbiwgaXQgZGlkbid0IHdvcmsgdGhhdCB0aW1lLlwiXG5cbiAgICAjIHRoaXMgZW5zdXJlcyB3ZSBkbyBub3QgaW5zZXJ0IGEgbmV3bGluZSBjaGFyYWN0ZXIgd2hlbiB3ZSBwcmVzcyBlbnRlclxuICAgIHJldHVybiBmYWxzZVxuXG4gIGdvQmFjazogLT5cbiAgICB3aW5kb3cuaGlzdG9yeS5iYWNrKClcbiJdfQ==
