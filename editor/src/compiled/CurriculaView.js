var CurriculaView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CurriculaView = (function(superClass) {
  extend(CurriculaView, superClass);

  function CurriculaView() {
    return CurriculaView.__super__.constructor.apply(this, arguments);
  }

  CurriculaView.prototype.className = "CurriculaView";

  CurriculaView.prototype.events = {
    'click .import': 'gotoImport',
    'click .back': 'goBack'
  };

  CurriculaView.prototype.goBack = function() {
    return history.back();
  };

  CurriculaView.prototype.gotoImport = function() {
    return Tangerine.router.navigate("curriculumImport", true);
  };

  CurriculaView.prototype.initialize = function(options) {
    return this.subView = new CurriculaListView({
      curricula: options.curricula
    });
  };

  CurriculaView.prototype.render = function() {
    this.$el.html("<button class='back navigation'>" + (t('back')) + "</button><br> <button class='command import'>" + (t('import')) + "</button> <br> <div id='curricula_list'></div>");
    this.subView.setElement(this.$el.find('#curricula_list'));
    this.subView.render();
    return this.trigger("rendered");
  };

  CurriculaView.prototype.onClose = function() {
    var ref;
    return (ref = this.subView) != null ? ref.close() : void 0;
  };

  return CurriculaView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImN1cnJpY3VsdW0vQ3VycmljdWxhVmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxhQUFBO0VBQUE7OztBQUFNOzs7Ozs7OzBCQUVKLFNBQUEsR0FBWTs7MEJBRVosTUFBQSxHQUNFO0lBQUEsZUFBQSxFQUFrQixZQUFsQjtJQUNBLGFBQUEsRUFBa0IsUUFEbEI7OzswQkFHRixNQUFBLEdBQVEsU0FBQTtXQUFHLE9BQU8sQ0FBQyxJQUFSLENBQUE7RUFBSDs7MEJBRVIsVUFBQSxHQUFZLFNBQUE7V0FDVixTQUFTLENBQUMsTUFBTSxDQUFDLFFBQWpCLENBQTBCLGtCQUExQixFQUE4QyxJQUE5QztFQURVOzswQkFHWixVQUFBLEdBQVksU0FBQyxPQUFEO1dBQ1YsSUFBQyxDQUFBLE9BQUQsR0FBZSxJQUFBLGlCQUFBLENBQ2I7TUFBQSxTQUFBLEVBQVksT0FBTyxDQUFDLFNBQXBCO0tBRGE7RUFETDs7MEJBSVosTUFBQSxHQUFRLFNBQUE7SUFDTixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxrQ0FBQSxHQUN5QixDQUFDLENBQUEsQ0FBRSxNQUFGLENBQUQsQ0FEekIsR0FDb0MsK0NBRHBDLEdBRXdCLENBQUMsQ0FBQSxDQUFFLFFBQUYsQ0FBRCxDQUZ4QixHQUVxQyxnREFGL0M7SUFPQSxJQUFDLENBQUEsT0FBTyxDQUFDLFVBQVQsQ0FBb0IsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsaUJBQVYsQ0FBcEI7SUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsQ0FBQTtXQUVBLElBQUMsQ0FBQSxPQUFELENBQVMsVUFBVDtFQVhNOzswQkFhUixPQUFBLEdBQVMsU0FBQTtBQUNQLFFBQUE7NkNBQVEsQ0FBRSxLQUFWLENBQUE7RUFETzs7OztHQTlCaUIsUUFBUSxDQUFDIiwiZmlsZSI6ImN1cnJpY3VsdW0vQ3VycmljdWxhVmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEN1cnJpY3VsYVZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lIDogXCJDdXJyaWN1bGFWaWV3XCJcblxuICBldmVudHMgOlxuICAgICdjbGljayAuaW1wb3J0JyA6ICdnb3RvSW1wb3J0J1xuICAgICdjbGljayAuYmFjaycgICA6ICdnb0JhY2snXG5cbiAgZ29CYWNrOiAtPiBoaXN0b3J5LmJhY2soKVxuXG4gIGdvdG9JbXBvcnQ6IC0+XG4gICAgVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcImN1cnJpY3VsdW1JbXBvcnRcIiwgdHJ1ZVxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zICktPlxuICAgIEBzdWJWaWV3ID0gbmV3IEN1cnJpY3VsYUxpc3RWaWV3XG4gICAgICBjdXJyaWN1bGEgOiBvcHRpb25zLmN1cnJpY3VsYVxuXG4gIHJlbmRlcjogLT5cbiAgICBAJGVsLmh0bWwgXCJcbiAgICAgIDxidXR0b24gY2xhc3M9J2JhY2sgbmF2aWdhdGlvbic+I3t0KCdiYWNrJyl9PC9idXR0b24+PGJyPlxuICAgICAgPGJ1dHRvbiBjbGFzcz0nY29tbWFuZCBpbXBvcnQnPiN7dCgnaW1wb3J0Jyl9PC9idXR0b24+XG4gICAgICA8YnI+XG4gICAgICA8ZGl2IGlkPSdjdXJyaWN1bGFfbGlzdCc+PC9kaXY+XG4gICAgXCJcblxuICAgIEBzdWJWaWV3LnNldEVsZW1lbnQgQCRlbC5maW5kKCcjY3VycmljdWxhX2xpc3QnKVxuICAgIEBzdWJWaWV3LnJlbmRlcigpXG5cbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcblxuICBvbkNsb3NlOiAtPlxuICAgIEBzdWJWaWV3Py5jbG9zZSgpIl19
