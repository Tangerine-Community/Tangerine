var ResultOfGrid, ResultOfMultiple, ResultOfPrevious, ResultOfQuestion, Robbert, Tangerine, TangerineTree, Utils, i, km, sks,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  slice = [].slice;

ResultOfQuestion = function(name) {
  var candidateView, index, k, len, ref, returnView;
  returnView = null;
  index = vm.currentView.orderMap[vm.currentView.index];
  ref = vm.currentView.subtestViews[index].prototypeView.questionViews;
  for (k = 0, len = ref.length; k < len; k++) {
    candidateView = ref[k];
    if (candidateView.model.get("name") === name) {
      returnView = candidateView;
    }
  }
  if (returnView === null) {
    throw new ReferenceError("ResultOfQuestion could not find variable " + name);
  }
  if (returnView.answer) {
    return returnView.answer;
  }
  return null;
};

ResultOfMultiple = function(name) {
  var candidateView, index, k, key, len, ref, ref1, result, returnView, value;
  returnView = null;
  index = vm.currentView.orderMap[vm.currentView.index];
  ref = vm.currentView.subtestViews[index].prototypeView.questionViews;
  for (k = 0, len = ref.length; k < len; k++) {
    candidateView = ref[k];
    if (candidateView.model.get("name") === name) {
      returnView = candidateView;
    }
  }
  if (returnView === null) {
    throw new ReferenceError("ResultOfQuestion could not find variable " + name);
  }
  result = [];
  ref1 = returnView.answer;
  for (key in ref1) {
    value = ref1[key];
    if (value === "checked") {
      result.push(key);
    }
  }
  return result;
};

ResultOfPrevious = function(name) {
  return vm.currentView.result.getVariable(name);
};

ResultOfGrid = function(name) {
  return vm.currentView.result.getItemResultCountByVariableName(name, "correct");
};

Tangerine = Tangerine != null ? Tangerine : {};

Tangerine.onBackButton = function(event) {
  if (Tangerine.activity === "assessment run") {
    if (confirm(t("NavigationView.message.incomplete_main_screen"))) {
      Tangerine.activity = "";
      return window.history.back();
    } else {
      return false;
    }
  } else {
    return window.history.back();
  }
};

Backbone.View.prototype.close = function() {
  this.remove();
  this.unbind();
  return typeof this.onClose === "function" ? this.onClose() : void 0;
};

Backbone.Collection.prototype.indexBy = function(attr) {
  var k, key, len, oneModel, ref, result;
  result = {};
  ref = this.models;
  for (k = 0, len = ref.length; k < len; k++) {
    oneModel = ref[k];
    if (oneModel.has(attr)) {
      key = oneModel.get(attr);
      if (result[key] == null) {
        result[key] = [];
      }
      result[key].push(oneModel);
    }
  }
  return result;
};

Backbone.Collection.prototype.indexArrayBy = function(attr) {
  var k, key, len, oneModel, ref, result;
  result = [];
  ref = this.models;
  for (k = 0, len = ref.length; k < len; k++) {
    oneModel = ref[k];
    if (oneModel.has(attr)) {
      key = oneModel.get(attr);
      if (result[key] == null) {
        result[key] = [];
      }
      result[key].push(oneModel);
    }
  }
  return result;
};

Backbone.Model.prototype.conform = function(standard) {
  var key, results, value;
  if (standard == null) {
    standard = {};
  }
  if (_.isEmpty(standard)) {
    throw "Cannot conform to empty standard. Use @clear() instead.";
  }
  results = [];
  for (key in standard) {
    value = standard[key];
    if (this.has(key) || this.get(key) === "") {
      results.push(this.set(key, value()));
    } else {
      results.push(void 0);
    }
  }
  return results;
};

Backbone.Model.prototype.prune = function(shape) {
  var key, ref, results, value;
  if (shape == null) {
    shape = {};
  }
  if (_.isEmpty(standard)) {
    throw "Cannot conform to empty standard. Use @clear() instead.";
  }
  ref = this.attributes;
  results = [];
  for (key in ref) {
    value = ref[key];
    if (indexOf.call(standard, key) < 0) {
      results.push(this.unset(key));
    } else {
      results.push(void 0);
    }
  }
  return results;
};

Backbone.Model.prototype.toHash = function() {
  var key, ref, significantAttributes, value;
  significantAttributes = {};
  ref = this.attributes;
  for (key in ref) {
    value = ref[key];
    if (!~['_rev', '_id', 'hash', 'updated', 'editedBy'].indexOf(key)) {
      significantAttributes[key] = value;
    }
  }
  return b64_sha1(JSON.stringify(significantAttributes));
};

Backbone.Model.prototype._beforeSave = function() {
  if (typeof this.beforeSave === "function") {
    this.beforeSave();
  }
  return this.stamp();
};

Backbone.Model.prototype.stamp = function() {
  var ref;
  return this.set({
    "editedBy": (Tangerine != null ? (ref = Tangerine.user) != null ? ref.name() : void 0 : void 0) || "unknown",
    "updated": (new Date()).toString(),
    "hash": this.toHash(),
    "fromInstanceId": Tangerine.settings.getString("instanceId")
  });
};

Backbone.Model.prototype.getNumber = function(key) {
  if (this.has(key)) {
    return parseInt(this.get(key));
  } else {
    return 0;
  }
};

Backbone.Model.prototype.getArray = function(key) {
  if (this.has(key)) {
    return this.get(key);
  } else {
    return [];
  }
};

Backbone.Model.prototype.getString = function(key) {
  if (this.has(key)) {
    return this.get(key);
  } else {
    return "";
  }
};

Backbone.Model.prototype.getEscapedString = function(key) {
  if (this.has(key)) {
    return this.escape(key);
  } else {
    return "";
  }
};

Backbone.Model.prototype.getBoolean = function(key) {
  if (this.has(key)) {
    return this.get(key) === true || this.get(key) === 'true';
  }
};

(function($) {
  $.fn.scrollTo = function(speed, callback) {
    var e, error1;
    if (speed == null) {
      speed = 250;
    }
    try {
      $('html, body').animate({
        scrollTop: $(this).offset().top + 'px'
      }, speed, null, callback);
    } catch (error1) {
      e = error1;
      console.log("error", e);
      console.log("Scroll error with 'this'", this);
    }
    return this;
  };
  $.fn.topCenter = function() {
    this.css("position", "absolute");
    this.css("top", $(window).scrollTop() + "px");
    return this.css("left", (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft() + "px");
  };
  $.fn.middleCenter = function() {
    this.css("position", "absolute");
    this.css("top", (($(window).height() - this.outerHeight()) / 2) + $(window).scrollTop() + "px");
    return this.css("left", (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft() + "px");
  };
  $.fn.widthPercentage = function() {
    return Math.round(100 * this.outerWidth() / this.offsetParent().width()) + '%';
  };
  $.fn.heightPercentage = function() {
    return Math.round(100 * this.outerHeight() / this.offsetParent().height()) + '%';
  };
  return $.fn.getStyleObject = function() {
    var camel, camelize, dom, k, l, len, len1, prop, returns, style, val;
    dom = this.get(0);
    returns = {};
    if (window.getComputedStyle) {
      camelize = function(a, b) {
        return b.toUpperCase();
      };
      style = window.getComputedStyle(dom, null);
      for (k = 0, len = style.length; k < len; k++) {
        prop = style[k];
        camel = prop.replace(/\-([a-z])/g, camelize);
        val = style.getPropertyValue(prop);
        returns[camel] = val;
      }
      return returns;
    }
    if (dom.currentStyle) {
      style = dom.currentStyle;
      for (l = 0, len1 = style.length; l < len1; l++) {
        prop = style[l];
        returns[prop] = style[prop];
      }
      return returns;
    }
    return this.css();
  };
})(jQuery);

$.ajaxSetup({
  statusCode: {
    404: function(xhr, status, message) {
      var code, seeUnauthorized, statusText;
      code = xhr.status;
      statusText = xhr.statusText;
      seeUnauthorized = ~xhr.responseText.indexOf("unauthorized");
      if (seeUnauthorized) {
        Utils.midAlert("Session closed<br>Please log in and try again.");
        return Tangerine.user.logout();
      }
    }
  }
});

km = {
  "0": 48,
  "1": 49,
  "2": 50,
  "3": 51,
  "4": 52,
  "5": 53,
  "6": 54,
  "7": 55,
  "8": 56,
  "9": 57,
  "a": 65,
  "b": 66,
  "c": 67,
  "d": 68,
  "e": 69,
  "f": 70,
  "g": 71,
  "h": 72,
  "i": 73,
  "j": 74,
  "k": 75,
  "l": 76,
  "m": 77,
  "n": 78,
  "o": 79,
  "p": 80,
  "q": 81,
  "r": 82,
  "s": 83,
  "t": 84,
  "u": 85,
  "v": 86,
  "w": 87,
  "x": 88,
  "y": 89,
  "z": 90
};

sks = [
  {
    q: (function() {
      var k, results;
      results = [];
      for (i = k = 0; k <= 9; i = ++k) {
        results.push(km["2001update"[i]]);
      }
      return results;
    })(),
    i: 0,
    c: function() {
      return Utils.updateTangerine(function() {
        return Utils.midAlert("Updated, please refresh.");
      });
    }
  }
];

$(document).keydown(function(e) {
  var j, k, len, results, sk;
  results = [];
  for (j = k = 0, len = sks.length; k < len; j = ++k) {
    sk = sks[j];
    results.push(e.keyCode === sks[j].q[sks[j].i++] ? sks[j].i === sks[j].q.length ? sks[j]['c']() : void 0 : sks[j].i = 0);
  }
  return results;
});

String.prototype.safetyDance = function() {
  return this.replace(/\s/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
};

String.prototype.databaseSafetyDance = function() {
  return this.replace(/\s/g, "_").toLowerCase().replace(/[^a-z0-9_-]/g, "");
};

String.prototype.count = function(substring) {
  var ref;
  return ((ref = this.match(new RegExp(substring, "g"))) != null ? ref.length : void 0) || 0;
};

Math.ave = function() {
  var k, len, result, x;
  result = 0;
  for (k = 0, len = arguments.length; k < len; k++) {
    x = arguments[k];
    result += x;
  }
  result /= arguments.length;
  return result;
};

Math.isInt = function() {
  return typeof n === 'number' && parseFloat(n) === parseInt(n, 10) && !isNaN(n);
};

Math.decimals = function(num, decimals) {
  var m;
  m = Math.pow(10, decimals);
  num *= m;
  num = num + num<0?-0.5:+0.5 >> 0;
  return num /= m;
};

Math.commas = function(num) {
  return parseInt(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

Math.limit = function(min, num, max) {
  return Math.max(min, Math.min(num, max));
};

_.isEmptyString = function(aString) {
  if (aString === null || aString === void 0) {
    return true;
  }
  if (!(_.isString(aString) || _.isNumber(aString))) {
    return false;
  }
  if (_.isNumber(aString)) {
    aString = String(aString);
  }
  if (aString.replace(/\s*/, '') === '') {
    return true;
  }
  return false;
};

_.indexBy = function(propertyName, objectArray) {
  var k, key, len, oneObject, result;
  result = {};
  for (k = 0, len = objectArray.length; k < len; k++) {
    oneObject = objectArray[k];
    if (oneObject[propertyName] != null) {
      key = oneObject[propertyName];
      if (result[key] == null) {
        result[key] = [];
      }
      result[key].push(oneObject);
    }
  }
  return result;
};

Utils = (function() {
  function Utils() {}

  Utils.changeLanguage = function(code, callback) {
    return i18n.setLng(code, callback);
  };

  Utils.resave = function() {
    var updateCollections, updateModels;
    updateModels = function(models, callback) {
      if (models.length === 0) {
        return callback();
      }
      return models.pop().save(null, {
        success: function(model) {
          console.log(model.url);
          return updateModels(models, callback);
        }
      });
    };
    updateCollections = function(collections, callback) {
      var collection;
      if (collections.length === 0) {
        return callback();
      }
      collection = new (collections.pop());
      return collection.fetch({
        success: function() {
          return updateModels(collection, function() {
            return updateCollections(collections, callback);
          });
        }
      });
    };
    return updateCollections([Assessments, Subtests, Questions], function() {
      return console.log("All done");
    });
  };

  Utils.execute = function(functions) {
    var step;
    step = function() {
      var nextFunction;
      nextFunction = functions.shift();
      return typeof nextFunction === "function" ? nextFunction(step) : void 0;
    };
    return step();
  };

  Utils.loadCollections = function(loadOptions) {
    var getNext, toLoad;
    if (loadOptions.complete == null) {
      throw "You're gonna want a callback in there, buddy.";
    }
    toLoad = loadOptions.collections || [];
    getNext = function(options) {
      var current, memberName;
      if (current = toLoad.pop()) {
        memberName = current.underscore().camelize(true);
        options[memberName] = new window[current];
        return options[memberName].fetch({
          success: function() {
            return getNext(options);
          }
        });
      } else {
        return loadOptions.complete(options);
      }
    };
    return getNext({});
  };

  Utils.universalUpload = function() {
    return $.ajax({
      url: Tangerine.settings.urlView("local", "byCollection"),
      type: "POST",
      dataType: "json",
      contentType: "application/json",
      data: JSON.stringify({
        keys: ["result"]
      }),
      success: function(data) {
        var docList;
        docList = _.pluck(data.rows, "id");
        return $.couch.replicate(Tangerine.settings.urlDB("local"), Tangerine.settings.urlDB("group"), {
          success: (function(_this) {
            return function() {
              return Utils.sticky("Results synced to cloud successfully.");
            };
          })(this),
          error: (function(_this) {
            return function(code, message) {
              return Utils.sticky("Upload error<br>" + code + " " + message);
            };
          })(this)
        }, {
          doc_ids: docList
        });
      }
    });
  };

  Utils.restartTangerine = function(message, callback) {
    Utils.midAlert("" + (message || 'Restarting Tangerine'));
    return _.delay(function() {
      document.location.reload();
      return typeof callback === "function" ? callback() : void 0;
    }, 2000);
  };

  Utils.onUpdateSuccess = function(totalDocs) {
    Utils.documentCounter++;
    if (Utils.documentCounter === totalDocs) {
      Utils.restartTangerine("Update successful", function() {
        return Tangerine.router.navigate("", false);
      });
      return Utils.documentCounter = null;
    }
  };

  Utils.updateTangerine = function(doResolve, options) {
    var dDoc, docIds, targetDB;
    if (doResolve == null) {
      doResolve = true;
    }
    if (options == null) {
      options = {};
    }
    if (!Tangerine.user.isAdmin()) {
      return;
    }
    Utils.documentCounter = 0;
    dDoc = "ojai";
    targetDB = options.targetDB || Tangerine.db_name;
    docIds = options.docIds || ["_design/" + dDoc, "configuration"];
    Utils.midAlert("Updating...");
    Utils.working(true);
    return Tangerine.$db.allDocs({
      keys: docIds,
      success: function(response) {
        var k, len, oldDocs, ref, row;
        oldDocs = [];
        ref = response.rows;
        for (k = 0, len = ref.length; k < len; k++) {
          row = ref[k];
          oldDocs.push({
            "_id": row.id,
            "_rev": row.value.rev
          });
        }
        return $.couch.replicate(Tangerine.settings.urlDB("update"), targetDB, {
          error: function(error) {
            Utils.working(false);
            Utils.midAlert("Update failed replicating<br>" + error);
            return Utils.documentCounter = null;
          },
          success: function() {
            var docId, l, len1, oldDoc, results, totalDocs;
            if (!doResolve) {
              Utils.onUpdateSuccess(1);
              return;
            }
            totalDocs = docIds.length;
            results = [];
            for (i = l = 0, len1 = docIds.length; l < len1; i = ++l) {
              docId = docIds[i];
              oldDoc = oldDocs[i];
              results.push((function(docId, oldDoc, totalDocs) {
                return Tangerine.$db.openDoc(docId, {
                  conflicts: true,
                  success: function(data) {
                    if (data._conflicts != null) {
                      return Tangerine.$db.removeDoc(oldDoc, {
                        success: function() {
                          Utils.working(false);
                          return Utils.onUpdateSuccess(totalDocs);
                        },
                        error: function(error) {
                          Utils.documentCounter = null;
                          Utils.working(false);
                          return Utils.midAlert("Update failed resolving conflict<br>" + error);
                        }
                      });
                    } else {
                      return Utils.onUpdateSuccess(totalDocs);
                    }
                  }
                });
              })(docId, oldDoc, totalDocs));
            }
            return results;
          }
        }, {
          doc_ids: docIds
        });
      }
    });
  };

  Utils.log = function(self, error) {
    var className;
    className = self.constructor.toString().match(/function\s*(\w+)/)[1];
    return console.log(className + ": " + error);
  };

  Utils.data = function() {
    var arg, args, key, value;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if (args.length === 1) {
      arg = args[0];
      if (_.isString(arg)) {
        return Tangerine.tempData[arg];
      } else if (_.isObject(arg)) {
        return Tangerine.tempData = $.extend(Tangerine.tempData, arg);
      } else if (arg === null) {
        return Tangerine.tempData = {};
      }
    } else if (args.length === 2) {
      key = args[0];
      value = args[1];
      Tangerine.tempData[key] = value;
      return Tangerine.tempData;
    } else if (args.length === 0) {
      return Tangerine.tempData;
    }
  };

  Utils.working = function(isWorking) {
    if (isWorking) {
      if (Tangerine.loadingTimer == null) {
        return Tangerine.loadingTimer = setTimeout(Utils.showLoadingIndicator, 3000);
      }
    } else {
      if (Tangerine.loadingTimer != null) {
        clearTimeout(Tangerine.loadingTimer);
        Tangerine.loadingTimer = null;
      }
      return $(".loading_bar").remove();
    }
  };

  Utils.showLoadingIndicator = function() {
    return $("<div class='loading_bar'><img class='loading' src='images/loading.gif'></div>").appendTo("body").middleCenter();
  };

  Utils.confirm = function(message, options) {
    var ref;
    if (((ref = navigator.notification) != null ? ref.confirm : void 0) != null) {
      navigator.notification.confirm(message, function(input) {
        if (input === 1) {
          return options.callback(true);
        } else if (input === 2) {
          return options.callback(false);
        } else {
          return options.callback(input);
        }
      }, options.title, options.action + ",Cancel");
    } else {
      if (window.confirm(message)) {
        options.callback(true);
        return true;
      } else {
        options.callback(false);
        return false;
      }
    }
    return 0;
  };

  Utils.getValues = function(selector) {
    var values;
    values = {};
    $(selector).find("input[type=text], input[type=password], textarea").each(function(index, element) {
      return values[element.id] = element.value;
    });
    return values;
  };

  Utils.cleanURL = function(url) {
    if ((typeof url.indexOf === "function" ? url.indexOf("%") : void 0) !== -1) {
      return url = decodeURIComponent(url);
    } else {
      return url;
    }
  };

  Utils.topAlert = function(alertText, delay) {
    if (delay == null) {
      delay = 2000;
    }
    return Utils.alert("top", alertText, delay);
  };

  Utils.midAlert = function(alertText, delay) {
    if (delay == null) {
      delay = 2000;
    }
    return Utils.alert("middle", alertText, delay);
  };

  Utils.alert = function(where, alertText, delay) {
    var $alert, aligner, selector;
    if (delay == null) {
      delay = 2000;
    }
    switch (where) {
      case "top":
        selector = ".top_alert";
        aligner = function($el) {
          return $el.topCenter();
        };
        break;
      case "middle":
        selector = ".mid_alert";
        aligner = function($el) {
          return $el.middleCenter();
        };
    }
    if (Utils[where + "AlertTimer"] != null) {
      clearTimeout(Utils[where + "AlertTimer"]);
      $alert = $(selector);
      $alert.html($alert.html() + "<br>" + alertText);
    } else {
      $alert = $("<div class='" + (selector.substring(1)) + " disposable_alert'>" + alertText + "</div>").appendTo("#content");
    }
    aligner($alert);
    return (function($alert, selector, delay) {
      var computedDelay;
      computedDelay = (("" + $alert.html()).match(/<br>/g) || []).length * 1500;
      return Utils[where + "AlertTimer"] = setTimeout(function() {
        Utils[where + "AlertTimer"] = null;
        return $alert.fadeOut(250, function() {
          return $(this).remove();
        });
      }, Math.max(computedDelay, delay));
    })($alert, selector, delay);
  };

  Utils.sticky = function(html, buttonText, callback, position) {
    var div;
    if (buttonText == null) {
      buttonText = "Close";
    }
    if (position == null) {
      position = "middle";
    }
    div = $("<div class='sticky_alert'>" + html + "<br><button class='command parent_remove'>" + buttonText + "</button></div>").appendTo("#content");
    if (position === "middle") {
      div.middleCenter();
    } else if (position === "top") {
      div.topCenter();
    }
    return div.on("keyup", function(event) {
      if (event.which === 27) {
        return $(this).remove();
      }
    }).find("button").click(callback);
  };

  Utils.topSticky = function(html, buttonText, callback) {
    if (buttonText == null) {
      buttonText = "Close";
    }
    return Utils.sticky(html, buttonText, callback, "top");
  };

  Utils.modal = function(html) {
    if (html === false) {
      $("#modal_back, #modal").remove();
      return;
    }
    $("body").prepend("<div id='modal_back'></div>");
    return $("<div id='modal'>" + html + "</div>").appendTo("#content").middleCenter().on("keyup", function(event) {
      if (event.which === 27) {
        return $("#modal_back, #modal").remove();
      }
    });
  };

  Utils.passwordPrompt = function(callback) {
    var $button, $pass, html;
    html = "<div id='pass_form' title='User verification'> <label for='password'>Please re-enter your password</label> <input id='pass_val' type='password' name='password' id='password' value=''> <button class='command' data-verify='true'>Verify</button> <button class='command'>Cancel</button> </div>";
    Utils.modal(html);
    $pass = $("#pass_val");
    $button = $("#pass_form button");
    $pass.on("keyup", function(event) {
      if (event.which !== 13) {
        return true;
      }
      $button.off("click");
      $pass.off("change");
      callback($pass.val());
      return Utils.modal(false);
    });
    return $button.on("click", function(event) {
      $button.off("click");
      $pass.off("change");
      if ($(event.target).attr("data-verify") === "true") {
        callback($pass.val());
      }
      return Utils.modal(false);
    });
  };

  Utils.guid = function() {
    return this.S4() + this.S4() + "-" + this.S4() + "-" + this.S4() + "-" + this.S4() + "-" + this.S4() + this.S4() + this.S4();
  };

  Utils.S4 = function() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };

  Utils.humanGUID = function() {
    return this.randomLetters(4) + "-" + this.randomLetters(4) + "-" + this.randomLetters(4);
  };

  Utils.safeLetters = "abcdefghijlmnopqrstuvwxyz".split("");

  Utils.randomLetters = function(length) {
    var result;
    result = "";
    while (length--) {
      result += Utils.safeLetters[Math.floor(Math.random() * Utils.safeLetters.length)];
    }
    return result;
  };

  Utils.flash = function(color, shouldTurnItOn) {
    if (color == null) {
      color = "red";
    }
    if (shouldTurnItOn == null) {
      shouldTurnItOn = null;
    }
    if (shouldTurnItOn == null) {
      Utils.background(color);
      return setTimeout(function() {
        return Utils.background("");
      }, 1000);
    }
  };

  Utils.background = function(color) {
    if (color != null) {
      return $("#content_wrapper").css({
        "backgroundColor": color
      });
    } else {
      return $("#content_wrapper").css("backgroundColor");
    }
  };

  Utils.$_GET = function(q, s) {
    var parts, vars;
    vars = {};
    parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
      value = ~value.indexOf("#") ? value.split("#")[0] : value;
      return vars[key] = value.split("#")[0];
    });
    return vars;
  };

  Utils.resizeScrollPane = function() {
    return $(".scroll_pane").height($(window).height() - ($("#navigation").height() + $("#footer").height() + 100));
  };

  Utils.askToLogout = function() {
    if (confirm("Would you like to logout now?")) {
      return Tangerine.user.logout();
    }
  };

  Utils.oldConsoleLog = null;

  Utils.enableConsoleLog = function() {
    if (typeof oldConsoleLog === "undefined" || oldConsoleLog === null) {
      return;
    }
    return window.console.log = oldConsoleLog;
  };

  Utils.disableConsoleLog = function() {
    var oldConsoleLog;
    oldConsoleLog = console.log;
    return window.console.log = $.noop;
  };

  Utils.oldConsoleAssert = null;

  Utils.enableConsoleAssert = function() {
    if (typeof oldConsoleAssert === "undefined" || oldConsoleAssert === null) {
      return;
    }
    return window.console.assert = oldConsoleAssert;
  };

  Utils.disableConsoleAssert = function() {
    var oldConsoleAssert;
    oldConsoleAssert = console.assert;
    return window.console.assert = $.noop;
  };

  return Utils;

})();

Robbert = (function() {
  function Robbert() {}

  Robbert.fetchUsers = function(group, callback) {
    return Robbert.req({
      type: 'GET',
      url: "/group/" + group,
      success: callback,
      error: callback
    });
  };

  Robbert.req = function(options) {
    options.url = Tangerine.config.get("robbert") + options.url;
    options.contentType = 'application/json';
    options.accept = 'application/json';
    options.dataType = 'json';
    options.data = JSON.stringify(options.data);
    console.log(options);
    return $.ajax(options);
  };

  Robbert.fetchUser = function(options) {
    return Robbert.req({
      type: 'GET',
      url: "/user/" + Tangerine.user.get("name"),
      success: (function(_this) {
        return function(data) {
          return typeof options.success === "function" ? options.success(data) : void 0;
        };
      })(this),
      error: (function(_this) {
        return function(data) {
          return typeof options.error === "function" ? options.error(data) : void 0;
        };
      })(this)
    });
  };

  Robbert.newGroup = function(options) {
    return Robbert.req({
      type: 'PUT',
      url: '/group',
      data: {
        name: options.name
      },
      success: (function(_this) {
        return function(data) {
          return typeof options.success === "function" ? options.success(data) : void 0;
        };
      })(this),
      error: (function(_this) {
        return function(data) {
          return typeof options.error === "function" ? options.error(data) : void 0;
        };
      })(this)
    });
  };

  Robbert.leaveGroup = function(options) {
    return Robbert.req({
      type: 'DELETE',
      url: "/group/" + options.group + "/" + options.user,
      success: (function(_this) {
        return function(data) {
          return typeof options.success === "function" ? options.success(data) : void 0;
        };
      })(this),
      error: (function(_this) {
        return function(data) {
          return typeof options.error === "function" ? options.error(data) : void 0;
        };
      })(this)
    });
  };

  Robbert.signup = function(options) {
    return Robbert.req({
      type: 'PUT',
      url: '/user',
      data: {
        name: options.name,
        pass: options.pass
      },
      success: (function(_this) {
        return function(data) {
          return typeof options.success === "function" ? options.success(data) : void 0;
        };
      })(this),
      error: (function(_this) {
        return function(data) {
          return typeof options.error === "function" ? options.error(data) : void 0;
        };
      })(this)
    });
  };

  Robbert.rolePost = function(url, user, callback) {
    var options;
    options = {
      type: 'POST',
      url: ("/group/" + (Tangerine.settings.get("groupName"))) + url,
      data: {
        user: user
      },
      success: callback,
      error: callback,
      complete: function(res) {
        return Utils.midAlert(res.responseJSON.message);
      }
    };
    return Robbert.req(options);
  };

  Robbert.addAdmin = function(user, callback) {
    return Robbert.rolePost("/add-admin", user, callback);
  };

  Robbert.addMember = function(user, callback) {
    return Robbert.rolePost("/add-member", user, callback);
  };

  Robbert.removeAdmin = function(user, callback) {
    return Robbert.rolePost("/remove-admin", user, callback);
  };

  Robbert.removeMember = function(user, callback) {
    return Robbert.rolePost("/remove-member", user, callback);
  };

  return Robbert;

})();

TangerineTree = (function() {
  function TangerineTree() {}

  TangerineTree.generateJsonAndMAke = function() {
    var url;
    url = Tangerine.settings.urlView("group", "assessmentsNotArchived");
    console.log("url: " + url);
    return $.ajax({
      url: Tangerine.settings.urlView("group", "assessmentsNotArchived"),
      dataType: "json",
      success: (function(_this) {
        return function(data) {
          var dKeyQuery, dKeys;
          console.log("data: " + JSON.stringify(data));
          dKeys = data.rows.map(function(row) {
            return row.id.substr(-5);
          });
          dKeyQuery = {
            keys: dKeys
          };
          console.log("dKeyQuery:" + JSON.stringify(dKeyQuery));
          url = Tangerine.settings.urlView("group", "byDKey");
          console.log("url: " + url);
          return $.ajax({
            url: Tangerine.settings.urlView("group", "byDKey"),
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(dKeyQuery),
            success: function(data) {
              var keyList;
              console.log("data: " + JSON.stringify(data));
              keyList = [];
              keyList = data.rows.map(function(row) {
                return row.id;
              });
              keyList = _.uniq(keyList);
              keyList.push("settings");
              console.log("keyList: " + JSON.stringify(keyList));
              return Tangerine.$db.allDocs({
                keys: keyList,
                success: function(response) {
                  var body, docs, k, len, ref, row;
                  docs = [];
                  ref = response.rows;
                  for (k = 0, len = ref.length; k < len; k++) {
                    row = ref[k];
                    docs.push(row.doc);
                  }
                  body = {
                    docs: docs
                  };
                  return body;
                }
              });
            }
          });
        };
      })(this),
      error: function(a, b) {
        console.log("a: " + a);
        return Utils.midAlert("Import error");
      }
    });
  };

  TangerineTree.make = function(options) {
    Utils.working(true);
    return $.ajax({
      url: Tangerine.settings.urlView("group", "assessmentsNotArchived"),
      dataType: "json",
      success: (function(_this) {
        return function(data) {
          var dKeyQuery, dKeys, url;
          dKeys = data.rows.map(function(row) {
            return row.id.substr(-5);
          });
          dKeyQuery = {
            keys: dKeys
          };
          url = Tangerine.settings.urlView("group", "byDKey");
          return $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            data: JSON.stringify(dKeyQuery),
            error: function(a, b) {
              return _this.trigger("status", "export json error", a + " " + b);
            },
            success: function(data) {
              var datum, docList, k, keyList, len, ref;
              docList = [];
              ref = data.rows;
              for (k = 0, len = ref.length; k < len; k++) {
                datum = ref[k];
                docList.push(datum.id);
                keyList = _.uniq(docList);
              }
              return Tangerine.$db.allDocs({
                keys: keyList,
                include_docs: true,
                success: function(response) {
                  var body, docs, error, l, len1, payload, ref1, row, success;
                  docs = [];
                  ref1 = response.rows;
                  for (l = 0, len1 = ref1.length; l < len1; l++) {
                    row = ref1[l];
                    docs.push(row.doc);
                  }
                  body = {
                    docs: docs
                  };
                  success = options.success;
                  error = options.error;
                  payload = JSON.stringify(body);
                  delete options.success;
                  delete options.error;
                  return $.ajax({
                    type: 'POST',
                    crossDomain: true,
                    url: (Tangerine.config.get('tree')) + "/group-" + (Tangerine.settings.get('groupName')) + "/" + (Tangerine.settings.get('hostname')),
                    dataType: 'json',
                    contentType: "application/json",
                    data: payload,
                    success: (function(_this) {
                      return function(data) {
                        return success(data);
                      };
                    })(this),
                    error: (function(_this) {
                      return function(data) {
                        return error(data, JSON.parse(data.responseText));
                      };
                    })(this),
                    complete: function() {
                      return Utils.working(false);
                    }
                  });
                }
              });
            }
          });
        };
      })(this),
      error: function(a, b) {
        console.log("Error: " + a);
        return Utils.midAlert("Import error");
      }
    });
  };

  return TangerineTree;

})();

$(function() {
  $("#content").on("click", ".clear_message", null, function(a) {
    return $(a.target).parent().fadeOut(250, function() {
      return $(this).empty().show();
    });
  });
  $("#content").on("click", ".parent_remove", null, function(a) {
    return $(a.target).parent().fadeOut(250, function() {
      return $(this).remove();
    });
  });
  $("#content").on("click", ".alert_button", function() {
    var alert_text;
    alert_text = $(this).attr("data-alert") ? $(this).attr("data-alert") : $(this).val();
    return Utils.disposableAlert(alert_text);
  });
  return $("#content").on("click", ".disposable_alert", function() {
    return $(this).stop().fadeOut(100, function() {
      return $(this).remove();
    });
  });
});

//# sourceMappingURL=data:application/json;base64,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QUFGLENBQU8sQ0FBQyxJQUFSLENBQWEsWUFBYixDQUFILEdBQW1DLENBQUEsQ0FBRSxJQUFGLENBQU8sQ0FBQyxJQUFSLENBQWEsWUFBYixDQUFuQyxHQUFtRSxDQUFBLENBQUUsSUFBRixDQUFPLENBQUMsR0FBUixDQUFBO1dBQ2hGLEtBQUssQ0FBQyxlQUFOLENBQXNCLFVBQXRCO0VBRndDLENBQTFDO1NBR0EsQ0FBQSxDQUFFLFVBQUYsQ0FBYSxDQUFDLEVBQWQsQ0FBaUIsT0FBakIsRUFBMEIsbUJBQTFCLEVBQStDLFNBQUE7V0FDN0MsQ0FBQSxDQUFFLElBQUYsQ0FBTyxDQUFDLElBQVIsQ0FBQSxDQUFjLENBQUMsT0FBZixDQUF1QixHQUF2QixFQUE0QixTQUFBO2FBQzFCLENBQUEsQ0FBRSxJQUFGLENBQU8sQ0FBQyxNQUFSLENBQUE7SUFEMEIsQ0FBNUI7RUFENkMsQ0FBL0M7QUFYQSxDQUFGIiwiZmlsZSI6ImFwcC9oZWxwZXJzLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiI1xuIyBTa2lwIGxvZ2ljXG4jXG5cbiMgdGhlc2UgY291bGQgZWFzaWx5IGJlIHJlZmFjdG9yZWQgaW50byBvbmUuXG5cblJlc3VsdE9mUXVlc3Rpb24gPSAobmFtZSkgLT5cbiAgcmV0dXJuVmlldyA9IG51bGxcbiAgaW5kZXggPSB2bS5jdXJyZW50Vmlldy5vcmRlck1hcFt2bS5jdXJyZW50Vmlldy5pbmRleF1cblxuICBmb3IgY2FuZGlkYXRlVmlldyBpbiB2bS5jdXJyZW50Vmlldy5zdWJ0ZXN0Vmlld3NbaW5kZXhdLnByb3RvdHlwZVZpZXcucXVlc3Rpb25WaWV3c1xuICAgIGlmIGNhbmRpZGF0ZVZpZXcubW9kZWwuZ2V0KFwibmFtZVwiKSA9PSBuYW1lXG4gICAgICByZXR1cm5WaWV3ID0gY2FuZGlkYXRlVmlld1xuICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJSZXN1bHRPZlF1ZXN0aW9uIGNvdWxkIG5vdCBmaW5kIHZhcmlhYmxlICN7bmFtZX1cIikgaWYgcmV0dXJuVmlldyA9PSBudWxsXG4gIHJldHVybiByZXR1cm5WaWV3LmFuc3dlciBpZiByZXR1cm5WaWV3LmFuc3dlclxuICByZXR1cm4gbnVsbFxuXG5SZXN1bHRPZk11bHRpcGxlID0gKG5hbWUpIC0+XG4gIHJldHVyblZpZXcgPSBudWxsXG4gIGluZGV4ID0gdm0uY3VycmVudFZpZXcub3JkZXJNYXBbdm0uY3VycmVudFZpZXcuaW5kZXhdXG5cbiAgZm9yIGNhbmRpZGF0ZVZpZXcgaW4gdm0uY3VycmVudFZpZXcuc3VidGVzdFZpZXdzW2luZGV4XS5wcm90b3R5cGVWaWV3LnF1ZXN0aW9uVmlld3NcbiAgICBpZiBjYW5kaWRhdGVWaWV3Lm1vZGVsLmdldChcIm5hbWVcIikgPT0gbmFtZVxuICAgICAgcmV0dXJuVmlldyA9IGNhbmRpZGF0ZVZpZXdcbiAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwiUmVzdWx0T2ZRdWVzdGlvbiBjb3VsZCBub3QgZmluZCB2YXJpYWJsZSAje25hbWV9XCIpIGlmIHJldHVyblZpZXcgPT0gbnVsbFxuXG4gIHJlc3VsdCA9IFtdXG4gIGZvciBrZXksIHZhbHVlIG9mIHJldHVyblZpZXcuYW5zd2VyXG4gICAgcmVzdWx0LnB1c2gga2V5IGlmIHZhbHVlID09IFwiY2hlY2tlZFwiXG4gIHJldHVybiByZXN1bHRcblxuUmVzdWx0T2ZQcmV2aW91cyA9IChuYW1lKSAtPlxuICByZXR1cm4gdm0uY3VycmVudFZpZXcucmVzdWx0LmdldFZhcmlhYmxlKG5hbWUpXG5cblJlc3VsdE9mR3JpZCA9IChuYW1lKSAtPlxuICByZXR1cm4gdm0uY3VycmVudFZpZXcucmVzdWx0LmdldEl0ZW1SZXN1bHRDb3VudEJ5VmFyaWFibGVOYW1lKG5hbWUsIFwiY29ycmVjdFwiKVxuXG5cbiNcbiMgVGFuZ2VyaW5lIGJhY2tidXR0b24gaGFuZGxlclxuI1xuVGFuZ2VyaW5lID0gaWYgVGFuZ2VyaW5lPyB0aGVuIFRhbmdlcmluZSBlbHNlIHt9XG5UYW5nZXJpbmUub25CYWNrQnV0dG9uID0gKGV2ZW50KSAtPlxuICBpZiBUYW5nZXJpbmUuYWN0aXZpdHkgPT0gXCJhc3Nlc3NtZW50IHJ1blwiXG4gICAgaWYgY29uZmlybSB0KFwiTmF2aWdhdGlvblZpZXcubWVzc2FnZS5pbmNvbXBsZXRlX21haW5fc2NyZWVuXCIpXG4gICAgICBUYW5nZXJpbmUuYWN0aXZpdHkgPSBcIlwiXG4gICAgICB3aW5kb3cuaGlzdG9yeS5iYWNrKClcbiAgICBlbHNlXG4gICAgICByZXR1cm4gZmFsc2VcbiAgZWxzZVxuICAgIHdpbmRvdy5oaXN0b3J5LmJhY2soKVxuXG5cblxuIyBFeHRlbmQgZXZlcnkgdmlldyB3aXRoIGEgY2xvc2UgbWV0aG9kLCB1c2VkIGJ5IFZpZXdNYW5hZ2VyXG5CYWNrYm9uZS5WaWV3LnByb3RvdHlwZS5jbG9zZSA9IC0+XG4gIEByZW1vdmUoKVxuICBAdW5iaW5kKClcbiAgQG9uQ2xvc2U/KClcblxuXG4jIFJldHVybnMgYW4gb2JqZWN0IGhhc2hlZCBieSBhIGdpdmVuIGF0dHJpYnV0ZS5cbkJhY2tib25lLkNvbGxlY3Rpb24ucHJvdG90eXBlLmluZGV4QnkgPSAoIGF0dHIgKSAtPlxuICByZXN1bHQgPSB7fVxuICBmb3Igb25lTW9kZWwgaW4gQG1vZGVsc1xuICAgIGlmIG9uZU1vZGVsLmhhcyhhdHRyKVxuICAgICAga2V5ID0gb25lTW9kZWwuZ2V0KGF0dHIpXG4gICAgICByZXN1bHRba2V5XSA9IFtdIGlmIG5vdCByZXN1bHRba2V5XT9cbiAgICAgIHJlc3VsdFtrZXldLnB1c2gob25lTW9kZWwpXG4gIHJldHVybiByZXN1bHRcblxuIyBSZXR1cm5zIGFuIG9iamVjdCBoYXNoZWQgYnkgYSBnaXZlbiBhdHRyaWJ1dGUuXG5CYWNrYm9uZS5Db2xsZWN0aW9uLnByb3RvdHlwZS5pbmRleEFycmF5QnkgPSAoIGF0dHIgKSAtPlxuICByZXN1bHQgPSBbXVxuICBmb3Igb25lTW9kZWwgaW4gQG1vZGVsc1xuICAgIGlmIG9uZU1vZGVsLmhhcyhhdHRyKVxuICAgICAga2V5ID0gb25lTW9kZWwuZ2V0KGF0dHIpXG4gICAgICByZXN1bHRba2V5XSA9IFtdIGlmIG5vdCByZXN1bHRba2V5XT9cbiAgICAgIHJlc3VsdFtrZXldLnB1c2gob25lTW9kZWwpXG4gIHJldHVybiByZXN1bHRcblxuQmFja2JvbmUuTW9kZWwucHJvdG90eXBlLmNvbmZvcm0gPSAoIHN0YW5kYXJkID0ge30gKSAtPlxuICB0aHJvdyBcIkNhbm5vdCBjb25mb3JtIHRvIGVtcHR5IHN0YW5kYXJkLiBVc2UgQGNsZWFyKCkgaW5zdGVhZC5cIiBpZiBfLmlzRW1wdHkoc3RhbmRhcmQpXG4gIGZvciBrZXksIHZhbHVlIG9mIHN0YW5kYXJkXG4gICAgQHNldChrZXksIHZhbHVlKCkpIGlmIEBoYXMoa2V5KSBvciBAZ2V0KGtleSkgaXMgXCJcIlxuXG5CYWNrYm9uZS5Nb2RlbC5wcm90b3R5cGUucHJ1bmUgPSAoIHNoYXBlID0ge30gKSAtPlxuICB0aHJvdyBcIkNhbm5vdCBjb25mb3JtIHRvIGVtcHR5IHN0YW5kYXJkLiBVc2UgQGNsZWFyKCkgaW5zdGVhZC5cIiBpZiBfLmlzRW1wdHkoc3RhbmRhcmQpXG4gIGZvciBrZXksIHZhbHVlIG9mIEBhdHRyaWJ1dGVzXG4gICAgQHVuc2V0KGtleSkgdW5sZXNzIGtleSBpbiBzdGFuZGFyZFxuXG4jIGhhc2ggdGhlIGF0dHJpYnV0ZXMgb2YgYSBtb2RlbFxuQmFja2JvbmUuTW9kZWwucHJvdG90eXBlLnRvSGFzaCA9IC0+XG4gIHNpZ25pZmljYW50QXR0cmlidXRlcyA9IHt9XG4gIGZvciBrZXksIHZhbHVlIG9mIEBhdHRyaWJ1dGVzXG4gICAgc2lnbmlmaWNhbnRBdHRyaWJ1dGVzW2tleV0gPSB2YWx1ZSBpZiAhflsnX3JldicsICdfaWQnLCdoYXNoJywndXBkYXRlZCcsJ2VkaXRlZEJ5J10uaW5kZXhPZihrZXkpXG4gIHJldHVybiBiNjRfc2hhMShKU09OLnN0cmluZ2lmeShzaWduaWZpY2FudEF0dHJpYnV0ZXMpKVxuXG4jIGJ5IGRlZmF1bHQgYWxsIG1vZGVscyB3aWxsIHNhdmUgYSB0aW1lc3RhbXAgYW5kIGhhc2ggb2Ygc2lnbmlmaWNhbnQgYXR0cmlidXRlc1xuQmFja2JvbmUuTW9kZWwucHJvdG90eXBlLl9iZWZvcmVTYXZlID0gLT5cbiAgQGJlZm9yZVNhdmU/KClcbiAgQHN0YW1wKClcblxuQmFja2JvbmUuTW9kZWwucHJvdG90eXBlLnN0YW1wID0gLT5cbiAgQHNldFxuICAgIFwiZWRpdGVkQnlcIiA6IFRhbmdlcmluZT8udXNlcj8ubmFtZSgpIHx8IFwidW5rbm93blwiXG4gICAgXCJ1cGRhdGVkXCIgOiAobmV3IERhdGUoKSkudG9TdHJpbmcoKVxuICAgIFwiaGFzaFwiIDogQHRvSGFzaCgpXG4gICAgXCJmcm9tSW5zdGFuY2VJZFwiIDogVGFuZ2VyaW5lLnNldHRpbmdzLmdldFN0cmluZyhcImluc3RhbmNlSWRcIilcblxuXG4jXG4jIFRoaXMgc2VyaWVzIG9mIGZ1bmN0aW9ucyByZXR1cm5zIHByb3BlcnRpZXMgd2l0aCBkZWZhdWx0IHZhbHVlcyBpZiBubyBwcm9wZXJ0eSBpcyBmb3VuZFxuIyBAZ290Y2hhIGJlIG1pbmRmdWwgb2YgdGhlIGRlZmF1bHQgXCJibGFua1wiIHZhbHVlcyBzZXQgaGVyZVxuI1xuQmFja2JvbmUuTW9kZWwucHJvdG90eXBlLmdldE51bWJlciA9ICAgICAgICAoa2V5KSAtPiByZXR1cm4gaWYgQGhhcyhrZXkpIHRoZW4gcGFyc2VJbnQoQGdldChrZXkpKSBlbHNlIDBcbkJhY2tib25lLk1vZGVsLnByb3RvdHlwZS5nZXRBcnJheSA9ICAgICAgICAgKGtleSkgLT4gcmV0dXJuIGlmIEBoYXMoa2V5KSB0aGVuIEBnZXQoa2V5KSAgICAgICAgICAgZWxzZSBbXVxuQmFja2JvbmUuTW9kZWwucHJvdG90eXBlLmdldFN0cmluZyA9ICAgICAgICAoa2V5KSAtPiByZXR1cm4gaWYgQGhhcyhrZXkpIHRoZW4gQGdldChrZXkpICAgICAgICAgICBlbHNlIFwiXCJcbkJhY2tib25lLk1vZGVsLnByb3RvdHlwZS5nZXRFc2NhcGVkU3RyaW5nID0gKGtleSkgLT4gcmV0dXJuIGlmIEBoYXMoa2V5KSB0aGVuIEBlc2NhcGUoa2V5KSAgICAgICAgZWxzZSBcIlwiXG5CYWNrYm9uZS5Nb2RlbC5wcm90b3R5cGUuZ2V0Qm9vbGVhbiA9ICAgICAgIChrZXkpIC0+IHJldHVybiBpZiBAaGFzKGtleSkgdGhlbiAoQGdldChrZXkpID09IHRydWUgb3IgQGdldChrZXkpID09ICd0cnVlJylcblxuXG4jXG4jIGhhbmR5IGpxdWVyeSBmdW5jdGlvbnNcbiNcbiggKCQpIC0+XG5cbiAgJC5mbi5zY3JvbGxUbyA9IChzcGVlZCA9IDI1MCwgY2FsbGJhY2spIC0+XG4gICAgdHJ5XG4gICAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSB7XG4gICAgICAgIHNjcm9sbFRvcDogJChAKS5vZmZzZXQoKS50b3AgKyAncHgnXG4gICAgICAgIH0sIHNwZWVkLCBudWxsLCBjYWxsYmFja1xuICAgIGNhdGNoIGVcbiAgICAgIGNvbnNvbGUubG9nIFwiZXJyb3JcIiwgZVxuICAgICAgY29uc29sZS5sb2cgXCJTY3JvbGwgZXJyb3Igd2l0aCAndGhpcydcIiwgQFxuXG4gICAgcmV0dXJuIEBcblxuICAjIHBsYWNlIHNvbWV0aGluZyB0b3AgYW5kIGNlbnRlclxuICAkLmZuLnRvcENlbnRlciA9IC0+XG4gICAgQGNzcyBcInBvc2l0aW9uXCIsIFwiYWJzb2x1dGVcIlxuICAgIEBjc3MgXCJ0b3BcIiwgJCh3aW5kb3cpLnNjcm9sbFRvcCgpICsgXCJweFwiXG4gICAgQGNzcyBcImxlZnRcIiwgKCgkKHdpbmRvdykud2lkdGgoKSAtIEBvdXRlcldpZHRoKCkpIC8gMikgKyAkKHdpbmRvdykuc2Nyb2xsTGVmdCgpICsgXCJweFwiXG5cbiAgIyBwbGFjZSBzb21ldGhpbmcgbWlkZGxlIGNlbnRlclxuICAkLmZuLm1pZGRsZUNlbnRlciA9IC0+XG4gICAgQGNzcyBcInBvc2l0aW9uXCIsIFwiYWJzb2x1dGVcIlxuICAgIEBjc3MgXCJ0b3BcIiwgKCgkKHdpbmRvdykuaGVpZ2h0KCkgLSB0aGlzLm91dGVySGVpZ2h0KCkpIC8gMikgKyAkKHdpbmRvdykuc2Nyb2xsVG9wKCkgKyBcInB4XCJcbiAgICBAY3NzIFwibGVmdFwiLCAoKCQod2luZG93KS53aWR0aCgpIC0gdGhpcy5vdXRlcldpZHRoKCkpIC8gMikgKyAkKHdpbmRvdykuc2Nyb2xsTGVmdCgpICsgXCJweFwiXG5cbiAgJC5mbi53aWR0aFBlcmNlbnRhZ2UgPSAtPlxuICAgIHJldHVybiBNYXRoLnJvdW5kKDEwMCAqIEBvdXRlcldpZHRoKCkgLyBAb2Zmc2V0UGFyZW50KCkud2lkdGgoKSkgKyAnJSdcblxuICAkLmZuLmhlaWdodFBlcmNlbnRhZ2UgPSAtPlxuICAgIHJldHVybiBNYXRoLnJvdW5kKDEwMCAqIEBvdXRlckhlaWdodCgpIC8gQG9mZnNldFBhcmVudCgpLmhlaWdodCgpKSArICclJ1xuXG5cbiAgJC5mbi5nZXRTdHlsZU9iamVjdCA9IC0+XG5cbiAgICAgIGRvbSA9IHRoaXMuZ2V0KDApXG5cbiAgICAgIHJldHVybnMgPSB7fVxuXG4gICAgICBpZiB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZVxuXG4gICAgICAgICAgY2FtZWxpemUgPSAoYSwgYikgLT4gYi50b1VwcGVyQ2FzZSgpXG5cbiAgICAgICAgICBzdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlIGRvbSwgbnVsbFxuXG4gICAgICAgICAgZm9yIHByb3AgaW4gc3R5bGVcbiAgICAgICAgICAgICAgY2FtZWwgPSBwcm9wLnJlcGxhY2UgL1xcLShbYS16XSkvZywgY2FtZWxpemVcbiAgICAgICAgICAgICAgdmFsID0gc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSBwcm9wXG4gICAgICAgICAgICAgIHJldHVybnNbY2FtZWxdID0gdmFsXG5cbiAgICAgICAgICByZXR1cm4gcmV0dXJuc1xuXG4gICAgICBpZiBkb20uY3VycmVudFN0eWxlXG5cbiAgICAgICAgICBzdHlsZSA9IGRvbS5jdXJyZW50U3R5bGVcblxuICAgICAgICAgIGZvciBwcm9wIGluIHN0eWxlXG5cbiAgICAgICAgICAgICAgcmV0dXJuc1twcm9wXSA9IHN0eWxlW3Byb3BdXG5cbiAgICAgICAgICByZXR1cm4gcmV0dXJuc1xuXG4gICAgICByZXR1cm4gdGhpcy5jc3MoKVxuXG5cblxuKShqUXVlcnkpXG5cbiNcbiMgQ291Y2hEQiBlcnJvciBoYW5kbGluZ1xuI1xuJC5hamF4U2V0dXBcbiAgc3RhdHVzQ29kZTpcbiAgICA0MDQ6ICh4aHIsIHN0YXR1cywgbWVzc2FnZSkgLT5cbiAgICAgIGNvZGUgPSB4aHIuc3RhdHVzXG4gICAgICBzdGF0dXNUZXh0ID0geGhyLnN0YXR1c1RleHRcbiAgICAgIHNlZVVuYXV0aG9yaXplZCA9IH54aHIucmVzcG9uc2VUZXh0LmluZGV4T2YoXCJ1bmF1dGhvcml6ZWRcIilcbiAgICAgIGlmIHNlZVVuYXV0aG9yaXplZFxuICAgICAgICBVdGlscy5taWRBbGVydCBcIlNlc3Npb24gY2xvc2VkPGJyPlBsZWFzZSBsb2cgaW4gYW5kIHRyeSBhZ2Fpbi5cIlxuICAgICAgICBUYW5nZXJpbmUudXNlci5sb2dvdXQoKVxuXG5cbiMgZGVidWcgY29kZXNcbmttID0ge1wiMFwiOjQ4LFwiMVwiOjQ5LFwiMlwiOjUwLFwiM1wiOjUxLFwiNFwiOjUyLFwiNVwiOjUzLFwiNlwiOjU0LFwiN1wiOjU1LFwiOFwiOjU2LFwiOVwiOjU3LFwiYVwiOjY1LFwiYlwiOjY2LFwiY1wiOjY3LFwiZFwiOjY4LFwiZVwiOjY5LFwiZlwiOjcwLFwiZ1wiOjcxLFwiaFwiOjcyLFwiaVwiOjczLFwialwiOjc0LFwia1wiOjc1LFwibFwiOjc2LFwibVwiOjc3LFwiblwiOjc4LFwib1wiOjc5LFwicFwiOjgwLFwicVwiOjgxLFwiclwiOjgyLFwic1wiOjgzLFwidFwiOjg0LFwidVwiOjg1LFwidlwiOjg2LFwid1wiOjg3LFwieFwiOjg4LFwieVwiOjg5LFwielwiOjkwfVxuc2tzID0gWyB7IHEgOiAoa21bXCIyMDAxdXBkYXRlXCJbaV1dIGZvciBpIGluIFswLi45XSksIGkgOiAwLCBjIDogLT4gVXRpbHMudXBkYXRlVGFuZ2VyaW5lKCAtPiBVdGlscy5taWRBbGVydChcIlVwZGF0ZWQsIHBsZWFzZSByZWZyZXNoLlwiKSApIH0gXVxuJChkb2N1bWVudCkua2V5ZG93biAoZSkgLT4gKCBpZiBlLmtleUNvZGUgPT0gc2tzW2pdLnFbc2tzW2pdLmkrK10gdGhlbiBza3Nbal1bJ2MnXSgpIGlmIHNrc1tqXS5pID09IHNrc1tqXS5xLmxlbmd0aCBlbHNlIHNrc1tqXS5pID0gMCApIGZvciBzaywgaiBpbiBza3NcblxuXG5TdHJpbmcucHJvdG90eXBlLnNhZmV0eURhbmNlID0gLT4gdGhpcy5yZXBsYWNlKC9cXHMvZywgXCJfXCIpLnJlcGxhY2UoL1teYS16QS1aMC05X10vZyxcIlwiKVxuU3RyaW5nLnByb3RvdHlwZS5kYXRhYmFzZVNhZmV0eURhbmNlID0gLT4gdGhpcy5yZXBsYWNlKC9cXHMvZywgXCJfXCIpLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvW15hLXowLTlfLV0vZyxcIlwiKVxuU3RyaW5nLnByb3RvdHlwZS5jb3VudCA9IChzdWJzdHJpbmcpIC0+IHRoaXMubWF0Y2gobmV3IFJlZ0V4cCBzdWJzdHJpbmcsIFwiZ1wiKT8ubGVuZ3RoIHx8IDBcblxuXG5cbk1hdGguYXZlID0gLT5cbiAgcmVzdWx0ID0gMFxuICByZXN1bHQgKz0geCBmb3IgeCBpbiBhcmd1bWVudHNcbiAgcmVzdWx0IC89IGFyZ3VtZW50cy5sZW5ndGhcbiAgcmV0dXJuIHJlc3VsdFxuXG5NYXRoLmlzSW50ICAgID0gLT4gcmV0dXJuIHR5cGVvZiBuID09ICdudW1iZXInICYmIHBhcnNlRmxvYXQobikgPT0gcGFyc2VJbnQobiwgMTApICYmICFpc05hTihuKVxuTWF0aC5kZWNpbWFscyA9IChudW0sIGRlY2ltYWxzKSAtPiBtID0gTWF0aC5wb3coIDEwLCBkZWNpbWFscyApOyBudW0gKj0gbTsgbnVtID0gIG51bSsoYG51bTwwPy0wLjU6KzAuNWApPj4wOyBudW0gLz0gbVxuTWF0aC5jb21tYXMgICA9IChudW0pIC0+IHBhcnNlSW50KG51bSkudG9TdHJpbmcoKS5yZXBsYWNlKC9cXEIoPz0oXFxkezN9KSsoPyFcXGQpKS9nLCBcIixcIilcbk1hdGgubGltaXQgICAgPSAobWluLCBudW0sIG1heCkgLT4gTWF0aC5tYXgobWluLCBNYXRoLm1pbihudW0sIG1heCkpXG5cbiMgbWV0aG9kIG5hbWUgc2xpZ2h0bHkgbWlzbGVhZGluZ1xuIyByZXR1cm5zIHRydWUgZm9yIGZhbHN5IHZhbHVlc1xuIyAgIG51bGwsIHVuZGVmaW5lZCwgYW5kICdcXHMqJ1xuIyBvdGhlciBmYWxzZSB2YWx1ZXMgbGlrZVxuIyAgIGZhbHNlLCAwXG4jIHJldHVybiBmYWxzZVxuXy5pc0VtcHR5U3RyaW5nID0gKCBhU3RyaW5nICkgLT5cbiAgcmV0dXJuIHRydWUgaWYgYVN0cmluZyBpcyBudWxsIG9yIGFTdHJpbmcgaXMgdW5kZWZpbmVkXG4gIHJldHVybiBmYWxzZSB1bmxlc3MgXy5pc1N0cmluZyhhU3RyaW5nKSBvciBfLmlzTnVtYmVyKGFTdHJpbmcpXG4gIGFTdHJpbmcgPSBTdHJpbmcoYVN0cmluZykgaWYgXy5pc051bWJlcihhU3RyaW5nKVxuICByZXR1cm4gdHJ1ZSBpZiBhU3RyaW5nLnJlcGxhY2UoL1xccyovLCAnJykgPT0gJydcbiAgcmV0dXJuIGZhbHNlXG5cbl8uaW5kZXhCeSA9ICggcHJvcGVydHlOYW1lLCBvYmplY3RBcnJheSApIC0+XG4gIHJlc3VsdCA9IHt9XG4gIGZvciBvbmVPYmplY3QgaW4gb2JqZWN0QXJyYXlcbiAgICBpZiBvbmVPYmplY3RbcHJvcGVydHlOYW1lXT9cbiAgICAgIGtleSA9IG9uZU9iamVjdFtwcm9wZXJ0eU5hbWVdXG4gICAgICByZXN1bHRba2V5XSA9IFtdIGlmIG5vdCByZXN1bHRba2V5XT9cbiAgICAgIHJlc3VsdFtrZXldLnB1c2gob25lT2JqZWN0KVxuICByZXR1cm4gcmVzdWx0XG5cblxuY2xhc3MgVXRpbHNcblxuXG4gIEBjaGFuZ2VMYW5ndWFnZSA6IChjb2RlLCBjYWxsYmFjaykgLT5cbiAgICBpMThuLnNldExuZyBjb2RlLCBjYWxsYmFja1xuXG4gIEByZXNhdmU6ICgpIC0+XG4gICAgdXBkYXRlTW9kZWxzID0gKG1vZGVscywgY2FsbGJhY2spIC0+XG4gICAgICBpZiBtb2RlbHMubGVuZ3RoIGlzIDBcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKClcbiAgICAgIG1vZGVscy5wb3AoKS5zYXZlIG51bGwsXG4gICAgICAgIHN1Y2Nlc3M6IChtb2RlbCkgLT5cbiAgICAgICAgICBjb25zb2xlLmxvZyBtb2RlbC51cmxcbiAgICAgICAgICB1cGRhdGVNb2RlbHMobW9kZWxzLCBjYWxsYmFjaylcblxuXG4gICAgdXBkYXRlQ29sbGVjdGlvbnMgPSAoY29sbGVjdGlvbnMsIGNhbGxiYWNrKSAtPlxuICAgICAgaWYgY29sbGVjdGlvbnMubGVuZ3RoIGlzIDBcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKClcblxuICAgICAgY29sbGVjdGlvbiA9IG5ldyAoY29sbGVjdGlvbnMucG9wKCkpXG4gICAgICBjb2xsZWN0aW9uLmZldGNoXG4gICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgdXBkYXRlTW9kZWxzIGNvbGxlY3Rpb24sIC0+XG4gICAgICAgICAgICB1cGRhdGVDb2xsZWN0aW9ucyggY29sbGVjdGlvbnMsIGNhbGxiYWNrIClcblxuICAgIHVwZGF0ZUNvbGxlY3Rpb25zIFsgQXNzZXNzbWVudHMsIFN1YnRlc3RzLCBRdWVzdGlvbnMgXSwgLT5cbiAgICAgIGNvbnNvbGUubG9nIFwiQWxsIGRvbmVcIlxuXG5cblxuICBAZXhlY3V0ZTogKCBmdW5jdGlvbnMgKSAtPlxuXG4gICAgc3RlcCA9IC0+XG4gICAgICBuZXh0RnVuY3Rpb24gPSBmdW5jdGlvbnMuc2hpZnQoKVxuICAgICAgbmV4dEZ1bmN0aW9uPyhzdGVwKVxuICAgIHN0ZXAoKVxuXG4gIEBsb2FkQ29sbGVjdGlvbnMgOiAoIGxvYWRPcHRpb25zICkgLT5cblxuICAgIHRocm93IFwiWW91J3JlIGdvbm5hIHdhbnQgYSBjYWxsYmFjayBpbiB0aGVyZSwgYnVkZHkuXCIgdW5sZXNzIGxvYWRPcHRpb25zLmNvbXBsZXRlP1xuXG4gICAgdG9Mb2FkID0gbG9hZE9wdGlvbnMuY29sbGVjdGlvbnMgfHwgW11cblxuICAgIGdldE5leHQgPSAob3B0aW9ucykgLT5cbiAgICAgIGlmIGN1cnJlbnQgPSB0b0xvYWQucG9wKClcbiAgICAgICAgbWVtYmVyTmFtZSA9IGN1cnJlbnQudW5kZXJzY29yZSgpLmNhbWVsaXplKHRydWUpXG4gICAgICAgIG9wdGlvbnNbbWVtYmVyTmFtZV0gPSBuZXcgd2luZG93W2N1cnJlbnRdXG4gICAgICAgIG9wdGlvbnNbbWVtYmVyTmFtZV0uZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgZ2V0TmV4dCBvcHRpb25zXG4gICAgICBlbHNlXG4gICAgICAgIGxvYWRPcHRpb25zLmNvbXBsZXRlIG9wdGlvbnNcblxuICAgIGdldE5leHQge31cblxuICBAdW5pdmVyc2FsVXBsb2FkOiAtPlxuICAgICQuYWpheFxuICAgICAgdXJsOiBUYW5nZXJpbmUuc2V0dGluZ3MudXJsVmlldyhcImxvY2FsXCIsIFwiYnlDb2xsZWN0aW9uXCIpXG4gICAgICB0eXBlOiBcIlBPU1RcIlxuICAgICAgZGF0YVR5cGU6IFwianNvblwiXG4gICAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCJcbiAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KFxuICAgICAgICBrZXlzIDogW1wicmVzdWx0XCJdXG4gICAgICApXG4gICAgICBzdWNjZXNzOiAoZGF0YSkgLT5cbiAgICAgICAgZG9jTGlzdCA9IF8ucGx1Y2soZGF0YS5yb3dzLFwiaWRcIilcblxuICAgICAgICAkLmNvdWNoLnJlcGxpY2F0ZShcbiAgICAgICAgICBUYW5nZXJpbmUuc2V0dGluZ3MudXJsREIoXCJsb2NhbFwiKSxcbiAgICAgICAgICBUYW5nZXJpbmUuc2V0dGluZ3MudXJsREIoXCJncm91cFwiKSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgICAgICAgIFV0aWxzLnN0aWNreSBcIlJlc3VsdHMgc3luY2VkIHRvIGNsb3VkIHN1Y2Nlc3NmdWxseS5cIlxuICAgICAgICAgICAgZXJyb3I6IChjb2RlLCBtZXNzYWdlKSA9PlxuICAgICAgICAgICAgICBVdGlscy5zdGlja3kgXCJVcGxvYWQgZXJyb3I8YnI+I3tjb2RlfSAje21lc3NhZ2V9XCJcbiAgICAgICAgICAsXG4gICAgICAgICAgICBkb2NfaWRzOiBkb2NMaXN0XG4gICAgICAgIClcblxuICBAcmVzdGFydFRhbmdlcmluZTogKG1lc3NhZ2UsIGNhbGxiYWNrKSAtPlxuICAgIFV0aWxzLm1pZEFsZXJ0IFwiI3ttZXNzYWdlIHx8ICdSZXN0YXJ0aW5nIFRhbmdlcmluZSd9XCJcbiAgICBfLmRlbGF5KCAtPlxuICAgICAgZG9jdW1lbnQubG9jYXRpb24ucmVsb2FkKClcbiAgICAgIGNhbGxiYWNrPygpXG4gICAgLCAyMDAwIClcblxuICBAb25VcGRhdGVTdWNjZXNzOiAodG90YWxEb2NzKSAtPlxuICAgIFV0aWxzLmRvY3VtZW50Q291bnRlcisrXG4gICAgaWYgVXRpbHMuZG9jdW1lbnRDb3VudGVyID09IHRvdGFsRG9jc1xuICAgICAgVXRpbHMucmVzdGFydFRhbmdlcmluZSBcIlVwZGF0ZSBzdWNjZXNzZnVsXCIsIC0+XG4gICAgICAgIFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJcIiwgZmFsc2VcbiAgICAgIFV0aWxzLmRvY3VtZW50Q291bnRlciA9IG51bGxcblxuXG4gIEB1cGRhdGVUYW5nZXJpbmU6IChkb1Jlc29sdmUgPSB0cnVlLCBvcHRpb25zID0ge30pIC0+XG5cbiAgICByZXR1cm4gdW5sZXNzIFRhbmdlcmluZS51c2VyLmlzQWRtaW4oKVxuXG4gICAgVXRpbHMuZG9jdW1lbnRDb3VudGVyID0gMFxuXG4gICAgZERvYyA9IFwib2phaVwiXG4gICAgdGFyZ2V0REIgPSBvcHRpb25zLnRhcmdldERCIHx8IFRhbmdlcmluZS5kYl9uYW1lXG4gICAgZG9jSWRzID0gb3B0aW9ucy5kb2NJZHMgfHwgW1wiX2Rlc2lnbi8je2REb2N9XCIsIFwiY29uZmlndXJhdGlvblwiXVxuXG5cbiAgICBVdGlscy5taWRBbGVydCBcIlVwZGF0aW5nLi4uXCJcbiAgICBVdGlscy53b3JraW5nIHRydWVcbiAgICAjIHNhdmUgb2xkIHJldiBmb3IgbGF0ZXJcbiAgICBUYW5nZXJpbmUuJGRiLmFsbERvY3NcbiAgICAgIGtleXMgOiBkb2NJZHNcbiAgICAgIHN1Y2Nlc3M6IChyZXNwb25zZSkgLT5cbiAgICAgICAgb2xkRG9jcyA9IFtdXG4gICAgICAgIGZvciByb3cgaW4gcmVzcG9uc2Uucm93c1xuICAgICAgICAgIG9sZERvY3MucHVzaCB7XG4gICAgICAgICAgICBcIl9pZFwiICA6IHJvdy5pZFxuICAgICAgICAgICAgXCJfcmV2XCIgOiByb3cudmFsdWUucmV2XG4gICAgICAgICAgfVxuICAgICAgICAjIHJlcGxpY2F0ZSBmcm9tIHVwZGF0ZSBkYXRhYmFzZVxuICAgICAgICAkLmNvdWNoLnJlcGxpY2F0ZSBUYW5nZXJpbmUuc2V0dGluZ3MudXJsREIoXCJ1cGRhdGVcIiksIHRhcmdldERCLFxuICAgICAgICAgIGVycm9yOiAoZXJyb3IpIC0+XG4gICAgICAgICAgICBVdGlscy53b3JraW5nIGZhbHNlXG4gICAgICAgICAgICBVdGlscy5taWRBbGVydCBcIlVwZGF0ZSBmYWlsZWQgcmVwbGljYXRpbmc8YnI+I3tlcnJvcn1cIlxuICAgICAgICAgICAgVXRpbHMuZG9jdW1lbnRDb3VudGVyID0gbnVsbFxuICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICB1bmxlc3MgZG9SZXNvbHZlXG4gICAgICAgICAgICAgIFV0aWxzLm9uVXBkYXRlU3VjY2VzcygxKVxuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIHRvdGFsRG9jcyA9IGRvY0lkcy5sZW5ndGhcbiAgICAgICAgICAgIGZvciBkb2NJZCwgaSBpbiBkb2NJZHNcbiAgICAgICAgICAgICAgb2xkRG9jID0gb2xkRG9jc1tpXVxuICAgICAgICAgICAgICBkbyAoZG9jSWQsIG9sZERvYywgdG90YWxEb2NzKSAtPlxuICAgICAgICAgICAgICAgIFRhbmdlcmluZS4kZGIub3BlbkRvYyBkb2NJZCxcbiAgICAgICAgICAgICAgICAgIGNvbmZsaWN0czogdHJ1ZVxuICAgICAgICAgICAgICAgICAgc3VjY2VzczogKGRhdGEpIC0+XG4gICAgICAgICAgICAgICAgICAgIGlmIGRhdGEuX2NvbmZsaWN0cz9cbiAgICAgICAgICAgICAgICAgICAgICBUYW5nZXJpbmUuJGRiLnJlbW92ZURvYyBvbGREb2MsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgICBVdGlscy53b3JraW5nIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFV0aWxzLm9uVXBkYXRlU3VjY2Vzcyh0b3RhbERvY3MpXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogKGVycm9yKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgICBVdGlscy5kb2N1bWVudENvdW50ZXIgPSBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFV0aWxzLndvcmtpbmcgZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgVXRpbHMubWlkQWxlcnQgXCJVcGRhdGUgZmFpbGVkIHJlc29sdmluZyBjb25mbGljdDxicj4je2Vycm9yfVwiXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICBVdGlscy5vblVwZGF0ZVN1Y2Nlc3ModG90YWxEb2NzKVxuICAgICAgICAsIGRvY19pZHMgOiBkb2NJZHNcblxuICBAbG9nOiAoc2VsZiwgZXJyb3IpIC0+XG4gICAgY2xhc3NOYW1lID0gc2VsZi5jb25zdHJ1Y3Rvci50b1N0cmluZygpLm1hdGNoKC9mdW5jdGlvblxccyooXFx3KykvKVsxXVxuICAgIGNvbnNvbGUubG9nIFwiI3tjbGFzc05hbWV9OiAje2Vycm9yfVwiXG5cbiAgIyBpZiBhcmdzIGlzIG9uZSBvYmplY3Qgc2F2ZSBpdCB0byB0ZW1wb3JhcnkgaGFzaFxuICAjIGlmIHR3byBzdHJpbmdzLCBzYXZlIGtleSB2YWx1ZSBwYWlyXG4gICMgaWYgb25lIHN0cmluZywgdXNlIGFzIGtleSwgcmV0dXJuIHZhbHVlXG4gIEBkYXRhOiAoYXJncy4uLikgLT5cbiAgICBpZiBhcmdzLmxlbmd0aCA9PSAxXG4gICAgICBhcmcgPSBhcmdzWzBdXG4gICAgICBpZiBfLmlzU3RyaW5nKGFyZylcbiAgICAgICAgcmV0dXJuIFRhbmdlcmluZS50ZW1wRGF0YVthcmddXG4gICAgICBlbHNlIGlmIF8uaXNPYmplY3QoYXJnKVxuICAgICAgICBUYW5nZXJpbmUudGVtcERhdGEgPSAkLmV4dGVuZChUYW5nZXJpbmUudGVtcERhdGEsIGFyZylcbiAgICAgIGVsc2UgaWYgYXJnID09IG51bGxcbiAgICAgICAgVGFuZ2VyaW5lLnRlbXBEYXRhID0ge31cbiAgICBlbHNlIGlmIGFyZ3MubGVuZ3RoID09IDJcbiAgICAgIGtleSA9IGFyZ3NbMF1cbiAgICAgIHZhbHVlID0gYXJnc1sxXVxuICAgICAgVGFuZ2VyaW5lLnRlbXBEYXRhW2tleV0gPSB2YWx1ZVxuICAgICAgcmV0dXJuIFRhbmdlcmluZS50ZW1wRGF0YVxuICAgIGVsc2UgaWYgYXJncy5sZW5ndGggPT0gMFxuICAgICAgcmV0dXJuIFRhbmdlcmluZS50ZW1wRGF0YVxuXG5cbiAgQHdvcmtpbmc6IChpc1dvcmtpbmcpIC0+XG4gICAgaWYgaXNXb3JraW5nXG4gICAgICBpZiBub3QgVGFuZ2VyaW5lLmxvYWRpbmdUaW1lcj9cbiAgICAgICAgVGFuZ2VyaW5lLmxvYWRpbmdUaW1lciA9IHNldFRpbWVvdXQoVXRpbHMuc2hvd0xvYWRpbmdJbmRpY2F0b3IsIDMwMDApXG4gICAgZWxzZVxuICAgICAgaWYgVGFuZ2VyaW5lLmxvYWRpbmdUaW1lcj9cbiAgICAgICAgY2xlYXJUaW1lb3V0IFRhbmdlcmluZS5sb2FkaW5nVGltZXJcbiAgICAgICAgVGFuZ2VyaW5lLmxvYWRpbmdUaW1lciA9IG51bGxcblxuICAgICAgJChcIi5sb2FkaW5nX2JhclwiKS5yZW1vdmUoKVxuXG4gIEBzaG93TG9hZGluZ0luZGljYXRvcjogLT5cbiAgICAkKFwiPGRpdiBjbGFzcz0nbG9hZGluZ19iYXInPjxpbWcgY2xhc3M9J2xvYWRpbmcnIHNyYz0naW1hZ2VzL2xvYWRpbmcuZ2lmJz48L2Rpdj5cIikuYXBwZW5kVG8oXCJib2R5XCIpLm1pZGRsZUNlbnRlcigpXG5cbiAgIyBhc2tzIGZvciBjb25maXJtYXRpb24gaW4gdGhlIGJyb3dzZXIsIGFuZCB1c2VzIHBob25lZ2FwIGZvciBjb29sIGNvbmZpcm1hdGlvblxuICBAY29uZmlybTogKG1lc3NhZ2UsIG9wdGlvbnMpIC0+XG4gICAgaWYgbmF2aWdhdG9yLm5vdGlmaWNhdGlvbj8uY29uZmlybT9cbiAgICAgIG5hdmlnYXRvci5ub3RpZmljYXRpb24uY29uZmlybSBtZXNzYWdlLFxuICAgICAgICAoaW5wdXQpIC0+XG4gICAgICAgICAgaWYgaW5wdXQgPT0gMVxuICAgICAgICAgICAgb3B0aW9ucy5jYWxsYmFjayB0cnVlXG4gICAgICAgICAgZWxzZSBpZiBpbnB1dCA9PSAyXG4gICAgICAgICAgICBvcHRpb25zLmNhbGxiYWNrIGZhbHNlXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgb3B0aW9ucy5jYWxsYmFjayBpbnB1dFxuICAgICAgLCBvcHRpb25zLnRpdGxlLCBvcHRpb25zLmFjdGlvbitcIixDYW5jZWxcIlxuICAgIGVsc2VcbiAgICAgIGlmIHdpbmRvdy5jb25maXJtIG1lc3NhZ2VcbiAgICAgICAgb3B0aW9ucy5jYWxsYmFjayB0cnVlXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICBlbHNlXG4gICAgICAgIG9wdGlvbnMuY2FsbGJhY2sgZmFsc2VcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgcmV0dXJuIDBcblxuICAjIHRoaXMgZnVuY3Rpb24gaXMgYSBsb3QgbGlrZSBqUXVlcnkuc2VyaWFsaXplQXJyYXksIGV4Y2VwdCB0aGF0IGl0IHJldHVybnMgdXNlZnVsIG91dHB1dFxuICAjIHdvcmtzIG9uIHRleHRhcmVhcywgaW5wdXQgdHlwZSB0ZXh0IGFuZCBwYXNzd29yZFxuICBAZ2V0VmFsdWVzOiAoIHNlbGVjdG9yICkgLT5cbiAgICB2YWx1ZXMgPSB7fVxuICAgICQoc2VsZWN0b3IpLmZpbmQoXCJpbnB1dFt0eXBlPXRleHRdLCBpbnB1dFt0eXBlPXBhc3N3b3JkXSwgdGV4dGFyZWFcIikuZWFjaCAoIGluZGV4LCBlbGVtZW50ICkgLT5cbiAgICAgIHZhbHVlc1tlbGVtZW50LmlkXSA9IGVsZW1lbnQudmFsdWVcbiAgICByZXR1cm4gdmFsdWVzXG5cbiAgIyBjb252ZXJ0cyB1cmwgZXNjYXBlZCBjaGFyYWN0ZXJzXG4gIEBjbGVhblVSTDogKHVybCkgLT5cbiAgICBpZiB1cmwuaW5kZXhPZj8oXCIlXCIpICE9IC0xXG4gICAgICB1cmwgPSBkZWNvZGVVUklDb21wb25lbnQgdXJsXG4gICAgZWxzZVxuICAgICAgdXJsXG5cbiAgIyBEaXNwb3NhYmxlIGFsZXJ0c1xuICBAdG9wQWxlcnQ6IChhbGVydFRleHQsIGRlbGF5ID0gMjAwMCkgLT5cbiAgICBVdGlscy5hbGVydCBcInRvcFwiLCBhbGVydFRleHQsIGRlbGF5XG5cbiAgQG1pZEFsZXJ0OiAoYWxlcnRUZXh0LCBkZWxheT0yMDAwKSAtPlxuICAgIFV0aWxzLmFsZXJ0IFwibWlkZGxlXCIsIGFsZXJ0VGV4dCwgZGVsYXlcblxuICBAYWxlcnQ6ICggd2hlcmUsIGFsZXJ0VGV4dCwgZGVsYXkgPSAyMDAwICkgLT5cblxuICAgIHN3aXRjaCB3aGVyZVxuICAgICAgd2hlbiBcInRvcFwiXG4gICAgICAgIHNlbGVjdG9yID0gXCIudG9wX2FsZXJ0XCJcbiAgICAgICAgYWxpZ25lciA9ICggJGVsICkgLT4gcmV0dXJuICRlbC50b3BDZW50ZXIoKVxuICAgICAgd2hlbiBcIm1pZGRsZVwiXG4gICAgICAgIHNlbGVjdG9yID0gXCIubWlkX2FsZXJ0XCJcbiAgICAgICAgYWxpZ25lciA9ICggJGVsICkgLT4gcmV0dXJuICRlbC5taWRkbGVDZW50ZXIoKVxuXG5cbiAgICBpZiBVdGlsc1tcIiN7d2hlcmV9QWxlcnRUaW1lclwiXT9cbiAgICAgIGNsZWFyVGltZW91dCBVdGlsc1tcIiN7d2hlcmV9QWxlcnRUaW1lclwiXVxuICAgICAgJGFsZXJ0ID0gJChzZWxlY3RvcilcbiAgICAgICRhbGVydC5odG1sKCAkYWxlcnQuaHRtbCgpICsgXCI8YnI+XCIgKyBhbGVydFRleHQgKVxuICAgIGVsc2VcbiAgICAgICRhbGVydCA9ICQoXCI8ZGl2IGNsYXNzPScje3NlbGVjdG9yLnN1YnN0cmluZygxKX0gZGlzcG9zYWJsZV9hbGVydCc+I3thbGVydFRleHR9PC9kaXY+XCIpLmFwcGVuZFRvKFwiI2NvbnRlbnRcIilcblxuICAgIGFsaWduZXIoJGFsZXJ0KVxuXG4gICAgZG8gKCRhbGVydCwgc2VsZWN0b3IsIGRlbGF5KSAtPlxuICAgICAgY29tcHV0ZWREZWxheSA9ICgoXCJcIiskYWxlcnQuaHRtbCgpKS5tYXRjaCgvPGJyPi9nKXx8W10pLmxlbmd0aCAqIDE1MDBcbiAgICAgIFV0aWxzW1wiI3t3aGVyZX1BbGVydFRpbWVyXCJdID0gc2V0VGltZW91dCAtPlxuICAgICAgICAgIFV0aWxzW1wiI3t3aGVyZX1BbGVydFRpbWVyXCJdID0gbnVsbFxuICAgICAgICAgICRhbGVydC5mYWRlT3V0KDI1MCwgLT4gJCh0aGlzKS5yZW1vdmUoKSApXG4gICAgICAsIE1hdGgubWF4KGNvbXB1dGVkRGVsYXksIGRlbGF5KVxuXG5cblxuICBAc3RpY2t5OiAoaHRtbCwgYnV0dG9uVGV4dCA9IFwiQ2xvc2VcIiwgY2FsbGJhY2ssIHBvc2l0aW9uID0gXCJtaWRkbGVcIikgLT5cbiAgICBkaXYgPSAkKFwiPGRpdiBjbGFzcz0nc3RpY2t5X2FsZXJ0Jz4je2h0bWx9PGJyPjxidXR0b24gY2xhc3M9J2NvbW1hbmQgcGFyZW50X3JlbW92ZSc+I3tidXR0b25UZXh0fTwvYnV0dG9uPjwvZGl2PlwiKS5hcHBlbmRUbyhcIiNjb250ZW50XCIpXG4gICAgaWYgcG9zaXRpb24gPT0gXCJtaWRkbGVcIlxuICAgICAgZGl2Lm1pZGRsZUNlbnRlcigpXG4gICAgZWxzZSBpZiBwb3NpdGlvbiA9PSBcInRvcFwiXG4gICAgICBkaXYudG9wQ2VudGVyKClcbiAgICBkaXYub24oXCJrZXl1cFwiLCAoZXZlbnQpIC0+IGlmIGV2ZW50LndoaWNoID09IDI3IHRoZW4gJCh0aGlzKS5yZW1vdmUoKSkuZmluZChcImJ1dHRvblwiKS5jbGljayBjYWxsYmFja1xuXG4gIEB0b3BTdGlja3k6IChodG1sLCBidXR0b25UZXh0ID0gXCJDbG9zZVwiLCBjYWxsYmFjaykgLT5cbiAgICBVdGlscy5zdGlja3koaHRtbCwgYnV0dG9uVGV4dCwgY2FsbGJhY2ssIFwidG9wXCIpXG5cblxuXG4gIEBtb2RhbDogKGh0bWwpIC0+XG4gICAgaWYgaHRtbCA9PSBmYWxzZVxuICAgICAgJChcIiNtb2RhbF9iYWNrLCAjbW9kYWxcIikucmVtb3ZlKClcbiAgICAgIHJldHVyblxuXG4gICAgJChcImJvZHlcIikucHJlcGVuZChcIjxkaXYgaWQ9J21vZGFsX2JhY2snPjwvZGl2PlwiKVxuICAgICQoXCI8ZGl2IGlkPSdtb2RhbCc+I3todG1sfTwvZGl2PlwiKS5hcHBlbmRUbyhcIiNjb250ZW50XCIpLm1pZGRsZUNlbnRlcigpLm9uKFwia2V5dXBcIiwgKGV2ZW50KSAtPiBpZiBldmVudC53aGljaCA9PSAyNyB0aGVuICQoXCIjbW9kYWxfYmFjaywgI21vZGFsXCIpLnJlbW92ZSgpKVxuXG4gIEBwYXNzd29yZFByb21wdDogKGNhbGxiYWNrKSAtPlxuICAgIGh0bWwgPSBcIlxuICAgICAgPGRpdiBpZD0ncGFzc19mb3JtJyB0aXRsZT0nVXNlciB2ZXJpZmljYXRpb24nPlxuICAgICAgICA8bGFiZWwgZm9yPSdwYXNzd29yZCc+UGxlYXNlIHJlLWVudGVyIHlvdXIgcGFzc3dvcmQ8L2xhYmVsPlxuICAgICAgICA8aW5wdXQgaWQ9J3Bhc3NfdmFsJyB0eXBlPSdwYXNzd29yZCcgbmFtZT0ncGFzc3dvcmQnIGlkPSdwYXNzd29yZCcgdmFsdWU9Jyc+XG4gICAgICAgIDxidXR0b24gY2xhc3M9J2NvbW1hbmQnIGRhdGEtdmVyaWZ5PSd0cnVlJz5WZXJpZnk8L2J1dHRvbj5cbiAgICAgICAgPGJ1dHRvbiBjbGFzcz0nY29tbWFuZCc+Q2FuY2VsPC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICBcIlxuXG4gICAgVXRpbHMubW9kYWwgaHRtbFxuXG4gICAgJHBhc3MgPSAkKFwiI3Bhc3NfdmFsXCIpXG4gICAgJGJ1dHRvbiA9ICQoXCIjcGFzc19mb3JtIGJ1dHRvblwiKVxuXG4gICAgJHBhc3Mub24gXCJrZXl1cFwiLCAoZXZlbnQpIC0+XG4gICAgICByZXR1cm4gdHJ1ZSB1bmxlc3MgZXZlbnQud2hpY2ggPT0gMTNcbiAgICAgICRidXR0b24ub2ZmIFwiY2xpY2tcIlxuICAgICAgJHBhc3Mub2ZmIFwiY2hhbmdlXCJcblxuICAgICAgY2FsbGJhY2sgJHBhc3MudmFsKClcbiAgICAgIFV0aWxzLm1vZGFsIGZhbHNlXG5cbiAgICAkYnV0dG9uLm9uIFwiY2xpY2tcIiwgKGV2ZW50KSAtPlxuICAgICAgJGJ1dHRvbi5vZmYgXCJjbGlja1wiXG4gICAgICAkcGFzcy5vZmYgXCJjaGFuZ2VcIlxuXG4gICAgICBjYWxsYmFjayAkcGFzcy52YWwoKSBpZiAkKGV2ZW50LnRhcmdldCkuYXR0cihcImRhdGEtdmVyaWZ5XCIpID09IFwidHJ1ZVwiXG5cbiAgICAgIFV0aWxzLm1vZGFsIGZhbHNlXG5cblxuXG4gICMgcmV0dXJucyBhIEdVSURcbiAgQGd1aWQ6IC0+XG4gICByZXR1cm4gQFM0KCkrQFM0KCkrXCItXCIrQFM0KCkrXCItXCIrQFM0KCkrXCItXCIrQFM0KCkrXCItXCIrQFM0KCkrQFM0KCkrQFM0KClcbiAgQFM0OiAtPlxuICAgcmV0dXJuICggKCAoIDEgKyBNYXRoLnJhbmRvbSgpICkgKiAweDEwMDAwICkgfCAwICkudG9TdHJpbmcoMTYpLnN1YnN0cmluZygxKVxuXG4gIEBodW1hbkdVSUQ6IC0+IHJldHVybiBAcmFuZG9tTGV0dGVycyg0KStcIi1cIitAcmFuZG9tTGV0dGVycyg0KStcIi1cIitAcmFuZG9tTGV0dGVycyg0KVxuICBAc2FmZUxldHRlcnMgPSBcImFiY2RlZmdoaWpsbW5vcHFyc3R1dnd4eXpcIi5zcGxpdChcIlwiKVxuICBAcmFuZG9tTGV0dGVyczogKGxlbmd0aCkgLT5cbiAgICByZXN1bHQgPSBcIlwiXG4gICAgd2hpbGUgbGVuZ3RoLS1cbiAgICAgIHJlc3VsdCArPSBVdGlscy5zYWZlTGV0dGVyc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqVXRpbHMuc2FmZUxldHRlcnMubGVuZ3RoKV1cbiAgICByZXR1cm4gcmVzdWx0XG5cbiAgIyB0dXJucyB0aGUgYm9keSBiYWNrZ3JvdW5kIGEgY29sb3IgYW5kIHRoZW4gcmV0dXJucyB0byB3aGl0ZVxuICBAZmxhc2g6IChjb2xvcj1cInJlZFwiLCBzaG91bGRUdXJuSXRPbiA9IG51bGwpIC0+XG5cbiAgICBpZiBub3Qgc2hvdWxkVHVybkl0T24/XG4gICAgICBVdGlscy5iYWNrZ3JvdW5kIGNvbG9yXG4gICAgICBzZXRUaW1lb3V0IC0+XG4gICAgICAgIFV0aWxzLmJhY2tncm91bmQgXCJcIlxuICAgICAgLCAxMDAwXG5cbiAgQGJhY2tncm91bmQ6IChjb2xvcikgLT5cbiAgICBpZiBjb2xvcj9cbiAgICAgICQoXCIjY29udGVudF93cmFwcGVyXCIpLmNzcyBcImJhY2tncm91bmRDb2xvclwiIDogY29sb3JcbiAgICBlbHNlXG4gICAgICAkKFwiI2NvbnRlbnRfd3JhcHBlclwiKS5jc3MgXCJiYWNrZ3JvdW5kQ29sb3JcIlxuXG4gICMgUmV0cmlldmVzIEdFVCB2YXJpYWJsZXNcbiAgIyBodHRwOi8vZWpvaG4ub3JnL2Jsb2cvc2VhcmNoLWFuZC1kb250LXJlcGxhY2UvXG4gIEAkX0dFVDogKHEsIHMpIC0+XG4gICAgdmFycyA9IHt9XG4gICAgcGFydHMgPSB3aW5kb3cubG9jYXRpb24uaHJlZi5yZXBsYWNlKC9bPyZdKyhbXj0mXSspPShbXiZdKikvZ2ksIChtLGtleSx2YWx1ZSkgLT5cbiAgICAgICAgdmFsdWUgPSBpZiB+dmFsdWUuaW5kZXhPZihcIiNcIikgdGhlbiB2YWx1ZS5zcGxpdChcIiNcIilbMF0gZWxzZSB2YWx1ZVxuICAgICAgICB2YXJzW2tleV0gPSB2YWx1ZS5zcGxpdChcIiNcIilbMF07XG4gICAgKVxuICAgIHZhcnNcblxuXG4gICMgbm90IGN1cnJlbnRseSBpbXBsZW1lbnRlZCBidXQgd29ya2luZ1xuICBAcmVzaXplU2Nyb2xsUGFuZTogLT5cbiAgICAkKFwiLnNjcm9sbF9wYW5lXCIpLmhlaWdodCggJCh3aW5kb3cpLmhlaWdodCgpIC0gKCAkKFwiI25hdmlnYXRpb25cIikuaGVpZ2h0KCkgKyAkKFwiI2Zvb3RlclwiKS5oZWlnaHQoKSArIDEwMCkgKVxuXG4gICMgYXNrcyB1c2VyIGlmIHRoZXkgd2FudCB0byBsb2dvdXRcbiAgQGFza1RvTG9nb3V0OiAtPiBUYW5nZXJpbmUudXNlci5sb2dvdXQoKSBpZiBjb25maXJtKFwiV291bGQgeW91IGxpa2UgdG8gbG9nb3V0IG5vdz9cIilcblxuICBAb2xkQ29uc29sZUxvZyA9IG51bGxcbiAgQGVuYWJsZUNvbnNvbGVMb2c6IC0+IHJldHVybiB1bmxlc3Mgb2xkQ29uc29sZUxvZz8gOyB3aW5kb3cuY29uc29sZS5sb2cgPSBvbGRDb25zb2xlTG9nXG4gIEBkaXNhYmxlQ29uc29sZUxvZzogLT4gb2xkQ29uc29sZUxvZyA9IGNvbnNvbGUubG9nIDsgd2luZG93LmNvbnNvbGUubG9nID0gJC5ub29wXG5cbiAgQG9sZENvbnNvbGVBc3NlcnQgPSBudWxsXG4gIEBlbmFibGVDb25zb2xlQXNzZXJ0OiAtPiByZXR1cm4gdW5sZXNzIG9sZENvbnNvbGVBc3NlcnQ/ICAgIDsgd2luZG93LmNvbnNvbGUuYXNzZXJ0ID0gb2xkQ29uc29sZUFzc2VydFxuICBAZGlzYWJsZUNvbnNvbGVBc3NlcnQ6IC0+IG9sZENvbnNvbGVBc3NlcnQgPSBjb25zb2xlLmFzc2VydCA7IHdpbmRvdy5jb25zb2xlLmFzc2VydCA9ICQubm9vcFxuXG4jIFJvYmJlcnQgaW50ZXJmYWNlXG5jbGFzcyBSb2JiZXJ0XG5cblxuICBAZmV0Y2hVc2VyczogKGdyb3VwLCBjYWxsYmFjaykgLT5cbiAgICByZXR1cm4gUm9iYmVydC5yZXFcbiAgICAgIHR5cGU6ICdHRVQnXG4gICAgICB1cmw6IFwiL2dyb3VwLyN7Z3JvdXB9XCJcbiAgICAgIHN1Y2Nlc3MgOiBjYWxsYmFja1xuICAgICAgZXJyb3IgOiBjYWxsYmFja1xuXG4gIEByZXE6IChvcHRpb25zKSAtPlxuICAgIG9wdGlvbnMudXJsID0gVGFuZ2VyaW5lLmNvbmZpZy5nZXQoXCJyb2JiZXJ0XCIpICsgb3B0aW9ucy51cmxcbiAgICBvcHRpb25zLmNvbnRlbnRUeXBlID0gJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgb3B0aW9ucy5hY2NlcHQgPSAnYXBwbGljYXRpb24vanNvbidcbiAgICBvcHRpb25zLmRhdGFUeXBlID0gJ2pzb24nXG4gICAgb3B0aW9ucy5kYXRhID0gSlNPTi5zdHJpbmdpZnkob3B0aW9ucy5kYXRhKVxuICAgIGNvbnNvbGUubG9nKG9wdGlvbnMpXG4gICAgcmV0dXJuICQuYWpheChvcHRpb25zKVxuXG4gIEBmZXRjaFVzZXI6IChvcHRpb25zKSAtPlxuICAgIFJvYmJlcnQucmVxXG4gICAgICB0eXBlIDogJ0dFVCdcbiAgICAgIHVybCAgOiAgXCIvdXNlci9cIiArIFRhbmdlcmluZS51c2VyLmdldChcIm5hbWVcIilcbiAgICAgIHN1Y2Nlc3M6ICggZGF0YSApID0+XG4gICAgICAgIG9wdGlvbnMuc3VjY2Vzcz8gZGF0YVxuICAgICAgZXJyb3I6ICggZGF0YSApID0+XG4gICAgICAgIG9wdGlvbnMuZXJyb3I/IGRhdGFcblxuICBAbmV3R3JvdXA6IChvcHRpb25zKSAtPlxuICAgIFJvYmJlcnQucmVxXG4gICAgICB0eXBlIDogJ1BVVCdcbiAgICAgIHVybCAgOiAnL2dyb3VwJ1xuICAgICAgZGF0YSA6XG4gICAgICAgIG5hbWUgOiBvcHRpb25zLm5hbWVcbiAgICAgIHN1Y2Nlc3M6ICggZGF0YSApID0+XG4gICAgICAgIG9wdGlvbnMuc3VjY2Vzcz8gZGF0YVxuICAgICAgZXJyb3I6ICggZGF0YSApID0+XG4gICAgICAgIG9wdGlvbnMuZXJyb3I/IGRhdGFcblxuICBAbGVhdmVHcm91cDogKG9wdGlvbnMpIC0+XG4gICAgUm9iYmVydC5yZXFcbiAgICAgIHR5cGUgOiAnREVMRVRFJ1xuICAgICAgdXJsICA6IFwiL2dyb3VwLyN7b3B0aW9ucy5ncm91cH0vI3tvcHRpb25zLnVzZXJ9XCJcbiAgICAgIHN1Y2Nlc3M6ICggZGF0YSApID0+XG4gICAgICAgIG9wdGlvbnMuc3VjY2Vzcz8gZGF0YVxuICAgICAgZXJyb3I6ICggZGF0YSApID0+XG4gICAgICAgIG9wdGlvbnMuZXJyb3I/IGRhdGFcblxuICBAc2lnbnVwOiAob3B0aW9ucykgLT5cbiAgICByZXR1cm4gUm9iYmVydC5yZXFcbiAgICAgIHR5cGUgOiAnUFVUJ1xuICAgICAgdXJsICA6ICcvdXNlcidcbiAgICAgIGRhdGEgOlxuICAgICAgICBuYW1lIDogb3B0aW9ucy5uYW1lXG4gICAgICAgIHBhc3MgOiBvcHRpb25zLnBhc3NcbiAgICAgIHN1Y2Nlc3M6ICggZGF0YSApID0+XG4gICAgICAgIG9wdGlvbnMuc3VjY2Vzcz8gZGF0YVxuICAgICAgZXJyb3I6ICggZGF0YSApID0+XG4gICAgICAgIG9wdGlvbnMuZXJyb3I/IGRhdGFcblxuICBAcm9sZVBvc3Q6ICh1cmwsIHVzZXIsIGNhbGxiYWNrKSAtPlxuICAgIG9wdGlvbnMgPVxuICAgICAgdHlwZSA6ICdQT1NUJ1xuICAgICAgdXJsIDogXCIvZ3JvdXAvI3tUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KFwiZ3JvdXBOYW1lXCIpfVwiICsgdXJsXG4gICAgICBkYXRhIDpcbiAgICAgICAgdXNlciA6IHVzZXJcbiAgICAgIHN1Y2Nlc3MgOiBjYWxsYmFja1xuICAgICAgZXJyb3IgOiBjYWxsYmFja1xuICAgICAgY29tcGxldGUgOiAocmVzKSAtPlxuICAgICAgICBVdGlscy5taWRBbGVydCByZXMucmVzcG9uc2VKU09OLm1lc3NhZ2VcblxuICAgIHJldHVybiBSb2JiZXJ0LnJlcSBvcHRpb25zXG5cbiAgQGFkZEFkbWluOiAodXNlciwgY2FsbGJhY2spIC0+ICAgICBSb2JiZXJ0LnJvbGVQb3N0IFwiL2FkZC1hZG1pblwiLCB1c2VyLCBjYWxsYmFja1xuICBAYWRkTWVtYmVyOiAodXNlciwgY2FsbGJhY2spIC0+ICAgIFJvYmJlcnQucm9sZVBvc3QgXCIvYWRkLW1lbWJlclwiLCB1c2VyLCBjYWxsYmFja1xuICBAcmVtb3ZlQWRtaW46ICh1c2VyLCBjYWxsYmFjaykgLT4gIFJvYmJlcnQucm9sZVBvc3QgXCIvcmVtb3ZlLWFkbWluXCIsIHVzZXIsIGNhbGxiYWNrXG4gIEByZW1vdmVNZW1iZXI6ICh1c2VyLCBjYWxsYmFjaykgLT4gUm9iYmVydC5yb2xlUG9zdCBcIi9yZW1vdmUtbWVtYmVyXCIsIHVzZXIsIGNhbGxiYWNrXG5cblxuIyBUcmVlIGludGVyZmFjZVxuY2xhc3MgVGFuZ2VyaW5lVHJlZVxuICBcbiAgQGdlbmVyYXRlSnNvbkFuZE1Ba2U6IC0+XG5cbiAgICB1cmwgPSBUYW5nZXJpbmUuc2V0dGluZ3MudXJsVmlldyBcImdyb3VwXCIsIFwiYXNzZXNzbWVudHNOb3RBcmNoaXZlZFwiXG4gICAgY29uc29sZS5sb2coXCJ1cmw6IFwiICsgdXJsKVxuXG4gICAgJC5hamF4XG4gICAgICB1cmw6IFRhbmdlcmluZS5zZXR0aW5ncy51cmxWaWV3IFwiZ3JvdXBcIiwgXCJhc3Nlc3NtZW50c05vdEFyY2hpdmVkXCJcbiAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgc3VjY2VzczogKGRhdGEpID0+XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZGF0YTogXCIgKyBKU09OLnN0cmluZ2lmeShkYXRhKSlcbiMgICAgICAgIGRLZXlzID0gXy5jb21wYWN0KGRvYy5pZC5zdWJzdHIoLTUsIDUpIGZvciBkb2MgaW4gZGF0YS5yb3dzKS5jb25jYXQoa2V5TGlzdCkuam9pbihcIiBcIilcbiAgICAgICAgZEtleXMgPSBkYXRhLnJvd3MubWFwKChyb3cpID0+IHJvdy5pZC5zdWJzdHIoLTUpKVxuICAgICAgICBkS2V5UXVlcnkgPVxuICAgICAgICAgIGtleXM6IGRLZXlzXG4gICAgICAgIGNvbnNvbGUubG9nKFwiZEtleVF1ZXJ5OlwiICsgSlNPTi5zdHJpbmdpZnkoZEtleVF1ZXJ5KSlcbiAgICAgICAgdXJsID0gVGFuZ2VyaW5lLnNldHRpbmdzLnVybFZpZXcoXCJncm91cFwiLCBcImJ5REtleVwiKVxuICAgICAgICBjb25zb2xlLmxvZyhcInVybDogXCIgKyB1cmwpXG4gICAgICAgICQuYWpheFxuICAgICAgICAgIHVybDogVGFuZ2VyaW5lLnNldHRpbmdzLnVybFZpZXcoXCJncm91cFwiLCBcImJ5REtleVwiKSxcbiAgICAgICAgICB0eXBlOiBcIlBPU1RcIlxuICAgICAgICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIlxuICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KGRLZXlRdWVyeSlcbiAgICAgICAgICBzdWNjZXNzOiAoZGF0YSkgPT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZGF0YTogXCIgKyBKU09OLnN0cmluZ2lmeShkYXRhKSlcbiAgICAgICAgICAgIGtleUxpc3QgPSBbXVxuIyAgICAgICAgICAgIGZvciBkYXR1bSBpbiBkYXRhLnJvd3NcbiMgICAgICAgICAgICAgIGtleUxpc3QucHVzaCBkYXR1bS5rZXlcbiAgICAgICAgICAgIGtleUxpc3QgPSBkYXRhLnJvd3MubWFwKChyb3cpID0+IHJvdy5pZCk7XG4gICAgICAgICAgICBrZXlMaXN0ID0gXy51bmlxKGtleUxpc3QpXG4gICAgICAgICAgICBrZXlMaXN0LnB1c2goXCJzZXR0aW5nc1wiKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwia2V5TGlzdDogXCIgKyBKU09OLnN0cmluZ2lmeShrZXlMaXN0KSk7XG4jICAgICAgICAgICAga2V5TGlzdFF1ZXJ5ID0ge1xuIyAgICAgICAgICAgICAga2V5czoga2V5TGlzdCxcbiMgICAgICAgICAgICAgIGluY2x1ZGVfZG9jczp0cnVlXG4jICAgICAgICAgICAgfVxuICAgICAgICAgICAgVGFuZ2VyaW5lLiRkYi5hbGxEb2NzXG4gICAgICAgICAgICAgIGtleXMgOiBrZXlMaXN0XG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IChyZXNwb25zZSkgLT5cbiAgIyAgICAgICAgICAgICAgbGV0IGRvY3MgPSByZXNwb25zZS5ib2R5LnJvd3MubWFwKCAocm93KSA9PiByb3cuZG9jICk7XG4gICAgICAgICAgICAgICAgZG9jcyA9IFtdXG4gICAgICAgICAgICAgICAgZm9yIHJvdyBpbiByZXNwb25zZS5yb3dzXG4gICAgICAgICAgICAgICAgICBkb2NzLnB1c2ggcm93LmRvY1xuICAgICAgICAgICAgICAgIGJvZHkgPVxuICAgICAgICAgICAgICAgICAgZG9jczogZG9jc1xuICAgICAgICAgICAgICAgIHJldHVybiBib2R5XG4gICAgICBlcnJvcjogKGEsIGIpIC0+XG4gICAgICAgIGNvbnNvbGUubG9nKFwiYTogXCIgKyBhKVxuICAgICAgICBVdGlscy5taWRBbGVydCBcIkltcG9ydCBlcnJvclwiXG5cbiAgQG1ha2U6IChvcHRpb25zKSAtPlxuXG4gICAgVXRpbHMud29ya2luZyB0cnVlXG4gICAgJC5hamF4XG4gICAgICB1cmw6IFRhbmdlcmluZS5zZXR0aW5ncy51cmxWaWV3IFwiZ3JvdXBcIiwgXCJhc3Nlc3NtZW50c05vdEFyY2hpdmVkXCJcbiAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgc3VjY2VzczogKGRhdGEpID0+XG4gICAgICAgIGRLZXlzID0gZGF0YS5yb3dzLm1hcCgocm93KSA9PiByb3cuaWQuc3Vic3RyKC01KSlcbiAgICAgICAgZEtleVF1ZXJ5ID1cbiAgICAgICAgICBrZXlzOiBkS2V5c1xuICAgICAgICB1cmwgPSBUYW5nZXJpbmUuc2V0dGluZ3MudXJsVmlldyhcImdyb3VwXCIsIFwiYnlES2V5XCIpXG4gICAgICAgICQuYWpheFxuICAgICAgICAgIHVybDogdXJsLFxuICAgICAgICAgIHR5cGU6IFwiR0VUXCJcbiAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCJcbiAgICAgICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeShkS2V5UXVlcnkpXG4gICAgICAgICAgZXJyb3I6IChhLCBiKSA9PiBAdHJpZ2dlciBcInN0YXR1c1wiLCBcImV4cG9ydCBqc29uIGVycm9yXCIsIFwiI3thfSAje2J9XCJcbiAgICAgICAgICBzdWNjZXNzOiAoZGF0YSkgPT5cbiAgICAgICAgICAgIGRvY0xpc3QgPSBbXVxuICAgICAgICAgICAgZm9yIGRhdHVtIGluIGRhdGEucm93c1xuICAgICAgICAgICAgICBkb2NMaXN0LnB1c2ggZGF0dW0uaWRcbiAgICAgICAgICAgICAga2V5TGlzdCA9IF8udW5pcShkb2NMaXN0KVxuICAgICAgICAgICAgVGFuZ2VyaW5lLiRkYi5hbGxEb2NzXG4gICAgICAgICAgICAgIGtleXMgOiBrZXlMaXN0XG4gICAgICAgICAgICAgIGluY2x1ZGVfZG9jczp0cnVlXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IChyZXNwb25zZSkgLT5cbiAgICAgICAgICAgICAgICBkb2NzID0gW11cbiAgICAgICAgICAgICAgICBmb3Igcm93IGluIHJlc3BvbnNlLnJvd3NcbiAgICAgICAgICAgICAgICAgIGRvY3MucHVzaCByb3cuZG9jXG4gICAgICAgICAgICAgICAgYm9keSA9XG4gICAgICAgICAgICAgICAgICBkb2NzOiBkb2NzXG4gICAgICAgICAgICAgICAgc3VjY2VzcyA9IG9wdGlvbnMuc3VjY2Vzc1xuICAgICAgICAgICAgICAgIGVycm9yICAgPSBvcHRpb25zLmVycm9yXG5cbiAgICAgICAgICAgICAgICBwYXlsb2FkID0gSlNPTi5zdHJpbmdpZnkoYm9keSlcbiMgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJwYXlsb2FkOlwiICsgSlNPTi5zdHJpbmdpZnkoYm9keSkpXG5cbiAgICAgICAgICAgICAgICBkZWxldGUgb3B0aW9ucy5zdWNjZXNzXG4gICAgICAgICAgICAgICAgZGVsZXRlIG9wdGlvbnMuZXJyb3JcblxuICAgICAgICAgICAgICAgICQuYWpheFxuICAgICAgICAgICAgICAgICAgdHlwZSAgICAgOiAnUE9TVCdcbiAgICAgICAgICAgICAgICAgIGNyb3NzRG9tYWluIDogdHJ1ZVxuICAgICAgICAgICAgICAgICAgdXJsICAgICAgOiBcIiN7VGFuZ2VyaW5lLmNvbmZpZy5nZXQoJ3RyZWUnKX0vZ3JvdXAtI3tUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KCdncm91cE5hbWUnKX0vI3tUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KCdob3N0bmFtZScpfVwiXG4gICAgICAgICAgICAgICAgICBkYXRhVHlwZSA6ICdqc29uJ1xuICAgICAgICAgICAgICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiXG4gICAgICAgICAgICAgICAgICBkYXRhICAgICA6IHBheWxvYWRcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6ICggZGF0YSApID0+XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3MgZGF0YVxuICAgICAgICAgICAgICAgICAgZXJyb3I6ICggZGF0YSApID0+XG4gICAgICAgICAgICAgICAgICAgIGVycm9yIGRhdGEsIEpTT04ucGFyc2UoZGF0YS5yZXNwb25zZVRleHQpXG4gICAgICAgICAgICAgICAgICBjb21wbGV0ZTogLT5cbiAgICAgICAgICAgICAgICAgICAgVXRpbHMud29ya2luZyBmYWxzZVxuICAgICAgZXJyb3I6IChhLCBiKSAtPlxuICAgICAgICBjb25zb2xlLmxvZyhcIkVycm9yOiBcIiArIGEpXG4gICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiSW1wb3J0IGVycm9yXCJcblxuXG4jI1VJIGhlbHBlcnNcbiQgLT5cbiAgIyAjIyMuY2xlYXJfbWVzc2FnZVxuICAjIFRoaXMgbGl0dGxlIGd1eSB3aWxsIGZhZGUgb3V0IGFuZCBjbGVhciBoaW0gYW5kIGhpcyBwYXJlbnRzLiBXcmFwIGhpbSB3aXNlbHkuXG4gICMgYDxzcGFuPiBteSBtZXNzYWdlIDxidXR0b24gY2xhc3M9XCJjbGVhcl9tZXNzYWdlXCI+WDwvYnV0dG9uPmBcbiAgJChcIiNjb250ZW50XCIpLm9uKFwiY2xpY2tcIiwgXCIuY2xlYXJfbWVzc2FnZVwiLCAgbnVsbCwgKGEpIC0+ICQoYS50YXJnZXQpLnBhcmVudCgpLmZhZGVPdXQoMjUwLCAtPiAkKHRoaXMpLmVtcHR5KCkuc2hvdygpICkgKVxuICAkKFwiI2NvbnRlbnRcIikub24oXCJjbGlja1wiLCBcIi5wYXJlbnRfcmVtb3ZlXCIsIG51bGwsIChhKSAtPiAkKGEudGFyZ2V0KS5wYXJlbnQoKS5mYWRlT3V0KDI1MCwgLT4gJCh0aGlzKS5yZW1vdmUoKSApIClcblxuICAjIGRpc3Bvc2FibGUgYWxlcnRzID0gYSBub24tZmFuY3kgYm94XG4gICQoXCIjY29udGVudFwiKS5vbiBcImNsaWNrXCIsXCIuYWxlcnRfYnV0dG9uXCIsIC0+XG4gICAgYWxlcnRfdGV4dCA9IGlmICQodGhpcykuYXR0cihcImRhdGEtYWxlcnRcIikgdGhlbiAkKHRoaXMpLmF0dHIoXCJkYXRhLWFsZXJ0XCIpIGVsc2UgJCh0aGlzKS52YWwoKVxuICAgIFV0aWxzLmRpc3Bvc2FibGVBbGVydCBhbGVydF90ZXh0XG4gICQoXCIjY29udGVudFwiKS5vbiBcImNsaWNrXCIsIFwiLmRpc3Bvc2FibGVfYWxlcnRcIiwgLT5cbiAgICAkKHRoaXMpLnN0b3AoKS5mYWRlT3V0IDEwMCwgLT5cbiAgICAgICQodGhpcykucmVtb3ZlKClcblxuICAjICQod2luZG93KS5yZXNpemUgVXRpbHMucmVzaXplU2Nyb2xsUGFuZVxuICAjIFV0aWxzLnJlc2l6ZVNjcm9sbFBhbmUoKVxuIl19
