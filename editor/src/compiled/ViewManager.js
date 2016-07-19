var ViewManager,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ViewManager = (function(superClass) {
  extend(ViewManager, superClass);

  function ViewManager() {
    this.show = bind(this.show, this);
    return ViewManager.__super__.constructor.apply(this, arguments);
  }

  ViewManager.prototype.show = function(view) {
    var ref;
    window.scrollTo(0, 0);
    if ((ref = this.currentView) != null) {
      ref.close();
    }
    this.currentView = view;
    this.className = this.currentView.className;
    Tangerine.log.app("show", this.className);
    this.currentView.on("rendered", (function(_this) {
      return function() {
        var base;
        Utils.working(false);
        $("#content").append(_this.currentView.el);
        _this.currentView.$el.find(".buttonset").buttonset();
        return typeof (base = _this.currentView).afterRender === "function" ? base.afterRender() : void 0;
      };
    })(this));
    this.currentView.on("subRendered", (function(_this) {
      return function() {
        return _this.currentView.$el.find(".buttonset").buttonset();
      };
    })(this));
    this.currentView.on("start_work", (function(_this) {
      return function() {
        return Utils.working(true);
      };
    })(this));
    this.currentView.on("end_work", (function(_this) {
      return function() {
        return Utils.working(false);
      };
    })(this));
    return this.currentView.render();
  };

  return ViewManager;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZpZXdNYW5hZ2VyL1ZpZXdNYW5hZ2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFNQSxJQUFBLFdBQUE7RUFBQTs7OztBQUFNOzs7Ozs7Ozt3QkFFSixJQUFBLEdBQU0sU0FBQyxJQUFEO0FBRUosUUFBQTtJQUFBLE1BQU0sQ0FBQyxRQUFQLENBQWdCLENBQWhCLEVBQW1CLENBQW5COztTQUVZLENBQUUsS0FBZCxDQUFBOztJQUNBLElBQUMsQ0FBQSxXQUFELEdBQWU7SUFFZixJQUFDLENBQUEsU0FBRCxHQUFhLElBQUMsQ0FBQSxXQUFXLENBQUM7SUFHMUIsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFkLENBQWtCLE1BQWxCLEVBQTBCLElBQUMsQ0FBQSxTQUEzQjtJQUVBLElBQUMsQ0FBQSxXQUFXLENBQUMsRUFBYixDQUFnQixVQUFoQixFQUE0QixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUE7QUFDMUIsWUFBQTtRQUFBLEtBQUssQ0FBQyxPQUFOLENBQWMsS0FBZDtRQUNBLENBQUEsQ0FBRSxVQUFGLENBQWEsQ0FBQyxNQUFkLENBQXFCLEtBQUMsQ0FBQSxXQUFXLENBQUMsRUFBbEM7UUFDQSxLQUFDLENBQUEsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFqQixDQUFzQixZQUF0QixDQUFtQyxDQUFDLFNBQXBDLENBQUE7a0ZBQ1ksQ0FBQztNQUphO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE1QjtJQU1BLElBQUMsQ0FBQSxXQUFXLENBQUMsRUFBYixDQUFnQixhQUFoQixFQUErQixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUE7ZUFDN0IsS0FBQyxDQUFBLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBakIsQ0FBc0IsWUFBdEIsQ0FBbUMsQ0FBQyxTQUFwQyxDQUFBO01BRDZCO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEvQjtJQUtBLElBQUMsQ0FBQSxXQUFXLENBQUMsRUFBYixDQUFnQixZQUFoQixFQUE4QixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUE7ZUFDNUIsS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFkO01BRDRCO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5QjtJQUdBLElBQUMsQ0FBQSxXQUFXLENBQUMsRUFBYixDQUFnQixVQUFoQixFQUE0QixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUE7ZUFDMUIsS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFkO01BRDBCO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE1QjtXQUdBLElBQUMsQ0FBQSxXQUFXLENBQUMsTUFBYixDQUFBO0VBN0JJOzs7O0dBRmtCLFFBQVEsQ0FBQyIsImZpbGUiOiJ2aWV3TWFuYWdlci9WaWV3TWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIiMgT25lIHZpZXcgdG8gcnVsZSB0aGVtIGFsbFxuIyBOb3QgbmVjZXNzYXJ5IHRvIGJlIGEgdmlldyBidXQganVzdCBpbiBjYXNlIHdlIG5lZWQgaXQgdG8gZG8gbW9yZVxuXG4jIFZpZXdNYW5hZ2VyIG5vdyBzdXBwb3J0cyBsb2FkaW5nIGJhcnMuIFRvIHRha2UgYWR2YW50YWdlIG9mIHRoaXMgZmVhdHVyZVxuIyB3aXRoaW4gYSB2aWV3IGFkZCBhIHRyaWdnZXIgZm9yIFwic3RhcnRfd29ya1wiIGFuZCBcImVuZF93b3JrXCIgYW5kIGR1cmluZ1xuIyBhbGwgdGhlIHRpbWUgaW4gYmV0d2VlbiBhIGxvYWRpbmcgYmFyIHNob3VsZCBhcHBlYXIuIFxuY2xhc3MgVmlld01hbmFnZXIgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgc2hvdzogKHZpZXcpID0+XG5cbiAgICB3aW5kb3cuc2Nyb2xsVG8gMCwgMFxuXG4gICAgQGN1cnJlbnRWaWV3Py5jbG9zZSgpXG4gICAgQGN1cnJlbnRWaWV3ID0gdmlld1xuXG4gICAgQGNsYXNzTmFtZSA9IEBjdXJyZW50Vmlldy5jbGFzc05hbWVcbiAgICAjIFN0cmluZyhAY3VycmVudFZpZXcuY29uc3RydWN0b3IpLnNwbGl0KFwiZnVuY3Rpb24gXCIpWzFdLnNwbGl0KFwiKCkge1wiKVswXVxuXG4gICAgVGFuZ2VyaW5lLmxvZy5hcHAoXCJzaG93XCIsIEBjbGFzc05hbWUpXG5cbiAgICBAY3VycmVudFZpZXcub24gXCJyZW5kZXJlZFwiLCA9PlxuICAgICAgVXRpbHMud29ya2luZyBmYWxzZVxuICAgICAgJChcIiNjb250ZW50XCIpLmFwcGVuZCBAY3VycmVudFZpZXcuZWxcbiAgICAgIEBjdXJyZW50Vmlldy4kZWwuZmluZChcIi5idXR0b25zZXRcIikuYnV0dG9uc2V0KClcbiAgICAgIEBjdXJyZW50Vmlldy5hZnRlclJlbmRlcj8oKVxuXG4gICAgQGN1cnJlbnRWaWV3Lm9uIFwic3ViUmVuZGVyZWRcIiwgPT5cbiAgICAgIEBjdXJyZW50Vmlldy4kZWwuZmluZChcIi5idXR0b25zZXRcIikuYnV0dG9uc2V0KCkgIyBidXR0b24gc2V0IGV2ZXJ5dGhpbmdcblxuICAgICMgVXRpbHMucmVzaXplU2Nyb2xsUGFuZSgpXG5cbiAgICBAY3VycmVudFZpZXcub24gXCJzdGFydF93b3JrXCIsID0+XG4gICAgICBVdGlscy53b3JraW5nIHRydWVcblxuICAgIEBjdXJyZW50Vmlldy5vbiBcImVuZF93b3JrXCIsID0+XG4gICAgICBVdGlscy53b3JraW5nIGZhbHNlXG5cbiAgICBAY3VycmVudFZpZXcucmVuZGVyKClcbiJdfQ==
