var Settings,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Settings = (function(superClass) {
  extend(Settings, superClass);

  function Settings() {
    this.update = bind(this.update, this);
    return Settings.__super__.constructor.apply(this, arguments);
  }

  Settings.prototype.url = "settings";

  Settings.prototype.initialize = function() {
    var x;
    this.ipRange = _.uniq(((function() {
      var i, results;
      results = [];
      for (x = i = 100; i <= 200; x = ++i) {
        results.push(x);
      }
      return results;
    })()).concat((function() {
      var i, results;
      results = [];
      for (x = i = 0; i <= 255; x = ++i) {
        results.push(x);
      }
      return results;
    })()));
    this.config = Tangerine.config;
    return this.on("all", (function(_this) {
      return function() {
        return _this.update();
      };
    })(this));
  };

  Settings.prototype.update = function() {
    var designDoc, groupDDoc, groupHost, groupName, local, port, prefix, subnetBase, trunk, update, x;
    groupHost = this.get("groupHost");
    groupName = this.get("groupName");
    groupDDoc = this.get("groupDDoc");
    this.upUser = "uploader-" + groupName;
    this.upPass = this.get("upPass");
    update = this.config.get("update");
    trunk = this.config.get("trunk");
    local = this.config.get("local");
    port = this.config.get("port");
    designDoc = Tangerine.design_doc;
    prefix = this.config.get("groupDBPrefix");
    this.groupDB = "" + prefix + groupName;
    this.trunkDB = trunk.dbName;
    subnetBase = this.config.get("subnet").base;
    this.location = {
      local: {
        url: local.host + ":" + port + "/",
        db: "/" + Tangerine.db_name + "/"
      },
      trunk: {
        url: "http://" + trunk.host + "/",
        db: "http://" + trunk.host + "/" + trunk.dbName + "/"
      },
      group: {
        url: groupHost + "/",
        db: groupHost + "/db/" + prefix + groupName + "/"
      },
      update: {
        url: "http://" + update.host + "/",
        db: "http://" + update.host + "/" + update.dbName + "/",
        target: update.target
      },
      subnet: {
        url: (function() {
          var i, results;
          results = [];
          for (x = i = 0; i <= 255; x = ++i) {
            results.push("http://" + subnetBase + this.ipRange[x] + ":" + port + "/");
          }
          return results;
        }).call(this),
        db: (function() {
          var i, results;
          results = [];
          for (x = i = 0; i <= 255; x = ++i) {
            results.push("http://" + subnetBase + this.ipRange[x] + ":" + port + "/" + Tangerine.db_name + "/");
          }
          return results;
        }).call(this)
      },
      satellite: {
        url: (function() {
          var i, results;
          results = [];
          for (x = i = 0; i <= 255; x = ++i) {
            results.push("" + subnetBase + x + ":" + port + "/");
          }
          return results;
        })(),
        db: (function() {
          var i, results;
          results = [];
          for (x = i = 0; i <= 255; x = ++i) {
            results.push("" + subnetBase + x + ":" + port + "/" + prefix + groupName + "/");
          }
          return results;
        })()
      }
    };
    this.couch = {
      view: "_design/" + designDoc + "/_view/",
      show: "_design/" + designDoc + "/_show/",
      list: "_design/" + designDoc + "/_list/",
      index: "_design/" + designDoc + "/index.html"
    };
    this.spa = {
      view: "db/_design/" + designDoc + "/_view/",
      show: "db/_design/" + designDoc + "/_show/",
      list: "db/_design/" + designDoc + "/_list/",
      index: "index.html"
    };
    return this.groupCouch = {
      view: "_design/" + groupDDoc + "/_view/",
      show: "_design/" + groupDDoc + "/_show/",
      list: "_design/" + groupDDoc + "/_list/",
      index: "_design/" + groupDDoc + "/index.html"
    };
  };

  Settings.prototype.urlBulkDocs = function() {
    var bulkDocsURL;
    return bulkDocsURL = "/db/" + Tangerine.db_name + "/_bulk_docs";
  };

  Settings.prototype.urlIndex = function(groupName, hash) {
    var groupHost, port;
    if (hash == null) {
      hash = null;
    }
    groupHost = this.get("groupHost");
    port = groupName === "local" ? ":" + this.config.get("port") : "";
    hash = hash != null ? "#" + hash : "";
    if (groupName === "trunk") {
      groupName = "tangerine";
    } else {
      groupName = this.config.get("groupDBPrefix") + groupName;
    }
    return "" + groupHost + port + "/app/" + groupName + "/" + this.spa.index + hash;
  };

  Settings.prototype.urlHost = function(location) {
    return "" + this.location[location].url;
  };

  Settings.prototype.urlDB = function(location, pass) {
    var result, splitDB;
    if (pass == null) {
      pass = null;
    }
    if (location === "local") {
      result = ("" + this.location[location].db).slice(1, -1);
    } else {
      result = ("" + this.location[location].db).slice(0, -1);
    }
    splitDB = result.split("://");
    if (pass != null) {
      result = splitDB[0] + "://" + (Tangerine.user.name()) + ":" + pass + "@" + splitDB[1];
    }
    return result;
  };

  Settings.prototype.urlDDoc = function(location) {
    var dDoc;
    dDoc = Tangerine.designDoc;
    return (this.urlDB('trunk')) + "/_design/" + dDoc;
  };

  Settings.prototype.urlView = function(location, view) {
    if (location === "group") {
      return "" + this.location[location].db + this.groupCouch.view + view;
    } else {
      return "" + this.location[location].db + this.couch.view + view;
    }
  };

  Settings.prototype.urlList = function(location, list) {
    if (location === "group") {
      return "" + this.location[location].db + this.groupCouch.list + list;
    } else {
      return "" + this.location[location].db + this.couch.list + list;
    }
  };

  Settings.prototype.urlShow = function(location, show) {
    if (location === "group") {
      return "" + this.location[location].db + this.groupCouch.show + show;
    } else {
      return "" + this.location[location].db + this.couch.show + show;
    }
  };

  Settings.prototype.urlSubnet = function(ip) {
    var dbName, port;
    port = this.config.get("port");
    dbName = Tangerine.db_name;
    return "http://" + ip + ":" + port + "/" + dbName;
  };

  Settings.prototype.subnetIP = function(index) {
    var base;
    base = this.config.get("subnet").base;
    return "" + base + this.ipRange[index];
  };

  return Settings;

})(Backbone.Model);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNldHRpbmdzL1NldHRpbmdzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxJQUFBLFFBQUE7RUFBQTs7OztBQUFNOzs7Ozs7OztxQkFFSixHQUFBLEdBQU07O3FCQUVOLFVBQUEsR0FBWSxTQUFBO0FBRVYsUUFBQTtJQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsQ0FBQyxDQUFDLElBQUYsQ0FBTzs7QUFBQztXQUFXLDhCQUFYO3FCQUFBO0FBQUE7O1FBQUQsQ0FBdUIsQ0FBQyxNQUF4Qjs7QUFBZ0M7V0FBVyw0QkFBWDtxQkFBQTtBQUFBOztRQUFoQyxDQUFQO0lBQ1gsSUFBQyxDQUFBLE1BQUQsR0FBVSxTQUFTLENBQUM7V0FDcEIsSUFBQyxDQUFBLEVBQUQsQ0FBSSxLQUFKLEVBQVcsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFBO2VBQUcsS0FBQyxDQUFBLE1BQUQsQ0FBQTtNQUFIO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFYO0VBSlU7O3FCQU1aLE1BQUEsR0FBUSxTQUFBO0FBQ04sUUFBQTtJQUFBLFNBQUEsR0FBWSxJQUFDLENBQUEsR0FBRCxDQUFLLFdBQUw7SUFDWixTQUFBLEdBQVksSUFBQyxDQUFBLEdBQUQsQ0FBSyxXQUFMO0lBQ1osU0FBQSxHQUFZLElBQUMsQ0FBQSxHQUFELENBQUssV0FBTDtJQUVaLElBQUMsQ0FBQSxNQUFELEdBQVUsV0FBQSxHQUFZO0lBQ3RCLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQyxDQUFBLEdBQUQsQ0FBSyxRQUFMO0lBRVYsTUFBQSxHQUFhLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLFFBQVo7SUFFYixLQUFBLEdBQWEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQVksT0FBWjtJQUNiLEtBQUEsR0FBYSxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBWSxPQUFaO0lBQ2IsSUFBQSxHQUFhLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLE1BQVo7SUFFYixT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USxDQUFBLEtBQUE7RUFGWDs7OztHQXRJVyxRQUFRLENBQUMiLCJmaWxlIjoic2V0dGluZ3MvU2V0dGluZ3MuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyIjIGhhbmRsZXMgc2V0dGluZ3MgdGhhdCBhcmUgZ3JvdXAgc3BlY2lmaWNcbmNsYXNzIFNldHRpbmdzIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblxuICB1cmwgOiBcInNldHRpbmdzXCJcblxuICBpbml0aWFsaXplOiAtPlxuXG4gICAgQGlwUmFuZ2UgPSBfLnVuaXEoKHggZm9yIHggaW4gWzEwMC4uMjAwXSkuY29uY2F0KCh4IGZvciB4IGluIFswLi4yNTVdKSkpXG4gICAgQGNvbmZpZyA9IFRhbmdlcmluZS5jb25maWdcbiAgICBAb24gXCJhbGxcIiwgPT4gQHVwZGF0ZSgpXG5cbiAgdXBkYXRlOiA9PlxuICAgIGdyb3VwSG9zdCA9IEBnZXQgXCJncm91cEhvc3RcIlxuICAgIGdyb3VwTmFtZSA9IEBnZXQgXCJncm91cE5hbWVcIlxuICAgIGdyb3VwRERvYyA9IEBnZXQgXCJncm91cEREb2NcIlxuXG4gICAgQHVwVXNlciA9IFwidXBsb2FkZXItI3tncm91cE5hbWV9XCJcbiAgICBAdXBQYXNzID0gQGdldCBcInVwUGFzc1wiXG5cbiAgICB1cGRhdGUgICAgID0gQGNvbmZpZy5nZXQgXCJ1cGRhdGVcIlxuXG4gICAgdHJ1bmsgICAgICA9IEBjb25maWcuZ2V0IFwidHJ1bmtcIlxuICAgIGxvY2FsICAgICAgPSBAY29uZmlnLmdldCBcImxvY2FsXCJcbiAgICBwb3J0ICAgICAgID0gQGNvbmZpZy5nZXQgXCJwb3J0XCJcblxuICAgIGRlc2lnbkRvYyAgPSBUYW5nZXJpbmUuZGVzaWduX2RvY1xuXG4gICAgcHJlZml4ICAgICA9IEBjb25maWcuZ2V0IFwiZ3JvdXBEQlByZWZpeFwiXG5cbiAgICBAZ3JvdXBEQiA9IFwiI3twcmVmaXh9I3tncm91cE5hbWV9XCJcbiAgICBAdHJ1bmtEQiA9IHRydW5rLmRiTmFtZVxuXG4gICAgc3VibmV0QmFzZSA9IEBjb25maWcuZ2V0KFwic3VibmV0XCIpLmJhc2VcblxuICAgIEBsb2NhdGlvbiA9XG4gICAgICBsb2NhbDpcbiAgICAgICAgdXJsIDogXCIje2xvY2FsLmhvc3R9OiN7cG9ydH0vXCJcbiAgICAgICAgZGIgIDogXCIvI3tUYW5nZXJpbmUuZGJfbmFtZX0vXCJcbiAgICAgIHRydW5rOlxuICAgICAgICB1cmwgOiBcImh0dHA6Ly8je3RydW5rLmhvc3R9L1wiXG4gICAgICAgIGRiICA6IFwiaHR0cDovLyN7dHJ1bmsuaG9zdH0vI3t0cnVuay5kYk5hbWV9L1wiXG4gICAgICBncm91cDpcbiAgICAgICAgdXJsIDogXCIje2dyb3VwSG9zdH0vXCJcbiAgICAgICAgZGIgIDogXCIje2dyb3VwSG9zdH0vZGIvI3twcmVmaXh9I3tncm91cE5hbWV9L1wiXG4gICAgICB1cGRhdGUgOlxuICAgICAgICB1cmwgOiBcImh0dHA6Ly8je3VwZGF0ZS5ob3N0fS9cIlxuICAgICAgICBkYiAgOiBcImh0dHA6Ly8je3VwZGF0ZS5ob3N0fS8je3VwZGF0ZS5kYk5hbWV9L1wiXG4gICAgICAgIHRhcmdldCA6IHVwZGF0ZS50YXJnZXRcbiAgICAgIHN1Ym5ldCA6XG4gICAgICAgIHVybCA6IChcImh0dHA6Ly8je3N1Ym5ldEJhc2V9I3tAaXBSYW5nZVt4XX06I3twb3J0fS9cIiAgICAgICAgICAgICAgICAgICAgICBmb3IgeCBpbiBbMC4uMjU1XSlcbiAgICAgICAgZGIgIDogKFwiaHR0cDovLyN7c3VibmV0QmFzZX0je0BpcFJhbmdlW3hdfToje3BvcnR9LyN7VGFuZ2VyaW5lLmRiX25hbWV9L1wiIGZvciB4IGluIFswLi4yNTVdKVxuICAgICAgc2F0ZWxsaXRlIDpcbiAgICAgICAgdXJsIDogKFwiI3tzdWJuZXRCYXNlfSN7eH06I3twb3J0fS9cIiAgICAgICAgICAgICAgICAgICAgICAgZm9yIHggaW4gWzAuLjI1NV0pXG4gICAgICAgIGRiICA6IChcIiN7c3VibmV0QmFzZX0je3h9OiN7cG9ydH0vI3twcmVmaXh9I3tncm91cE5hbWV9L1wiIGZvciB4IGluIFswLi4yNTVdKVxuXG4gICAgQGNvdWNoID1cbiAgICAgIHZpZXcgIDogXCJfZGVzaWduLyN7ZGVzaWduRG9jfS9fdmlldy9cIlxuICAgICAgc2hvdyAgOiBcIl9kZXNpZ24vI3tkZXNpZ25Eb2N9L19zaG93L1wiXG4gICAgICBsaXN0ICA6IFwiX2Rlc2lnbi8je2Rlc2lnbkRvY30vX2xpc3QvXCJcbiAgICAgIGluZGV4IDogXCJfZGVzaWduLyN7ZGVzaWduRG9jfS9pbmRleC5odG1sXCJcblxuICAgIEBzcGEgPVxuICAgICAgdmlldyAgOiBcImRiL19kZXNpZ24vI3tkZXNpZ25Eb2N9L192aWV3L1wiXG4gICAgICBzaG93ICA6IFwiZGIvX2Rlc2lnbi8je2Rlc2lnbkRvY30vX3Nob3cvXCJcbiAgICAgIGxpc3QgIDogXCJkYi9fZGVzaWduLyN7ZGVzaWduRG9jfS9fbGlzdC9cIlxuICAgICAgaW5kZXggOiBcImluZGV4Lmh0bWxcIlxuXG4gICAgQGdyb3VwQ291Y2ggPVxuICAgICAgdmlldyAgOiBcIl9kZXNpZ24vI3tncm91cEREb2N9L192aWV3L1wiXG4gICAgICBzaG93ICA6IFwiX2Rlc2lnbi8je2dyb3VwRERvY30vX3Nob3cvXCJcbiAgICAgIGxpc3QgIDogXCJfZGVzaWduLyN7Z3JvdXBERG9jfS9fbGlzdC9cIlxuICAgICAgaW5kZXggOiBcIl9kZXNpZ24vI3tncm91cEREb2N9L2luZGV4Lmh0bWxcIlxuXG4gIHVybEJ1bGtEb2NzIDogLT5cbiAgICBidWxrRG9jc1VSTCA9IFwiL2RiL1wiICsgVGFuZ2VyaW5lLmRiX25hbWUgKyBcIi9fYnVsa19kb2NzXCJcblxuXG4gIHVybEluZGV4IDogKCBncm91cE5hbWUsIGhhc2ggPSBudWxsICkgLT5cbiAgICBncm91cEhvc3QgPSBAZ2V0IFwiZ3JvdXBIb3N0XCJcblxuICAgICMgcG9ydCBudW1iZXIgb25seSBmb3IgbG9jYWwsIGlyaXNjb3VjaCBhbHdheXMgdXNlcyA4MCwgY29uZnVzZXMgY29yc1xuICAgIHBvcnQgICA9IGlmIGdyb3VwTmFtZSA9PSBcImxvY2FsXCIgdGhlbiBcIjpcIitAY29uZmlnLmdldChcInBvcnRcIikgZWxzZSBcIlwiXG4gICAgaGFzaCAgID0gaWYgaGFzaD8gdGhlbiBcIiMje2hhc2h9XCIgZWxzZSBcIlwiXG5cbiAgICBpZiBncm91cE5hbWUgPT0gXCJ0cnVua1wiXG4gICAgICBncm91cE5hbWUgPSBcInRhbmdlcmluZVwiXG4gICAgZWxzZVxuICAgICAgZ3JvdXBOYW1lID0gQGNvbmZpZy5nZXQoXCJncm91cERCUHJlZml4XCIpICsgZ3JvdXBOYW1lXG5cbiAgICByZXR1cm4gXCIje2dyb3VwSG9zdH0je3BvcnR9L2FwcC8je2dyb3VwTmFtZX0vI3tAc3BhLmluZGV4fSN7aGFzaH1cIlxuXG4gIHVybEhvc3QgIDogKCBsb2NhdGlvbiApIC0+IFwiI3tAbG9jYXRpb25bbG9jYXRpb25dLnVybH1cIlxuXG4gIHVybERCICAgIDogKCBsb2NhdGlvbiwgcGFzcyA9IG51bGwgKSAtPlxuICAgIGlmIGxvY2F0aW9uID09IFwibG9jYWxcIlxuICAgICAgcmVzdWx0ID0gXCIje0Bsb2NhdGlvbltsb2NhdGlvbl0uZGJ9XCIuc2xpY2UoMSwtMSlcbiAgICBlbHNlXG4gICAgICByZXN1bHQgPSBcIiN7QGxvY2F0aW9uW2xvY2F0aW9uXS5kYn1cIi5zbGljZSgwLCAtMSlcblxuICAgIHNwbGl0REIgPSByZXN1bHQuc3BsaXQoXCI6Ly9cIilcblxuICAgIGlmIHBhc3M/XG4gICAgICByZXN1bHQgPSBcIiN7c3BsaXREQlswXX06Ly8je1RhbmdlcmluZS51c2VyLm5hbWUoKX06I3twYXNzfUAje3NwbGl0REJbMV19XCJcblxuICAgIHJldHVybiByZXN1bHRcblxuICB1cmxERG9jIDogKCBsb2NhdGlvbiApIC0+XG4gICAgZERvYyA9IFRhbmdlcmluZS5kZXNpZ25Eb2NcbiAgICByZXR1cm4gXCIje0B1cmxEQigndHJ1bmsnKX0vX2Rlc2lnbi8je2REb2N9XCJcblxuICB1cmxWaWV3ICA6ICggbG9jYXRpb24sIHZpZXcgKSAtPlxuICAgIGlmIGxvY2F0aW9uID09IFwiZ3JvdXBcIlxuICAgICAgXCIje0Bsb2NhdGlvbltsb2NhdGlvbl0uZGJ9I3tAZ3JvdXBDb3VjaC52aWV3fSN7dmlld31cIlxuICAgIGVsc2VcbiAgICAgIFwiI3tAbG9jYXRpb25bbG9jYXRpb25dLmRifSN7QGNvdWNoLnZpZXd9I3t2aWV3fVwiXG5cbiAgdXJsTGlzdCAgOiAoIGxvY2F0aW9uLCBsaXN0ICkgLT5cbiAgICBpZiBsb2NhdGlvbiA9PSBcImdyb3VwXCJcbiAgICAgIFwiI3tAbG9jYXRpb25bbG9jYXRpb25dLmRifSN7QGdyb3VwQ291Y2gubGlzdH0je2xpc3R9XCJcbiAgICBlbHNlXG4gICAgICBcIiN7QGxvY2F0aW9uW2xvY2F0aW9uXS5kYn0je0Bjb3VjaC5saXN0fSN7bGlzdH1cIlxuXG4gIHVybFNob3cgIDogKCBsb2NhdGlvbiwgc2hvdyApIC0+XG4gICAgaWYgbG9jYXRpb24gPT0gXCJncm91cFwiXG4gICAgICBcIiN7QGxvY2F0aW9uW2xvY2F0aW9uXS5kYn0je0Bncm91cENvdWNoLnNob3d9I3tzaG93fVwiXG4gICAgZWxzZVxuICAgICAgXCIje0Bsb2NhdGlvbltsb2NhdGlvbl0uZGJ9I3tAY291Y2guc2hvd30je3Nob3d9XCJcblxuICAjIHRoZXNlIHR3byBhcmUgYSBsaXR0bGUgd2VpcmQuIEkgZmVlbCBsaWtlIHN1Ym5ldEFkZHJlc3Mgc2hvdWxkIGJlIGEgY2xhc3Mgd2l0aCBwcm9wZXJ0aWVzIElQLCBVUkwgYW5kIGluZGV4XG4gIHVybFN1Ym5ldDogKCBpcCApIC0+XG4gICAgcG9ydCAgID0gQGNvbmZpZy5nZXQgXCJwb3J0XCJcbiAgICBkYk5hbWUgPSBUYW5nZXJpbmUuZGJfbmFtZVxuXG4gICAgXCJodHRwOi8vI3tpcH06I3twb3J0fS8je2RiTmFtZX1cIlxuXG4gIHN1Ym5ldElQOiAoIGluZGV4ICkgLT5cbiAgICBiYXNlID0gQGNvbmZpZy5nZXQoXCJzdWJuZXRcIikuYmFzZVxuICAgIFwiI3tiYXNlfSN7QGlwUmFuZ2VbaW5kZXhdfVwiXG5cblxuXG5cblxuIl19
