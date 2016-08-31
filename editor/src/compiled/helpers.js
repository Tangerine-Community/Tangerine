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
              }
              keyList = _.uniq(docList);
              keyList.push("settings");
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

//# sourceMappingURL=data:application/json;base64,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QTtJQUFBLFVBQUEsR0FBZ0IsQ0FBQSxDQUFFLElBQUYsQ0FBTyxDQUFDLElBQVIsQ0FBYSxZQUFiLENBQUgsR0FBbUMsQ0FBQSxDQUFFLElBQUYsQ0FBTyxDQUFDLElBQVIsQ0FBYSxZQUFiLENBQW5DLEdBQW1FLENBQUEsQ0FBRSxJQUFGLENBQU8sQ0FBQyxHQUFSLENBQUE7V0FDaEYsS0FBSyxDQUFDLGVBQU4sQ0FBc0IsVUFBdEI7RUFGd0MsQ0FBMUM7U0FHQSxDQUFBLENBQUUsVUFBRixDQUFhLENBQUMsRUFBZCxDQUFpQixPQUFqQixFQUEwQixtQkFBMUIsRUFBK0MsU0FBQTtXQUM3QyxDQUFBLENBQUUsSUFBRixDQUFPLENBQUMsSUFBUixDQUFBLENBQWMsQ0FBQyxPQUFmLENBQXVCLEdBQXZCLEVBQTRCLFNBQUE7YUFDMUIsQ0FBQSxDQUFFLElBQUYsQ0FBTyxDQUFDLE1BQVIsQ0FBQTtJQUQwQixDQUE1QjtFQUQ2QyxDQUEvQztBQVhBLENBQUYiLCJmaWxlIjoiYXBwL2hlbHBlcnMuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyIjXG4jIFNraXAgbG9naWNcbiNcblxuIyB0aGVzZSBjb3VsZCBlYXNpbHkgYmUgcmVmYWN0b3JlZCBpbnRvIG9uZS5cblxuUmVzdWx0T2ZRdWVzdGlvbiA9IChuYW1lKSAtPlxuICByZXR1cm5WaWV3ID0gbnVsbFxuICBpbmRleCA9IHZtLmN1cnJlbnRWaWV3Lm9yZGVyTWFwW3ZtLmN1cnJlbnRWaWV3LmluZGV4XVxuXG4gIGZvciBjYW5kaWRhdGVWaWV3IGluIHZtLmN1cnJlbnRWaWV3LnN1YnRlc3RWaWV3c1tpbmRleF0ucHJvdG90eXBlVmlldy5xdWVzdGlvblZpZXdzXG4gICAgaWYgY2FuZGlkYXRlVmlldy5tb2RlbC5nZXQoXCJuYW1lXCIpID09IG5hbWVcbiAgICAgIHJldHVyblZpZXcgPSBjYW5kaWRhdGVWaWV3XG4gIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcIlJlc3VsdE9mUXVlc3Rpb24gY291bGQgbm90IGZpbmQgdmFyaWFibGUgI3tuYW1lfVwiKSBpZiByZXR1cm5WaWV3ID09IG51bGxcbiAgcmV0dXJuIHJldHVyblZpZXcuYW5zd2VyIGlmIHJldHVyblZpZXcuYW5zd2VyXG4gIHJldHVybiBudWxsXG5cblJlc3VsdE9mTXVsdGlwbGUgPSAobmFtZSkgLT5cbiAgcmV0dXJuVmlldyA9IG51bGxcbiAgaW5kZXggPSB2bS5jdXJyZW50Vmlldy5vcmRlck1hcFt2bS5jdXJyZW50Vmlldy5pbmRleF1cblxuICBmb3IgY2FuZGlkYXRlVmlldyBpbiB2bS5jdXJyZW50Vmlldy5zdWJ0ZXN0Vmlld3NbaW5kZXhdLnByb3RvdHlwZVZpZXcucXVlc3Rpb25WaWV3c1xuICAgIGlmIGNhbmRpZGF0ZVZpZXcubW9kZWwuZ2V0KFwibmFtZVwiKSA9PSBuYW1lXG4gICAgICByZXR1cm5WaWV3ID0gY2FuZGlkYXRlVmlld1xuICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJSZXN1bHRPZlF1ZXN0aW9uIGNvdWxkIG5vdCBmaW5kIHZhcmlhYmxlICN7bmFtZX1cIikgaWYgcmV0dXJuVmlldyA9PSBudWxsXG5cbiAgcmVzdWx0ID0gW11cbiAgZm9yIGtleSwgdmFsdWUgb2YgcmV0dXJuVmlldy5hbnN3ZXJcbiAgICByZXN1bHQucHVzaCBrZXkgaWYgdmFsdWUgPT0gXCJjaGVja2VkXCJcbiAgcmV0dXJuIHJlc3VsdFxuXG5SZXN1bHRPZlByZXZpb3VzID0gKG5hbWUpIC0+XG4gIHJldHVybiB2bS5jdXJyZW50Vmlldy5yZXN1bHQuZ2V0VmFyaWFibGUobmFtZSlcblxuUmVzdWx0T2ZHcmlkID0gKG5hbWUpIC0+XG4gIHJldHVybiB2bS5jdXJyZW50Vmlldy5yZXN1bHQuZ2V0SXRlbVJlc3VsdENvdW50QnlWYXJpYWJsZU5hbWUobmFtZSwgXCJjb3JyZWN0XCIpXG5cblxuI1xuIyBUYW5nZXJpbmUgYmFja2J1dHRvbiBoYW5kbGVyXG4jXG5UYW5nZXJpbmUgPSBpZiBUYW5nZXJpbmU/IHRoZW4gVGFuZ2VyaW5lIGVsc2Uge31cblRhbmdlcmluZS5vbkJhY2tCdXR0b24gPSAoZXZlbnQpIC0+XG4gIGlmIFRhbmdlcmluZS5hY3Rpdml0eSA9PSBcImFzc2Vzc21lbnQgcnVuXCJcbiAgICBpZiBjb25maXJtIHQoXCJOYXZpZ2F0aW9uVmlldy5tZXNzYWdlLmluY29tcGxldGVfbWFpbl9zY3JlZW5cIilcbiAgICAgIFRhbmdlcmluZS5hY3Rpdml0eSA9IFwiXCJcbiAgICAgIHdpbmRvdy5oaXN0b3J5LmJhY2soKVxuICAgIGVsc2VcbiAgICAgIHJldHVybiBmYWxzZVxuICBlbHNlXG4gICAgd2luZG93Lmhpc3RvcnkuYmFjaygpXG5cblxuXG4jIEV4dGVuZCBldmVyeSB2aWV3IHdpdGggYSBjbG9zZSBtZXRob2QsIHVzZWQgYnkgVmlld01hbmFnZXJcbkJhY2tib25lLlZpZXcucHJvdG90eXBlLmNsb3NlID0gLT5cbiAgQHJlbW92ZSgpXG4gIEB1bmJpbmQoKVxuICBAb25DbG9zZT8oKVxuXG5cbiMgUmV0dXJucyBhbiBvYmplY3QgaGFzaGVkIGJ5IGEgZ2l2ZW4gYXR0cmlidXRlLlxuQmFja2JvbmUuQ29sbGVjdGlvbi5wcm90b3R5cGUuaW5kZXhCeSA9ICggYXR0ciApIC0+XG4gIHJlc3VsdCA9IHt9XG4gIGZvciBvbmVNb2RlbCBpbiBAbW9kZWxzXG4gICAgaWYgb25lTW9kZWwuaGFzKGF0dHIpXG4gICAgICBrZXkgPSBvbmVNb2RlbC5nZXQoYXR0cilcbiAgICAgIHJlc3VsdFtrZXldID0gW10gaWYgbm90IHJlc3VsdFtrZXldP1xuICAgICAgcmVzdWx0W2tleV0ucHVzaChvbmVNb2RlbClcbiAgcmV0dXJuIHJlc3VsdFxuXG4jIFJldHVybnMgYW4gb2JqZWN0IGhhc2hlZCBieSBhIGdpdmVuIGF0dHJpYnV0ZS5cbkJhY2tib25lLkNvbGxlY3Rpb24ucHJvdG90eXBlLmluZGV4QXJyYXlCeSA9ICggYXR0ciApIC0+XG4gIHJlc3VsdCA9IFtdXG4gIGZvciBvbmVNb2RlbCBpbiBAbW9kZWxzXG4gICAgaWYgb25lTW9kZWwuaGFzKGF0dHIpXG4gICAgICBrZXkgPSBvbmVNb2RlbC5nZXQoYXR0cilcbiAgICAgIHJlc3VsdFtrZXldID0gW10gaWYgbm90IHJlc3VsdFtrZXldP1xuICAgICAgcmVzdWx0W2tleV0ucHVzaChvbmVNb2RlbClcbiAgcmV0dXJuIHJlc3VsdFxuXG5CYWNrYm9uZS5Nb2RlbC5wcm90b3R5cGUuY29uZm9ybSA9ICggc3RhbmRhcmQgPSB7fSApIC0+XG4gIHRocm93IFwiQ2Fubm90IGNvbmZvcm0gdG8gZW1wdHkgc3RhbmRhcmQuIFVzZSBAY2xlYXIoKSBpbnN0ZWFkLlwiIGlmIF8uaXNFbXB0eShzdGFuZGFyZClcbiAgZm9yIGtleSwgdmFsdWUgb2Ygc3RhbmRhcmRcbiAgICBAc2V0KGtleSwgdmFsdWUoKSkgaWYgQGhhcyhrZXkpIG9yIEBnZXQoa2V5KSBpcyBcIlwiXG5cbkJhY2tib25lLk1vZGVsLnByb3RvdHlwZS5wcnVuZSA9ICggc2hhcGUgPSB7fSApIC0+XG4gIHRocm93IFwiQ2Fubm90IGNvbmZvcm0gdG8gZW1wdHkgc3RhbmRhcmQuIFVzZSBAY2xlYXIoKSBpbnN0ZWFkLlwiIGlmIF8uaXNFbXB0eShzdGFuZGFyZClcbiAgZm9yIGtleSwgdmFsdWUgb2YgQGF0dHJpYnV0ZXNcbiAgICBAdW5zZXQoa2V5KSB1bmxlc3Mga2V5IGluIHN0YW5kYXJkXG5cbiMgaGFzaCB0aGUgYXR0cmlidXRlcyBvZiBhIG1vZGVsXG5CYWNrYm9uZS5Nb2RlbC5wcm90b3R5cGUudG9IYXNoID0gLT5cbiAgc2lnbmlmaWNhbnRBdHRyaWJ1dGVzID0ge31cbiAgZm9yIGtleSwgdmFsdWUgb2YgQGF0dHJpYnV0ZXNcbiAgICBzaWduaWZpY2FudEF0dHJpYnV0ZXNba2V5XSA9IHZhbHVlIGlmICF+WydfcmV2JywgJ19pZCcsJ2hhc2gnLCd1cGRhdGVkJywnZWRpdGVkQnknXS5pbmRleE9mKGtleSlcbiAgcmV0dXJuIGI2NF9zaGExKEpTT04uc3RyaW5naWZ5KHNpZ25pZmljYW50QXR0cmlidXRlcykpXG5cbiMgYnkgZGVmYXVsdCBhbGwgbW9kZWxzIHdpbGwgc2F2ZSBhIHRpbWVzdGFtcCBhbmQgaGFzaCBvZiBzaWduaWZpY2FudCBhdHRyaWJ1dGVzXG5CYWNrYm9uZS5Nb2RlbC5wcm90b3R5cGUuX2JlZm9yZVNhdmUgPSAtPlxuICBAYmVmb3JlU2F2ZT8oKVxuICBAc3RhbXAoKVxuXG5CYWNrYm9uZS5Nb2RlbC5wcm90b3R5cGUuc3RhbXAgPSAtPlxuICBAc2V0XG4gICAgXCJlZGl0ZWRCeVwiIDogVGFuZ2VyaW5lPy51c2VyPy5uYW1lKCkgfHwgXCJ1bmtub3duXCJcbiAgICBcInVwZGF0ZWRcIiA6IChuZXcgRGF0ZSgpKS50b1N0cmluZygpXG4gICAgXCJoYXNoXCIgOiBAdG9IYXNoKClcbiAgICBcImZyb21JbnN0YW5jZUlkXCIgOiBUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0U3RyaW5nKFwiaW5zdGFuY2VJZFwiKVxuXG5cbiNcbiMgVGhpcyBzZXJpZXMgb2YgZnVuY3Rpb25zIHJldHVybnMgcHJvcGVydGllcyB3aXRoIGRlZmF1bHQgdmFsdWVzIGlmIG5vIHByb3BlcnR5IGlzIGZvdW5kXG4jIEBnb3RjaGEgYmUgbWluZGZ1bCBvZiB0aGUgZGVmYXVsdCBcImJsYW5rXCIgdmFsdWVzIHNldCBoZXJlXG4jXG5CYWNrYm9uZS5Nb2RlbC5wcm90b3R5cGUuZ2V0TnVtYmVyID0gICAgICAgIChrZXkpIC0+IHJldHVybiBpZiBAaGFzKGtleSkgdGhlbiBwYXJzZUludChAZ2V0KGtleSkpIGVsc2UgMFxuQmFja2JvbmUuTW9kZWwucHJvdG90eXBlLmdldEFycmF5ID0gICAgICAgICAoa2V5KSAtPiByZXR1cm4gaWYgQGhhcyhrZXkpIHRoZW4gQGdldChrZXkpICAgICAgICAgICBlbHNlIFtdXG5CYWNrYm9uZS5Nb2RlbC5wcm90b3R5cGUuZ2V0U3RyaW5nID0gICAgICAgIChrZXkpIC0+IHJldHVybiBpZiBAaGFzKGtleSkgdGhlbiBAZ2V0KGtleSkgICAgICAgICAgIGVsc2UgXCJcIlxuQmFja2JvbmUuTW9kZWwucHJvdG90eXBlLmdldEVzY2FwZWRTdHJpbmcgPSAoa2V5KSAtPiByZXR1cm4gaWYgQGhhcyhrZXkpIHRoZW4gQGVzY2FwZShrZXkpICAgICAgICBlbHNlIFwiXCJcbkJhY2tib25lLk1vZGVsLnByb3RvdHlwZS5nZXRCb29sZWFuID0gICAgICAgKGtleSkgLT4gcmV0dXJuIGlmIEBoYXMoa2V5KSB0aGVuIChAZ2V0KGtleSkgPT0gdHJ1ZSBvciBAZ2V0KGtleSkgPT0gJ3RydWUnKVxuXG5cbiNcbiMgaGFuZHkganF1ZXJ5IGZ1bmN0aW9uc1xuI1xuKCAoJCkgLT5cblxuICAkLmZuLnNjcm9sbFRvID0gKHNwZWVkID0gMjUwLCBjYWxsYmFjaykgLT5cbiAgICB0cnlcbiAgICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlIHtcbiAgICAgICAgc2Nyb2xsVG9wOiAkKEApLm9mZnNldCgpLnRvcCArICdweCdcbiAgICAgICAgfSwgc3BlZWQsIG51bGwsIGNhbGxiYWNrXG4gICAgY2F0Y2ggZVxuICAgICAgY29uc29sZS5sb2cgXCJlcnJvclwiLCBlXG4gICAgICBjb25zb2xlLmxvZyBcIlNjcm9sbCBlcnJvciB3aXRoICd0aGlzJ1wiLCBAXG5cbiAgICByZXR1cm4gQFxuXG4gICMgcGxhY2Ugc29tZXRoaW5nIHRvcCBhbmQgY2VudGVyXG4gICQuZm4udG9wQ2VudGVyID0gLT5cbiAgICBAY3NzIFwicG9zaXRpb25cIiwgXCJhYnNvbHV0ZVwiXG4gICAgQGNzcyBcInRvcFwiLCAkKHdpbmRvdykuc2Nyb2xsVG9wKCkgKyBcInB4XCJcbiAgICBAY3NzIFwibGVmdFwiLCAoKCQod2luZG93KS53aWR0aCgpIC0gQG91dGVyV2lkdGgoKSkgLyAyKSArICQod2luZG93KS5zY3JvbGxMZWZ0KCkgKyBcInB4XCJcblxuICAjIHBsYWNlIHNvbWV0aGluZyBtaWRkbGUgY2VudGVyXG4gICQuZm4ubWlkZGxlQ2VudGVyID0gLT5cbiAgICBAY3NzIFwicG9zaXRpb25cIiwgXCJhYnNvbHV0ZVwiXG4gICAgQGNzcyBcInRvcFwiLCAoKCQod2luZG93KS5oZWlnaHQoKSAtIHRoaXMub3V0ZXJIZWlnaHQoKSkgLyAyKSArICQod2luZG93KS5zY3JvbGxUb3AoKSArIFwicHhcIlxuICAgIEBjc3MgXCJsZWZ0XCIsICgoJCh3aW5kb3cpLndpZHRoKCkgLSB0aGlzLm91dGVyV2lkdGgoKSkgLyAyKSArICQod2luZG93KS5zY3JvbGxMZWZ0KCkgKyBcInB4XCJcblxuICAkLmZuLndpZHRoUGVyY2VudGFnZSA9IC0+XG4gICAgcmV0dXJuIE1hdGgucm91bmQoMTAwICogQG91dGVyV2lkdGgoKSAvIEBvZmZzZXRQYXJlbnQoKS53aWR0aCgpKSArICclJ1xuXG4gICQuZm4uaGVpZ2h0UGVyY2VudGFnZSA9IC0+XG4gICAgcmV0dXJuIE1hdGgucm91bmQoMTAwICogQG91dGVySGVpZ2h0KCkgLyBAb2Zmc2V0UGFyZW50KCkuaGVpZ2h0KCkpICsgJyUnXG5cblxuICAkLmZuLmdldFN0eWxlT2JqZWN0ID0gLT5cblxuICAgICAgZG9tID0gdGhpcy5nZXQoMClcblxuICAgICAgcmV0dXJucyA9IHt9XG5cbiAgICAgIGlmIHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlXG5cbiAgICAgICAgICBjYW1lbGl6ZSA9IChhLCBiKSAtPiBiLnRvVXBwZXJDYXNlKClcblxuICAgICAgICAgIHN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUgZG9tLCBudWxsXG5cbiAgICAgICAgICBmb3IgcHJvcCBpbiBzdHlsZVxuICAgICAgICAgICAgICBjYW1lbCA9IHByb3AucmVwbGFjZSAvXFwtKFthLXpdKS9nLCBjYW1lbGl6ZVxuICAgICAgICAgICAgICB2YWwgPSBzdHlsZS5nZXRQcm9wZXJ0eVZhbHVlIHByb3BcbiAgICAgICAgICAgICAgcmV0dXJuc1tjYW1lbF0gPSB2YWxcblxuICAgICAgICAgIHJldHVybiByZXR1cm5zXG5cbiAgICAgIGlmIGRvbS5jdXJyZW50U3R5bGVcblxuICAgICAgICAgIHN0eWxlID0gZG9tLmN1cnJlbnRTdHlsZVxuXG4gICAgICAgICAgZm9yIHByb3AgaW4gc3R5bGVcblxuICAgICAgICAgICAgICByZXR1cm5zW3Byb3BdID0gc3R5bGVbcHJvcF1cblxuICAgICAgICAgIHJldHVybiByZXR1cm5zXG5cbiAgICAgIHJldHVybiB0aGlzLmNzcygpXG5cblxuXG4pKGpRdWVyeSlcblxuI1xuIyBDb3VjaERCIGVycm9yIGhhbmRsaW5nXG4jXG4kLmFqYXhTZXR1cFxuICBzdGF0dXNDb2RlOlxuICAgIDQwNDogKHhociwgc3RhdHVzLCBtZXNzYWdlKSAtPlxuICAgICAgY29kZSA9IHhoci5zdGF0dXNcbiAgICAgIHN0YXR1c1RleHQgPSB4aHIuc3RhdHVzVGV4dFxuICAgICAgc2VlVW5hdXRob3JpemVkID0gfnhoci5yZXNwb25zZVRleHQuaW5kZXhPZihcInVuYXV0aG9yaXplZFwiKVxuICAgICAgaWYgc2VlVW5hdXRob3JpemVkXG4gICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiU2Vzc2lvbiBjbG9zZWQ8YnI+UGxlYXNlIGxvZyBpbiBhbmQgdHJ5IGFnYWluLlwiXG4gICAgICAgIFRhbmdlcmluZS51c2VyLmxvZ291dCgpXG5cblxuIyBkZWJ1ZyBjb2Rlc1xua20gPSB7XCIwXCI6NDgsXCIxXCI6NDksXCIyXCI6NTAsXCIzXCI6NTEsXCI0XCI6NTIsXCI1XCI6NTMsXCI2XCI6NTQsXCI3XCI6NTUsXCI4XCI6NTYsXCI5XCI6NTcsXCJhXCI6NjUsXCJiXCI6NjYsXCJjXCI6NjcsXCJkXCI6NjgsXCJlXCI6NjksXCJmXCI6NzAsXCJnXCI6NzEsXCJoXCI6NzIsXCJpXCI6NzMsXCJqXCI6NzQsXCJrXCI6NzUsXCJsXCI6NzYsXCJtXCI6NzcsXCJuXCI6NzgsXCJvXCI6NzksXCJwXCI6ODAsXCJxXCI6ODEsXCJyXCI6ODIsXCJzXCI6ODMsXCJ0XCI6ODQsXCJ1XCI6ODUsXCJ2XCI6ODYsXCJ3XCI6ODcsXCJ4XCI6ODgsXCJ5XCI6ODksXCJ6XCI6OTB9XG5za3MgPSBbIHsgcSA6IChrbVtcIjIwMDF1cGRhdGVcIltpXV0gZm9yIGkgaW4gWzAuLjldKSwgaSA6IDAsIGMgOiAtPiBVdGlscy51cGRhdGVUYW5nZXJpbmUoIC0+IFV0aWxzLm1pZEFsZXJ0KFwiVXBkYXRlZCwgcGxlYXNlIHJlZnJlc2guXCIpICkgfSBdXG4kKGRvY3VtZW50KS5rZXlkb3duIChlKSAtPiAoIGlmIGUua2V5Q29kZSA9PSBza3Nbal0ucVtza3Nbal0uaSsrXSB0aGVuIHNrc1tqXVsnYyddKCkgaWYgc2tzW2pdLmkgPT0gc2tzW2pdLnEubGVuZ3RoIGVsc2Ugc2tzW2pdLmkgPSAwICkgZm9yIHNrLCBqIGluIHNrc1xuXG5cblN0cmluZy5wcm90b3R5cGUuc2FmZXR5RGFuY2UgPSAtPiB0aGlzLnJlcGxhY2UoL1xccy9nLCBcIl9cIikucmVwbGFjZSgvW15hLXpBLVowLTlfXS9nLFwiXCIpXG5TdHJpbmcucHJvdG90eXBlLmRhdGFiYXNlU2FmZXR5RGFuY2UgPSAtPiB0aGlzLnJlcGxhY2UoL1xccy9nLCBcIl9cIikudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bXmEtejAtOV8tXS9nLFwiXCIpXG5TdHJpbmcucHJvdG90eXBlLmNvdW50ID0gKHN1YnN0cmluZykgLT4gdGhpcy5tYXRjaChuZXcgUmVnRXhwIHN1YnN0cmluZywgXCJnXCIpPy5sZW5ndGggfHwgMFxuXG5cblxuTWF0aC5hdmUgPSAtPlxuICByZXN1bHQgPSAwXG4gIHJlc3VsdCArPSB4IGZvciB4IGluIGFyZ3VtZW50c1xuICByZXN1bHQgLz0gYXJndW1lbnRzLmxlbmd0aFxuICByZXR1cm4gcmVzdWx0XG5cbk1hdGguaXNJbnQgICAgPSAtPiByZXR1cm4gdHlwZW9mIG4gPT0gJ251bWJlcicgJiYgcGFyc2VGbG9hdChuKSA9PSBwYXJzZUludChuLCAxMCkgJiYgIWlzTmFOKG4pXG5NYXRoLmRlY2ltYWxzID0gKG51bSwgZGVjaW1hbHMpIC0+IG0gPSBNYXRoLnBvdyggMTAsIGRlY2ltYWxzICk7IG51bSAqPSBtOyBudW0gPSAgbnVtKyhgbnVtPDA/LTAuNTorMC41YCk+PjA7IG51bSAvPSBtXG5NYXRoLmNvbW1hcyAgID0gKG51bSkgLT4gcGFyc2VJbnQobnVtKS50b1N0cmluZygpLnJlcGxhY2UoL1xcQig/PShcXGR7M30pKyg/IVxcZCkpL2csIFwiLFwiKVxuTWF0aC5saW1pdCAgICA9IChtaW4sIG51bSwgbWF4KSAtPiBNYXRoLm1heChtaW4sIE1hdGgubWluKG51bSwgbWF4KSlcblxuIyBtZXRob2QgbmFtZSBzbGlnaHRseSBtaXNsZWFkaW5nXG4jIHJldHVybnMgdHJ1ZSBmb3IgZmFsc3kgdmFsdWVzXG4jICAgbnVsbCwgdW5kZWZpbmVkLCBhbmQgJ1xccyonXG4jIG90aGVyIGZhbHNlIHZhbHVlcyBsaWtlXG4jICAgZmFsc2UsIDBcbiMgcmV0dXJuIGZhbHNlXG5fLmlzRW1wdHlTdHJpbmcgPSAoIGFTdHJpbmcgKSAtPlxuICByZXR1cm4gdHJ1ZSBpZiBhU3RyaW5nIGlzIG51bGwgb3IgYVN0cmluZyBpcyB1bmRlZmluZWRcbiAgcmV0dXJuIGZhbHNlIHVubGVzcyBfLmlzU3RyaW5nKGFTdHJpbmcpIG9yIF8uaXNOdW1iZXIoYVN0cmluZylcbiAgYVN0cmluZyA9IFN0cmluZyhhU3RyaW5nKSBpZiBfLmlzTnVtYmVyKGFTdHJpbmcpXG4gIHJldHVybiB0cnVlIGlmIGFTdHJpbmcucmVwbGFjZSgvXFxzKi8sICcnKSA9PSAnJ1xuICByZXR1cm4gZmFsc2VcblxuXy5pbmRleEJ5ID0gKCBwcm9wZXJ0eU5hbWUsIG9iamVjdEFycmF5ICkgLT5cbiAgcmVzdWx0ID0ge31cbiAgZm9yIG9uZU9iamVjdCBpbiBvYmplY3RBcnJheVxuICAgIGlmIG9uZU9iamVjdFtwcm9wZXJ0eU5hbWVdP1xuICAgICAga2V5ID0gb25lT2JqZWN0W3Byb3BlcnR5TmFtZV1cbiAgICAgIHJlc3VsdFtrZXldID0gW10gaWYgbm90IHJlc3VsdFtrZXldP1xuICAgICAgcmVzdWx0W2tleV0ucHVzaChvbmVPYmplY3QpXG4gIHJldHVybiByZXN1bHRcblxuXG5jbGFzcyBVdGlsc1xuXG5cbiAgQGNoYW5nZUxhbmd1YWdlIDogKGNvZGUsIGNhbGxiYWNrKSAtPlxuICAgIGkxOG4uc2V0TG5nIGNvZGUsIGNhbGxiYWNrXG5cbiAgQHJlc2F2ZTogKCkgLT5cbiAgICB1cGRhdGVNb2RlbHMgPSAobW9kZWxzLCBjYWxsYmFjaykgLT5cbiAgICAgIGlmIG1vZGVscy5sZW5ndGggaXMgMFxuICAgICAgICByZXR1cm4gY2FsbGJhY2soKVxuICAgICAgbW9kZWxzLnBvcCgpLnNhdmUgbnVsbCxcbiAgICAgICAgc3VjY2VzczogKG1vZGVsKSAtPlxuICAgICAgICAgIGNvbnNvbGUubG9nIG1vZGVsLnVybFxuICAgICAgICAgIHVwZGF0ZU1vZGVscyhtb2RlbHMsIGNhbGxiYWNrKVxuXG5cbiAgICB1cGRhdGVDb2xsZWN0aW9ucyA9IChjb2xsZWN0aW9ucywgY2FsbGJhY2spIC0+XG4gICAgICBpZiBjb2xsZWN0aW9ucy5sZW5ndGggaXMgMFxuICAgICAgICByZXR1cm4gY2FsbGJhY2soKVxuXG4gICAgICBjb2xsZWN0aW9uID0gbmV3IChjb2xsZWN0aW9ucy5wb3AoKSlcbiAgICAgIGNvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICB1cGRhdGVNb2RlbHMgY29sbGVjdGlvbiwgLT5cbiAgICAgICAgICAgIHVwZGF0ZUNvbGxlY3Rpb25zKCBjb2xsZWN0aW9ucywgY2FsbGJhY2sgKVxuXG4gICAgdXBkYXRlQ29sbGVjdGlvbnMgWyBBc3Nlc3NtZW50cywgU3VidGVzdHMsIFF1ZXN0aW9ucyBdLCAtPlxuICAgICAgY29uc29sZS5sb2cgXCJBbGwgZG9uZVwiXG5cblxuXG4gIEBleGVjdXRlOiAoIGZ1bmN0aW9ucyApIC0+XG5cbiAgICBzdGVwID0gLT5cbiAgICAgIG5leHRGdW5jdGlvbiA9IGZ1bmN0aW9ucy5zaGlmdCgpXG4gICAgICBuZXh0RnVuY3Rpb24/KHN0ZXApXG4gICAgc3RlcCgpXG5cbiAgQGxvYWRDb2xsZWN0aW9ucyA6ICggbG9hZE9wdGlvbnMgKSAtPlxuXG4gICAgdGhyb3cgXCJZb3UncmUgZ29ubmEgd2FudCBhIGNhbGxiYWNrIGluIHRoZXJlLCBidWRkeS5cIiB1bmxlc3MgbG9hZE9wdGlvbnMuY29tcGxldGU/XG5cbiAgICB0b0xvYWQgPSBsb2FkT3B0aW9ucy5jb2xsZWN0aW9ucyB8fCBbXVxuXG4gICAgZ2V0TmV4dCA9IChvcHRpb25zKSAtPlxuICAgICAgaWYgY3VycmVudCA9IHRvTG9hZC5wb3AoKVxuICAgICAgICBtZW1iZXJOYW1lID0gY3VycmVudC51bmRlcnNjb3JlKCkuY2FtZWxpemUodHJ1ZSlcbiAgICAgICAgb3B0aW9uc1ttZW1iZXJOYW1lXSA9IG5ldyB3aW5kb3dbY3VycmVudF1cbiAgICAgICAgb3B0aW9uc1ttZW1iZXJOYW1lXS5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICBnZXROZXh0IG9wdGlvbnNcbiAgICAgIGVsc2VcbiAgICAgICAgbG9hZE9wdGlvbnMuY29tcGxldGUgb3B0aW9uc1xuXG4gICAgZ2V0TmV4dCB7fVxuXG4gIEB1bml2ZXJzYWxVcGxvYWQ6IC0+XG4gICAgJC5hamF4XG4gICAgICB1cmw6IFRhbmdlcmluZS5zZXR0aW5ncy51cmxWaWV3KFwibG9jYWxcIiwgXCJieUNvbGxlY3Rpb25cIilcbiAgICAgIHR5cGU6IFwiUE9TVFwiXG4gICAgICBkYXRhVHlwZTogXCJqc29uXCJcbiAgICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIlxuICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoXG4gICAgICAgIGtleXMgOiBbXCJyZXN1bHRcIl1cbiAgICAgIClcbiAgICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuICAgICAgICBkb2NMaXN0ID0gXy5wbHVjayhkYXRhLnJvd3MsXCJpZFwiKVxuXG4gICAgICAgICQuY291Y2gucmVwbGljYXRlKFxuICAgICAgICAgIFRhbmdlcmluZS5zZXR0aW5ncy51cmxEQihcImxvY2FsXCIpLFxuICAgICAgICAgIFRhbmdlcmluZS5zZXR0aW5ncy51cmxEQihcImdyb3VwXCIpLFxuICAgICAgICAgICAgc3VjY2VzczogPT5cbiAgICAgICAgICAgICAgVXRpbHMuc3RpY2t5IFwiUmVzdWx0cyBzeW5jZWQgdG8gY2xvdWQgc3VjY2Vzc2Z1bGx5LlwiXG4gICAgICAgICAgICBlcnJvcjogKGNvZGUsIG1lc3NhZ2UpID0+XG4gICAgICAgICAgICAgIFV0aWxzLnN0aWNreSBcIlVwbG9hZCBlcnJvcjxicj4je2NvZGV9ICN7bWVzc2FnZX1cIlxuICAgICAgICAgICxcbiAgICAgICAgICAgIGRvY19pZHM6IGRvY0xpc3RcbiAgICAgICAgKVxuXG4gIEByZXN0YXJ0VGFuZ2VyaW5lOiAobWVzc2FnZSwgY2FsbGJhY2spIC0+XG4gICAgVXRpbHMubWlkQWxlcnQgXCIje21lc3NhZ2UgfHwgJ1Jlc3RhcnRpbmcgVGFuZ2VyaW5lJ31cIlxuICAgIF8uZGVsYXkoIC0+XG4gICAgICBkb2N1bWVudC5sb2NhdGlvbi5yZWxvYWQoKVxuICAgICAgY2FsbGJhY2s/KClcbiAgICAsIDIwMDAgKVxuXG4gIEBvblVwZGF0ZVN1Y2Nlc3M6ICh0b3RhbERvY3MpIC0+XG4gICAgVXRpbHMuZG9jdW1lbnRDb3VudGVyKytcbiAgICBpZiBVdGlscy5kb2N1bWVudENvdW50ZXIgPT0gdG90YWxEb2NzXG4gICAgICBVdGlscy5yZXN0YXJ0VGFuZ2VyaW5lIFwiVXBkYXRlIHN1Y2Nlc3NmdWxcIiwgLT5cbiAgICAgICAgVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcIlwiLCBmYWxzZVxuICAgICAgVXRpbHMuZG9jdW1lbnRDb3VudGVyID0gbnVsbFxuXG5cbiAgQHVwZGF0ZVRhbmdlcmluZTogKGRvUmVzb2x2ZSA9IHRydWUsIG9wdGlvbnMgPSB7fSkgLT5cblxuICAgIHJldHVybiB1bmxlc3MgVGFuZ2VyaW5lLnVzZXIuaXNBZG1pbigpXG5cbiAgICBVdGlscy5kb2N1bWVudENvdW50ZXIgPSAwXG5cbiAgICBkRG9jID0gXCJvamFpXCJcbiAgICB0YXJnZXREQiA9IG9wdGlvbnMudGFyZ2V0REIgfHwgVGFuZ2VyaW5lLmRiX25hbWVcbiAgICBkb2NJZHMgPSBvcHRpb25zLmRvY0lkcyB8fCBbXCJfZGVzaWduLyN7ZERvY31cIiwgXCJjb25maWd1cmF0aW9uXCJdXG5cblxuICAgIFV0aWxzLm1pZEFsZXJ0IFwiVXBkYXRpbmcuLi5cIlxuICAgIFV0aWxzLndvcmtpbmcgdHJ1ZVxuICAgICMgc2F2ZSBvbGQgcmV2IGZvciBsYXRlclxuICAgIFRhbmdlcmluZS4kZGIuYWxsRG9jc1xuICAgICAga2V5cyA6IGRvY0lkc1xuICAgICAgc3VjY2VzczogKHJlc3BvbnNlKSAtPlxuICAgICAgICBvbGREb2NzID0gW11cbiAgICAgICAgZm9yIHJvdyBpbiByZXNwb25zZS5yb3dzXG4gICAgICAgICAgb2xkRG9jcy5wdXNoIHtcbiAgICAgICAgICAgIFwiX2lkXCIgIDogcm93LmlkXG4gICAgICAgICAgICBcIl9yZXZcIiA6IHJvdy52YWx1ZS5yZXZcbiAgICAgICAgICB9XG4gICAgICAgICMgcmVwbGljYXRlIGZyb20gdXBkYXRlIGRhdGFiYXNlXG4gICAgICAgICQuY291Y2gucmVwbGljYXRlIFRhbmdlcmluZS5zZXR0aW5ncy51cmxEQihcInVwZGF0ZVwiKSwgdGFyZ2V0REIsXG4gICAgICAgICAgZXJyb3I6IChlcnJvcikgLT5cbiAgICAgICAgICAgIFV0aWxzLndvcmtpbmcgZmFsc2VcbiAgICAgICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiVXBkYXRlIGZhaWxlZCByZXBsaWNhdGluZzxicj4je2Vycm9yfVwiXG4gICAgICAgICAgICBVdGlscy5kb2N1bWVudENvdW50ZXIgPSBudWxsXG4gICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgIHVubGVzcyBkb1Jlc29sdmVcbiAgICAgICAgICAgICAgVXRpbHMub25VcGRhdGVTdWNjZXNzKDEpXG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgdG90YWxEb2NzID0gZG9jSWRzLmxlbmd0aFxuICAgICAgICAgICAgZm9yIGRvY0lkLCBpIGluIGRvY0lkc1xuICAgICAgICAgICAgICBvbGREb2MgPSBvbGREb2NzW2ldXG4gICAgICAgICAgICAgIGRvIChkb2NJZCwgb2xkRG9jLCB0b3RhbERvY3MpIC0+XG4gICAgICAgICAgICAgICAgVGFuZ2VyaW5lLiRkYi5vcGVuRG9jIGRvY0lkLFxuICAgICAgICAgICAgICAgICAgY29uZmxpY3RzOiB0cnVlXG4gICAgICAgICAgICAgICAgICBzdWNjZXNzOiAoZGF0YSkgLT5cbiAgICAgICAgICAgICAgICAgICAgaWYgZGF0YS5fY29uZmxpY3RzP1xuICAgICAgICAgICAgICAgICAgICAgIFRhbmdlcmluZS4kZGIucmVtb3ZlRG9jIG9sZERvYyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIFV0aWxzLndvcmtpbmcgZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgVXRpbHMub25VcGRhdGVTdWNjZXNzKHRvdGFsRG9jcylcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiAoZXJyb3IpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIFV0aWxzLmRvY3VtZW50Q291bnRlciA9IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgVXRpbHMud29ya2luZyBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICBVdGlscy5taWRBbGVydCBcIlVwZGF0ZSBmYWlsZWQgcmVzb2x2aW5nIGNvbmZsaWN0PGJyPiN7ZXJyb3J9XCJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgIFV0aWxzLm9uVXBkYXRlU3VjY2Vzcyh0b3RhbERvY3MpXG4gICAgICAgICwgZG9jX2lkcyA6IGRvY0lkc1xuXG4gIEBsb2c6IChzZWxmLCBlcnJvcikgLT5cbiAgICBjbGFzc05hbWUgPSBzZWxmLmNvbnN0cnVjdG9yLnRvU3RyaW5nKCkubWF0Y2goL2Z1bmN0aW9uXFxzKihcXHcrKS8pWzFdXG4gICAgY29uc29sZS5sb2cgXCIje2NsYXNzTmFtZX06ICN7ZXJyb3J9XCJcblxuICAjIGlmIGFyZ3MgaXMgb25lIG9iamVjdCBzYXZlIGl0IHRvIHRlbXBvcmFyeSBoYXNoXG4gICMgaWYgdHdvIHN0cmluZ3MsIHNhdmUga2V5IHZhbHVlIHBhaXJcbiAgIyBpZiBvbmUgc3RyaW5nLCB1c2UgYXMga2V5LCByZXR1cm4gdmFsdWVcbiAgQGRhdGE6IChhcmdzLi4uKSAtPlxuICAgIGlmIGFyZ3MubGVuZ3RoID09IDFcbiAgICAgIGFyZyA9IGFyZ3NbMF1cbiAgICAgIGlmIF8uaXNTdHJpbmcoYXJnKVxuICAgICAgICByZXR1cm4gVGFuZ2VyaW5lLnRlbXBEYXRhW2FyZ11cbiAgICAgIGVsc2UgaWYgXy5pc09iamVjdChhcmcpXG4gICAgICAgIFRhbmdlcmluZS50ZW1wRGF0YSA9ICQuZXh0ZW5kKFRhbmdlcmluZS50ZW1wRGF0YSwgYXJnKVxuICAgICAgZWxzZSBpZiBhcmcgPT0gbnVsbFxuICAgICAgICBUYW5nZXJpbmUudGVtcERhdGEgPSB7fVxuICAgIGVsc2UgaWYgYXJncy5sZW5ndGggPT0gMlxuICAgICAga2V5ID0gYXJnc1swXVxuICAgICAgdmFsdWUgPSBhcmdzWzFdXG4gICAgICBUYW5nZXJpbmUudGVtcERhdGFba2V5XSA9IHZhbHVlXG4gICAgICByZXR1cm4gVGFuZ2VyaW5lLnRlbXBEYXRhXG4gICAgZWxzZSBpZiBhcmdzLmxlbmd0aCA9PSAwXG4gICAgICByZXR1cm4gVGFuZ2VyaW5lLnRlbXBEYXRhXG5cblxuICBAd29ya2luZzogKGlzV29ya2luZykgLT5cbiAgICBpZiBpc1dvcmtpbmdcbiAgICAgIGlmIG5vdCBUYW5nZXJpbmUubG9hZGluZ1RpbWVyP1xuICAgICAgICBUYW5nZXJpbmUubG9hZGluZ1RpbWVyID0gc2V0VGltZW91dChVdGlscy5zaG93TG9hZGluZ0luZGljYXRvciwgMzAwMClcbiAgICBlbHNlXG4gICAgICBpZiBUYW5nZXJpbmUubG9hZGluZ1RpbWVyP1xuICAgICAgICBjbGVhclRpbWVvdXQgVGFuZ2VyaW5lLmxvYWRpbmdUaW1lclxuICAgICAgICBUYW5nZXJpbmUubG9hZGluZ1RpbWVyID0gbnVsbFxuXG4gICAgICAkKFwiLmxvYWRpbmdfYmFyXCIpLnJlbW92ZSgpXG5cbiAgQHNob3dMb2FkaW5nSW5kaWNhdG9yOiAtPlxuICAgICQoXCI8ZGl2IGNsYXNzPSdsb2FkaW5nX2Jhcic+PGltZyBjbGFzcz0nbG9hZGluZycgc3JjPSdpbWFnZXMvbG9hZGluZy5naWYnPjwvZGl2PlwiKS5hcHBlbmRUbyhcImJvZHlcIikubWlkZGxlQ2VudGVyKClcblxuICAjIGFza3MgZm9yIGNvbmZpcm1hdGlvbiBpbiB0aGUgYnJvd3NlciwgYW5kIHVzZXMgcGhvbmVnYXAgZm9yIGNvb2wgY29uZmlybWF0aW9uXG4gIEBjb25maXJtOiAobWVzc2FnZSwgb3B0aW9ucykgLT5cbiAgICBpZiBuYXZpZ2F0b3Iubm90aWZpY2F0aW9uPy5jb25maXJtP1xuICAgICAgbmF2aWdhdG9yLm5vdGlmaWNhdGlvbi5jb25maXJtIG1lc3NhZ2UsXG4gICAgICAgIChpbnB1dCkgLT5cbiAgICAgICAgICBpZiBpbnB1dCA9PSAxXG4gICAgICAgICAgICBvcHRpb25zLmNhbGxiYWNrIHRydWVcbiAgICAgICAgICBlbHNlIGlmIGlucHV0ID09IDJcbiAgICAgICAgICAgIG9wdGlvbnMuY2FsbGJhY2sgZmFsc2VcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBvcHRpb25zLmNhbGxiYWNrIGlucHV0XG4gICAgICAsIG9wdGlvbnMudGl0bGUsIG9wdGlvbnMuYWN0aW9uK1wiLENhbmNlbFwiXG4gICAgZWxzZVxuICAgICAgaWYgd2luZG93LmNvbmZpcm0gbWVzc2FnZVxuICAgICAgICBvcHRpb25zLmNhbGxiYWNrIHRydWVcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIGVsc2VcbiAgICAgICAgb3B0aW9ucy5jYWxsYmFjayBmYWxzZVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICByZXR1cm4gMFxuXG4gICMgdGhpcyBmdW5jdGlvbiBpcyBhIGxvdCBsaWtlIGpRdWVyeS5zZXJpYWxpemVBcnJheSwgZXhjZXB0IHRoYXQgaXQgcmV0dXJucyB1c2VmdWwgb3V0cHV0XG4gICMgd29ya3Mgb24gdGV4dGFyZWFzLCBpbnB1dCB0eXBlIHRleHQgYW5kIHBhc3N3b3JkXG4gIEBnZXRWYWx1ZXM6ICggc2VsZWN0b3IgKSAtPlxuICAgIHZhbHVlcyA9IHt9XG4gICAgJChzZWxlY3RvcikuZmluZChcImlucHV0W3R5cGU9dGV4dF0sIGlucHV0W3R5cGU9cGFzc3dvcmRdLCB0ZXh0YXJlYVwiKS5lYWNoICggaW5kZXgsIGVsZW1lbnQgKSAtPlxuICAgICAgdmFsdWVzW2VsZW1lbnQuaWRdID0gZWxlbWVudC52YWx1ZVxuICAgIHJldHVybiB2YWx1ZXNcblxuICAjIGNvbnZlcnRzIHVybCBlc2NhcGVkIGNoYXJhY3RlcnNcbiAgQGNsZWFuVVJMOiAodXJsKSAtPlxuICAgIGlmIHVybC5pbmRleE9mPyhcIiVcIikgIT0gLTFcbiAgICAgIHVybCA9IGRlY29kZVVSSUNvbXBvbmVudCB1cmxcbiAgICBlbHNlXG4gICAgICB1cmxcblxuICAjIERpc3Bvc2FibGUgYWxlcnRzXG4gIEB0b3BBbGVydDogKGFsZXJ0VGV4dCwgZGVsYXkgPSAyMDAwKSAtPlxuICAgIFV0aWxzLmFsZXJ0IFwidG9wXCIsIGFsZXJ0VGV4dCwgZGVsYXlcblxuICBAbWlkQWxlcnQ6IChhbGVydFRleHQsIGRlbGF5PTIwMDApIC0+XG4gICAgVXRpbHMuYWxlcnQgXCJtaWRkbGVcIiwgYWxlcnRUZXh0LCBkZWxheVxuXG4gIEBhbGVydDogKCB3aGVyZSwgYWxlcnRUZXh0LCBkZWxheSA9IDIwMDAgKSAtPlxuXG4gICAgc3dpdGNoIHdoZXJlXG4gICAgICB3aGVuIFwidG9wXCJcbiAgICAgICAgc2VsZWN0b3IgPSBcIi50b3BfYWxlcnRcIlxuICAgICAgICBhbGlnbmVyID0gKCAkZWwgKSAtPiByZXR1cm4gJGVsLnRvcENlbnRlcigpXG4gICAgICB3aGVuIFwibWlkZGxlXCJcbiAgICAgICAgc2VsZWN0b3IgPSBcIi5taWRfYWxlcnRcIlxuICAgICAgICBhbGlnbmVyID0gKCAkZWwgKSAtPiByZXR1cm4gJGVsLm1pZGRsZUNlbnRlcigpXG5cblxuICAgIGlmIFV0aWxzW1wiI3t3aGVyZX1BbGVydFRpbWVyXCJdP1xuICAgICAgY2xlYXJUaW1lb3V0IFV0aWxzW1wiI3t3aGVyZX1BbGVydFRpbWVyXCJdXG4gICAgICAkYWxlcnQgPSAkKHNlbGVjdG9yKVxuICAgICAgJGFsZXJ0Lmh0bWwoICRhbGVydC5odG1sKCkgKyBcIjxicj5cIiArIGFsZXJ0VGV4dCApXG4gICAgZWxzZVxuICAgICAgJGFsZXJ0ID0gJChcIjxkaXYgY2xhc3M9JyN7c2VsZWN0b3Iuc3Vic3RyaW5nKDEpfSBkaXNwb3NhYmxlX2FsZXJ0Jz4je2FsZXJ0VGV4dH08L2Rpdj5cIikuYXBwZW5kVG8oXCIjY29udGVudFwiKVxuXG4gICAgYWxpZ25lcigkYWxlcnQpXG5cbiAgICBkbyAoJGFsZXJ0LCBzZWxlY3RvciwgZGVsYXkpIC0+XG4gICAgICBjb21wdXRlZERlbGF5ID0gKChcIlwiKyRhbGVydC5odG1sKCkpLm1hdGNoKC88YnI+L2cpfHxbXSkubGVuZ3RoICogMTUwMFxuICAgICAgVXRpbHNbXCIje3doZXJlfUFsZXJ0VGltZXJcIl0gPSBzZXRUaW1lb3V0IC0+XG4gICAgICAgICAgVXRpbHNbXCIje3doZXJlfUFsZXJ0VGltZXJcIl0gPSBudWxsXG4gICAgICAgICAgJGFsZXJ0LmZhZGVPdXQoMjUwLCAtPiAkKHRoaXMpLnJlbW92ZSgpIClcbiAgICAgICwgTWF0aC5tYXgoY29tcHV0ZWREZWxheSwgZGVsYXkpXG5cblxuXG4gIEBzdGlja3k6IChodG1sLCBidXR0b25UZXh0ID0gXCJDbG9zZVwiLCBjYWxsYmFjaywgcG9zaXRpb24gPSBcIm1pZGRsZVwiKSAtPlxuICAgIGRpdiA9ICQoXCI8ZGl2IGNsYXNzPSdzdGlja3lfYWxlcnQnPiN7aHRtbH08YnI+PGJ1dHRvbiBjbGFzcz0nY29tbWFuZCBwYXJlbnRfcmVtb3ZlJz4je2J1dHRvblRleHR9PC9idXR0b24+PC9kaXY+XCIpLmFwcGVuZFRvKFwiI2NvbnRlbnRcIilcbiAgICBpZiBwb3NpdGlvbiA9PSBcIm1pZGRsZVwiXG4gICAgICBkaXYubWlkZGxlQ2VudGVyKClcbiAgICBlbHNlIGlmIHBvc2l0aW9uID09IFwidG9wXCJcbiAgICAgIGRpdi50b3BDZW50ZXIoKVxuICAgIGRpdi5vbihcImtleXVwXCIsIChldmVudCkgLT4gaWYgZXZlbnQud2hpY2ggPT0gMjcgdGhlbiAkKHRoaXMpLnJlbW92ZSgpKS5maW5kKFwiYnV0dG9uXCIpLmNsaWNrIGNhbGxiYWNrXG5cbiAgQHRvcFN0aWNreTogKGh0bWwsIGJ1dHRvblRleHQgPSBcIkNsb3NlXCIsIGNhbGxiYWNrKSAtPlxuICAgIFV0aWxzLnN0aWNreShodG1sLCBidXR0b25UZXh0LCBjYWxsYmFjaywgXCJ0b3BcIilcblxuXG5cbiAgQG1vZGFsOiAoaHRtbCkgLT5cbiAgICBpZiBodG1sID09IGZhbHNlXG4gICAgICAkKFwiI21vZGFsX2JhY2ssICNtb2RhbFwiKS5yZW1vdmUoKVxuICAgICAgcmV0dXJuXG5cbiAgICAkKFwiYm9keVwiKS5wcmVwZW5kKFwiPGRpdiBpZD0nbW9kYWxfYmFjayc+PC9kaXY+XCIpXG4gICAgJChcIjxkaXYgaWQ9J21vZGFsJz4je2h0bWx9PC9kaXY+XCIpLmFwcGVuZFRvKFwiI2NvbnRlbnRcIikubWlkZGxlQ2VudGVyKCkub24oXCJrZXl1cFwiLCAoZXZlbnQpIC0+IGlmIGV2ZW50LndoaWNoID09IDI3IHRoZW4gJChcIiNtb2RhbF9iYWNrLCAjbW9kYWxcIikucmVtb3ZlKCkpXG5cbiAgQHBhc3N3b3JkUHJvbXB0OiAoY2FsbGJhY2spIC0+XG4gICAgaHRtbCA9IFwiXG4gICAgICA8ZGl2IGlkPSdwYXNzX2Zvcm0nIHRpdGxlPSdVc2VyIHZlcmlmaWNhdGlvbic+XG4gICAgICAgIDxsYWJlbCBmb3I9J3Bhc3N3b3JkJz5QbGVhc2UgcmUtZW50ZXIgeW91ciBwYXNzd29yZDwvbGFiZWw+XG4gICAgICAgIDxpbnB1dCBpZD0ncGFzc192YWwnIHR5cGU9J3Bhc3N3b3JkJyBuYW1lPSdwYXNzd29yZCcgaWQ9J3Bhc3N3b3JkJyB2YWx1ZT0nJz5cbiAgICAgICAgPGJ1dHRvbiBjbGFzcz0nY29tbWFuZCcgZGF0YS12ZXJpZnk9J3RydWUnPlZlcmlmeTwvYnV0dG9uPlxuICAgICAgICA8YnV0dG9uIGNsYXNzPSdjb21tYW5kJz5DYW5jZWw8L2J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgIFwiXG5cbiAgICBVdGlscy5tb2RhbCBodG1sXG5cbiAgICAkcGFzcyA9ICQoXCIjcGFzc192YWxcIilcbiAgICAkYnV0dG9uID0gJChcIiNwYXNzX2Zvcm0gYnV0dG9uXCIpXG5cbiAgICAkcGFzcy5vbiBcImtleXVwXCIsIChldmVudCkgLT5cbiAgICAgIHJldHVybiB0cnVlIHVubGVzcyBldmVudC53aGljaCA9PSAxM1xuICAgICAgJGJ1dHRvbi5vZmYgXCJjbGlja1wiXG4gICAgICAkcGFzcy5vZmYgXCJjaGFuZ2VcIlxuXG4gICAgICBjYWxsYmFjayAkcGFzcy52YWwoKVxuICAgICAgVXRpbHMubW9kYWwgZmFsc2VcblxuICAgICRidXR0b24ub24gXCJjbGlja1wiLCAoZXZlbnQpIC0+XG4gICAgICAkYnV0dG9uLm9mZiBcImNsaWNrXCJcbiAgICAgICRwYXNzLm9mZiBcImNoYW5nZVwiXG5cbiAgICAgIGNhbGxiYWNrICRwYXNzLnZhbCgpIGlmICQoZXZlbnQudGFyZ2V0KS5hdHRyKFwiZGF0YS12ZXJpZnlcIikgPT0gXCJ0cnVlXCJcblxuICAgICAgVXRpbHMubW9kYWwgZmFsc2VcblxuXG5cbiAgIyByZXR1cm5zIGEgR1VJRFxuICBAZ3VpZDogLT5cbiAgIHJldHVybiBAUzQoKStAUzQoKStcIi1cIitAUzQoKStcIi1cIitAUzQoKStcIi1cIitAUzQoKStcIi1cIitAUzQoKStAUzQoKStAUzQoKVxuICBAUzQ6IC0+XG4gICByZXR1cm4gKCAoICggMSArIE1hdGgucmFuZG9tKCkgKSAqIDB4MTAwMDAgKSB8IDAgKS50b1N0cmluZygxNikuc3Vic3RyaW5nKDEpXG5cbiAgQGh1bWFuR1VJRDogLT4gcmV0dXJuIEByYW5kb21MZXR0ZXJzKDQpK1wiLVwiK0ByYW5kb21MZXR0ZXJzKDQpK1wiLVwiK0ByYW5kb21MZXR0ZXJzKDQpXG4gIEBzYWZlTGV0dGVycyA9IFwiYWJjZGVmZ2hpamxtbm9wcXJzdHV2d3h5elwiLnNwbGl0KFwiXCIpXG4gIEByYW5kb21MZXR0ZXJzOiAobGVuZ3RoKSAtPlxuICAgIHJlc3VsdCA9IFwiXCJcbiAgICB3aGlsZSBsZW5ndGgtLVxuICAgICAgcmVzdWx0ICs9IFV0aWxzLnNhZmVMZXR0ZXJzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSpVdGlscy5zYWZlTGV0dGVycy5sZW5ndGgpXVxuICAgIHJldHVybiByZXN1bHRcblxuICAjIHR1cm5zIHRoZSBib2R5IGJhY2tncm91bmQgYSBjb2xvciBhbmQgdGhlbiByZXR1cm5zIHRvIHdoaXRlXG4gIEBmbGFzaDogKGNvbG9yPVwicmVkXCIsIHNob3VsZFR1cm5JdE9uID0gbnVsbCkgLT5cblxuICAgIGlmIG5vdCBzaG91bGRUdXJuSXRPbj9cbiAgICAgIFV0aWxzLmJhY2tncm91bmQgY29sb3JcbiAgICAgIHNldFRpbWVvdXQgLT5cbiAgICAgICAgVXRpbHMuYmFja2dyb3VuZCBcIlwiXG4gICAgICAsIDEwMDBcblxuICBAYmFja2dyb3VuZDogKGNvbG9yKSAtPlxuICAgIGlmIGNvbG9yP1xuICAgICAgJChcIiNjb250ZW50X3dyYXBwZXJcIikuY3NzIFwiYmFja2dyb3VuZENvbG9yXCIgOiBjb2xvclxuICAgIGVsc2VcbiAgICAgICQoXCIjY29udGVudF93cmFwcGVyXCIpLmNzcyBcImJhY2tncm91bmRDb2xvclwiXG5cbiAgIyBSZXRyaWV2ZXMgR0VUIHZhcmlhYmxlc1xuICAjIGh0dHA6Ly9lam9obi5vcmcvYmxvZy9zZWFyY2gtYW5kLWRvbnQtcmVwbGFjZS9cbiAgQCRfR0VUOiAocSwgcykgLT5cbiAgICB2YXJzID0ge31cbiAgICBwYXJ0cyA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnJlcGxhY2UoL1s/Jl0rKFtePSZdKyk9KFteJl0qKS9naSwgKG0sa2V5LHZhbHVlKSAtPlxuICAgICAgICB2YWx1ZSA9IGlmIH52YWx1ZS5pbmRleE9mKFwiI1wiKSB0aGVuIHZhbHVlLnNwbGl0KFwiI1wiKVswXSBlbHNlIHZhbHVlXG4gICAgICAgIHZhcnNba2V5XSA9IHZhbHVlLnNwbGl0KFwiI1wiKVswXTtcbiAgICApXG4gICAgdmFyc1xuXG5cbiAgIyBub3QgY3VycmVudGx5IGltcGxlbWVudGVkIGJ1dCB3b3JraW5nXG4gIEByZXNpemVTY3JvbGxQYW5lOiAtPlxuICAgICQoXCIuc2Nyb2xsX3BhbmVcIikuaGVpZ2h0KCAkKHdpbmRvdykuaGVpZ2h0KCkgLSAoICQoXCIjbmF2aWdhdGlvblwiKS5oZWlnaHQoKSArICQoXCIjZm9vdGVyXCIpLmhlaWdodCgpICsgMTAwKSApXG5cbiAgIyBhc2tzIHVzZXIgaWYgdGhleSB3YW50IHRvIGxvZ291dFxuICBAYXNrVG9Mb2dvdXQ6IC0+IFRhbmdlcmluZS51c2VyLmxvZ291dCgpIGlmIGNvbmZpcm0oXCJXb3VsZCB5b3UgbGlrZSB0byBsb2dvdXQgbm93P1wiKVxuXG4gIEBvbGRDb25zb2xlTG9nID0gbnVsbFxuICBAZW5hYmxlQ29uc29sZUxvZzogLT4gcmV0dXJuIHVubGVzcyBvbGRDb25zb2xlTG9nPyA7IHdpbmRvdy5jb25zb2xlLmxvZyA9IG9sZENvbnNvbGVMb2dcbiAgQGRpc2FibGVDb25zb2xlTG9nOiAtPiBvbGRDb25zb2xlTG9nID0gY29uc29sZS5sb2cgOyB3aW5kb3cuY29uc29sZS5sb2cgPSAkLm5vb3BcblxuICBAb2xkQ29uc29sZUFzc2VydCA9IG51bGxcbiAgQGVuYWJsZUNvbnNvbGVBc3NlcnQ6IC0+IHJldHVybiB1bmxlc3Mgb2xkQ29uc29sZUFzc2VydD8gICAgOyB3aW5kb3cuY29uc29sZS5hc3NlcnQgPSBvbGRDb25zb2xlQXNzZXJ0XG4gIEBkaXNhYmxlQ29uc29sZUFzc2VydDogLT4gb2xkQ29uc29sZUFzc2VydCA9IGNvbnNvbGUuYXNzZXJ0IDsgd2luZG93LmNvbnNvbGUuYXNzZXJ0ID0gJC5ub29wXG5cbiMgUm9iYmVydCBpbnRlcmZhY2VcbmNsYXNzIFJvYmJlcnRcblxuXG4gIEBmZXRjaFVzZXJzOiAoZ3JvdXAsIGNhbGxiYWNrKSAtPlxuICAgIHJldHVybiBSb2JiZXJ0LnJlcVxuICAgICAgdHlwZTogJ0dFVCdcbiAgICAgIHVybDogXCIvZ3JvdXAvI3tncm91cH1cIlxuICAgICAgc3VjY2VzcyA6IGNhbGxiYWNrXG4gICAgICBlcnJvciA6IGNhbGxiYWNrXG5cbiAgQHJlcTogKG9wdGlvbnMpIC0+XG4gICAgb3B0aW9ucy51cmwgPSBUYW5nZXJpbmUuY29uZmlnLmdldChcInJvYmJlcnRcIikgKyBvcHRpb25zLnVybFxuICAgIG9wdGlvbnMuY29udGVudFR5cGUgPSAnYXBwbGljYXRpb24vanNvbidcbiAgICBvcHRpb25zLmFjY2VwdCA9ICdhcHBsaWNhdGlvbi9qc29uJ1xuICAgIG9wdGlvbnMuZGF0YVR5cGUgPSAnanNvbidcbiAgICBvcHRpb25zLmRhdGEgPSBKU09OLnN0cmluZ2lmeShvcHRpb25zLmRhdGEpXG4gICAgY29uc29sZS5sb2cob3B0aW9ucylcbiAgICByZXR1cm4gJC5hamF4KG9wdGlvbnMpXG5cbiAgQGZldGNoVXNlcjogKG9wdGlvbnMpIC0+XG4gICAgUm9iYmVydC5yZXFcbiAgICAgIHR5cGUgOiAnR0VUJ1xuICAgICAgdXJsICA6ICBcIi91c2VyL1wiICsgVGFuZ2VyaW5lLnVzZXIuZ2V0KFwibmFtZVwiKVxuICAgICAgc3VjY2VzczogKCBkYXRhICkgPT5cbiAgICAgICAgb3B0aW9ucy5zdWNjZXNzPyBkYXRhXG4gICAgICBlcnJvcjogKCBkYXRhICkgPT5cbiAgICAgICAgb3B0aW9ucy5lcnJvcj8gZGF0YVxuXG4gIEBuZXdHcm91cDogKG9wdGlvbnMpIC0+XG4gICAgUm9iYmVydC5yZXFcbiAgICAgIHR5cGUgOiAnUFVUJ1xuICAgICAgdXJsICA6ICcvZ3JvdXAnXG4gICAgICBkYXRhIDpcbiAgICAgICAgbmFtZSA6IG9wdGlvbnMubmFtZVxuICAgICAgc3VjY2VzczogKCBkYXRhICkgPT5cbiAgICAgICAgb3B0aW9ucy5zdWNjZXNzPyBkYXRhXG4gICAgICBlcnJvcjogKCBkYXRhICkgPT5cbiAgICAgICAgb3B0aW9ucy5lcnJvcj8gZGF0YVxuXG4gIEBsZWF2ZUdyb3VwOiAob3B0aW9ucykgLT5cbiAgICBSb2JiZXJ0LnJlcVxuICAgICAgdHlwZSA6ICdERUxFVEUnXG4gICAgICB1cmwgIDogXCIvZ3JvdXAvI3tvcHRpb25zLmdyb3VwfS8je29wdGlvbnMudXNlcn1cIlxuICAgICAgc3VjY2VzczogKCBkYXRhICkgPT5cbiAgICAgICAgb3B0aW9ucy5zdWNjZXNzPyBkYXRhXG4gICAgICBlcnJvcjogKCBkYXRhICkgPT5cbiAgICAgICAgb3B0aW9ucy5lcnJvcj8gZGF0YVxuXG4gIEBzaWdudXA6IChvcHRpb25zKSAtPlxuICAgIHJldHVybiBSb2JiZXJ0LnJlcVxuICAgICAgdHlwZSA6ICdQVVQnXG4gICAgICB1cmwgIDogJy91c2VyJ1xuICAgICAgZGF0YSA6XG4gICAgICAgIG5hbWUgOiBvcHRpb25zLm5hbWVcbiAgICAgICAgcGFzcyA6IG9wdGlvbnMucGFzc1xuICAgICAgc3VjY2VzczogKCBkYXRhICkgPT5cbiAgICAgICAgb3B0aW9ucy5zdWNjZXNzPyBkYXRhXG4gICAgICBlcnJvcjogKCBkYXRhICkgPT5cbiAgICAgICAgb3B0aW9ucy5lcnJvcj8gZGF0YVxuXG4gIEByb2xlUG9zdDogKHVybCwgdXNlciwgY2FsbGJhY2spIC0+XG4gICAgb3B0aW9ucyA9XG4gICAgICB0eXBlIDogJ1BPU1QnXG4gICAgICB1cmwgOiBcIi9ncm91cC8je1RhbmdlcmluZS5zZXR0aW5ncy5nZXQoXCJncm91cE5hbWVcIil9XCIgKyB1cmxcbiAgICAgIGRhdGEgOlxuICAgICAgICB1c2VyIDogdXNlclxuICAgICAgc3VjY2VzcyA6IGNhbGxiYWNrXG4gICAgICBlcnJvciA6IGNhbGxiYWNrXG4gICAgICBjb21wbGV0ZSA6IChyZXMpIC0+XG4gICAgICAgIFV0aWxzLm1pZEFsZXJ0IHJlcy5yZXNwb25zZUpTT04ubWVzc2FnZVxuXG4gICAgcmV0dXJuIFJvYmJlcnQucmVxIG9wdGlvbnNcblxuICBAYWRkQWRtaW46ICh1c2VyLCBjYWxsYmFjaykgLT4gICAgIFJvYmJlcnQucm9sZVBvc3QgXCIvYWRkLWFkbWluXCIsIHVzZXIsIGNhbGxiYWNrXG4gIEBhZGRNZW1iZXI6ICh1c2VyLCBjYWxsYmFjaykgLT4gICAgUm9iYmVydC5yb2xlUG9zdCBcIi9hZGQtbWVtYmVyXCIsIHVzZXIsIGNhbGxiYWNrXG4gIEByZW1vdmVBZG1pbjogKHVzZXIsIGNhbGxiYWNrKSAtPiAgUm9iYmVydC5yb2xlUG9zdCBcIi9yZW1vdmUtYWRtaW5cIiwgdXNlciwgY2FsbGJhY2tcbiAgQHJlbW92ZU1lbWJlcjogKHVzZXIsIGNhbGxiYWNrKSAtPiBSb2JiZXJ0LnJvbGVQb3N0IFwiL3JlbW92ZS1tZW1iZXJcIiwgdXNlciwgY2FsbGJhY2tcblxuXG4jIFRyZWUgaW50ZXJmYWNlXG5jbGFzcyBUYW5nZXJpbmVUcmVlXG4gIFxuICBAZ2VuZXJhdGVKc29uQW5kTUFrZTogLT5cblxuICAgIHVybCA9IFRhbmdlcmluZS5zZXR0aW5ncy51cmxWaWV3IFwiZ3JvdXBcIiwgXCJhc3Nlc3NtZW50c05vdEFyY2hpdmVkXCJcbiAgICBjb25zb2xlLmxvZyhcInVybDogXCIgKyB1cmwpXG5cbiAgICAkLmFqYXhcbiAgICAgIHVybDogVGFuZ2VyaW5lLnNldHRpbmdzLnVybFZpZXcgXCJncm91cFwiLCBcImFzc2Vzc21lbnRzTm90QXJjaGl2ZWRcIlxuICAgICAgZGF0YVR5cGU6IFwianNvblwiXG4gICAgICBzdWNjZXNzOiAoZGF0YSkgPT5cbiAgICAgICAgY29uc29sZS5sb2coXCJkYXRhOiBcIiArIEpTT04uc3RyaW5naWZ5KGRhdGEpKVxuIyAgICAgICAgZEtleXMgPSBfLmNvbXBhY3QoZG9jLmlkLnN1YnN0cigtNSwgNSkgZm9yIGRvYyBpbiBkYXRhLnJvd3MpLmNvbmNhdChrZXlMaXN0KS5qb2luKFwiIFwiKVxuICAgICAgICBkS2V5cyA9IGRhdGEucm93cy5tYXAoKHJvdykgPT4gcm93LmlkLnN1YnN0cigtNSkpXG4gICAgICAgIGRLZXlRdWVyeSA9XG4gICAgICAgICAga2V5czogZEtleXNcbiAgICAgICAgY29uc29sZS5sb2coXCJkS2V5UXVlcnk6XCIgKyBKU09OLnN0cmluZ2lmeShkS2V5UXVlcnkpKVxuICAgICAgICB1cmwgPSBUYW5nZXJpbmUuc2V0dGluZ3MudXJsVmlldyhcImdyb3VwXCIsIFwiYnlES2V5XCIpXG4gICAgICAgIGNvbnNvbGUubG9nKFwidXJsOiBcIiArIHVybClcbiAgICAgICAgJC5hamF4XG4gICAgICAgICAgdXJsOiBUYW5nZXJpbmUuc2V0dGluZ3MudXJsVmlldyhcImdyb3VwXCIsIFwiYnlES2V5XCIpLFxuICAgICAgICAgIHR5cGU6IFwiUE9TVFwiXG4gICAgICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiXG4gICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiXG4gICAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoZEtleVF1ZXJ5KVxuICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PlxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJkYXRhOiBcIiArIEpTT04uc3RyaW5naWZ5KGRhdGEpKVxuICAgICAgICAgICAga2V5TGlzdCA9IFtdXG4jICAgICAgICAgICAgZm9yIGRhdHVtIGluIGRhdGEucm93c1xuIyAgICAgICAgICAgICAga2V5TGlzdC5wdXNoIGRhdHVtLmtleVxuICAgICAgICAgICAga2V5TGlzdCA9IGRhdGEucm93cy5tYXAoKHJvdykgPT4gcm93LmlkKTtcbiAgICAgICAgICAgIGtleUxpc3QgPSBfLnVuaXEoa2V5TGlzdClcbiAgICAgICAgICAgIGtleUxpc3QucHVzaChcInNldHRpbmdzXCIpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJrZXlMaXN0OiBcIiArIEpTT04uc3RyaW5naWZ5KGtleUxpc3QpKTtcbiMgICAgICAgICAgICBrZXlMaXN0UXVlcnkgPSB7XG4jICAgICAgICAgICAgICBrZXlzOiBrZXlMaXN0LFxuIyAgICAgICAgICAgICAgaW5jbHVkZV9kb2NzOnRydWVcbiMgICAgICAgICAgICB9XG4gICAgICAgICAgICBUYW5nZXJpbmUuJGRiLmFsbERvY3NcbiAgICAgICAgICAgICAga2V5cyA6IGtleUxpc3RcbiAgICAgICAgICAgICAgc3VjY2VzczogKHJlc3BvbnNlKSAtPlxuICAjICAgICAgICAgICAgICBsZXQgZG9jcyA9IHJlc3BvbnNlLmJvZHkucm93cy5tYXAoIChyb3cpID0+IHJvdy5kb2MgKTtcbiAgICAgICAgICAgICAgICBkb2NzID0gW11cbiAgICAgICAgICAgICAgICBmb3Igcm93IGluIHJlc3BvbnNlLnJvd3NcbiAgICAgICAgICAgICAgICAgIGRvY3MucHVzaCByb3cuZG9jXG4gICAgICAgICAgICAgICAgYm9keSA9XG4gICAgICAgICAgICAgICAgICBkb2NzOiBkb2NzXG4gICAgICAgICAgICAgICAgcmV0dXJuIGJvZHlcbiAgICAgIGVycm9yOiAoYSwgYikgLT5cbiAgICAgICAgY29uc29sZS5sb2coXCJhOiBcIiArIGEpXG4gICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiSW1wb3J0IGVycm9yXCJcblxuICBAbWFrZTogKG9wdGlvbnMpIC0+XG5cbiAgICBVdGlscy53b3JraW5nIHRydWVcbiAgICAkLmFqYXhcbiAgICAgIHVybDogVGFuZ2VyaW5lLnNldHRpbmdzLnVybFZpZXcgXCJncm91cFwiLCBcImFzc2Vzc21lbnRzTm90QXJjaGl2ZWRcIlxuICAgICAgZGF0YVR5cGU6IFwianNvblwiXG4gICAgICBzdWNjZXNzOiAoZGF0YSkgPT5cbiAgICAgICAgZEtleXMgPSBkYXRhLnJvd3MubWFwKChyb3cpID0+IHJvdy5pZC5zdWJzdHIoLTUpKVxuICAgICAgICBkS2V5UXVlcnkgPVxuICAgICAgICAgIGtleXM6IGRLZXlzXG4gICAgICAgIHVybCA9IFRhbmdlcmluZS5zZXR0aW5ncy51cmxWaWV3KFwiZ3JvdXBcIiwgXCJieURLZXlcIilcbiAgICAgICAgJC5hamF4XG4gICAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgICAgdHlwZTogXCJHRVRcIlxuICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KGRLZXlRdWVyeSlcbiAgICAgICAgICBlcnJvcjogKGEsIGIpID0+IEB0cmlnZ2VyIFwic3RhdHVzXCIsIFwiZXhwb3J0IGpzb24gZXJyb3JcIiwgXCIje2F9ICN7Yn1cIlxuICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PlxuICAgICAgICAgICAgZG9jTGlzdCA9IFtdXG4gICAgICAgICAgICBmb3IgZGF0dW0gaW4gZGF0YS5yb3dzXG4gICAgICAgICAgICAgIGRvY0xpc3QucHVzaCBkYXR1bS5pZFxuICAgICAgICAgICAga2V5TGlzdCA9IF8udW5pcShkb2NMaXN0KVxuICAgICAgICAgICAga2V5TGlzdC5wdXNoKFwic2V0dGluZ3NcIik7XG4gICAgICAgICAgICBUYW5nZXJpbmUuJGRiLmFsbERvY3NcbiAgICAgICAgICAgICAga2V5cyA6IGtleUxpc3RcbiAgICAgICAgICAgICAgaW5jbHVkZV9kb2NzOnRydWVcbiAgICAgICAgICAgICAgc3VjY2VzczogKHJlc3BvbnNlKSAtPlxuICAgICAgICAgICAgICAgIGRvY3MgPSBbXVxuICAgICAgICAgICAgICAgIGZvciByb3cgaW4gcmVzcG9uc2Uucm93c1xuICAgICAgICAgICAgICAgICAgZG9jcy5wdXNoIHJvdy5kb2NcbiAgICAgICAgICAgICAgICBib2R5ID1cbiAgICAgICAgICAgICAgICAgIGRvY3M6IGRvY3NcbiAgICAgICAgICAgICAgICBzdWNjZXNzID0gb3B0aW9ucy5zdWNjZXNzXG4gICAgICAgICAgICAgICAgZXJyb3IgICA9IG9wdGlvbnMuZXJyb3JcblxuICAgICAgICAgICAgICAgIHBheWxvYWQgPSBKU09OLnN0cmluZ2lmeShib2R5KVxuIyAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInBheWxvYWQ6XCIgKyBKU09OLnN0cmluZ2lmeShib2R5KSlcblxuICAgICAgICAgICAgICAgIGRlbGV0ZSBvcHRpb25zLnN1Y2Nlc3NcbiAgICAgICAgICAgICAgICBkZWxldGUgb3B0aW9ucy5lcnJvclxuXG4gICAgICAgICAgICAgICAgJC5hamF4XG4gICAgICAgICAgICAgICAgICB0eXBlICAgICA6ICdQT1NUJ1xuICAgICAgICAgICAgICAgICAgY3Jvc3NEb21haW4gOiB0cnVlXG4gICAgICAgICAgICAgICAgICB1cmwgICAgICA6IFwiI3tUYW5nZXJpbmUuY29uZmlnLmdldCgndHJlZScpfS9ncm91cC0je1RhbmdlcmluZS5zZXR0aW5ncy5nZXQoJ2dyb3VwTmFtZScpfS8je1RhbmdlcmluZS5zZXR0aW5ncy5nZXQoJ2hvc3RuYW1lJyl9XCJcbiAgICAgICAgICAgICAgICAgIGRhdGFUeXBlIDogJ2pzb24nXG4gICAgICAgICAgICAgICAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCJcbiAgICAgICAgICAgICAgICAgIGRhdGEgICAgIDogcGF5bG9hZFxuICAgICAgICAgICAgICAgICAgc3VjY2VzczogKCBkYXRhICkgPT5cbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzcyBkYXRhXG4gICAgICAgICAgICAgICAgICBlcnJvcjogKCBkYXRhICkgPT5cbiAgICAgICAgICAgICAgICAgICAgZXJyb3IgZGF0YSwgSlNPTi5wYXJzZShkYXRhLnJlc3BvbnNlVGV4dClcbiAgICAgICAgICAgICAgICAgIGNvbXBsZXRlOiAtPlxuICAgICAgICAgICAgICAgICAgICBVdGlscy53b3JraW5nIGZhbHNlXG4gICAgICBlcnJvcjogKGEsIGIpIC0+XG4gICAgICAgIGNvbnNvbGUubG9nKFwiRXJyb3I6IFwiICsgYSlcbiAgICAgICAgVXRpbHMubWlkQWxlcnQgXCJJbXBvcnQgZXJyb3JcIlxuXG5cbiMjVUkgaGVscGVyc1xuJCAtPlxuICAjICMjIy5jbGVhcl9tZXNzYWdlXG4gICMgVGhpcyBsaXR0bGUgZ3V5IHdpbGwgZmFkZSBvdXQgYW5kIGNsZWFyIGhpbSBhbmQgaGlzIHBhcmVudHMuIFdyYXAgaGltIHdpc2VseS5cbiAgIyBgPHNwYW4+IG15IG1lc3NhZ2UgPGJ1dHRvbiBjbGFzcz1cImNsZWFyX21lc3NhZ2VcIj5YPC9idXR0b24+YFxuICAkKFwiI2NvbnRlbnRcIikub24oXCJjbGlja1wiLCBcIi5jbGVhcl9tZXNzYWdlXCIsICBudWxsLCAoYSkgLT4gJChhLnRhcmdldCkucGFyZW50KCkuZmFkZU91dCgyNTAsIC0+ICQodGhpcykuZW1wdHkoKS5zaG93KCkgKSApXG4gICQoXCIjY29udGVudFwiKS5vbihcImNsaWNrXCIsIFwiLnBhcmVudF9yZW1vdmVcIiwgbnVsbCwgKGEpIC0+ICQoYS50YXJnZXQpLnBhcmVudCgpLmZhZGVPdXQoMjUwLCAtPiAkKHRoaXMpLnJlbW92ZSgpICkgKVxuXG4gICMgZGlzcG9zYWJsZSBhbGVydHMgPSBhIG5vbi1mYW5jeSBib3hcbiAgJChcIiNjb250ZW50XCIpLm9uIFwiY2xpY2tcIixcIi5hbGVydF9idXR0b25cIiwgLT5cbiAgICBhbGVydF90ZXh0ID0gaWYgJCh0aGlzKS5hdHRyKFwiZGF0YS1hbGVydFwiKSB0aGVuICQodGhpcykuYXR0cihcImRhdGEtYWxlcnRcIikgZWxzZSAkKHRoaXMpLnZhbCgpXG4gICAgVXRpbHMuZGlzcG9zYWJsZUFsZXJ0IGFsZXJ0X3RleHRcbiAgJChcIiNjb250ZW50XCIpLm9uIFwiY2xpY2tcIiwgXCIuZGlzcG9zYWJsZV9hbGVydFwiLCAtPlxuICAgICQodGhpcykuc3RvcCgpLmZhZGVPdXQgMTAwLCAtPlxuICAgICAgJCh0aGlzKS5yZW1vdmUoKVxuXG4gICMgJCh3aW5kb3cpLnJlc2l6ZSBVdGlscy5yZXNpemVTY3JvbGxQYW5lXG4gICMgVXRpbHMucmVzaXplU2Nyb2xsUGFuZSgpXG4iXX0=
