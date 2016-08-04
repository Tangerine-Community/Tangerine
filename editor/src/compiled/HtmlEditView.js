var HtmlEditView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

HtmlEditView = (function(superClass) {
  extend(HtmlEditView, superClass);

  function HtmlEditView() {
    return HtmlEditView.__super__.constructor.apply(this, arguments);
  }

  HtmlEditView.prototype.className = "HtmlEditView";

  HtmlEditView.prototype.initialize = function(options) {
    this.model = options.model;
    return this.parent = options.parent;
  };

  HtmlEditView.prototype.isValid = function() {
    return true;
  };

  HtmlEditView.prototype.save = function() {
    return this.model.set({
      "html": CKEDITOR.instances.html.getData()
    });
  };

  HtmlEditView.prototype.render = function() {
    var html;
    html = this.model.get("html") || "";
    return this.$el.html("<div class='label_value'> <label for='html'>Html</label> <textarea id='html'>" + html + "</textarea> </div>");
  };

  return HtmlEditView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVsZW1lbnQvdHlwZXMvSHRtbEVkaXRWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFlBQUE7RUFBQTs7O0FBQU07Ozs7Ozs7eUJBRUosU0FBQSxHQUFZOzt5QkFFWixVQUFBLEdBQVksU0FBRSxPQUFGO0lBQ1YsSUFBQyxDQUFBLEtBQUQsR0FBUyxPQUFPLENBQUM7V0FDakIsSUFBQyxDQUFBLE1BQUQsR0FBVSxPQUFPLENBQUM7RUFGUjs7eUJBSVosT0FBQSxHQUFTLFNBQUE7V0FBRztFQUFIOzt5QkFFVCxJQUFBLEdBQU0sU0FBQTtXQUNKLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUNFO01BQUEsTUFBQSxFQUFTLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQXhCLENBQUEsQ0FBVDtLQURGO0VBREk7O3lCQUlOLE1BQUEsR0FBUSxTQUFBO0FBQ04sUUFBQTtJQUFBLElBQUEsR0FBTyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxNQUFYLENBQUEsSUFBc0I7V0FDN0IsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsK0VBQUEsR0FHZ0IsSUFIaEIsR0FHcUIsb0JBSC9CO0VBRk07Ozs7R0FkaUIsUUFBUSxDQUFDIiwiZmlsZSI6ImVsZW1lbnQvdHlwZXMvSHRtbEVkaXRWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgSHRtbEVkaXRWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZSA6IFwiSHRtbEVkaXRWaWV3XCJcblxuICBpbml0aWFsaXplOiAoIG9wdGlvbnMgKSAtPlxuICAgIEBtb2RlbCA9IG9wdGlvbnMubW9kZWxcbiAgICBAcGFyZW50ID0gb3B0aW9ucy5wYXJlbnRcblxuICBpc1ZhbGlkOiAtPiB0cnVlXG5cbiAgc2F2ZTogLT5cbiAgICBAbW9kZWwuc2V0XG4gICAgICBcImh0bWxcIiA6IENLRURJVE9SLmluc3RhbmNlcy5odG1sLmdldERhdGEoKVxuXG4gIHJlbmRlcjogLT5cbiAgICBodG1sID0gQG1vZGVsLmdldChcImh0bWxcIikgfHwgXCJcIlxuICAgIEAkZWwuaHRtbCBcIlxuICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICA8bGFiZWwgZm9yPSdodG1sJz5IdG1sPC9sYWJlbD5cbiAgICAgICAgPHRleHRhcmVhIGlkPSdodG1sJz4je2h0bWx9PC90ZXh0YXJlYT5cbiAgICAgIDwvZGl2PlxuICAgIFwiXG4iXX0=
