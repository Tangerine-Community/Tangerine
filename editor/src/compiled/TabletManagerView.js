var TabletManagerView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

TabletManagerView = (function(superClass) {
  extend(TabletManagerView, superClass);

  function TabletManagerView() {
    this.pushDocs = bind(this.pushDocs, this);
    this.updatePullResult = bind(this.updatePullResult, this);
    this.updatePull = bind(this.updatePull, this);
    this.pullDocs = bind(this.pullDocs, this);
    this.sync = bind(this.sync, this);
    return TabletManagerView.__super__.constructor.apply(this, arguments);
  }

  TabletManagerView.prototype.className = "KlassesView";

  TabletManagerView.prototype.i18n = function() {
    return this.text = {
      detectingTablets: t("TabletManagerView.message.detecting"),
      syncComplete: t("TabletManagerView.label.sync_complete")
    };
  };

  TabletManagerView.prototype.initialize = function(options) {
    this.i18n();
    this.ipBlock = 32;
    this.totalIps = 256;
    this.tabletOffset = 0;
    this.callbacks = options.callbacks;
    return this.docTypes = options.docTypes;
  };

  TabletManagerView.prototype.sync = function() {
    if (this.tabletOffset !== 0) {
      return;
    }
    return this.pullDocs();
  };

  TabletManagerView.prototype.pullDocs = function() {
    if (this.tabletOffset === 0) {
      this.tablets = {
        checked: 0,
        complete: 0,
        successful: 0,
        okCount: 0,
        ips: [],
        result: 0
      };
      Utils.midAlert(this.text.detectingTablets);
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
                timeout: 20000
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
        return Utils.midAlert(this.text.internalError);
      }
    });
  };

  TabletManagerView.prototype.updatePull = function() {
    var i, ip, len, percentage, ref, results;
    if (this.tablets.checked < this.ipBlock + this.tabletOffset) {
      return;
    }
    if (this.tabletOffset !== this.totalIps - this.ipBlock) {
      percentage = Math.round(this.tabletOffset / this.totalIps * 100);
      Utils.midAlert(t("TabletManagerView.message.searching", {
        percentage: percentage
      }));
      this.tabletOffset += this.ipBlock;
      return this.pullDocs();
    } else {
      this.tablets.okCount = Math.max(this.tablets.okCount - 1, 0);
      if (this.tablets.okCount === 0) {
        this.tabletOffset = 0;
        Utils.working(false);
        Utils.midAlert(t("TabletManagerView.message.found", {
          count: this.tablets.okCount
        }));
        Tangerine.$db.removeDoc({
          "_id": this.randomDoc.id,
          "_rev": this.randomDoc.rev
        });
        return;
      }
      if (!confirm(t("TabletManagerView.message.confirm_pull", {
        __found__: this.tablets.okCount
      }))) {
        this.tabletOffset = 0;
        Utils.working(false);
        Tangerine.$db.removeDoc({
          "_id": this.randomDoc.id,
          "_rev": this.randomDoc.rev
        });
        return;
      }
      Utils.midAlert(t("TabletManagerView.message.pull_status", {
        tabletCount: this.tablets.okCount
      }));
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
            selfReq.success(function(data, xhr, error) {
              return _this.selfSubnetIp = ip;
            });
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
                    keys: JSON.stringify(_this.docTypes)
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

  TabletManagerView.prototype.updatePullResult = function() {
    var base;
    if (this.tablets.complete === this.tablets.okCount) {
      Utils.working(false);
      Utils.midAlert(t("TabletManagerView.message.pull_complete", {
        successful: this.tablets.successful,
        total: this.tablets.okCount
      }));
      Tangerine.$db.removeDoc({
        "_id": this.randomDoc.id,
        "_rev": this.randomDoc.rev
      });
      return typeof (base = this.callbacks).completePull === "function" ? base.completePull() : void 0;
    }
  };

  TabletManagerView.prototype.pushDocs = function() {
    if (!_.isObject(this.push)) {
      Utils.working(true);
      return Tangerine.$db.view(Tangerine.design_doc + "/byCollection", {
        keys: this.docTypes,
        success: (function(_this) {
          return function(response) {
            var docIds;
            docIds = _.pluck(response.rows, "id");
            _this.push = {
              ips: _.without(_this.tablets.ips, _this.selfSubnetIp),
              docIds: docIds,
              current: 0,
              complete: 0,
              successful: 0
            };
            return _this.pushDocs();
          };
        })(this)
      });
    } else {
      if (this.push.complete === this.push.ips.length) {
        Utils.working(false);
        return Utils.sticky("<b>" + this.text.syncComplete + "</b><br>" + (t("TabletManagerView.message.successful_count", {
          successful: this.push.successful,
          total: this.push.complete
        })));
      } else {
        Utils.midAlert(t("TabletManagerView.message.syncing", {
          done: this.push.complete + 1,
          total: this.push.ips.length
        }));
        return $.couch.replicate(Tangerine.settings.urlDB("local"), Tangerine.settings.urlSubnet(this.push.ips[this.push.current]), {
          success: (function(_this) {
            return function() {
              _this.push.complete++;
              _this.push.successful++;
              return _this.pushDocs();
            };
          })(this),
          error: (function(_this) {
            return function(a, b) {
              _this.push.complete++;
              return _this.pushDocs();
            };
          })(this)
        }, {
          doc_ids: this.push.docIds
        });
      }
    }
  };

  return TabletManagerView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlc3VsdC9UYWJsZXRNYW5hZ2VyVmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxpQkFBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7Ozs7Ozs4QkFFSixTQUFBLEdBQVk7OzhCQUVaLElBQUEsR0FBTSxTQUFBO1dBQ0osSUFBQyxDQUFBLElBQUQsR0FDRTtNQUFBLGdCQUFBLEVBQW1CLENBQUEsQ0FBRSxxQ0FBRixDQUFuQjtNQUNBLFlBQUEsRUFBbUIsQ0FBQSxDQUFFLHVDQUFGLENBRG5COztFQUZFOzs4QkFLTixVQUFBLEdBQVksU0FBRSxPQUFGO0lBRVYsSUFBQyxDQUFBLElBQUQsQ0FBQTtJQUVBLElBQUMsQ0FBQSxPQUFELEdBQVk7SUFDWixJQUFDLENBQUEsUUFBRCxHQUFZO0lBQ1osSUFBQyxDQUFBLFlBQUQsR0FBZ0I7SUFFaEIsSUFBQyxDQUFBLFNBQUQsR0FBYSxPQUFPLENBQUM7V0FFckIsSUFBQyxDQUFBLFFBQUQsR0FBWSxPQUFPLENBQUM7RUFWVjs7OEJBWVosSUFBQSxHQUFNLFNBQUE7SUFDSixJQUFjLElBQUMsQ0FBQSxZQUFELEtBQWlCLENBQS9CO0FBQUEsYUFBQTs7V0FDQSxJQUFDLENBQUEsUUFBRCxDQUFBO0VBRkk7OzhCQUlOLFFBQUEsR0FBVSxTQUFBO0lBQ1IsSUFBRyxJQUFDLENBQUEsWUFBRCxLQUFpQixDQUFwQjtNQUNFLElBQUMsQ0FBQSxPQUFELEdBQ0U7UUFBQSxPQUFBLEVBQWEsQ0FBYjtRQUNBLFFBQUEsRUFBYSxDQURiO1FBRUEsVUFBQSxFQUFhLENBRmI7UUFHQSxPQUFBLEVBQWEsQ0FIYjtRQUlBLEdBQUEsRUFBYSxFQUpiO1FBS0EsTUFBQSxFQUFhLENBTGI7O01BTUYsS0FBSyxDQUFDLFFBQU4sQ0FBZSxJQUFDLENBQUEsSUFBSSxDQUFDLGdCQUFyQixFQVJGOztJQVVBLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBZDtJQUNBLElBQUMsQ0FBQSxXQUFELEdBQWUsUUFBQSxDQUFT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QSxDQUFkO1VBSUEsS0FBQSxFQUFPLENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUMsQ0FBRCxFQUFJLENBQUo7Y0FDTCxLQUFDLENBQUEsSUFBSSxDQUFDLFFBQU47cUJBQ0EsS0FBQyxDQUFBLFFBQUQsQ0FBQTtZQUZLO1VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUpQO1NBSEosRUFXSTtVQUFBLE9BQUEsRUFBUyxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQWY7U0FYSixFQUxGO09BakJGOztFQURROzs7O0dBakpvQixRQUFRLENBQUMiLCJmaWxlIjoicmVzdWx0L1RhYmxldE1hbmFnZXJWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgVGFibGV0TWFuYWdlclZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lIDogXCJLbGFzc2VzVmlld1wiXG5cbiAgaTE4bjogLT5cbiAgICBAdGV4dCA9XG4gICAgICBkZXRlY3RpbmdUYWJsZXRzIDogdChcIlRhYmxldE1hbmFnZXJWaWV3Lm1lc3NhZ2UuZGV0ZWN0aW5nXCIpXG4gICAgICBzeW5jQ29tcGxldGUgICAgIDogdChcIlRhYmxldE1hbmFnZXJWaWV3LmxhYmVsLnN5bmNfY29tcGxldGVcIilcblxuICBpbml0aWFsaXplOiAoIG9wdGlvbnMgKSAtPlxuXG4gICAgQGkxOG4oKVxuXG4gICAgQGlwQmxvY2sgID0gMzJcbiAgICBAdG90YWxJcHMgPSAyNTZcbiAgICBAdGFibGV0T2Zmc2V0ID0gMFxuXG4gICAgQGNhbGxiYWNrcyA9IG9wdGlvbnMuY2FsbGJhY2tzXG5cbiAgICBAZG9jVHlwZXMgPSBvcHRpb25zLmRvY1R5cGVzXG5cbiAgc3luYzogPT5cbiAgICByZXR1cm4gdW5sZXNzIEB0YWJsZXRPZmZzZXQgaXMgMFxuICAgIEBwdWxsRG9jcygpXG5cbiAgcHVsbERvY3M6ID0+XG4gICAgaWYgQHRhYmxldE9mZnNldCA9PSAwXG4gICAgICBAdGFibGV0cyA9ICMgaWYgeW91IGNhbiB0aGluayBvZiBhIGJldHRlciBpZGVhIEknZCBsaWtlIHRvIHNlZSBpdFxuICAgICAgICBjaGVja2VkICAgIDogMFxuICAgICAgICBjb21wbGV0ZSAgIDogMFxuICAgICAgICBzdWNjZXNzZnVsIDogMFxuICAgICAgICBva0NvdW50ICAgIDogMFxuICAgICAgICBpcHMgICAgICAgIDogW11cbiAgICAgICAgcmVzdWx0ICAgICA6IDBcbiAgICAgIFV0aWxzLm1pZEFsZXJ0IEB0ZXh0LmRldGVjdGluZ1RhYmxldHNcblxuICAgIFV0aWxzLndvcmtpbmcgdHJ1ZVxuICAgIEByYW5kb21JZERvYyA9IGhleF9zaGExKFwiXCIrTWF0aC5yYW5kb20oKSlcbiAgICBUYW5nZXJpbmUuJGRiLnNhdmVEb2MgXG4gICAgICBcIl9pZFwiIDogQHJhbmRvbUlkRG9jXG4gICAgLFxuICAgICAgc3VjY2VzczogKGRvYykgPT5cbiAgICAgICAgQHJhbmRvbURvYyA9IGRvY1xuICAgICAgICBmb3IgbG9jYWwgaW4gW0B0YWJsZXRPZmZzZXQuLihAaXBCbG9jay0xKStAdGFibGV0T2Zmc2V0XVxuICAgICAgICAgIGRvIChsb2NhbCkgPT5cbiAgICAgICAgICAgIGlwID0gVGFuZ2VyaW5lLnNldHRpbmdzLnN1Ym5ldElQKGxvY2FsKVxuICAgICAgICAgICAgcmVxID0gJC5hamF4XG4gICAgICAgICAgICAgIHVybDogVGFuZ2VyaW5lLnNldHRpbmdzLnVybFN1Ym5ldChpcClcbiAgICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvbnBcIlxuICAgICAgICAgICAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLThcIixcbiAgICAgICAgICAgICAgdGltZW91dDogMjAwMDBcbiAgICAgICAgICAgIHJlcS5jb21wbGV0ZSAoeGhyLCBlcnJvcikgPT5cbiAgICAgICAgICAgICAgQHRhYmxldHMuY2hlY2tlZCsrXG4gICAgICAgICAgICAgIGlmIHBhcnNlSW50KHhoci5zdGF0dXMpID09IDIwMFxuICAgICAgICAgICAgICAgIEB0YWJsZXRzLm9rQ291bnQrK1xuICAgICAgICAgICAgICAgIEB0YWJsZXRzLmlwcy5wdXNoIGlwXG4gICAgICAgICAgICAgIEB1cGRhdGVQdWxsKClcbiAgICAgIGVycm9yOiAtPlxuICAgICAgICBVdGlscy53b3JraW5nIGZhbHNlXG4gICAgICAgIFV0aWxzLm1pZEFsZXJ0IEB0ZXh0LmludGVybmFsRXJyb3JcblxuICB1cGRhdGVQdWxsOiA9PlxuICAgICMgZG8gbm90IHByb2Nlc3MgdW5sZXNzIHdlJ3JlIGRvbmUgd2l0aCBjaGVja2luZyB0aGlzIGJsb2NrXG4gICAgcmV0dXJuIGlmIEB0YWJsZXRzLmNoZWNrZWQgPCBAaXBCbG9jayArIEB0YWJsZXRPZmZzZXRcblxuICAgICMgZ2l2ZSB0aGUgY2hvaWNlIHRvIGtlZXAgbG9va2luZyBpZiBub3QgYWxsIHRhYmxldHMgZm91bmRcbiAgICBpZiBAdGFibGV0T2Zmc2V0ICE9IEB0b3RhbElwcyAtIEBpcEJsb2NrICMmJiBjb25maXJtKFwiI3tNYXRoLm1heChAdGFibGV0cy5va0NvdW50LTEsIDApfSB0YWJsZXRzIGZvdW5kLlxcblxcbkNvbnRpbnVlIHNlYXJjaGluZz9cIilcbiAgICAgIHBlcmNlbnRhZ2UgPSBNYXRoLnJvdW5kKEB0YWJsZXRPZmZzZXQgLyBAdG90YWxJcHMgKiAxMDApXG4gICAgICBVdGlscy5taWRBbGVydCB0KFwiVGFibGV0TWFuYWdlclZpZXcubWVzc2FnZS5zZWFyY2hpbmdcIiwgcGVyY2VudGFnZTogcGVyY2VudGFnZSlcbiAgICAgIEB0YWJsZXRPZmZzZXQgKz0gQGlwQmxvY2tcbiAgICAgIEBwdWxsRG9jcygpXG4gICAgZWxzZVxuXG4gICAgICAjIC0xIGJlY2F1c2Ugb25lIG9mIHRoZW0gd2lsbCBiZSB0aGlzIGNvbXB1dGVyXG4gICAgICBAdGFibGV0cy5va0NvdW50ID0gTWF0aC5tYXgoQHRhYmxldHMub2tDb3VudC0xLCAwKVxuXG4gICAgICBpZiBAdGFibGV0cy5va0NvdW50ID09IDBcbiAgICAgICAgQHRhYmxldE9mZnNldCA9IDBcbiAgICAgICAgVXRpbHMud29ya2luZyBmYWxzZVxuICAgICAgICBVdGlscy5taWRBbGVydCB0KFwiVGFibGV0TWFuYWdlclZpZXcubWVzc2FnZS5mb3VuZFwiLCBjb3VudCA6IEB0YWJsZXRzLm9rQ291bnQpXG4gICAgICAgIFRhbmdlcmluZS4kZGIucmVtb3ZlRG9jXG4gICAgICAgICAgXCJfaWRcIiAgOiBAcmFuZG9tRG9jLmlkXG4gICAgICAgICAgXCJfcmV2XCIgOiBAcmFuZG9tRG9jLnJldlxuICAgICAgICByZXR1cm5cblxuICAgICAgdW5sZXNzIGNvbmZpcm0odChcIlRhYmxldE1hbmFnZXJWaWV3Lm1lc3NhZ2UuY29uZmlybV9wdWxsXCIsIF9fZm91bmRfXyA6IEB0YWJsZXRzLm9rQ291bnQpKVxuICAgICAgICBAdGFibGV0T2Zmc2V0ID0gMFxuICAgICAgICBVdGlscy53b3JraW5nIGZhbHNlXG4gICAgICAgIFRhbmdlcmluZS4kZGIucmVtb3ZlRG9jXG4gICAgICAgICAgXCJfaWRcIiAgOiBAcmFuZG9tRG9jLmlkXG4gICAgICAgICAgXCJfcmV2XCIgOiBAcmFuZG9tRG9jLnJldlxuICAgICAgICByZXR1cm5cblxuXG4gICAgICBVdGlscy5taWRBbGVydCB0KFwiVGFibGV0TWFuYWdlclZpZXcubWVzc2FnZS5wdWxsX3N0YXR1c1wiLCB0YWJsZXRDb3VudCA6IEB0YWJsZXRzLm9rQ291bnQpXG4gICAgICBmb3IgaXAgaW4gQHRhYmxldHMuaXBzXG5cbiAgICAgICAgZG8gKGlwKSA9PlxuICAgICAgICAgICMgc2VlIGlmIG91ciByYW5kb20gZG9jdW1lbnQgaXMgb24gdGhlIHNlcnZlciB3ZSBqdXN0IGZvdW5kXG4gICAgICAgICAgc2VsZlJlcSA9ICQuYWpheFxuICAgICAgICAgICAgXCJ1cmxcIiAgICAgICAgIDogVGFuZ2VyaW5lLnNldHRpbmdzLnVybFN1Ym5ldChpcCkgKyBcIi9cIiArIEByYW5kb21JZERvY1xuICAgICAgICAgICAgXCJkYXRhVHlwZVwiICAgIDogXCJqc29ucFwiXG4gICAgICAgICAgICBcInRpbWVvdXRcIiAgICAgOiAxMDAwMFxuICAgICAgICAgICAgXCJjb250ZW50VHlwZVwiIDogXCJhcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLThcIlxuXG4gICAgICAgICAgc2VsZlJlcS5zdWNjZXNzIChkYXRhLCB4aHIsIGVycm9yKSA9PlxuICAgICAgICAgICAgIyBpZiBmb3VuZCBzZWxmIHRoZW4gcmVtZW1iZXIgc2VsZlxuICAgICAgICAgICAgQHNlbGZTdWJuZXRJcCA9IGlwXG5cbiAgICAgICAgICBzZWxmUmVxLmNvbXBsZXRlICh4aHIsIGVycm9yKSA9PiBkbyAoeGhyKSA9PlxuICAgICAgICAgICAgcmV0dXJuIGlmIHBhcnNlSW50KHhoci5zdGF0dXMpID09IDIwMFxuICAgICAgICAgICAgIyBpZiBub3QsIHRoZW4gd2UgZm91bmQgYW5vdGhlciB0YWJsZXRcbiAgICAgICAgICAgIHZpZXdSZXEgPSAkLmFqYXhcbiAgICAgICAgICAgICAgXCJ1cmxcIiAgICAgICAgIDogVGFuZ2VyaW5lLnNldHRpbmdzLnVybFN1Ym5ldChpcCkgKyBcIi9fZGVzaWduL3RhbmdlcmluZS9fdmlldy9ieUNvbGxlY3Rpb25cIlxuICAgICAgICAgICAgICBcImRhdGFUeXBlXCIgICAgOiBcImpzb25wXCJcbiAgICAgICAgICAgICAgXCJjb250ZW50VHlwZVwiIDogXCJhcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLThcIixcbiAgICAgICAgICAgICAgXCJkYXRhXCIgICAgICAgIDogXG4gICAgICAgICAgICAgICAgaW5jbHVkZV9kb2NzIDogZmFsc2VcbiAgICAgICAgICAgICAgICBrZXlzIDogSlNPTi5zdHJpbmdpZnkoQGRvY1R5cGVzKVxuXG4gICAgICAgICAgICB2aWV3UmVxLnN1Y2Nlc3MgKGRhdGEpID0+XG4gICAgICAgICAgICAgIGRvY0xpc3QgPSAoZGF0dW0uaWQgZm9yIGRhdHVtIGluIGRhdGEucm93cylcbiAgICAgICAgICAgICAgJC5jb3VjaC5yZXBsaWNhdGUoXG4gICAgICAgICAgICAgICAgVGFuZ2VyaW5lLnNldHRpbmdzLnVybFN1Ym5ldChpcCksXG4gICAgICAgICAgICAgICAgVGFuZ2VyaW5lLnNldHRpbmdzLnVybERCKFwibG9jYWxcIiksXG4gICAgICAgICAgICAgICAgICBzdWNjZXNzOiAgICAgID0+XG4gICAgICAgICAgICAgICAgICAgIEB0YWJsZXRzLmNvbXBsZXRlKytcbiAgICAgICAgICAgICAgICAgICAgQHRhYmxldHMuc3VjY2Vzc2Z1bCsrXG4gICAgICAgICAgICAgICAgICAgIEB1cGRhdGVQdWxsUmVzdWx0KClcbiAgICAgICAgICAgICAgICAgIGVycm9yOiAoYSwgYikgPT5cbiAgICAgICAgICAgICAgICAgICAgQHRhYmxldHMuY29tcGxldGUrK1xuICAgICAgICAgICAgICAgICAgICBAdXBkYXRlUHVsbFJlc3VsdCgpXG4gICAgICAgICAgICAgICAgLFxuICAgICAgICAgICAgICAgICAgZG9jX2lkczogZG9jTGlzdFxuICAgICAgICAgICAgICApXG5cbiAgdXBkYXRlUHVsbFJlc3VsdDogPT5cbiAgICBpZiBAdGFibGV0cy5jb21wbGV0ZSA9PSBAdGFibGV0cy5va0NvdW50XG4gICAgICBVdGlscy53b3JraW5nIGZhbHNlXG4gICAgICBVdGlscy5taWRBbGVydCB0KFwiVGFibGV0TWFuYWdlclZpZXcubWVzc2FnZS5wdWxsX2NvbXBsZXRlXCIsIHsgc3VjY2Vzc2Z1bDogQHRhYmxldHMuc3VjY2Vzc2Z1bCwgdG90YWwgOiBAdGFibGV0cy5va0NvdW50fSlcbiAgICAgIFRhbmdlcmluZS4kZGIucmVtb3ZlRG9jIFxuICAgICAgICBcIl9pZFwiICA6IEByYW5kb21Eb2MuaWRcbiAgICAgICAgXCJfcmV2XCIgOiBAcmFuZG9tRG9jLnJldlxuICAgICAgQGNhbGxiYWNrcy5jb21wbGV0ZVB1bGw/KClcblxuICBwdXNoRG9jczogPT5cbiAgICBpZiBub3QgXy5pc09iamVjdChAcHVzaClcbiAgICAgIFV0aWxzLndvcmtpbmcgdHJ1ZVxuICAgICAgVGFuZ2VyaW5lLiRkYi52aWV3IFRhbmdlcmluZS5kZXNpZ25fZG9jK1wiL2J5Q29sbGVjdGlvblwiLCBcbiAgICAgICAga2V5cyA6IEBkb2NUeXBlc1xuICAgICAgICBzdWNjZXNzIDogKHJlc3BvbnNlKSA9PlxuICAgICAgICAgIGRvY0lkcyA9IF8ucGx1Y2socmVzcG9uc2Uucm93cyxcImlkXCIpXG4gICAgICAgIFxuICAgICAgICAgIEBwdXNoID0gXG4gICAgICAgICAgICBpcHMgICAgOiBfLndpdGhvdXQoQHRhYmxldHMuaXBzLCBAc2VsZlN1Ym5ldElwKVxuICAgICAgICAgICAgZG9jSWRzIDogZG9jSWRzXG4gICAgICAgICAgICBjdXJyZW50ICAgIDogMFxuICAgICAgICAgICAgY29tcGxldGUgICA6IDBcbiAgICAgICAgICAgIHN1Y2Nlc3NmdWwgOiAwXG5cbiAgICAgICAgICBAcHVzaERvY3MoKVxuICAgIGVsc2VcblxuICAgICAgaWYgQHB1c2guY29tcGxldGUgPT0gQHB1c2guaXBzLmxlbmd0aFxuICAgICAgICBVdGlscy53b3JraW5nIGZhbHNlXG4gICAgICAgIFV0aWxzLnN0aWNreSBcIjxiPiN7QHRleHQuc3luY0NvbXBsZXRlfTwvYj48YnI+I3t0KFwiVGFibGV0TWFuYWdlclZpZXcubWVzc2FnZS5zdWNjZXNzZnVsX2NvdW50XCIsIHtzdWNjZXNzZnVsIDogQHB1c2guc3VjY2Vzc2Z1bCwgdG90YWwgOiBAcHVzaC5jb21wbGV0ZSB9ICkgfVwiXG4gICAgICBlbHNlXG4gICAgICAgIFV0aWxzLm1pZEFsZXJ0IHQoXCJUYWJsZXRNYW5hZ2VyVmlldy5tZXNzYWdlLnN5bmNpbmdcIix7IGRvbmU6IEBwdXNoLmNvbXBsZXRlKzEsIHRvdGFsIDogQHB1c2guaXBzLmxlbmd0aH0pXG4gICAgICAgICQuY291Y2gucmVwbGljYXRlKFxuICAgICAgICAgIFRhbmdlcmluZS5zZXR0aW5ncy51cmxEQiggXCJsb2NhbFwiICksXG4gICAgICAgICAgVGFuZ2VyaW5lLnNldHRpbmdzLnVybFN1Ym5ldCggQHB1c2guaXBzWyBAcHVzaC5jdXJyZW50IF0gKSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6ICAgICAgPT5cbiAgICAgICAgICAgICAgQHB1c2guY29tcGxldGUrK1xuICAgICAgICAgICAgICBAcHVzaC5zdWNjZXNzZnVsKytcbiAgICAgICAgICAgICAgQHB1c2hEb2NzKClcbiAgICAgICAgICAgIGVycm9yOiAoYSwgYikgPT5cbiAgICAgICAgICAgICAgQHB1c2guY29tcGxldGUrK1xuICAgICAgICAgICAgICBAcHVzaERvY3MoKVxuICAgICAgICAgICxcbiAgICAgICAgICAgIGRvY19pZHM6IEBwdXNoLmRvY0lkc1xuICAgICAgICApXG5cblxuIl19
