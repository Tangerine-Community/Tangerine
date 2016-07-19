var KlassesView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KlassesView = (function(superClass) {
  extend(KlassesView, superClass);

  function KlassesView() {
    this.render = bind(this.render, this);
    this.onSubviewRendered = bind(this.onSubviewRendered, this);
    this.updatePullResult = bind(this.updatePullResult, this);
    this.updatePull = bind(this.updatePull, this);
    this.updateUploader = bind(this.updateUploader, this);
    return KlassesView.__super__.constructor.apply(this, arguments);
  }

  KlassesView.prototype.className = "KlassesView";

  KlassesView.prototype.events = {
    'click .klass_add': 'toggleAddForm',
    'click .klass_cancel': 'toggleAddForm',
    'click .klass_save': 'saveNewKlass',
    'click .klass_curricula': 'gotoCurricula',
    'click .goto_class': 'gotoKlass',
    'click .pull_data': 'pullData',
    'click .verify': 'ghostLogin',
    'click .upload_data': 'uploadData'
  };

  KlassesView.prototype.initialize = function(options) {
    var verReq;
    this.ipBlock = 32;
    this.totalIps = 256;
    this.tabletOffset = 0;
    this.views = [];
    this.klasses = options.klasses;
    this.curricula = options.curricula;
    this.teachers = options.teachers;
    this.klasses.on("add remove change", this.render);
    if (Tangerine.user.isAdmin()) {
      this.timer = setTimeout((function(_this) {
        return function() {
          return _this.updateUploader(false);
        };
      })(this), 20 * 1000);
      return verReq = $.ajax({
        url: Tangerine.settings.urlView("group", "byDKey"),
        dataType: "jsonp",
        data: {
          keys: ["testtest"]
        },
        timeout: 5000,
        success: (function(_this) {
          return function() {
            clearTimeout(_this.timer);
            return _this.updateUploader(true);
          };
        })(this)
      });
    }
  };

  KlassesView.prototype.ghostLogin = function() {
    return Tangerine.user.ghostLogin(Tangerine.settings.upUser, Tangerine.settings.upPass);
  };

  KlassesView.prototype.uploadData = function() {
    return $.ajax({
      "url": "/" + Tangerine.db_name + "/_design/tangerine/_view/byCollection?include_docs=false",
      "type": "POST",
      "dataType": "json",
      "contentType": "application/json;charset=utf-8",
      "data": JSON.stringify({
        include_docs: false,
        keys: ['result', 'klass', 'student', 'teacher', 'logs', 'user']
      }),
      "success": (function(_this) {
        return function(data) {
          var docList;
          docList = _.pluck(data.rows, "id");
          return $.couch.replicate(Tangerine.settings.urlDB("local"), Tangerine.settings.urlDB("group"), {
            success: function() {
              return Utils.midAlert("Sync successful");
            },
            error: function(a, b) {
              return Utils.midAlert("Sync error<br>" + a + " " + b);
            }
          }, {
            doc_ids: docList
          });
        };
      })(this)
    });
  };

  KlassesView.prototype.updateUploader = function(status) {
    var html;
    html = status === true ? "<button class='upload_data command'>Upload</button>" : status === false ? "<div class='menu_box'><small>No connection</small><br><button class='command verify'>Verify connection</button></div>" : "<button class='command' disabled='disabled'>Verifying connection...</button>";
    return this.$el.find(".uploader").html(html);
  };

  KlassesView.prototype.pullData = function() {
    if (this.tabletOffset === 0) {
      this.tablets = {
        checked: 0,
        complete: 0,
        successful: 0,
        okCount: 0,
        ips: [],
        result: 0
      };
      Utils.midAlert("Please wait, detecting tablets.");
    }
    Utils.working(true);
    this.randomIdDoc = hex_sha1("" + Math.random());
    return Tangerine.$db.saveDoc({
      "_id": this.randomIdDoc
    }, {
      success: (function(_this) {
        return function(doc) {
          var i, local, ref, ref1, results;
          _this.randomDoc = doc;
          results = [];
          for (local = i = ref = _this.tabletOffset, ref1 = (_this.ipBlock - 1) + _this.tabletOffset; ref <= ref1 ? i <= ref1 : i >= ref1; local = ref <= ref1 ? ++i : --i) {
            results.push((function(local) {
              var ip, req;
              ip = Tangerine.settings.subnetIP(local);
              req = $.ajax({
                url: Tangerine.settings.urlSubnet(ip),
                dataType: "jsonp",
                contentType: "application/json;charset=utf-8",
                timeout: 10000
              });
              return req.complete(function(xhr, error) {
                _this.tablets.checked++;
                if (parseInt(xhr.status) === 200) {
                  _this.tablets.okCount++;
                  _this.tablets.ips.push(ip);
                }
                return _this.updatePull();
              });
            })(local));
          }
          return results;
        };
      })(this),
      error: function() {
        Utils.working(false);
        return Utils.midAlert("Internal database error");
      }
    });
  };

  KlassesView.prototype.updatePull = function() {
    var i, ip, len, ref, results;
    if (this.tablets.checked < this.ipBlock + this.tabletOffset) {
      return;
    }
    if (this.tabletOffset !== this.totalIps - this.ipBlock) {
      this.tabletOffset += this.ipBlock;
      return this.pullData();
    } else {
      this.tablets.okCount = Math.max(this.tablets.okCount - 1, 0);
      if (this.tablets.okCount === 0) {
        this.tabletOffset = 0;
        Utils.working(false);
        Utils.midAlert(this.tablets.okCount + " tablets found.");
        Tangerine.$db.removeDoc({
          "_id": this.randomDoc.id,
          "_rev": this.randomDoc.rev
        });
        return;
      }
      if (!confirm(this.tablets.okCount + " tablets found.\n\nStart data pull?")) {
        this.tabletOffset = 0;
        Utils.working(false);
        Tangerine.$db.removeDoc({
          "_id": this.randomDoc.id,
          "_rev": this.randomDoc.rev
        });
        return;
      }
      Utils.midAlert("Pulling from " + this.tablets.okCount + " tablets.");
      ref = this.tablets.ips;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        ip = ref[i];
        results.push((function(_this) {
          return function(ip) {
            var selfReq;
            selfReq = $.ajax({
              "url": Tangerine.settings.urlSubnet(ip) + "/" + _this.randomIdDoc,
              "dataType": "jsonp",
              "timeout": 10000,
              "contentType": "application/json;charset=utf-8"
            });
            selfReq.success(function(data, xhr, error) {});
            return selfReq.complete(function(xhr, error) {
              return (function(xhr) {
                var viewReq;
                if (parseInt(xhr.status) === 200) {
                  return;
                }
                viewReq = $.ajax({
                  "url": Tangerine.settings.urlSubnet(ip) + "/_design/tangerine/_view/byCollection",
                  "dataType": "jsonp",
                  "contentType": "application/json;charset=utf-8",
                  "data": {
                    include_docs: false,
                    keys: JSON.stringify(['result', 'klass', 'student', 'curriculum', 'teacher', 'logs'])
                  }
                });
                return viewReq.success(function(data) {
                  var datum, docList;
                  docList = (function() {
                    var j, len1, ref1, results1;
                    ref1 = data.rows;
                    results1 = [];
                    for (j = 0, len1 = ref1.length; j < len1; j++) {
                      datum = ref1[j];
                      results1.push(datum.id);
                    }
                    return results1;
                  })();
                  return $.couch.replicate(Tangerine.settings.urlSubnet(ip), Tangerine.settings.urlDB("local"), {
                    success: function() {
                      _this.tablets.complete++;
                      _this.tablets.successful++;
                      return _this.updatePullResult();
                    },
                    error: function(a, b) {
                      _this.tablets.complete++;
                      return _this.updatePullResult();
                    }
                  }, {
                    doc_ids: docList
                  });
                });
              })(xhr);
            });
          };
        })(this)(ip));
      }
      return results;
    }
  };

  KlassesView.prototype.updatePullResult = function() {
    if (this.tablets.complete === this.tablets.okCount) {
      Utils.working(false);
      Utils.midAlert("Pull finished.<br>" + this.tablets.successful + " out of " + this.tablets.okCount + " successful.", 5000);
      Tangerine.$db.removeDoc({
        "_id": this.randomDoc.id,
        "_rev": this.randomDoc.rev
      });
      return this.klasses.fetch({
        success: (function(_this) {
          return function() {
            return _this.renderKlasses();
          };
        })(this)
      });
    }
  };

  KlassesView.prototype.gotoCurricula = function() {
    return Tangerine.router.navigate("curricula", true);
  };

  KlassesView.prototype.saveNewKlass = function() {
    var curriculum, errors, grade, i, klass, len, ref, schoolName, stream, teacherId, year;
    schoolName = $.trim(this.$el.find("#school_name").val());
    year = $.trim(this.$el.find("#year").val());
    grade = $.trim(this.$el.find("#grade").val());
    stream = $.trim(this.$el.find("#stream").val());
    curriculum = this.$el.find("#curriculum option:selected").attr("data-id");
    errors = [];
    if (schoolName === "") {
      errors.push(" - No school name.");
    }
    if (year === "") {
      errors.push(" - No year.");
    }
    if (grade === "") {
      errors.push(" - No grade.");
    }
    if (stream === "") {
      errors.push(" - No stream.");
    }
    if (curriculum === "_none") {
      errors.push(" - No curriculum selected.");
    }
    ref = this.klasses.models;
    for (i = 0, len = ref.length; i < len; i++) {
      klass = ref[i];
      if (klass.get("year") === year && klass.get("grade") === grade && klass.get("stream") === stream) {
        errors.push(" - Duplicate year, grade, stream.");
      }
    }
    if (errors.length === 0) {
      teacherId = Tangerine.user.has("teacherId") ? Tangerine.user.get("teacherId") : "admin";
      klass = new Klass;
      return klass.save({
        teacherId: teacherId,
        schoolName: schoolName,
        year: year,
        grade: grade,
        stream: stream,
        curriculumId: this.$el.find("#curriculum option:selected").attr("data-id"),
        startDate: (new Date()).getTime()
      }, {
        success: (function(_this) {
          return function() {
            return _this.klasses.add(klass);
          };
        })(this)
      });
    } else {
      return alert("Please correct the following errors:\n\n" + (errors.join('\n')));
    }
  };

  KlassesView.prototype.gotoKlass = function(event) {
    return Tangerine.router.navigate("class/edit/" + $(event.target).attr("data-id"));
  };

  KlassesView.prototype.toggleAddForm = function() {
    var schoolName;
    this.$el.find("#add_form, .add").toggle();
    if (!Tangerine.user.isAdmin()) {
      schoolName = this.teachers.get(Tangerine.user.get("teacherId")).get("school");
      this.$el.find("#school_name").val(schoolName);
      this.$el.find("#year").focus();
    } else {
      this.$el.find("#school_name").focus();
    }
    if (this.$el.find("#add_form").is(":visible")) {
      return this.$el.find("#add_form").scrollTo();
    }
  };

  KlassesView.prototype.renderKlasses = function() {
    var $ul, i, klass, len, ref, view;
    this.closeViews();
    $ul = $("<ul>").addClass("klass_list");
    ref = this.klasses.models;
    for (i = 0, len = ref.length; i < len; i++) {
      klass = ref[i];
      view = new KlassListElementView({
        klass: klass,
        curricula: this.curricula
      });
      view.on("rendered", this.onSubviewRendered);
      view.render();
      this.views.push(view);
      $ul.append(view.el);
    }
    this.$el.find("#klass_list_wrapper").empty();
    return this.$el.find("#klass_list_wrapper").append($ul);
  };

  KlassesView.prototype.onSubviewRendered = function() {
    return this.trigger("subRendered");
  };

  KlassesView.prototype.render = function() {
    var curricula, curriculaOptionList, i, len, ref;
    curriculaOptionList = "<option data-id='_none' disabled='disabled' selected='selected'>" + (t('select a curriculum')) + "</option>";
    ref = this.curricula.models;
    for (i = 0, len = ref.length; i < len; i++) {
      curricula = ref[i];
      curriculaOptionList += "<option data-id='" + curricula.id + "'>" + (curricula.get('name')) + "</option>";
    }
    this.$el.html((adminPanel || "") + " <h1>" + (t('classes')) + "</h1> <div id='klass_list_wrapper'></div> <button class='klass_add command'>" + (t('add')) + "</button> <div id='add_form' class='confirmation'> <div class='menu_box'> <div class='label_value'> <label for='school_name'>School name</label> <input id='school_name'> </div> <div class='label_value'> <label for='year'>School year</label> <input id='year'> </div> <div class='label_value'> <label for='grade'>" + (t('grade')) + "</label> <input id='grade'> </div> <div class='label_value'> <label for='stream'>" + (t('stream')) + "</label> <input id='stream'> </div> <div class='label_value'> <label for='curriculum'>" + (t('curriculum')) + "</label><br> <select id='curriculum'>" + curriculaOptionList + "</select> </div> <button class='command klass_save'>" + (t('save')) + "</button><button class='command klass_cancel'>" + (t('cancel')) + "</button> </div> </div> " + (curriculaButton || ''));
    if (Tangerine.user.isAdmin()) {
      this.updateUploader();
    }
    this.renderKlasses();
    return this.trigger("rendered");
  };

  KlassesView.prototype.closeViews = function() {
    var i, len, ref, view;
    ref = this.views != null;
    for (i = 0, len = ref.length; i < len; i++) {
      view = ref[i];
      view.close();
    }
    return this.views = [];
  };

  KlassesView.prototype.onClose = function() {
    return this.closeViews();
  };

  return KlassesView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImtsYXNzL0tsYXNzZXNWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFdBQUE7RUFBQTs7OztBQUFNOzs7Ozs7Ozs7Ozs7d0JBRUosU0FBQSxHQUFZOzt3QkFFWixNQUFBLEdBQ0U7SUFBQSxrQkFBQSxFQUE2QixlQUE3QjtJQUNBLHFCQUFBLEVBQTZCLGVBRDdCO0lBRUEsbUJBQUEsRUFBNkIsY0FGN0I7SUFHQSx3QkFBQSxFQUE2QixlQUg3QjtJQUlBLG1CQUFBLEVBQTZCLFdBSjdCO0lBS0Esa0JBQUEsRUFBdUIsVUFMdkI7SUFNQSxlQUFBLEVBQXVCLFlBTnZCO0lBT0Esb0JBQUEsRUFBdUIsWUFQdkI7Ozt3QkFTRixVQUFBLEdBQVksU0FBRSxPQUFGO0FBQ1YsUUFBQTtJQUFBLElBQUMsQ0FBQSxPQUFELEdBQVk7SUFDWixJQUFDLENBQUEsUUFBRCxHQUFZO0lBQ1osSUFBQyxDQUFBLFlBQUQsR0FBZ0I7SUFFaEIsSUFBQyxDQUFBLEtBQUQsR0FBUztJQUNULElBQUMsQ0FBQSxPQUFELEdBQWEsT0FBTyxDQUFDO0lBQ3JCLElBQUMsQ0FBQSxTQUFELEdBQWEsT0FBTyxDQUFDO0lBQ3JCLElBQUMsQ0FBQSxRQUFELEdBQWEsT0FBTyxDQUFDO0lBRXJCLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLG1CQUFaLEVBQWlDLElBQUMsQ0FBQSxNQUFsQztJQUVBLElBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFmLENBQUEsQ0FBSDtNQUVFLElBQUMsQ0FBQSxLQUFELEdBQVMsVUFBQSxDQUFXLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDbEIsS0FBQyxDQUFBLGNBQUQsQ0FBZ0IsS0FBaEI7UUFEa0I7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVgsRUFFUCxFQUFBLEdBQUssSUFGRTthQUtULE1BQUEsR0FBUyxDQUFDLENBQUMsSUFBRixDQUNQO1FBQUEsR0FBQSxFQUFLLFNBQVMsQ0FBQyxRQUFR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LEVBQWYsQ0FBQSxHQUFrQixPQUFsQixHQUNJLENBQUMsQ0FBQSxDQUFFLFNBQUYsQ0FBRCxDQURKLEdBQ2tCLDhFQURsQixHQUlrQyxDQUFDLENBQUEsQ0FBRSxLQUFGLENBQUQsQ0FKbEMsR0FJNEMseVRBSjVDLEdBZ0J5QixDQUFDLENBQUEsQ0FBRSxPQUFGLENBQUQsQ0FoQnpCLEdBZ0JxQyxtRkFoQnJDLEdBb0IwQixDQUFDLENBQUEsQ0FBRSxRQUFGLENBQUQsQ0FwQjFCLEdBb0J1Qyx3RkFwQnZDLEdBd0I4QixDQUFDLENBQUEsQ0FBRSxZQUFGLENBQUQsQ0F4QjlCLEdBd0IrQyx1Q0F4Qi9DLEdBeUIrQixtQkF6Qi9CLEdBeUJtRCxzREF6Qm5ELEdBMkJ1QyxDQUFDLENBQUEsQ0FBRSxNQUFGLENBQUQsQ0EzQnZDLEdBMkJrRCxnREEzQmxELEdBMkJpRyxDQUFDLENBQUEsQ0FBRSxRQUFGLENBQUQsQ0EzQmpHLEdBMkI4RywwQkEzQjlHLEdBOEJBLENBQUMsZUFBQSxJQUFtQixFQUFwQixDQS9CSDtJQWtDQSxJQUFxQixTQUFTLENBQUMsSUFBSSxDQUFDLE9BQWYsQ0FBQSxDQUFyQjtNQUFBLElBQUMsQ0FBQSxjQUFELENBQUEsRUFBQTs7SUFFQSxJQUFDLENBQUEsYUFBRCxDQUFBO1dBRUEsSUFBQyxDQUFBLE9BQUQsQ0FBUyxVQUFUO0VBNUNNOzt3QkE4Q1IsVUFBQSxHQUFZLFNBQUE7QUFDVixRQUFBO0FBQUE7QUFBQSxTQUFBLHFDQUFBOztNQUNFLElBQUksQ0FBQyxLQUFMLENBQUE7QUFERjtXQUVBLElBQUMsQ0FBQSxLQUFELEdBQVM7RUFIQzs7d0JBS1osT0FBQSxHQUFTLFNBQUE7V0FDUCxJQUFDLENBQUEsVUFBRCxDQUFBO0VBRE87Ozs7R0FwVWUsUUFBUSxDQUFDIiwiZmlsZSI6ImtsYXNzL0tsYXNzZXNWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgS2xhc3Nlc1ZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lIDogXCJLbGFzc2VzVmlld1wiXG5cbiAgZXZlbnRzIDpcbiAgICAnY2xpY2sgLmtsYXNzX2FkZCcgICAgICAgICA6ICd0b2dnbGVBZGRGb3JtJ1xuICAgICdjbGljayAua2xhc3NfY2FuY2VsJyAgICAgIDogJ3RvZ2dsZUFkZEZvcm0nXG4gICAgJ2NsaWNrIC5rbGFzc19zYXZlJyAgICAgICAgOiAnc2F2ZU5ld0tsYXNzJ1xuICAgICdjbGljayAua2xhc3NfY3VycmljdWxhJyAgIDogJ2dvdG9DdXJyaWN1bGEnXG4gICAgJ2NsaWNrIC5nb3RvX2NsYXNzJyAgICAgICAgOiAnZ290b0tsYXNzJ1xuICAgICdjbGljayAucHVsbF9kYXRhJyAgIDogJ3B1bGxEYXRhJ1xuICAgICdjbGljayAudmVyaWZ5JyAgICAgIDogJ2dob3N0TG9naW4nXG4gICAgJ2NsaWNrIC51cGxvYWRfZGF0YScgOiAndXBsb2FkRGF0YSdcblxuICBpbml0aWFsaXplOiAoIG9wdGlvbnMgKSAtPlxuICAgIEBpcEJsb2NrICA9IDMyXG4gICAgQHRvdGFsSXBzID0gMjU2XG4gICAgQHRhYmxldE9mZnNldCA9IDBcblxuICAgIEB2aWV3cyA9IFtdXG4gICAgQGtsYXNzZXMgICA9IG9wdGlvbnMua2xhc3Nlc1xuICAgIEBjdXJyaWN1bGEgPSBvcHRpb25zLmN1cnJpY3VsYVxuICAgIEB0ZWFjaGVycyAgPSBvcHRpb25zLnRlYWNoZXJzXG5cbiAgICBAa2xhc3Nlcy5vbiBcImFkZCByZW1vdmUgY2hhbmdlXCIsIEByZW5kZXJcblxuICAgIGlmIFRhbmdlcmluZS51c2VyLmlzQWRtaW4oKVxuICAgICAgIyB0aW1lb3V0IGZvciB0aGUgdmVyaWZpY2F0aW9uIGF0dGVtcHRcbiAgICAgIEB0aW1lciA9IHNldFRpbWVvdXQgPT5cbiAgICAgICAgQHVwZGF0ZVVwbG9hZGVyKGZhbHNlKVxuICAgICAgLCAyMCAqIDEwMDBcblxuICAgICAgIyB0cnkgdG8gdmVyaWZ5IHRoZSBjb25uZWN0aW9uIHRvIHRoZSBzZXJ2ZXJcbiAgICAgIHZlclJlcSA9ICQuYWpheFxuICAgICAgICB1cmw6IFRhbmdlcmluZS5zZXR0aW5ncy51cmxWaWV3KFwiZ3JvdXBcIiwgXCJieURLZXlcIilcbiAgICAgICAgZGF0YVR5cGU6IFwianNvbnBcIlxuICAgICAgICBkYXRhOiBrZXlzOiBbXCJ0ZXN0dGVzdFwiXVxuICAgICAgICB0aW1lb3V0OiA1MDAwXG4gICAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgICAgY2xlYXJUaW1lb3V0IEB0aW1lclxuICAgICAgICAgIEB1cGRhdGVVcGxvYWRlciB0cnVlXG5cbiAgZ2hvc3RMb2dpbjogLT5cbiAgICBUYW5nZXJpbmUudXNlci5naG9zdExvZ2luIFRhbmdlcmluZS5zZXR0aW5ncy51cFVzZXIsIFRhbmdlcmluZS5zZXR0aW5ncy51cFBhc3NcblxuICB1cGxvYWREYXRhOiAtPlxuICAgICQuYWpheFxuICAgICAgXCJ1cmxcIiAgICAgICAgIDogXCIvXCIgKyBUYW5nZXJpbmUuZGJfbmFtZSArIFwiL19kZXNpZ24vdGFuZ2VyaW5lL192aWV3L2J5Q29sbGVjdGlvbj9pbmNsdWRlX2RvY3M9ZmFsc2VcIlxuICAgICAgXCJ0eXBlXCIgICAgICAgIDogXCJQT1NUXCJcbiAgICAgIFwiZGF0YVR5cGVcIiAgICA6IFwianNvblwiXG4gICAgICBcImNvbnRlbnRUeXBlXCIgOiBcImFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtOFwiLFxuICAgICAgXCJkYXRhXCIgICAgICAgIDogSlNPTi5zdHJpbmdpZnkoXG4gICAgICAgICAgaW5jbHVkZV9kb2NzOiBmYWxzZVxuICAgICAgICAgIGtleXMgOiBbJ3Jlc3VsdCcsICdrbGFzcycsICdzdHVkZW50JywgJ3RlYWNoZXInLCAnbG9ncycsICd1c2VyJ11cbiAgICAgICAgKVxuICAgICAgXCJzdWNjZXNzXCIgOiAoZGF0YSkgPT5cbiAgICAgICAgZG9jTGlzdCA9IF8ucGx1Y2soZGF0YS5yb3dzLFwiaWRcIilcbiAgICAgICAgJC5jb3VjaC5yZXBsaWNhdGUoXG4gICAgICAgICAgVGFuZ2VyaW5lLnNldHRpbmdzLnVybERCKFwibG9jYWxcIiksXG4gICAgICAgICAgVGFuZ2VyaW5lLnNldHRpbmdzLnVybERCKFwiZ3JvdXBcIiksXG4gICAgICAgICAgICBzdWNjZXNzOiAgICAgID0+XG4gICAgICAgICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiU3luYyBzdWNjZXNzZnVsXCJcbiAgICAgICAgICAgIGVycm9yOiAoYSwgYikgPT5cbiAgICAgICAgICAgICAgVXRpbHMubWlkQWxlcnQgXCJTeW5jIGVycm9yPGJyPiN7YX0gI3tifVwiXG4gICAgICAgICAgLFxuICAgICAgICAgICAgZG9jX2lkczogZG9jTGlzdFxuICAgICAgICApXG5cblxuICB1cGRhdGVVcGxvYWRlcjogKHN0YXR1cykgPT5cbiAgICBodG1sID1cbiAgICAgIGlmIHN0YXR1cyA9PSB0cnVlXG4gICAgICAgIFwiPGJ1dHRvbiBjbGFzcz0ndXBsb2FkX2RhdGEgY29tbWFuZCc+VXBsb2FkPC9idXR0b24+XCJcbiAgICAgIGVsc2UgaWYgc3RhdHVzID09IGZhbHNlXG4gICAgICAgIFwiPGRpdiBjbGFzcz0nbWVudV9ib3gnPjxzbWFsbD5ObyBjb25uZWN0aW9uPC9zbWFsbD48YnI+PGJ1dHRvbiBjbGFzcz0nY29tbWFuZCB2ZXJpZnknPlZlcmlmeSBjb25uZWN0aW9uPC9idXR0b24+PC9kaXY+XCJcbiAgICAgIGVsc2VcbiAgICAgICAgXCI8YnV0dG9uIGNsYXNzPSdjb21tYW5kJyBkaXNhYmxlZD0nZGlzYWJsZWQnPlZlcmlmeWluZyBjb25uZWN0aW9uLi4uPC9idXR0b24+XCJcblxuICAgIEAkZWwuZmluZChcIi51cGxvYWRlclwiKS5odG1sIGh0bWxcblxuXG4gIHB1bGxEYXRhOiAtPlxuICAgIGlmIEB0YWJsZXRPZmZzZXQgPT0gMFxuICAgICAgQHRhYmxldHMgPSAjIGlmIHlvdSBjYW4gdGhpbmsgb2YgYSBiZXR0ZXIgaWRlYSBJJ2QgbGlrZSB0byBzZWUgaXRcbiAgICAgICAgY2hlY2tlZCAgICA6IDBcbiAgICAgICAgY29tcGxldGUgICA6IDBcbiAgICAgICAgc3VjY2Vzc2Z1bCA6IDBcbiAgICAgICAgb2tDb3VudCAgICA6IDBcbiAgICAgICAgaXBzICAgICAgICA6IFtdXG4gICAgICAgIHJlc3VsdCAgICAgOiAwXG4gICAgICBVdGlscy5taWRBbGVydCBcIlBsZWFzZSB3YWl0LCBkZXRlY3RpbmcgdGFibGV0cy5cIlxuXG4gICAgVXRpbHMud29ya2luZyB0cnVlXG4gICAgQHJhbmRvbUlkRG9jID0gaGV4X3NoYTEoXCJcIitNYXRoLnJhbmRvbSgpKVxuICAgIFRhbmdlcmluZS4kZGIuc2F2ZURvY1xuICAgICAgXCJfaWRcIiA6IEByYW5kb21JZERvY1xuICAgICxcbiAgICAgIHN1Y2Nlc3M6IChkb2MpID0+XG4gICAgICAgIEByYW5kb21Eb2MgPSBkb2NcbiAgICAgICAgZm9yIGxvY2FsIGluIFtAdGFibGV0T2Zmc2V0Li4oQGlwQmxvY2stMSkrQHRhYmxldE9mZnNldF1cbiAgICAgICAgICBkbyAobG9jYWwpID0+XG4gICAgICAgICAgICBpcCA9IFRhbmdlcmluZS5zZXR0aW5ncy5zdWJuZXRJUChsb2NhbClcbiAgICAgICAgICAgIHJlcSA9ICQuYWpheFxuICAgICAgICAgICAgICB1cmw6IFRhbmdlcmluZS5zZXR0aW5ncy51cmxTdWJuZXQoaXApXG4gICAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25wXCJcbiAgICAgICAgICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04XCIsXG4gICAgICAgICAgICAgIHRpbWVvdXQ6IDEwMDAwXG4gICAgICAgICAgICByZXEuY29tcGxldGUgKHhociwgZXJyb3IpID0+XG4gICAgICAgICAgICAgIEB0YWJsZXRzLmNoZWNrZWQrK1xuICAgICAgICAgICAgICBpZiBwYXJzZUludCh4aHIuc3RhdHVzKSA9PSAyMDBcbiAgICAgICAgICAgICAgICBAdGFibGV0cy5va0NvdW50KytcbiAgICAgICAgICAgICAgICBAdGFibGV0cy5pcHMucHVzaCBpcFxuICAgICAgICAgICAgICBAdXBkYXRlUHVsbCgpXG4gICAgICBlcnJvcjogLT5cbiAgICAgICAgVXRpbHMud29ya2luZyBmYWxzZVxuICAgICAgICBVdGlscy5taWRBbGVydCBcIkludGVybmFsIGRhdGFiYXNlIGVycm9yXCJcblxuICB1cGRhdGVQdWxsOiA9PlxuICAgICMgZG8gbm90IHByb2Nlc3MgdW5sZXNzIHdlJ3JlIGRvbmUgd2l0aCBjaGVja2luZyB0aGlzIGJsb2NrXG4gICAgcmV0dXJuIGlmIEB0YWJsZXRzLmNoZWNrZWQgPCBAaXBCbG9jayArIEB0YWJsZXRPZmZzZXRcblxuICAgICMgZ2l2ZSB0aGUgY2hvaWNlIHRvIGtlZXAgbG9va2luZyBpZiBub3QgYWxsIHRhYmxldHMgZm91bmRcbiAgICBpZiBAdGFibGV0T2Zmc2V0ICE9IEB0b3RhbElwcyAtIEBpcEJsb2NrICMmJiBjb25maXJtKFwiI3tNYXRoLm1heChAdGFibGV0cy5va0NvdW50LTEsIDApfSB0YWJsZXRzIGZvdW5kLlxcblxcbkNvbnRpbnVlIHNlYXJjaGluZz9cIilcbiAgICAgIEB0YWJsZXRPZmZzZXQgKz0gQGlwQmxvY2tcbiAgICAgIEBwdWxsRGF0YSgpXG4gICAgZWxzZVxuXG4gICAgICAjIC0xIGJlY2F1c2Ugb25lIG9mIHRoZW0gd2lsbCBiZSB0aGlzIGNvbXB1dGVyXG4gICAgICBAdGFibGV0cy5va0NvdW50ID0gTWF0aC5tYXgoQHRhYmxldHMub2tDb3VudC0xLCAwKVxuXG4gICAgICBpZiBAdGFibGV0cy5va0NvdW50ID09IDBcbiAgICAgICAgQHRhYmxldE9mZnNldCA9IDBcbiAgICAgICAgVXRpbHMud29ya2luZyBmYWxzZVxuICAgICAgICBVdGlscy5taWRBbGVydCBcIiN7QHRhYmxldHMub2tDb3VudH0gdGFibGV0cyBmb3VuZC5cIlxuICAgICAgICBUYW5nZXJpbmUuJGRiLnJlbW92ZURvY1xuICAgICAgICAgIFwiX2lkXCIgIDogQHJhbmRvbURvYy5pZFxuICAgICAgICAgIFwiX3JldlwiIDogQHJhbmRvbURvYy5yZXZcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgIHVubGVzcyBjb25maXJtKFwiI3tAdGFibGV0cy5va0NvdW50fSB0YWJsZXRzIGZvdW5kLlxcblxcblN0YXJ0IGRhdGEgcHVsbD9cIilcbiAgICAgICAgQHRhYmxldE9mZnNldCA9IDBcbiAgICAgICAgVXRpbHMud29ya2luZyBmYWxzZVxuICAgICAgICBUYW5nZXJpbmUuJGRiLnJlbW92ZURvY1xuICAgICAgICAgIFwiX2lkXCIgIDogQHJhbmRvbURvYy5pZFxuICAgICAgICAgIFwiX3JldlwiIDogQHJhbmRvbURvYy5yZXZcbiAgICAgICAgcmV0dXJuXG5cblxuICAgICAgVXRpbHMubWlkQWxlcnQgXCJQdWxsaW5nIGZyb20gI3tAdGFibGV0cy5va0NvdW50fSB0YWJsZXRzLlwiXG4gICAgICBmb3IgaXAgaW4gQHRhYmxldHMuaXBzXG5cbiAgICAgICAgZG8gKGlwKSA9PlxuICAgICAgICAgICMgc2VlIGlmIG91ciByYW5kb20gZG9jdW1lbnQgaXMgb24gdGhlIHNlcnZlciB3ZSBqdXN0IGZvdW5kXG4gICAgICAgICAgc2VsZlJlcSA9ICQuYWpheFxuICAgICAgICAgICAgXCJ1cmxcIiAgICAgICAgIDogVGFuZ2VyaW5lLnNldHRpbmdzLnVybFN1Ym5ldChpcCkgKyBcIi9cIiArIEByYW5kb21JZERvY1xuICAgICAgICAgICAgXCJkYXRhVHlwZVwiICAgIDogXCJqc29ucFwiXG4gICAgICAgICAgICBcInRpbWVvdXRcIiAgICAgOiAxMDAwMFxuICAgICAgICAgICAgXCJjb250ZW50VHlwZVwiIDogXCJhcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLThcIlxuXG4gICAgICAgICAgc2VsZlJlcS5zdWNjZXNzIChkYXRhLCB4aHIsIGVycm9yKSA9PlxuICAgICAgICAgICAgIyBpZiBmb3VuZCBzZWxmIHRoZW4gZG8gbm90aGluZ1xuXG4gICAgICAgICAgc2VsZlJlcS5jb21wbGV0ZSAoeGhyLCBlcnJvcikgPT4gZG8gKHhocikgPT5cbiAgICAgICAgICAgIHJldHVybiBpZiBwYXJzZUludCh4aHIuc3RhdHVzKSA9PSAyMDBcbiAgICAgICAgICAgICMgaWYgbm90LCB0aGVuIHdlIGZvdW5kIGFub3RoZXIgdGFibGV0XG4gICAgICAgICAgICB2aWV3UmVxID0gJC5hamF4XG4gICAgICAgICAgICAgIFwidXJsXCIgICAgICAgICA6IFRhbmdlcmluZS5zZXR0aW5ncy51cmxTdWJuZXQoaXApICsgXCIvX2Rlc2lnbi90YW5nZXJpbmUvX3ZpZXcvYnlDb2xsZWN0aW9uXCJcbiAgICAgICAgICAgICAgXCJkYXRhVHlwZVwiICAgIDogXCJqc29ucFwiXG4gICAgICAgICAgICAgIFwiY29udGVudFR5cGVcIiA6IFwiYXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04XCIsXG4gICAgICAgICAgICAgIFwiZGF0YVwiICAgICAgICA6XG4gICAgICAgICAgICAgICAgaW5jbHVkZV9kb2NzIDogZmFsc2VcbiAgICAgICAgICAgICAgICBrZXlzIDogSlNPTi5zdHJpbmdpZnkoWydyZXN1bHQnLCAna2xhc3MnLCAnc3R1ZGVudCcsJ2N1cnJpY3VsdW0nLCAndGVhY2hlcicsICdsb2dzJ10pXG5cbiAgICAgICAgICAgIHZpZXdSZXEuc3VjY2VzcyAoZGF0YSkgPT5cbiAgICAgICAgICAgICAgZG9jTGlzdCA9IChkYXR1bS5pZCBmb3IgZGF0dW0gaW4gZGF0YS5yb3dzKVxuICAgICAgICAgICAgICAkLmNvdWNoLnJlcGxpY2F0ZShcbiAgICAgICAgICAgICAgICBUYW5nZXJpbmUuc2V0dGluZ3MudXJsU3VibmV0KGlwKSxcbiAgICAgICAgICAgICAgICBUYW5nZXJpbmUuc2V0dGluZ3MudXJsREIoXCJsb2NhbFwiKSxcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6ICAgICAgPT5cbiAgICAgICAgICAgICAgICAgICAgQHRhYmxldHMuY29tcGxldGUrK1xuICAgICAgICAgICAgICAgICAgICBAdGFibGV0cy5zdWNjZXNzZnVsKytcbiAgICAgICAgICAgICAgICAgICAgQHVwZGF0ZVB1bGxSZXN1bHQoKVxuICAgICAgICAgICAgICAgICAgZXJyb3I6IChhLCBiKSA9PlxuICAgICAgICAgICAgICAgICAgICBAdGFibGV0cy5jb21wbGV0ZSsrXG4gICAgICAgICAgICAgICAgICAgIEB1cGRhdGVQdWxsUmVzdWx0KClcbiAgICAgICAgICAgICAgICAsXG4gICAgICAgICAgICAgICAgICBkb2NfaWRzOiBkb2NMaXN0XG4gICAgICAgICAgICAgIClcblxuICB1cGRhdGVQdWxsUmVzdWx0OiA9PlxuICAgIGlmIEB0YWJsZXRzLmNvbXBsZXRlID09IEB0YWJsZXRzLm9rQ291bnRcbiAgICAgIFV0aWxzLndvcmtpbmcgZmFsc2VcbiAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiUHVsbCBmaW5pc2hlZC48YnI+I3tAdGFibGV0cy5zdWNjZXNzZnVsfSBvdXQgb2YgI3tAdGFibGV0cy5va0NvdW50fSBzdWNjZXNzZnVsLlwiLCA1MDAwXG4gICAgICBUYW5nZXJpbmUuJGRiLnJlbW92ZURvY1xuICAgICAgICBcIl9pZFwiICA6IEByYW5kb21Eb2MuaWRcbiAgICAgICAgXCJfcmV2XCIgOiBAcmFuZG9tRG9jLnJldlxuICAgICAgQGtsYXNzZXMuZmV0Y2ggc3VjY2VzczogPT4gQHJlbmRlcktsYXNzZXMoKVxuXG4gIGdvdG9DdXJyaWN1bGE6IC0+XG4gICAgVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcImN1cnJpY3VsYVwiLCB0cnVlXG5cbiAgc2F2ZU5ld0tsYXNzOiAtPlxuXG4gICAgc2Nob29sTmFtZSA9ICQudHJpbShAJGVsLmZpbmQoXCIjc2Nob29sX25hbWVcIikudmFsKCkpXG4gICAgeWVhciAgICAgICA9ICQudHJpbShAJGVsLmZpbmQoXCIjeWVhclwiKS52YWwoKSlcbiAgICBncmFkZSAgICAgID0gJC50cmltKEAkZWwuZmluZChcIiNncmFkZVwiKS52YWwoKSlcbiAgICBzdHJlYW0gICAgID0gJC50cmltKEAkZWwuZmluZChcIiNzdHJlYW1cIikudmFsKCkpXG4gICAgY3VycmljdWx1bSA9IEAkZWwuZmluZChcIiNjdXJyaWN1bHVtIG9wdGlvbjpzZWxlY3RlZFwiKS5hdHRyKFwiZGF0YS1pZFwiKVxuXG4gICAgZXJyb3JzID0gW11cbiAgICBlcnJvcnMucHVzaCBcIiAtIE5vIHNjaG9vbCBuYW1lLlwiICAgICAgICAgaWYgc2Nob29sTmFtZSA9PSBcIlwiXG4gICAgZXJyb3JzLnB1c2ggXCIgLSBObyB5ZWFyLlwiICAgICAgICAgICAgICAgIGlmIHllYXIgICAgICAgPT0gXCJcIlxuICAgIGVycm9ycy5wdXNoIFwiIC0gTm8gZ3JhZGUuXCIgICAgICAgICAgICAgICBpZiBncmFkZSAgICAgID09IFwiXCJcbiAgICBlcnJvcnMucHVzaCBcIiAtIE5vIHN0cmVhbS5cIiAgICAgICAgICAgICAgaWYgc3RyZWFtICAgICA9PSBcIlwiXG4gICAgZXJyb3JzLnB1c2ggXCIgLSBObyBjdXJyaWN1bHVtIHNlbGVjdGVkLlwiIGlmIGN1cnJpY3VsdW0gPT0gXCJfbm9uZVwiXG5cbiAgICBmb3Iga2xhc3MgaW4gQGtsYXNzZXMubW9kZWxzXG4gICAgICBpZiBrbGFzcy5nZXQoXCJ5ZWFyXCIpICAgPT0geWVhciAmJlxuICAgICAgICAga2xhc3MuZ2V0KFwiZ3JhZGVcIikgID09IGdyYWRlICYmXG4gICAgICAgICBrbGFzcy5nZXQoXCJzdHJlYW1cIikgPT0gc3RyZWFtXG4gICAgICAgIGVycm9ycy5wdXNoIFwiIC0gRHVwbGljYXRlIHllYXIsIGdyYWRlLCBzdHJlYW0uXCJcblxuICAgIGlmIGVycm9ycy5sZW5ndGggPT0gMFxuICAgICAgdGVhY2hlcklkID0gaWYgVGFuZ2VyaW5lLnVzZXIuaGFzKFwidGVhY2hlcklkXCIpXG4gICAgICAgIFRhbmdlcmluZS51c2VyLmdldChcInRlYWNoZXJJZFwiKVxuICAgICAgZWxzZVxuICAgICAgICBcImFkbWluXCJcbiAgICAgIGtsYXNzID0gbmV3IEtsYXNzXG4gICAgICBrbGFzcy5zYXZlXG4gICAgICAgIHRlYWNoZXJJZCAgICA6IHRlYWNoZXJJZFxuICAgICAgICBzY2hvb2xOYW1lICAgOiBzY2hvb2xOYW1lXG4gICAgICAgIHllYXIgICAgICAgICA6IHllYXJcbiAgICAgICAgZ3JhZGUgICAgICAgIDogZ3JhZGVcbiAgICAgICAgc3RyZWFtICAgICAgIDogc3RyZWFtXG4gICAgICAgIGN1cnJpY3VsdW1JZCA6IEAkZWwuZmluZChcIiNjdXJyaWN1bHVtIG9wdGlvbjpzZWxlY3RlZFwiKS5hdHRyKFwiZGF0YS1pZFwiKVxuICAgICAgICBzdGFydERhdGUgICAgOiAobmV3IERhdGUoKSkuZ2V0VGltZSgpXG4gICAgICAsXG4gICAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgICAgQGtsYXNzZXMuYWRkIGtsYXNzXG4gICAgZWxzZVxuICAgICAgYWxlcnQgKFwiUGxlYXNlIGNvcnJlY3QgdGhlIGZvbGxvd2luZyBlcnJvcnM6XFxuXFxuI3tlcnJvcnMuam9pbignXFxuJyl9XCIpXG5cbiAgZ290b0tsYXNzOiAoZXZlbnQpIC0+XG4gICAgVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcImNsYXNzL2VkaXQvXCIrJChldmVudC50YXJnZXQpLmF0dHIoXCJkYXRhLWlkXCIpXG5cbiAgdG9nZ2xlQWRkRm9ybTogLT5cbiAgICBAJGVsLmZpbmQoXCIjYWRkX2Zvcm0sIC5hZGRcIikudG9nZ2xlKClcbiAgICBpZiBub3QgVGFuZ2VyaW5lLnVzZXIuaXNBZG1pbigpXG4gICAgICBzY2hvb2xOYW1lID0gQHRlYWNoZXJzLmdldChUYW5nZXJpbmUudXNlci5nZXQoXCJ0ZWFjaGVySWRcIikpLmdldChcInNjaG9vbFwiKVxuICAgICAgQCRlbC5maW5kKFwiI3NjaG9vbF9uYW1lXCIpLnZhbChzY2hvb2xOYW1lKVxuICAgICAgQCRlbC5maW5kKFwiI3llYXJcIikuZm9jdXMoKVxuICAgIGVsc2VcbiAgICAgIEAkZWwuZmluZChcIiNzY2hvb2xfbmFtZVwiKS5mb2N1cygpXG4gICAgaWYgQCRlbC5maW5kKFwiI2FkZF9mb3JtXCIpLmlzKFwiOnZpc2libGVcIikgdGhlbiBAJGVsLmZpbmQoXCIjYWRkX2Zvcm1cIikuc2Nyb2xsVG8oKVxuXG4gIHJlbmRlcktsYXNzZXM6IC0+XG4gICAgQGNsb3NlVmlld3MoKVxuXG4gICAgJHVsID0gJChcIjx1bD5cIikuYWRkQ2xhc3MoXCJrbGFzc19saXN0XCIpXG4gICAgZm9yIGtsYXNzIGluIEBrbGFzc2VzLm1vZGVsc1xuICAgICAgdmlldyA9IG5ldyBLbGFzc0xpc3RFbGVtZW50Vmlld1xuICAgICAgICBrbGFzcyAgICAgIDoga2xhc3NcbiAgICAgICAgY3VycmljdWxhICA6IEBjdXJyaWN1bGFcbiAgICAgIHZpZXcub24gXCJyZW5kZXJlZFwiLCBAb25TdWJ2aWV3UmVuZGVyZWRcbiAgICAgIHZpZXcucmVuZGVyKClcbiAgICAgIEB2aWV3cy5wdXNoIHZpZXdcbiAgICAgICR1bC5hcHBlbmQgdmlldy5lbFxuICAgIEAkZWwuZmluZChcIiNrbGFzc19saXN0X3dyYXBwZXJcIikuZW1wdHkoKVxuICAgIEAkZWwuZmluZChcIiNrbGFzc19saXN0X3dyYXBwZXJcIikuYXBwZW5kICR1bFxuXG4gIG9uU3Vidmlld1JlbmRlcmVkOiA9PlxuICAgIEB0cmlnZ2VyIFwic3ViUmVuZGVyZWRcIlxuXG4gIHJlbmRlcjogPT5cblxuICAgIGN1cnJpY3VsYU9wdGlvbkxpc3QgPSBcIjxvcHRpb24gZGF0YS1pZD0nX25vbmUnIGRpc2FibGVkPSdkaXNhYmxlZCcgc2VsZWN0ZWQ9J3NlbGVjdGVkJz4je3QoJ3NlbGVjdCBhIGN1cnJpY3VsdW0nKX08L29wdGlvbj5cIlxuICAgIGZvciBjdXJyaWN1bGEgaW4gQGN1cnJpY3VsYS5tb2RlbHNcbiAgICAgIGN1cnJpY3VsYU9wdGlvbkxpc3QgKz0gXCI8b3B0aW9uIGRhdGEtaWQ9JyN7Y3VycmljdWxhLmlkfSc+I3tjdXJyaWN1bGEuZ2V0ICduYW1lJ308L29wdGlvbj5cIlxuXG4gICAgQCRlbC5odG1sIFwiXG4gICAgICAje2FkbWluUGFuZWwgfHwgXCJcIn1cbiAgICAgIDxoMT4je3QoJ2NsYXNzZXMnKX08L2gxPlxuICAgICAgPGRpdiBpZD0na2xhc3NfbGlzdF93cmFwcGVyJz48L2Rpdj5cblxuICAgICAgPGJ1dHRvbiBjbGFzcz0na2xhc3NfYWRkIGNvbW1hbmQnPiN7dCgnYWRkJyl9PC9idXR0b24+XG4gICAgICA8ZGl2IGlkPSdhZGRfZm9ybScgY2xhc3M9J2NvbmZpcm1hdGlvbic+XG4gICAgICAgIDxkaXYgY2xhc3M9J21lbnVfYm94Jz5cbiAgICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPSdzY2hvb2xfbmFtZSc+U2Nob29sIG5hbWU8L2xhYmVsPlxuICAgICAgICAgICAgPGlucHV0IGlkPSdzY2hvb2xfbmFtZSc+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICAgICAgPGxhYmVsIGZvcj0neWVhcic+U2Nob29sIHllYXI8L2xhYmVsPlxuICAgICAgICAgICAgPGlucHV0IGlkPSd5ZWFyJz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPSdncmFkZSc+I3t0KCdncmFkZScpfTwvbGFiZWw+XG4gICAgICAgICAgICA8aW5wdXQgaWQ9J2dyYWRlJz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPSdzdHJlYW0nPiN7dCgnc3RyZWFtJyl9PC9sYWJlbD5cbiAgICAgICAgICAgIDxpbnB1dCBpZD0nc3RyZWFtJz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPSdjdXJyaWN1bHVtJz4je3QoJ2N1cnJpY3VsdW0nKX08L2xhYmVsPjxicj5cbiAgICAgICAgICAgIDxzZWxlY3QgaWQ9J2N1cnJpY3VsdW0nPiN7Y3VycmljdWxhT3B0aW9uTGlzdH08L3NlbGVjdD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8YnV0dG9uIGNsYXNzPSdjb21tYW5kIGtsYXNzX3NhdmUnPiN7dCgnc2F2ZScpfTwvYnV0dG9uPjxidXR0b24gY2xhc3M9J2NvbW1hbmQga2xhc3NfY2FuY2VsJz4je3QoJ2NhbmNlbCcpfTwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICAgI3tjdXJyaWN1bGFCdXR0b24gfHwgJyd9XG4gICAgXCJcblxuICAgIEB1cGRhdGVVcGxvYWRlcigpIGlmIFRhbmdlcmluZS51c2VyLmlzQWRtaW4oKVxuXG4gICAgQHJlbmRlcktsYXNzZXMoKVxuXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG5cbiAgY2xvc2VWaWV3czogLT5cbiAgICBmb3IgdmlldyBpbiBAdmlld3M/XG4gICAgICB2aWV3LmNsb3NlKClcbiAgICBAdmlld3MgPSBbXVxuXG4gIG9uQ2xvc2U6IC0+XG4gICAgQGNsb3NlVmlld3MoKSJdfQ==
