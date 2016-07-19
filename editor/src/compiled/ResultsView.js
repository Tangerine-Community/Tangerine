var ResultsView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ResultsView = (function(superClass) {
  extend(ResultsView, superClass);

  function ResultsView() {
    this.afterRender = bind(this.afterRender, this);
    this.updateResults = bind(this.updateResults, this);
    this.updateOptions = bind(this.updateOptions, this);
    this.detectTablets = bind(this.detectTablets, this);
    return ResultsView.__super__.constructor.apply(this, arguments);
  }

  ResultsView.prototype.className = "ResultsView";

  ResultsView.prototype.events = {
    'click .cloud': 'cloud',
    'click .tablets': 'tablets',
    'click .detect': 'detectOptions',
    'click .details': 'showResultSumView',
    'click .refresh': 'refresh',
    'click .show_advanced': 'toggleAdvanced',
    'change #limit': "setLimit",
    'change #page': "setOffset"
  };

  ResultsView.prototype.toggleAdvanced = function() {
    return this.$el.find("#advanced").toggleClass("confirmation");
  };

  ResultsView.prototype.refresh = function() {
    return Utils.restartTangerine("Please wait...");
  };

  ResultsView.prototype.showResultSumView = function(event) {
    var $details, result, targetId;
    targetId = $(event.target).attr("data-result-id");
    $details = this.$el.find("#details_" + targetId);
    if (!_.isEmpty($details.html())) {
      $details.empty();
      return;
    }
    result = new Result({
      "_id": targetId
    });
    return result.fetch({
      success: function() {
        var view;
        view = new ResultSumView({
          model: result,
          finishCheck: true
        });
        view.render();
        $details.html("<div class='info_box'>" + $(view.el).html() + "</div>");
        return view.close();
      }
    });
  };

  ResultsView.prototype.cloud = function() {
    if (this.available.cloud.ok) {
      $.couch.replicate(Tangerine.settings.urlDB("local"), Tangerine.settings.urlDB("group"), {
        success: (function(_this) {
          return function() {
            return _this.$el.find(".status").find(".info_box").html("Results synced to cloud successfully");
          };
        })(this),
        error: (function(_this) {
          return function(a, b) {
            return _this.$el.find(".status").find(".info_box").html("<div>Sync error</div><div>" + a + " " + b + "</div>");
          };
        })(this)
      }, {
        doc_ids: this.docList
      });
    } else {
      Utils.midAlert("Cannot detect cloud");
    }
    return false;
  };

  ResultsView.prototype.tablets = function() {
    var fn, i, ip, len, ref;
    if (this.available.tablets.okCount > 0) {
      ref = this.available.tablets.ips;
      fn = (function(_this) {
        return function(ip) {
          return $.couch.replicate(Tangerine.settings.urlDB("local"), Tangerine.settings.urlSubnet(ip), {
            success: function() {
              return _this.$el.find(".status").find(".info_box").html("Results synced to " + _this.available.tablets.okCount + " successfully");
            },
            error: function(a, b) {
              return _this.$el.find(".status").find(".info_box").html("<div>Sync error</div><div>" + a + " " + b + "</div>");
            }
          }, {
            doc_ids: _this.docList
          });
        };
      })(this);
      for (i = 0, len = ref.length; i < len; i++) {
        ip = ref[i];
        fn(ip);
      }
    } else {
      Utils.midAlert("Cannot detect tablets");
    }
    return false;
  };

  ResultsView.prototype.initDetectOptions = function() {
    return this.available = {
      cloud: {
        ok: false,
        checked: false
      },
      tablets: {
        ips: [],
        okCount: 0,
        checked: 0,
        total: 256
      }
    };
  };

  ResultsView.prototype.detectOptions = function() {
    $("button.cloud, button.tablets").attr("disabled", "disabled");
    this.detectCloud();
    return this.detectTablets();
  };

  ResultsView.prototype.detectCloud = function() {
    return $.ajax({
      dataType: "jsonp",
      url: Tangerine.settings.urlHost("group"),
      success: (function(_this) {
        return function(a, b) {
          return _this.available.cloud.ok = true;
        };
      })(this),
      error: (function(_this) {
        return function(a, b) {
          return _this.available.cloud.ok = false;
        };
      })(this),
      complete: (function(_this) {
        return function() {
          _this.available.cloud.checked = true;
          return _this.updateOptions();
        };
      })(this)
    });
  };

  ResultsView.prototype.detectTablets = function() {
    var i, local, results;
    results = [];
    for (local = i = 0; i <= 255; local = ++i) {
      results.push((function(_this) {
        return function(local) {
          var ip;
          ip = Tangerine.settings.subnetIP(local);
          return $.ajax({
            url: Tangerine.settings.urlSubnet(ip),
            dataType: "jsonp",
            contentType: "application/json;charset=utf-8",
            timeout: 30000,
            complete: function(xhr, error) {
              _this.available.tablets.checked++;
              if (xhr.status === 200) {
                _this.available.tablets.okCount++;
                _this.available.tablets.ips.push(ip);
              }
              return _this.updateOptions();
            }
          });
        };
      })(this)(local));
    }
    return results;
  };

  ResultsView.prototype.updateOptions = function() {
    var message, percentage, tabletMessage;
    percentage = Math.decimals((this.available.tablets.checked / this.available.tablets.total) * 100, 2);
    if (percentage === 100) {
      message = "finished";
    } else {
      message = percentage + "%";
    }
    tabletMessage = "Searching for tablets: " + message;
    if (this.available.tablets.checked > 0) {
      this.$el.find(".checking_status").html("" + tabletMessage);
    }
    if (this.available.cloud.checked && this.available.tablets.checked === this.available.tablets.total) {
      this.$el.find(".status .info_box").html("Done detecting options");
      this.$el.find(".checking_status").hide();
    }
    if (this.available.cloud.ok) {
      this.$el.find('button.cloud').removeAttr('disabled');
    }
    if (this.available.tablets.okCount > 0 && percentage === 100) {
      return this.$el.find('button.tablets').removeAttr('disabled');
    }
  };

  ResultsView.prototype.i18n = function() {
    return this.text = {
      saveOptions: t("ResultsView.label.save_options"),
      cloud: t("ResultsView.label.cloud"),
      tablets: t("ResultsView.label.tablets"),
      csv: t("ResultsView.label.csv"),
      started: t("ResultsView.label.started"),
      results: t("ResultsView.label.results"),
      details: t("ResultsView.label.details"),
      page: t("ResultsView.label.page"),
      perPage: t("ResultsView.label.per_page"),
      advanced: t("ResultsView.label.advanced"),
      noResults: t("ResultsView.message.no_results"),
      refresh: t("ResultsView.button.refresh"),
      detect: t("ResultsView.button.detect")
    };
  };

  ResultsView.prototype.initialize = function(options) {
    var i, len, ref, result;
    this.i18n();
    this.resultLimit = 100;
    this.resultOffset = 0;
    this.subViews = [];
    this.results = options.results;
    this.assessment = options.assessment;
    this.docList = [];
    ref = this.results;
    for (i = 0, len = ref.length; i < len; i++) {
      result = ref[i];
      this.docList.push(result.get("id"));
    }
    this.initDetectOptions();
    return this.detectCloud();
  };

  ResultsView.prototype.render = function() {
    var html;
    this.clearSubViews();
    html = "<h1>" + (this.assessment.getEscapedString('name')) + " " + this.text.results + "</h1> <h2>" + this.text.saveOptions + "</h2> <div class='menu_box'> <a href='/brockman/assessment/" + Tangerine.db_name + "/" + this.assessment.id + "'><button class='csv command'>" + this.text.csv + "</button></a> <!--div class='small_grey clickable show_advanced'>" + this.text.advanced + "</div--> <div id='advanced' class='confirmation'> <div class='menu_box'> <table class='class_table'> <tr> <td><label for='excludes' title='Space delimited, accepts string literals or regular expressions wrapped in / characters.'>Exclude variables</label></td> <td><input id='excludes'></td> </tr> <tr> <td><label for='includes' title='Space delimited, accepts string literals or regular expressions wrapped in / characters. Overrides exclusions.'>Include variables</label></td> <td><input id='includes'></td> </tr> </table> </div> </div> </div>";
    html += "<h2 id='results_header'>" + this.text.results + " (<span id='result_position'>loading...</span>)</h2> <div class='confirmation' id='controls'> <label for='page' class='small_grey'>" + this.text.page + "</label><input id='page' type='number' value='0'> <label for='limit' class='small_grey'>" + this.text.perPage + "</label><input id='limit' type='number' value='0'> </div> <section id='results_container'></section> <br> <button class='command refresh'>" + this.text.refresh + "</button>";
    this.$el.html(html);
    this.updateResults();
    return this.trigger("rendered");
  };

  ResultsView.prototype.setLimit = function(event) {
    this.resultLimit = parseInt($("#limit").val()) || 100;
    return this.updateResults();
  };

  ResultsView.prototype.setOffset = function(event) {
    var calculated, maxPage, val;
    val = parseInt($("#page").val()) || 1;
    calculated = (val - 1) * this.resultLimit;
    maxPage = Math.floor(this.results.length / this.resultLimit);
    this.resultOffset = Math.limit(0, calculated, maxPage * this.resultLimit);
    return this.updateResults();
  };

  ResultsView.prototype.updateResults = function(focus) {
    var ref;
    if (((ref = this.results) != null ? ref.length : void 0) === 0) {
      this.$el.find('#results_header').html(this.text.noResults);
      return;
    }
    return $.ajax({
      url: Tangerine.settings.urlView('group', "resultSummaryByAssessmentId") + ("?descending=true&limit=" + this.resultLimit + "&skip=" + this.resultOffset),
      type: "POST",
      dataType: "json",
      contentType: "application/json",
      data: JSON.stringify({
        keys: [this.assessment.id]
      }),
      success: (function(_this) {
        return function(data) {
          var count, currentPage, end, endTime, fromNow, htmlRows, i, id, len, long, maxResults, ref1, row, rows, start, startTime, time, total;
          rows = data.rows;
          count = rows.length;
          maxResults = 100;
          currentPage = Math.floor(_this.resultOffset / _this.resultLimit) + 1;
          if (_this.results.length > maxResults) {
            _this.$el.find("#controls").removeClass("confirmation");
            _this.$el.find("#page").val(currentPage);
            _this.$el.find("#limit").val(_this.resultLimit);
          }
          start = _this.resultOffset + 1;
          end = Math.min(_this.resultOffset + _this.resultLimit, _this.results.length);
          total = _this.results.length;
          _this.$el.find('#result_position').html(t("ResultsView.label.pagination", {
            start: start,
            end: end,
            total: total
          }));
          htmlRows = "";
          for (i = 0, len = rows.length; i < len; i++) {
            row = rows[i];
            id = ((ref1 = row.value) != null ? ref1.participant_id : void 0) || "No ID";
            endTime = row.value.end_time;
            if (endTime != null) {
              long = moment(endTime).format('YYYY-MMM-DD HH:mm');
              fromNow = moment(endTime).fromNow();
            } else {
              startTime = row.value.start_time;
              long = ("<b>" + _this.text.started + "</b> ") + moment(startTime).format('YYYY-MMM-DD HH:mm');
              fromNow = moment(startTime).fromNow();
            }
            time = long + " (" + fromNow + ")";
            htmlRows += "<div> " + id + " - " + time + " <button data-result-id='" + row.id + "' class='details command'>" + _this.text.details + "</button> <div id='details_" + row.id + "'></div> </div>";
          }
          _this.$el.find("#results_container").html(htmlRows);
          return _this.$el.find(focus).focus();
        };
      })(this)
    });
  };

  ResultsView.prototype.afterRender = function() {
    var i, len, ref, results, view;
    ref = this.subViews;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      view = ref[i];
      results.push(typeof view.afterRender === "function" ? view.afterRender() : void 0);
    }
    return results;
  };

  ResultsView.prototype.clearSubViews = function() {
    var i, len, ref, view;
    ref = this.subViews;
    for (i = 0, len = ref.length; i < len; i++) {
      view = ref[i];
      view.close();
    }
    return this.subViews = [];
  };

  return ResultsView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlc3VsdC9SZXN1bHRzVmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxXQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7Ozs7d0JBRUosU0FBQSxHQUFZOzt3QkFFWixNQUFBLEdBQ0U7SUFBQSxjQUFBLEVBQW9CLE9BQXBCO0lBQ0EsZ0JBQUEsRUFBb0IsU0FEcEI7SUFFQSxlQUFBLEVBQW9CLGVBRnBCO0lBR0EsZ0JBQUEsRUFBb0IsbUJBSHBCO0lBSUEsZ0JBQUEsRUFBb0IsU0FKcEI7SUFLQSxzQkFBQSxFQUF5QixnQkFMekI7SUFPQSxlQUFBLEVBQWtCLFVBUGxCO0lBUUEsY0FBQSxFQUFpQixXQVJqQjs7O3dCQVVGLGNBQUEsR0FBZ0IsU0FBQTtXQUNkLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLFdBQVYsQ0FBc0IsQ0FBQyxXQUF2QixDQUFtQyxjQUFuQztFQURjOzt3QkFHaEIsT0FBQSxHQUFTLFNBQUE7V0FDUCxLQUFLLENBQUMsZ0JBQU4sQ0FBdUIsZ0JBQXZCO0VBRE87O3dCQUdULGlCQUFBLEdBQW1CLFNBQUMsS0FBRDtBQUNqQixRQUFBO0lBQUEsUUFBQSxHQUFXLENBQUEsQ0FBRSxLQUFLLENBQUMsTUFBUixDQUFlLENBQUMsSUFBaEIsQ0FBcUIsZ0JBQXJCO0lBQ1gsUUFBQSxHQUFXLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLFdBQUEsR0FBWSxRQUF0QjtJQUNYLElBQUcsQ0FBSSxDQUFDLENBQUMsT0FBRixDQUFVLFFBQVEsQ0FBQyxJQUFULENBQUEsQ0FBVixDQUFQO01BQ0UsUUFBUSxDQUFDLEtBQVQsQ0FBQTtBQUNBLGFBRkY7O0lBSUEsTUFBQSxHQUFhLElBQUEsTUFBQSxDQUFPO01BQUEsS0FBQSxFQUFRLFFBQVI7S0FBUDtXQUNiLE1BQU0sQ0FBQyxLQUFQLENBQ0U7TUFBQSxPQUFBLEVBQVMsU0FBQTtBQUNQLFlBQUE7UUFBQSxJQUFBLEdBQVcsSUFBQSxhQUFBLENBQ1Q7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QUMsTUFBbEIsQ0FBeUIsbUJBQXpCO2NBQ3ZDLE9BQUEsR0FBVSxNQUFBLENBQU8sU0FBUCxDQUFpQixDQUFDLE9BQWxCLENBQUEsRUFOWjs7WUFRQSxJQUFBLEdBQWEsSUFBRCxHQUFNLElBQU4sR0FBVSxPQUFWLEdBQWtCO1lBQzlCLFFBQUEsSUFBWSxRQUFBLEdBRUwsRUFGSyxHQUVELEtBRkMsR0FHTCxJQUhLLEdBR0MsMkJBSEQsR0FJa0IsR0FBRyxDQUFDLEVBSnRCLEdBSXlCLDRCQUp6QixHQUlxRCxLQUFDLENBQUEsSUFBSSxDQUFDLE9BSjNELEdBSW1FLDZCQUpuRSxHQUtXLEdBQUcsQ0FBQyxFQUxmLEdBS2tCO0FBbEJoQztVQXNCQSxLQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxvQkFBVixDQUErQixDQUFDLElBQWhDLENBQXFDLFFBQXJDO2lCQUVBLEtBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsQ0FBQyxLQUFqQixDQUFBO1FBNUNPO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQVBUO0tBREY7RUFMYTs7d0JBMkRmLFdBQUEsR0FBYSxTQUFBO0FBQ1gsUUFBQTtBQUFBO0FBQUE7U0FBQSxxQ0FBQTs7NERBQ0UsSUFBSSxDQUFDO0FBRFA7O0VBRFc7O3dCQUliLGFBQUEsR0FBYyxTQUFBO0FBQ1osUUFBQTtBQUFBO0FBQUEsU0FBQSxxQ0FBQTs7TUFDRSxJQUFJLENBQUMsS0FBTCxDQUFBO0FBREY7V0FFQSxJQUFDLENBQUEsUUFBRCxHQUFZO0VBSEE7Ozs7R0E3U1UsUUFBUSxDQUFDIiwiZmlsZSI6InJlc3VsdC9SZXN1bHRzVmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFJlc3VsdHNWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZSA6IFwiUmVzdWx0c1ZpZXdcIlxuXG4gIGV2ZW50czpcbiAgICAnY2xpY2sgLmNsb3VkJyAgICA6ICdjbG91ZCdcbiAgICAnY2xpY2sgLnRhYmxldHMnICA6ICd0YWJsZXRzJ1xuICAgICdjbGljayAuZGV0ZWN0JyAgIDogJ2RldGVjdE9wdGlvbnMnXG4gICAgJ2NsaWNrIC5kZXRhaWxzJyAgOiAnc2hvd1Jlc3VsdFN1bVZpZXcnXG4gICAgJ2NsaWNrIC5yZWZyZXNoJyAgOiAncmVmcmVzaCdcbiAgICAnY2xpY2sgLnNob3dfYWR2YW5jZWQnIDogJ3RvZ2dsZUFkdmFuY2VkJ1xuXG4gICAgJ2NoYW5nZSAjbGltaXQnIDogXCJzZXRMaW1pdFwiXG4gICAgJ2NoYW5nZSAjcGFnZScgOiBcInNldE9mZnNldFwiXG5cbiAgdG9nZ2xlQWR2YW5jZWQ6IC0+XG4gICAgQCRlbC5maW5kKFwiI2FkdmFuY2VkXCIpLnRvZ2dsZUNsYXNzKFwiY29uZmlybWF0aW9uXCIpXG5cbiAgcmVmcmVzaDogLT5cbiAgICBVdGlscy5yZXN0YXJ0VGFuZ2VyaW5lKFwiUGxlYXNlIHdhaXQuLi5cIilcblxuICBzaG93UmVzdWx0U3VtVmlldzogKGV2ZW50KSAtPlxuICAgIHRhcmdldElkID0gJChldmVudC50YXJnZXQpLmF0dHIoXCJkYXRhLXJlc3VsdC1pZFwiKVxuICAgICRkZXRhaWxzID0gQCRlbC5maW5kKFwiI2RldGFpbHNfI3t0YXJnZXRJZH1cIilcbiAgICBpZiBub3QgXy5pc0VtcHR5KCRkZXRhaWxzLmh0bWwoKSlcbiAgICAgICRkZXRhaWxzLmVtcHR5KClcbiAgICAgIHJldHVyblxuXG4gICAgcmVzdWx0ID0gbmV3IFJlc3VsdCBcIl9pZFwiIDogdGFyZ2V0SWRcbiAgICByZXN1bHQuZmV0Y2hcbiAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgIHZpZXcgPSBuZXcgUmVzdWx0U3VtVmlld1xuICAgICAgICAgIG1vZGVsICAgICAgIDogcmVzdWx0XG4gICAgICAgICAgZmluaXNoQ2hlY2sgOiB0cnVlXG4gICAgICAgIHZpZXcucmVuZGVyKClcbiAgICAgICAgJGRldGFpbHMuaHRtbCBcIjxkaXYgY2xhc3M9J2luZm9fYm94Jz5cIiArICQodmlldy5lbCkuaHRtbCgpICsgXCI8L2Rpdj5cIlxuICAgICAgICB2aWV3LmNsb3NlKClcblxuXG5cbiAgY2xvdWQ6IC0+XG4gICAgaWYgQGF2YWlsYWJsZS5jbG91ZC5va1xuICAgICAgJC5jb3VjaC5yZXBsaWNhdGUoXG4gICAgICAgIFRhbmdlcmluZS5zZXR0aW5ncy51cmxEQihcImxvY2FsXCIpLFxuICAgICAgICBUYW5nZXJpbmUuc2V0dGluZ3MudXJsREIoXCJncm91cFwiKSxcbiAgICAgICAgICBzdWNjZXNzOiAgICAgID0+XG4gICAgICAgICAgICBAJGVsLmZpbmQoXCIuc3RhdHVzXCIpLmZpbmQoXCIuaW5mb19ib3hcIikuaHRtbCBcIlJlc3VsdHMgc3luY2VkIHRvIGNsb3VkIHN1Y2Nlc3NmdWxseVwiXG4gICAgICAgICAgZXJyb3I6IChhLCBiKSA9PlxuICAgICAgICAgICAgQCRlbC5maW5kKFwiLnN0YXR1c1wiKS5maW5kKFwiLmluZm9fYm94XCIpLmh0bWwgXCI8ZGl2PlN5bmMgZXJyb3I8L2Rpdj48ZGl2PiN7YX0gI3tifTwvZGl2PlwiXG4gICAgICAgICxcbiAgICAgICAgICBkb2NfaWRzOiBAZG9jTGlzdFxuICAgICAgKVxuICAgIGVsc2VcbiAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiQ2Fubm90IGRldGVjdCBjbG91ZFwiXG4gICAgcmV0dXJuIGZhbHNlXG5cblxuICB0YWJsZXRzOiAtPlxuICAgIGlmIEBhdmFpbGFibGUudGFibGV0cy5va0NvdW50ID4gMFxuICAgICAgZm9yIGlwIGluIEBhdmFpbGFibGUudGFibGV0cy5pcHNcbiAgICAgICAgZG8gKGlwKSA9PlxuICAgICAgICAgICQuY291Y2gucmVwbGljYXRlKFxuICAgICAgICAgICAgVGFuZ2VyaW5lLnNldHRpbmdzLnVybERCKFwibG9jYWxcIiksXG4gICAgICAgICAgICBUYW5nZXJpbmUuc2V0dGluZ3MudXJsU3VibmV0KGlwKSxcbiAgICAgICAgICAgICAgc3VjY2VzczogICAgICA9PlxuICAgICAgICAgICAgICAgIEAkZWwuZmluZChcIi5zdGF0dXNcIikuZmluZChcIi5pbmZvX2JveFwiKS5odG1sIFwiUmVzdWx0cyBzeW5jZWQgdG8gI3tAYXZhaWxhYmxlLnRhYmxldHMub2tDb3VudH0gc3VjY2Vzc2Z1bGx5XCJcbiAgICAgICAgICAgICAgZXJyb3I6IChhLCBiKSA9PlxuICAgICAgICAgICAgICAgIEAkZWwuZmluZChcIi5zdGF0dXNcIikuZmluZChcIi5pbmZvX2JveFwiKS5odG1sIFwiPGRpdj5TeW5jIGVycm9yPC9kaXY+PGRpdj4je2F9ICN7Yn08L2Rpdj5cIlxuICAgICAgICAgICAgLFxuICAgICAgICAgICAgICBkb2NfaWRzOiBAZG9jTGlzdFxuICAgICAgICAgIClcbiAgICBlbHNlXG4gICAgICBVdGlscy5taWRBbGVydCBcIkNhbm5vdCBkZXRlY3QgdGFibGV0c1wiXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgaW5pdERldGVjdE9wdGlvbnM6IC0+XG4gICAgQGF2YWlsYWJsZSA9XG4gICAgICBjbG91ZCA6XG4gICAgICAgIG9rIDogZmFsc2VcbiAgICAgICAgY2hlY2tlZCA6IGZhbHNlXG4gICAgICB0YWJsZXRzIDpcbiAgICAgICAgaXBzIDogW11cbiAgICAgICAgb2tDb3VudCAgOiAwXG4gICAgICAgIGNoZWNrZWQgIDogMFxuICAgICAgICB0b3RhbCA6IDI1NlxuXG4gIGRldGVjdE9wdGlvbnM6IC0+XG4gICAgJChcImJ1dHRvbi5jbG91ZCwgYnV0dG9uLnRhYmxldHNcIikuYXR0cihcImRpc2FibGVkXCIsIFwiZGlzYWJsZWRcIilcbiAgICBAZGV0ZWN0Q2xvdWQoKVxuICAgIEBkZXRlY3RUYWJsZXRzKClcblxuICBkZXRlY3RDbG91ZDogLT5cbiAgICAjIERldGVjdCBDbG91ZFxuICAgICQuYWpheFxuICAgICAgZGF0YVR5cGU6IFwianNvbnBcIlxuICAgICAgdXJsOiBUYW5nZXJpbmUuc2V0dGluZ3MudXJsSG9zdChcImdyb3VwXCIpXG4gICAgICBzdWNjZXNzOiAoYSwgYikgPT5cbiAgICAgICAgQGF2YWlsYWJsZS5jbG91ZC5vayA9IHRydWVcbiAgICAgIGVycm9yOiAoYSwgYikgPT5cbiAgICAgICAgQGF2YWlsYWJsZS5jbG91ZC5vayA9IGZhbHNlXG4gICAgICBjb21wbGV0ZTogPT5cbiAgICAgICAgQGF2YWlsYWJsZS5jbG91ZC5jaGVja2VkID0gdHJ1ZVxuICAgICAgICBAdXBkYXRlT3B0aW9ucygpXG5cbiAgZGV0ZWN0VGFibGV0czogPT5cbiAgICBmb3IgbG9jYWwgaW4gWzAuLjI1NV1cbiAgICAgIGRvIChsb2NhbCkgPT5cbiAgICAgICAgaXAgPSBUYW5nZXJpbmUuc2V0dGluZ3Muc3VibmV0SVAobG9jYWwpXG4gICAgICAgICQuYWpheFxuICAgICAgICAgIHVybDogVGFuZ2VyaW5lLnNldHRpbmdzLnVybFN1Ym5ldChpcClcbiAgICAgICAgICBkYXRhVHlwZTogXCJqc29ucFwiXG4gICAgICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04XCIsXG4gICAgICAgICAgdGltZW91dDogMzAwMDBcbiAgICAgICAgICBjb21wbGV0ZTogICh4aHIsIGVycm9yKSA9PlxuICAgICAgICAgICAgQGF2YWlsYWJsZS50YWJsZXRzLmNoZWNrZWQrK1xuICAgICAgICAgICAgaWYgeGhyLnN0YXR1cyA9PSAyMDBcbiAgICAgICAgICAgICAgQGF2YWlsYWJsZS50YWJsZXRzLm9rQ291bnQrK1xuICAgICAgICAgICAgICBAYXZhaWxhYmxlLnRhYmxldHMuaXBzLnB1c2ggaXBcbiAgICAgICAgICAgIEB1cGRhdGVPcHRpb25zKClcblxuICB1cGRhdGVPcHRpb25zOiA9PlxuICAgIHBlcmNlbnRhZ2UgPSBNYXRoLmRlY2ltYWxzKChAYXZhaWxhYmxlLnRhYmxldHMuY2hlY2tlZCAvIEBhdmFpbGFibGUudGFibGV0cy50b3RhbCkgKiAxMDAsIDIpXG4gICAgaWYgcGVyY2VudGFnZSA9PSAxMDBcbiAgICAgIG1lc3NhZ2UgPSBcImZpbmlzaGVkXCJcbiAgICBlbHNlXG4gICAgICBtZXNzYWdlID0gXCIje3BlcmNlbnRhZ2V9JVwiXG4gICAgdGFibGV0TWVzc2FnZSA9IFwiU2VhcmNoaW5nIGZvciB0YWJsZXRzOiAje21lc3NhZ2V9XCJcblxuICAgIEAkZWwuZmluZChcIi5jaGVja2luZ19zdGF0dXNcIikuaHRtbCBcIiN7dGFibGV0TWVzc2FnZX1cIiBpZiBAYXZhaWxhYmxlLnRhYmxldHMuY2hlY2tlZCA+IDBcblxuICAgIGlmIEBhdmFpbGFibGUuY2xvdWQuY2hlY2tlZCAmJiBAYXZhaWxhYmxlLnRhYmxldHMuY2hlY2tlZCA9PSBAYXZhaWxhYmxlLnRhYmxldHMudG90YWxcbiAgICAgIEAkZWwuZmluZChcIi5zdGF0dXMgLmluZm9fYm94XCIpLmh0bWwgXCJEb25lIGRldGVjdGluZyBvcHRpb25zXCJcbiAgICAgIEAkZWwuZmluZChcIi5jaGVja2luZ19zdGF0dXNcIikuaGlkZSgpXG5cbiAgICBpZiBAYXZhaWxhYmxlLmNsb3VkLm9rXG4gICAgICBAJGVsLmZpbmQoJ2J1dHRvbi5jbG91ZCcpLnJlbW92ZUF0dHIoJ2Rpc2FibGVkJylcbiAgICBpZiBAYXZhaWxhYmxlLnRhYmxldHMub2tDb3VudCA+IDAgJiYgcGVyY2VudGFnZSA9PSAxMDBcbiAgICAgIEAkZWwuZmluZCgnYnV0dG9uLnRhYmxldHMnKS5yZW1vdmVBdHRyKCdkaXNhYmxlZCcpXG5cblxuICBpMThuOiAtPlxuICAgIEB0ZXh0ID1cbiAgICAgIHNhdmVPcHRpb25zIDogdChcIlJlc3VsdHNWaWV3LmxhYmVsLnNhdmVfb3B0aW9uc1wiKVxuICAgICAgY2xvdWQgICAgICAgOiB0KFwiUmVzdWx0c1ZpZXcubGFiZWwuY2xvdWRcIilcbiAgICAgIHRhYmxldHMgICAgIDogdChcIlJlc3VsdHNWaWV3LmxhYmVsLnRhYmxldHNcIilcbiAgICAgIGNzdiAgICAgICAgIDogdChcIlJlc3VsdHNWaWV3LmxhYmVsLmNzdlwiKVxuICAgICAgc3RhcnRlZCAgICAgOiB0KFwiUmVzdWx0c1ZpZXcubGFiZWwuc3RhcnRlZFwiKVxuICAgICAgcmVzdWx0cyAgICAgOiB0KFwiUmVzdWx0c1ZpZXcubGFiZWwucmVzdWx0c1wiKVxuICAgICAgZGV0YWlscyAgICAgOiB0KFwiUmVzdWx0c1ZpZXcubGFiZWwuZGV0YWlsc1wiKVxuICAgICAgcGFnZSAgICAgICAgOiB0KFwiUmVzdWx0c1ZpZXcubGFiZWwucGFnZVwiKVxuICAgICAgcGVyUGFnZSAgICAgOiB0KFwiUmVzdWx0c1ZpZXcubGFiZWwucGVyX3BhZ2VcIilcbiAgICAgIGFkdmFuY2VkICAgIDogdChcIlJlc3VsdHNWaWV3LmxhYmVsLmFkdmFuY2VkXCIpXG5cbiAgICAgIG5vUmVzdWx0cyAgIDogdChcIlJlc3VsdHNWaWV3Lm1lc3NhZ2Uubm9fcmVzdWx0c1wiKVxuXG4gICAgICByZWZyZXNoICAgICA6IHQoXCJSZXN1bHRzVmlldy5idXR0b24ucmVmcmVzaFwiKVxuICAgICAgZGV0ZWN0ICAgICAgOiB0KFwiUmVzdWx0c1ZpZXcuYnV0dG9uLmRldGVjdFwiKVxuXG4gIGluaXRpYWxpemU6ICggb3B0aW9ucyApIC0+XG5cbiAgICBAaTE4bigpXG5cbiAgICBAcmVzdWx0TGltaXQgID0gMTAwXG4gICAgQHJlc3VsdE9mZnNldCA9IDBcblxuICAgIEBzdWJWaWV3cyA9IFtdXG4gICAgQHJlc3VsdHMgPSBvcHRpb25zLnJlc3VsdHNcbiAgICBAYXNzZXNzbWVudCA9IG9wdGlvbnMuYXNzZXNzbWVudFxuICAgIEBkb2NMaXN0ID0gW11cbiAgICBmb3IgcmVzdWx0IGluIEByZXN1bHRzXG4gICAgICBAZG9jTGlzdC5wdXNoIHJlc3VsdC5nZXQgXCJpZFwiXG4gICAgQGluaXREZXRlY3RPcHRpb25zKClcbiAgICBAZGV0ZWN0Q2xvdWQoKVxuXG4gIHJlbmRlcjogLT5cblxuICAgIEBjbGVhclN1YlZpZXdzKClcblxuICAgIGh0bWwgPSBcIlxuICAgICAgPGgxPiN7QGFzc2Vzc21lbnQuZ2V0RXNjYXBlZFN0cmluZygnbmFtZScpfSAje0B0ZXh0LnJlc3VsdHN9PC9oMT5cbiAgICAgIDxoMj4je0B0ZXh0LnNhdmVPcHRpb25zfTwvaDI+XG4gICAgICA8ZGl2IGNsYXNzPSdtZW51X2JveCc+XG5cbiAgICAgICAgPGEgaHJlZj0nL2Jyb2NrbWFuL2Fzc2Vzc21lbnQvI3tUYW5nZXJpbmUuZGJfbmFtZX0vI3tAYXNzZXNzbWVudC5pZH0nPjxidXR0b24gY2xhc3M9J2NzdiBjb21tYW5kJz4je0B0ZXh0LmNzdn08L2J1dHRvbj48L2E+XG5cbiAgICAgICAgPCEtLWRpdiBjbGFzcz0nc21hbGxfZ3JleSBjbGlja2FibGUgc2hvd19hZHZhbmNlZCc+I3tAdGV4dC5hZHZhbmNlZH08L2Rpdi0tPlxuICAgICAgICA8ZGl2IGlkPSdhZHZhbmNlZCcgY2xhc3M9J2NvbmZpcm1hdGlvbic+XG4gICAgICAgICAgPGRpdiBjbGFzcz0nbWVudV9ib3gnPlxuICAgICAgICAgICAgPHRhYmxlIGNsYXNzPSdjbGFzc190YWJsZSc+XG4gICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICA8dGQ+PGxhYmVsIGZvcj0nZXhjbHVkZXMnIHRpdGxlPSdTcGFjZSBkZWxpbWl0ZWQsIGFjY2VwdHMgc3RyaW5nIGxpdGVyYWxzIG9yIHJlZ3VsYXIgZXhwcmVzc2lvbnMgd3JhcHBlZCBpbiAvIGNoYXJhY3RlcnMuJz5FeGNsdWRlIHZhcmlhYmxlczwvbGFiZWw+PC90ZD5cbiAgICAgICAgICAgICAgICA8dGQ+PGlucHV0IGlkPSdleGNsdWRlcyc+PC90ZD5cbiAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgIDx0ZD48bGFiZWwgZm9yPSdpbmNsdWRlcycgdGl0bGU9J1NwYWNlIGRlbGltaXRlZCwgYWNjZXB0cyBzdHJpbmcgbGl0ZXJhbHMgb3IgcmVndWxhciBleHByZXNzaW9ucyB3cmFwcGVkIGluIC8gY2hhcmFjdGVycy4gT3ZlcnJpZGVzIGV4Y2x1c2lvbnMuJz5JbmNsdWRlIHZhcmlhYmxlczwvbGFiZWw+PC90ZD5cbiAgICAgICAgICAgICAgICA8dGQ+PGlucHV0IGlkPSdpbmNsdWRlcyc+PC90ZD5cbiAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgIDwvdGFibGU+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgXCJcblxuICAgIGh0bWwgKz0gXCJcbiAgICAgIDxoMiBpZD0ncmVzdWx0c19oZWFkZXInPiN7QHRleHQucmVzdWx0c30gKDxzcGFuIGlkPSdyZXN1bHRfcG9zaXRpb24nPmxvYWRpbmcuLi48L3NwYW4+KTwvaDI+XG4gICAgICA8ZGl2IGNsYXNzPSdjb25maXJtYXRpb24nIGlkPSdjb250cm9scyc+XG4gICAgICAgIDxsYWJlbCBmb3I9J3BhZ2UnIGNsYXNzPSdzbWFsbF9ncmV5Jz4je0B0ZXh0LnBhZ2V9PC9sYWJlbD48aW5wdXQgaWQ9J3BhZ2UnIHR5cGU9J251bWJlcicgdmFsdWU9JzAnPlxuICAgICAgICA8bGFiZWwgZm9yPSdsaW1pdCcgY2xhc3M9J3NtYWxsX2dyZXknPiN7QHRleHQucGVyUGFnZX08L2xhYmVsPjxpbnB1dCBpZD0nbGltaXQnIHR5cGU9J251bWJlcicgdmFsdWU9JzAnPlxuICAgICAgPC9kaXY+XG4gICAgICA8c2VjdGlvbiBpZD0ncmVzdWx0c19jb250YWluZXInPjwvc2VjdGlvbj5cbiAgICAgIDxicj5cbiAgICAgIDxidXR0b24gY2xhc3M9J2NvbW1hbmQgcmVmcmVzaCc+I3tAdGV4dC5yZWZyZXNofTwvYnV0dG9uPlxuICAgIFwiXG5cbiAgICBAJGVsLmh0bWwgaHRtbFxuXG4gICAgQHVwZGF0ZVJlc3VsdHMoKVxuXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG5cbiAgc2V0TGltaXQ6IChldmVudCkgLT5cbiAgICAjIEByZXN1bHRPZmZzZXRcbiAgICAjIEByZXN1bHRMaW1pdFxuXG4gICAgQHJlc3VsdExpbWl0ID0gcGFyc2VJbnQoJChcIiNsaW1pdFwiKS52YWwoKSkgfHwgMTAwICMgZGVmYXVsdCAxMDBcbiAgICBAdXBkYXRlUmVzdWx0cygpXG5cbiAgc2V0T2Zmc2V0OiAoZXZlbnQpIC0+XG4gICAgIyBAcmVzdWx0T2Zmc2V0XG4gICAgIyBAcmVzdWx0TGltaXRcblxuICAgIHZhbCAgICAgICAgICAgPSBwYXJzZUludCgkKFwiI3BhZ2VcIikudmFsKCkpIHx8IDFcbiAgICBjYWxjdWxhdGVkICAgID0gKHZhbCAtIDEpICogQHJlc3VsdExpbWl0XG4gICAgbWF4UGFnZSAgICAgICA9IE1hdGguZmxvb3IoQHJlc3VsdHMubGVuZ3RoIC8gQHJlc3VsdExpbWl0IClcbiAgICBAcmVzdWx0T2Zmc2V0ID0gTWF0aC5saW1pdCgwLCBjYWxjdWxhdGVkLCBtYXhQYWdlICogQHJlc3VsdExpbWl0KSAjIGRlZmF1bHQgcGFnZSAxID09IDBfb2Zmc2V0XG5cbiAgICBAdXBkYXRlUmVzdWx0cygpXG5cbiAgdXBkYXRlUmVzdWx0czogKGZvY3VzKSA9PlxuICAgIGlmIEByZXN1bHRzPy5sZW5ndGggPT0gMFxuICAgICAgQCRlbC5maW5kKCcjcmVzdWx0c19oZWFkZXInKS5odG1sIEB0ZXh0Lm5vUmVzdWx0c1xuICAgICAgcmV0dXJuXG5cbiAgICAkLmFqYXhcbiAgICAgIHVybDogVGFuZ2VyaW5lLnNldHRpbmdzLnVybFZpZXcoJ2dyb3VwJywgXCJyZXN1bHRTdW1tYXJ5QnlBc3Nlc3NtZW50SWRcIikrXCI/ZGVzY2VuZGluZz10cnVlJmxpbWl0PSN7QHJlc3VsdExpbWl0fSZza2lwPSN7QHJlc3VsdE9mZnNldH1cIlxuICAgICAgdHlwZTogXCJQT1NUXCJcbiAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiXG4gICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeShcbiAgICAgICAga2V5cyA6IFtAYXNzZXNzbWVudC5pZF1cbiAgICAgIClcbiAgICAgIHN1Y2Nlc3M6ICggZGF0YSApID0+XG5cbiAgICAgICAgcm93cyAgPSBkYXRhLnJvd3NcbiAgICAgICAgY291bnQgPSByb3dzLmxlbmd0aFxuXG4gICAgICAgIG1heFJlc3VsdHMgID0gMTAwXG4gICAgICAgIGN1cnJlbnRQYWdlID0gTWF0aC5mbG9vciggQHJlc3VsdE9mZnNldCAvIEByZXN1bHRMaW1pdCApICsgMVxuXG4gICAgICAgIGlmIEByZXN1bHRzLmxlbmd0aCA+IG1heFJlc3VsdHNcbiAgICAgICAgICBAJGVsLmZpbmQoXCIjY29udHJvbHNcIikucmVtb3ZlQ2xhc3MoXCJjb25maXJtYXRpb25cIilcbiAgICAgICAgICBAJGVsLmZpbmQoXCIjcGFnZVwiKS52YWwoY3VycmVudFBhZ2UpXG4gICAgICAgICAgQCRlbC5maW5kKFwiI2xpbWl0XCIpLnZhbChAcmVzdWx0TGltaXQpXG5cbiAgICAgICAgc3RhcnQgPSBAcmVzdWx0T2Zmc2V0ICsgMVxuICAgICAgICBlbmQgICA9IE1hdGgubWluKEByZXN1bHRPZmZzZXQrQHJlc3VsdExpbWl0LEByZXN1bHRzLmxlbmd0aClcbiAgICAgICAgdG90YWwgPSBAcmVzdWx0cy5sZW5ndGhcblxuICAgICAgICBAJGVsLmZpbmQoJyNyZXN1bHRfcG9zaXRpb24nKS5odG1sIHQoXCJSZXN1bHRzVmlldy5sYWJlbC5wYWdpbmF0aW9uXCIsIHtzdGFydDpzdGFydCwgZW5kOmVuZCwgdG90YWw6dG90YWx9IClcblxuICAgICAgICBodG1sUm93cyA9IFwiXCJcbiAgICAgICAgZm9yIHJvdyBpbiByb3dzXG5cbiAgICAgICAgICBpZCAgICAgID0gcm93LnZhbHVlPy5wYXJ0aWNpcGFudF9pZCB8fCBcIk5vIElEXCJcbiAgICAgICAgICBlbmRUaW1lID0gcm93LnZhbHVlLmVuZF90aW1lXG4gICAgICAgICAgaWYgZW5kVGltZT9cbiAgICAgICAgICAgIGxvbmcgICAgPSBtb21lbnQoZW5kVGltZSkuZm9ybWF0KCdZWVlZLU1NTS1ERCBISDptbScpXG4gICAgICAgICAgICBmcm9tTm93ID0gbW9tZW50KGVuZFRpbWUpLmZyb21Ob3coKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHN0YXJ0VGltZSA9IHJvdy52YWx1ZS5zdGFydF90aW1lXG4gICAgICAgICAgICBsb25nICAgID0gXCI8Yj4je0B0ZXh0LnN0YXJ0ZWR9PC9iPiBcIiArIG1vbWVudChzdGFydFRpbWUpLmZvcm1hdCgnWVlZWS1NTU0tREQgSEg6bW0nKVxuICAgICAgICAgICAgZnJvbU5vdyA9IG1vbWVudChzdGFydFRpbWUpLmZyb21Ob3coKVxuXG4gICAgICAgICAgdGltZSAgICA9IFwiI3tsb25nfSAoI3tmcm9tTm93fSlcIlxuICAgICAgICAgIGh0bWxSb3dzICs9IFwiXG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAjeyBpZCB9IC1cbiAgICAgICAgICAgICAgI3sgdGltZSB9XG4gICAgICAgICAgICAgIDxidXR0b24gZGF0YS1yZXN1bHQtaWQ9JyN7cm93LmlkfScgY2xhc3M9J2RldGFpbHMgY29tbWFuZCc+I3tAdGV4dC5kZXRhaWxzfTwvYnV0dG9uPlxuICAgICAgICAgICAgICA8ZGl2IGlkPSdkZXRhaWxzXyN7cm93LmlkfSc+PC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICBcIlxuXG4gICAgICAgIEAkZWwuZmluZChcIiNyZXN1bHRzX2NvbnRhaW5lclwiKS5odG1sIGh0bWxSb3dzXG5cbiAgICAgICAgQCRlbC5maW5kKGZvY3VzKS5mb2N1cygpXG5cbiAgYWZ0ZXJSZW5kZXI6ID0+XG4gICAgZm9yIHZpZXcgaW4gQHN1YlZpZXdzXG4gICAgICB2aWV3LmFmdGVyUmVuZGVyPygpXG5cbiAgY2xlYXJTdWJWaWV3czotPlxuICAgIGZvciB2aWV3IGluIEBzdWJWaWV3c1xuICAgICAgdmlldy5jbG9zZSgpXG4gICAgQHN1YlZpZXdzID0gW11cbiJdfQ==
