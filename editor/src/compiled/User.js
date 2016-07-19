var User,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

User = (function(superClass) {
  extend(User, superClass);

  function User() {
    this.fetch = bind(this.fetch, this);
    this.sessionRefresh = bind(this.sessionRefresh, this);
    this.login = bind(this.login, this);
    this.signup = bind(this.signup, this);
    return User.__super__.constructor.apply(this, arguments);
  }

  User.prototype.url = 'user';

  User.prototype.initialize = function(options) {
    this.myRoles = [];
    this.myName = null;
    return this.myPass = null;
  };


  /*
    Accessors
   */

  User.prototype.name = function() {
    return this.myName || null;
  };

  User.prototype.myPass = function() {
    return this.myPass || null;
  };

  User.prototype.roles = function() {
    return this.myRoles || null;
  };

  User.prototype.recentUsers = function() {
    return ($.cookie("recentUsers") || '').split(",");
  };

  User.prototype.signup = function(name, pass) {
    Tangerine.log.app("User-signup", name);
    return Robbert.signup({
      name: name,
      pass: pass,
      success: (function(_this) {
        return function() {
          if (_this.intent === "login") {
            _this.intent = "retry_login";
            return _this.login(name, pass);
          }
        };
      })(this),
      error: (function(_this) {
        return function(err) {
          _this.intent = null;
          return alert("Signup error\n" + err.toString());
        };
      })(this)
    });
  };

  User.prototype.groups = function() {
    return this.getArray('roles').reduce(function(result, role) {
      if (role.indexOf('admin-') !== -1) {
        result.admin.push(role.substr(6, role.length));
      } else if (role.indexOf('member-') !== -1) {
        result.member.push(role.substr(7, role.length));
      }
      return result;
    }, {
      admin: [],
      member: []
    });
  };

  User.prototype.login = function(name, pass, callbacks) {
    if (callbacks == null) {
      callbacks = {};
    }
    Tangerine.log.app("User-login-attempt", name);
    return $.couch.login({
      name: name,
      password: pass,
      success: (function(_this) {
        return function(user) {
          _this.intent = "";
          _this.myName = name;
          _this.pass = pass;
          _this.myPass = pass;
          _this.myRoles = user.roles;
          Tangerine.log.app("User-login-success", name);
          return _this.fetch({
            success: function() {
              var recentUsers;
              if (typeof callbacks.success === "function") {
                callbacks.success();
              }
              _this.trigger("login");
              recentUsers = _this.recentUsers().filter(function(a) {
                return !~a.indexOf(_this.name());
              });
              recentUsers.unshift(_this.name());
              if (recentUsers.length >= _this.RECENT_USER_MAX) {
                recentUsers.pop();
              }
              return $.cookie("recentUsers", recentUsers);
            }
          });
        };
      })(this),
      error: (function(_this) {
        return function(status, error, message) {
          if (_this.intent === "retry_login") {
            _this.intent = "";
            _this.trigger("pass-error", t("LoginView.message.error_password_incorrect"));
            return Tangerine.log.app("User-login-fail", name + " password incorrect");
          } else {
            _this.intent = "login";
            return _this.signup(name, pass);
          }
        };
      })(this)
    });
  };

  User.prototype.sessionRefresh = function(callbacks) {
    return $.couch.session({
      success: (function(_this) {
        return function(response) {
          if (response.userCtx.name != null) {
            _this.myName = response.userCtx.name;
            _this.myRoles = response.userCtx.roles;
            return _this.fetch({
              success: function() {
                _this.trigger("login");
                callbacks.success.apply(_this, arguments);
                return Tangerine.log.app("User-login", "Resumed session");
              }
            });
          } else {
            return callbacks.success.apply(_this, arguments);
          }
        };
      })(this),
      error: function() {
        return alert("Couch session error.\n\n" + (arguments.join("\n")));
      }
    });
  };

  User.prototype.verify = function(callbacks) {
    if (this.myName === null) {
      if ((callbacks != null ? callbacks.isUnregistered : void 0) != null) {
        return callbacks.isUnregistered();
      } else {
        return Tangerine.router.navigate("login", true);
      }
    } else {
      if (callbacks != null) {
        if (typeof callbacks.isAuthenticated === "function") {
          callbacks.isAuthenticated();
        }
      }
      if (this.isAdmin()) {
        return callbacks != null ? typeof callbacks.isAdmin === "function" ? callbacks.isAdmin() : void 0 : void 0;
      } else {
        return callbacks != null ? typeof callbacks.isUser === "function" ? callbacks.isUser() : void 0 : void 0;
      }
    }
  };

  User.prototype.isAdmin = function() {
    var amGroupAdmin, amServerAdmin;
    amServerAdmin = this.getArray('roles').indexOf('_admin') !== -1;
    amGroupAdmin = this.groups().admin.indexOf(Tangerine.settings.get('groupName')) !== -1;
    if (amGroupAdmin) {
      return true;
    }
    if (amServerAdmin) {
      return true;
    }
    return false;
  };

  User.prototype.logout = function() {
    return $.couch.logout({
      success: (function(_this) {
        return function() {
          $.removeCookie("AuthSession");
          _this.myName = null;
          _this.myPass = null;
          _this.pass = null;
          _this.myRoles = [];
          _this.clear();
          _this.trigger("logout");
          Tangerine.log.app("User-logout", "logout");
          return window.location = Tangerine.settings.urlIndex("trunk");
        };
      })(this)
    });
  };


  /*
    Saves to the `_users` database
    usage: either `@save("key", "value", options)` or `@save({"key":"value"}, options)`
    @override (Backbone.Model.save)
   */

  User.prototype.save = function(keyObject, valueOptions, options) {
    var attrs;
    attrs = {};
    if (_.isObject(keyObject)) {
      attrs = $.extend(attrs, keyObject);
      options = valueOptions;
    } else {
      attrs[keyObject] = value;
    }
    return $.couch.userDb((function(_this) {
      return function(db) {
        return db.saveDoc($.extend(_this.attributes, attrs), {
          success: function() {
            var ref;
            return (ref = options.success) != null ? ref.apply(_this, arguments) : void 0;
          }
        });
      };
    })(this));
  };


  /*
    Fetches user's doc from _users, loads into @attributes
   */

  User.prototype.fetch = function(callbacks) {
    if (callbacks == null) {
      callbacks = {};
    }
    return $.couch.userDb((function(_this) {
      return function(db) {
        return db.openDoc("org.couchdb.user:" + _this.myName, {
          success: function(userDoc) {
            _this.set(userDoc);
            return typeof callbacks.success === "function" ? callbacks.success(userDoc) : void 0;
          },
          error: function() {
            return typeof callbacks.error === "function" ? callbacks.error(userDoc) : void 0;
          }
        });
      };
    })(this));
  };


  /*
  
  Groups
   */

  User.prototype.joinGroup = function(name, callbacks) {
    if (callbacks == null) {
      callbacks = {};
    }
    Utils.working(true);
    return Robbert.newGroup({
      name: name,
      success: (function(_this) {
        return function(response) {
          Utils.working(false);
          Utils.midAlert(response.message);
          return _this.fetch({
            success: function() {
              if (typeof callbacks.success === "function") {
                callbacks.success(response);
              }
              return _this.trigger("groups-update");
            }
          });
        };
      })(this),
      error: (function(_this) {
        return function(response) {
          Utils.working(false);
          Utils.midAlert((response.responseJSON || {}).message || 'Error creating group');
          return typeof callbacks.error === "function" ? callbacks.error(response) : void 0;
        };
      })(this)
    });
  };

  User.prototype.leaveGroup = function(group, callbacks) {
    if (callbacks == null) {
      callbacks = {};
    }
    Utils.working(true);
    return Robbert.leaveGroup({
      user: this.get("name"),
      group: group,
      success: (function(_this) {
        return function(response) {
          return _this.fetch({
            success: function() {
              Utils.working(false);
              _this.trigger("groups-update");
              Utils.midAlert(response.message);
              return typeof callbacks.success === "function" ? callbacks.success(response) : void 0;
            }
          });
        };
      })(this),
      error: (function(_this) {
        return function(response) {
          Utils.working(false);
          Utils.midAlert("Error leaving group\n" + response.responseJSON);
          return typeof callbacks.error === "function" ? callbacks.error(response) : void 0;
        };
      })(this)
    });
  };

  User.prototype.ghostLogin = function(user, pass) {
    var location;
    Tangerine.log.db("User", "ghostLogin");
    location = encodeURIComponent(window.location.toString());
    return document.location = Tangerine.settings.location.group.url.replace(/\:\/\/.*@/, '://') + ("_ghost/" + user + "/" + pass + "/" + location);
  };

  return User;

})(Backbone.Model);

//# sourceMappingURL=data:application/json;base64,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QUEsT0FBRCxDQUFTLGVBQVQ7Y0FDQSxLQUFLLENBQUMsUUFBTixDQUFlLFFBQVEsQ0FBQyxPQUF4QjsrREFDQSxTQUFTLENBQUMsUUFBUztZQUpaLENBQVQ7V0FERjtRQURRO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUZWO01BVUEsS0FBQSxFQUFRLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxRQUFEO1VBQ04sS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFkO1VBQ0EsS0FBSyxDQUFDLFFBQU4sQ0FBZSx1QkFBQSxHQUF3QixRQUFRLENBQUMsWUFBaEQ7eURBQ0EsU0FBUyxDQUFDLE1BQU87UUFIWDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FWUjtLQURGO0VBRlU7O2lCQW1CWixVQUFBLEdBQVksU0FBQyxJQUFELEVBQU8sSUFBUDtBQUNWLFFBQUE7SUFBQSxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQWQsQ0FBaUIsTUFBakIsRUFBeUIsWUFBekI7SUFDQSxRQUFBLEdBQVcsa0JBQUEsQ0FBbUIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFoQixDQUFBLENBQW5CO1dBQ1gsUUFBUSxDQUFDLFFBQVQsR0FBb0IsU0FBUyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUF0QyxDQUE4QyxXQUE5QyxFQUEwRCxLQUExRCxDQUFBLEdBQWlFLENBQUEsU0FBQSxHQUFVLElBQVYsR0FBZSxHQUFmLEdBQWtCLElBQWxCLEdBQXVCLEdBQXZCLEdBQTBCLFFBQTFCO0VBSDNFOzs7O0dBck1LLFFBQVEsQ0FBQyIsImZpbGUiOiJ1c2VyL1VzZXIuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyIjIEV2ZW50dWFsbHkgd2UnbGwgbWFrZSBCYWNrYm9uZS5Vc2VyIGJhc2VkIG9uIHRoaXMuXG4jICQuY291Y2guc2Vzc2lvbiBuZWVkcyB0byBiZSBhc3luYzogZmFsc2VcbmNsYXNzIFVzZXIgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXG4gIHVybDogJ3VzZXInXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgQG15Um9sZXMgID0gW11cbiAgICBAbXlOYW1lID0gbnVsbFxuICAgIEBteVBhc3MgPSBudWxsXG5cbiAgIyMjXG4gICAgQWNjZXNzb3JzXG4gICMjI1xuICBuYW1lOiAgLT4gQG15TmFtZSAgfHwgbnVsbFxuICBteVBhc3M6ICAtPiBAbXlQYXNzICB8fCBudWxsXG4gIHJvbGVzOiAtPiBAbXlSb2xlcyB8fCBudWxsXG4gIHJlY2VudFVzZXJzOiAtPiAoJC5jb29raWUoXCJyZWNlbnRVc2Vyc1wiKXx8JycpLnNwbGl0KFwiLFwiKVxuXG5cbiAgc2lnbnVwOiAoIG5hbWUsIHBhc3MgKSA9PlxuICAgIFRhbmdlcmluZS5sb2cuYXBwIFwiVXNlci1zaWdudXBcIiwgbmFtZVxuICAgIFJvYmJlcnQuc2lnbnVwXG4gICAgICBuYW1lIDogbmFtZVxuICAgICAgcGFzcyA6IHBhc3NcbiAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgIGlmIEBpbnRlbnQgPT0gXCJsb2dpblwiXG4gICAgICAgICAgQGludGVudCA9IFwicmV0cnlfbG9naW5cIlxuICAgICAgICAgIEBsb2dpbiBuYW1lLCBwYXNzXG4gICAgICBlcnJvcjogKGVycikgPT5cbiAgICAgICAgQGludGVudCA9IG51bGxcbiAgICAgICAgYWxlcnQoXCJTaWdudXAgZXJyb3JcXG5cIitlcnIudG9TdHJpbmcoKSlcblxuICBncm91cHM6IC0+XG4gICAgQGdldEFycmF5KCdyb2xlcycpLnJlZHVjZSAocmVzdWx0LCByb2xlKSAtPlxuICAgICAgaWYgcm9sZS5pbmRleE9mKCdhZG1pbi0nKSAhPSAtMSAjIGlzQWRtaW5cbiAgICAgICAgcmVzdWx0LmFkbWluLnB1c2ggcm9sZS5zdWJzdHIoNiwgcm9sZS5sZW5ndGgpICMgcmVtb3ZlIGFkbWluLVxuICAgICAgZWxzZSBpZiByb2xlLmluZGV4T2YoJ21lbWJlci0nKSAhPSAtMSAjIGlzTWVtYmVyXG4gICAgICAgIHJlc3VsdC5tZW1iZXIucHVzaCByb2xlLnN1YnN0cig3LCByb2xlLmxlbmd0aCkgICMgcmVtb3ZlIG1lbWJlci1cbiAgICAgIHJldHVybiByZXN1bHRcbiAgICAsIHsgYWRtaW4gOiBbXSwgbWVtYmVyIDogW10gfVxuXG4gIGxvZ2luOiAoIG5hbWUsIHBhc3MsIGNhbGxiYWNrcyA9IHt9KSA9PlxuIyAgICBjb25zb2xlLmxvZyhcIlVzZXIubG9naW46IFwiICsgcGFzcylcbiAgICBUYW5nZXJpbmUubG9nLmFwcCBcIlVzZXItbG9naW4tYXR0ZW1wdFwiLCBuYW1lXG4gICAgJC5jb3VjaC5sb2dpblxuICAgICAgbmFtZSAgICAgOiBuYW1lXG4gICAgICBwYXNzd29yZCA6IHBhc3NcbiAgICAgIHN1Y2Nlc3M6ICggdXNlciApID0+XG4jICAgICAgICBjb25zb2xlLmxvZyhcImFzc2lnbmluZyBAbXlQYXNzOlwiICsgcGFzcylcbiAgICAgICAgQGludGVudCA9IFwiXCJcbiAgICAgICAgQG15TmFtZSA9IG5hbWVcbiAgICAgICAgQHBhc3MgPSBwYXNzXG4gICAgICAgIEBteVBhc3MgPSBwYXNzXG4gICAgICAgIEBteVJvbGVzICA9IHVzZXIucm9sZXNcbiAgICAgICAgVGFuZ2VyaW5lLmxvZy5hcHAgXCJVc2VyLWxvZ2luLXN1Y2Nlc3NcIiwgbmFtZVxuICAgICAgICBAZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiA9PlxuICAgICAgICAgICAgY2FsbGJhY2tzLnN1Y2Nlc3M/KClcbiAgICAgICAgICAgIEB0cmlnZ2VyIFwibG9naW5cIlxuICAgICAgICAgICAgcmVjZW50VXNlcnMgPSBAcmVjZW50VXNlcnMoKS5maWx0ZXIoIChhKSA9PiAhfmEuaW5kZXhPZihAbmFtZSgpKSlcbiAgICAgICAgICAgIHJlY2VudFVzZXJzLnVuc2hpZnQoQG5hbWUoKSlcbiAgICAgICAgICAgIHJlY2VudFVzZXJzLnBvcCgpIGlmIHJlY2VudFVzZXJzLmxlbmd0aCA+PSBAUkVDRU5UX1VTRVJfTUFYXG4gICAgICAgICAgICAkLmNvb2tpZShcInJlY2VudFVzZXJzXCIsIHJlY2VudFVzZXJzKVxuXG4gICAgICBlcnJvcjogKCBzdGF0dXMsIGVycm9yLCBtZXNzYWdlICkgPT5cbiAgICAgICAgaWYgQGludGVudCA9PSBcInJldHJ5X2xvZ2luXCJcbiAgICAgICAgICBAaW50ZW50ID0gXCJcIlxuICAgICAgICAgIEB0cmlnZ2VyIFwicGFzcy1lcnJvclwiLCB0KFwiTG9naW5WaWV3Lm1lc3NhZ2UuZXJyb3JfcGFzc3dvcmRfaW5jb3JyZWN0XCIpXG4gICAgICAgICAgVGFuZ2VyaW5lLmxvZy5hcHAgXCJVc2VyLWxvZ2luLWZhaWxcIiwgbmFtZSArIFwiIHBhc3N3b3JkIGluY29ycmVjdFwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAaW50ZW50ID0gXCJsb2dpblwiXG4gICAgICAgICAgQHNpZ251cCBuYW1lLCBwYXNzXG5cbiAgIyBhdHRlbXB0IHRvIHJlc3RvcmUgYSB1c2VyJ3MgbG9naW4gc3RhdGUgZnJvbSBjb3VjaCBzZXNzaW9uXG4gIHNlc3Npb25SZWZyZXNoOiAoY2FsbGJhY2tzKSA9PlxuICAgICQuY291Y2guc2Vzc2lvblxuICAgICAgc3VjY2VzczogKHJlc3BvbnNlKSA9PlxuICAgICAgICBpZiByZXNwb25zZS51c2VyQ3R4Lm5hbWU/XG4gICAgICAgICAgQG15TmFtZSAgPSByZXNwb25zZS51c2VyQ3R4Lm5hbWVcbiAgICAgICAgICBAbXlSb2xlcyA9IHJlc3BvbnNlLnVzZXJDdHgucm9sZXNcbiAgICAgICAgICBAZmV0Y2hcbiAgICAgICAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgICAgICAgIEB0cmlnZ2VyIFwibG9naW5cIlxuICAgICAgICAgICAgICBjYWxsYmFja3Muc3VjY2Vzcy5hcHBseShALCBhcmd1bWVudHMpXG4gICAgICAgICAgICAgIFRhbmdlcmluZS5sb2cuYXBwIFwiVXNlci1sb2dpblwiLCBcIlJlc3VtZWQgc2Vzc2lvblwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBjYWxsYmFja3Muc3VjY2Vzcy5hcHBseShALCBhcmd1bWVudHMpXG4gICAgICBlcnJvcjogLT5cbiAgICAgICAgYWxlcnQgXCJDb3VjaCBzZXNzaW9uIGVycm9yLlxcblxcbiN7YXJndW1lbnRzLmpvaW4oXCJcXG5cIil9XCJcblxuICAjIEBjYWxsYmFja3MgU3VwcG9ydHMgaXNBZG1pbiwgaXNVc2VyLCBpc0F1dGhlbnRpY2F0ZWQsIGlzVW5yZWdpc3RlcmVkXG4gIHZlcmlmeTogKCBjYWxsYmFja3MgKSAtPlxuICAgIGlmIEBteU5hbWUgPT0gbnVsbFxuICAgICAgaWYgY2FsbGJhY2tzPy5pc1VucmVnaXN0ZXJlZD9cbiAgICAgICAgY2FsbGJhY2tzLmlzVW5yZWdpc3RlcmVkKClcbiAgICAgIGVsc2VcbiAgICAgICAgVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcImxvZ2luXCIsIHRydWVcbiAgICBlbHNlXG4gICAgICBjYWxsYmFja3M/LmlzQXV0aGVudGljYXRlZD8oKVxuICAgICAgaWYgQGlzQWRtaW4oKVxuICAgICAgICBjYWxsYmFja3M/LmlzQWRtaW4/KClcbiAgICAgIGVsc2VcbiAgICAgICAgY2FsbGJhY2tzPy5pc1VzZXI/KClcblxuICBpc0FkbWluOiAtPlxuICAgIGFtU2VydmVyQWRtaW4gPSBAZ2V0QXJyYXkoJ3JvbGVzJykuaW5kZXhPZignX2FkbWluJykgIT0gLTFcbiAgICBhbUdyb3VwQWRtaW4gPSBAZ3JvdXBzKCkuYWRtaW4uaW5kZXhPZihUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KCdncm91cE5hbWUnKSkgIT0gLTFcbiAgICByZXR1cm4gdHJ1ZSBpZiBhbUdyb3VwQWRtaW5cbiAgICByZXR1cm4gdHJ1ZSBpZiBhbVNlcnZlckFkbWluXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgbG9nb3V0OiAtPlxuICAgICQuY291Y2gubG9nb3V0XG4gICAgICBzdWNjZXNzOiA9PlxuICAgICAgICAkLnJlbW92ZUNvb2tpZSBcIkF1dGhTZXNzaW9uXCJcbiAgICAgICAgQG15TmFtZSAgPSBudWxsXG4gICAgICAgIEBteVBhc3MgID0gbnVsbFxuICAgICAgICBAcGFzcyA9IG51bGxcbiAgICAgICAgQG15Um9sZXMgPSBbXVxuICAgICAgICBAY2xlYXIoKVxuICAgICAgICBAdHJpZ2dlciBcImxvZ291dFwiXG4gICAgICAgIFRhbmdlcmluZS5sb2cuYXBwIFwiVXNlci1sb2dvdXRcIiwgXCJsb2dvdXRcIlxuICAgICAgICB3aW5kb3cubG9jYXRpb24gPSBUYW5nZXJpbmUuc2V0dGluZ3MudXJsSW5kZXggXCJ0cnVua1wiXG5cblxuICAjIyNcbiAgICBTYXZlcyB0byB0aGUgYF91c2Vyc2AgZGF0YWJhc2VcbiAgICB1c2FnZTogZWl0aGVyIGBAc2F2ZShcImtleVwiLCBcInZhbHVlXCIsIG9wdGlvbnMpYCBvciBgQHNhdmUoe1wia2V5XCI6XCJ2YWx1ZVwifSwgb3B0aW9ucylgXG4gICAgQG92ZXJyaWRlIChCYWNrYm9uZS5Nb2RlbC5zYXZlKVxuICAjIyNcbiAgc2F2ZTogKGtleU9iamVjdCwgdmFsdWVPcHRpb25zLCBvcHRpb25zICkgLT5cbiAgICBhdHRycyA9IHt9XG4gICAgaWYgXy5pc09iamVjdCBrZXlPYmplY3RcbiAgICAgIGF0dHJzID0gJC5leHRlbmQgYXR0cnMsIGtleU9iamVjdFxuICAgICAgb3B0aW9ucyA9IHZhbHVlT3B0aW9uc1xuICAgIGVsc2VcbiAgICAgIGF0dHJzW2tleU9iamVjdF0gPSB2YWx1ZVxuICAgICMgZ2V0IHVzZXIgREJcbiAgICAkLmNvdWNoLnVzZXJEYiAoZGIpID0+XG4gICAgICBkYi5zYXZlRG9jICQuZXh0ZW5kKEBhdHRyaWJ1dGVzLCBhdHRycyksXG4gICAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgICAgb3B0aW9ucy5zdWNjZXNzPy5hcHBseShALCBhcmd1bWVudHMpXG5cbiAgIyMjXG4gICAgRmV0Y2hlcyB1c2VyJ3MgZG9jIGZyb20gX3VzZXJzLCBsb2FkcyBpbnRvIEBhdHRyaWJ1dGVzXG4gICMjI1xuICBmZXRjaDogKCBjYWxsYmFja3M9e30gKSA9PlxuICAgICQuY291Y2gudXNlckRiIChkYikgPT5cbiAgICAgIGRiLm9wZW5Eb2MgXCJvcmcuY291Y2hkYi51c2VyOiN7QG15TmFtZX1cIixcbiAgICAgICAgc3VjY2VzczogKCB1c2VyRG9jICkgPT5cbiAgICAgICAgICBAc2V0IHVzZXJEb2NcbiAgICAgICAgICBjYWxsYmFja3Muc3VjY2Vzcz8odXNlckRvYylcbiAgICAgICAgZXJyb3I6ID0+XG4gICAgICAgICAgY2FsbGJhY2tzLmVycm9yPyh1c2VyRG9jKVxuXG5cblxuICAjIyNcblxuICBHcm91cHNcblxuICAjIyNcblxuICBqb2luR3JvdXA6IChuYW1lLCBjYWxsYmFja3MgPSB7fSkgLT5cbiAgICBVdGlscy53b3JraW5nIHRydWVcbiAgICBSb2JiZXJ0Lm5ld0dyb3VwXG4gICAgICBuYW1lICA6IG5hbWVcbiAgICAgIHN1Y2Nlc3MgOiAoIHJlc3BvbnNlICkgPT5cbiAgICAgICAgVXRpbHMud29ya2luZyBmYWxzZVxuICAgICAgICBVdGlscy5taWRBbGVydCByZXNwb25zZS5tZXNzYWdlXG4gICAgICAgIEBmZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgICAgICBjYWxsYmFja3Muc3VjY2Vzcz8ocmVzcG9uc2UpXG4gICAgICAgICAgICBAdHJpZ2dlciBcImdyb3Vwcy11cGRhdGVcIlxuICAgICAgZXJyb3IgOiAocmVzcG9uc2UpID0+XG4gICAgICAgIFV0aWxzLndvcmtpbmcgZmFsc2VcbiAgICAgICAgVXRpbHMubWlkQWxlcnQgKHJlc3BvbnNlLnJlc3BvbnNlSlNPTnx8e30pLm1lc3NhZ2UgfHwgJ0Vycm9yIGNyZWF0aW5nIGdyb3VwJ1xuICAgICAgICBjYWxsYmFja3MuZXJyb3I/KHJlc3BvbnNlKVxuXG4gIGxlYXZlR3JvdXA6IChncm91cCwgY2FsbGJhY2tzID0ge30pIC0+XG4gICAgVXRpbHMud29ya2luZyB0cnVlXG4gICAgUm9iYmVydC5sZWF2ZUdyb3VwXG4gICAgICB1c2VyICAgOiBAZ2V0KFwibmFtZVwiKVxuICAgICAgZ3JvdXAgIDogZ3JvdXBcbiAgICAgIHN1Y2Nlc3MgOiAocmVzcG9uc2UpID0+XG4gICAgICAgIEBmZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgICAgICBVdGlscy53b3JraW5nIGZhbHNlXG4gICAgICAgICAgICBAdHJpZ2dlciBcImdyb3Vwcy11cGRhdGVcIlxuICAgICAgICAgICAgVXRpbHMubWlkQWxlcnQgcmVzcG9uc2UubWVzc2FnZVxuICAgICAgICAgICAgY2FsbGJhY2tzLnN1Y2Nlc3M/KHJlc3BvbnNlKVxuXG4gICAgICBlcnJvciA6IChyZXNwb25zZSkgPT5cbiAgICAgICAgVXRpbHMud29ya2luZyBmYWxzZVxuICAgICAgICBVdGlscy5taWRBbGVydCBcIkVycm9yIGxlYXZpbmcgZ3JvdXBcXG4je3Jlc3BvbnNlLnJlc3BvbnNlSlNPTn1cIlxuICAgICAgICBjYWxsYmFja3MuZXJyb3I/KHJlc3BvbnNlKVxuXG4gICMgcHJvYmFibHkgbm90IG5lZWRlZCBhbnltb3JlXG4gIGdob3N0TG9naW46ICh1c2VyLCBwYXNzKSAtPlxuICAgIFRhbmdlcmluZS5sb2cuZGIgXCJVc2VyXCIsIFwiZ2hvc3RMb2dpblwiXG4gICAgbG9jYXRpb24gPSBlbmNvZGVVUklDb21wb25lbnQod2luZG93LmxvY2F0aW9uLnRvU3RyaW5nKCkpXG4gICAgZG9jdW1lbnQubG9jYXRpb24gPSBUYW5nZXJpbmUuc2V0dGluZ3MubG9jYXRpb24uZ3JvdXAudXJsLnJlcGxhY2UoL1xcOlxcL1xcLy4qQC8sJzovLycpK1wiX2dob3N0LyN7dXNlcn0vI3twYXNzfS8je2xvY2F0aW9ufVwiXG4iXX0=
