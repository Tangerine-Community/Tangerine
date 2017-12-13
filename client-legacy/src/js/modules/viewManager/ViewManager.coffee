`
/*

 One view to rule them all
 Not necessary to be a view but just in case we need it to do more

*/

var ViewManager = function() {
        
  this.currentView = {};

};

ViewManager.prototype = {

  templates: {
    container: function(name) {
      return "<div class='" + name + "'></div>";
    }
  },


  // displays a view and removes the previous if it exists
  show: function( view ) {

    // scroll window to top of screen
    window.scrollTo(0, 0);

    // close view if exists
    if (typeof this.currentView.close === "function") {
      this.currentView.close()
    }

    // save new view to member variable
    this.currentView = view;
    this.className = view.className;

    // make a container
    var $container = $(this.templates.container(this.className)).appendTo("#content");
    this.currentView.setElement($container);

    // render view to container
    this.currentView.render()

    // call afterRender function if exists
    if (typeof this.currentView.afterRender === "function") {
      this.currentView.afterRender()
    }

  } // END of show

};

`