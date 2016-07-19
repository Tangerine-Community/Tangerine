var NavigationView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

NavigationView = (function(superClass) {
  extend(NavigationView, superClass);

  function NavigationView() {
    this.handleMenu = bind(this.handleMenu, this);
    this.initialize = bind(this.initialize, this);
    this.userMenuOut = bind(this.userMenuOut, this);
    this.userMenuIn = bind(this.userMenuIn, this);
    return NavigationView.__super__.constructor.apply(this, arguments);
  }

  NavigationView.prototype.el = '#navigation';

  NavigationView.prototype.events = Modernizr.touch ? {
    'click #logout': 'logout',
    'click #navigation-logo': 'logoClick',
    'click #username': 'gotoAccount'
  } : {
    'click #logout': 'logout',
    'click #navigation-logo': 'logoClick',
    'click #username': 'gotoAccount'
  };

  NavigationView.prototype.refreshDropDownPosition = function() {
    var $ul, userPosistion;
    userPosistion = this.$el.find("#username-container").position();
    $ul = this.$el.find("#username-dropdown");
    return $ul.css({
      left: Math.min(userPosistion.left, $(window).width() - $ul.width())
    });
  };

  NavigationView.prototype.userMenuIn = function() {
    this.refreshDropDownPosition();
    return this.$el.find("#username-dropdown").show();
  };

  NavigationView.prototype.userMenuOut = function() {
    this.refreshDropDownPosition();
    return this.$el.find("#username-dropdown").hide();
  };

  NavigationView.prototype.gotoAccount = function() {
    if (this.user.isAdmin()) {
      return Tangerine.router.navigate("account", true);
    }
  };

  NavigationView.prototype.logoClick = function() {
    if (this.user.isAdmin()) {
      Tangerine.activity = "";
      return this.router.landing(true);
    } else {
      if (Tangerine.activity === "assessment run") {
        if (confirm(this.text.incomplete_main)) {
          return this.router.landing(true);
        }
      } else {
        return this.router.landing(true);
      }
    }
  };

  NavigationView.prototype.logout = function() {
    if (this.user.isAdmin()) {
      Tangerine.activity = "";
      return Tangerine.user.logout();
    } else {
      if (Tangerine.activity === "assessment run") {
        if (confirm(this.text.incomplete_logout)) {
          Tangerine.activity = "";
          return Tangerine.user.logout();
        }
      } else {
        if (confirm(this.text.confirm_logout)) {
          Tangerine.activity = "";
          return Tangerine.user.logout();
        }
      }
    }
  };

  NavigationView.prototype.onClose = function() {};

  NavigationView.prototype.initialize = function(options) {
    this.$el.addClass("NavigationView");
    this.i18n();
    this.render();
    this.user = options.user;
    this.router = options.router;
    this.whoAmI = this.text.user;
    this.router.on('all', this.handleMenu);
    return this.user.on('login logout', this.handleMenu);
  };

  NavigationView.prototype.i18n = function() {
    return this.text = {
      "logout": t('NavigationView.button.logout'),
      "account_button": t('NavigationView.button.account'),
      "settings_button": t('NavigationView.button.settings'),
      "user": t('NavigationView.label.user'),
      "teacher": t('NavigationView.label.teacher'),
      "enumerator": t('NavigationView.label.enumerator'),
      "student_id": t('NavigationView.label.student_id'),
      "version": t('NavigationView.label.version'),
      "account": t('NavigationView.help.account'),
      "logo": t('NavigationView.help.logo'),
      "incomplete_logout": t("NavigationView.message.incomplete_logout"),
      "confirm_logout": t("NavigationView.message.logout_confirm"),
      "incomplete_main": t("NavigationView.message.incomplete_main_screen")
    };
  };

  NavigationView.prototype.render = function() {
    var ref;
    this.$el.html("<img id='navigation-logo' src='images/navigation-logo.png' title='" + this.text.logo + "'> <ul> <li id='student-container' class='hidden'> <label>" + this.text.student_id + "</label> <div id='student-id'></div> </li> <li id='username-container'> <label title='" + this.text.account + "'>" + this.whoAmI + "</label> <div id='username'>" + (Tangerine.user.name() || "") + "</div> <ul id='username-dropdown'> <li><a href='#account'>" + this.text.account_button + "</a></li> <li><a href='#settings'>" + this.text.settings_button + "</a></li> </ul> </li> <li id='logout'>" + this.text.logout + "</li> </ul>");
    if ((ref = this.user) != null ? typeof ref.isAdmin === "function" ? ref.isAdmin() : void 0 : void 0) {
      this.$el.find("#username-container").hover(this.userMenuIn, this.userMenuOut);
    }
    $(document).ajaxStart(function() {
      if ($("#navigation-logo").attr("src") !== "images/navigation-logo-spin.gif") {
        return $("#navigation-logo").attr("src", "images/navigation-logo-spin.gif");
      }
    });
    return $(document).ajaxStop(function() {
      if ($("#navigation-logo").attr("src") !== "images/navigation-logo.png") {
        return $("#navigation-logo").attr("src", "images/navigation-logo.png");
      }
    });
  };

  NavigationView.prototype.setStudent = function(id) {
    if (id === "") {
      this.$el.find("#student-container").addClass("hidden");
      return this.$el.find('#student-id').html("");
    } else {
      this.$el.find("#student-container").removeClass("hidden");
      return this.$el.find('#student-id').html(id);
    }
  };

  NavigationView.prototype.handleMenu = function(event) {
    $("#username_label").html(this.whoAmI);
    $('#username').html(this.user.name());
    if (~window.location.toString().indexOf("name=")) {
      this.$el.find("#logout_link").hide();
    } else {
      this.$el.find("#logout_link").show();
    }
    return this.user.verify({
      isAuthenticated: (function(_this) {
        return function() {
          _this.render();
          return $('#navigation').fadeIn(250);
        };
      })(this),
      isUnregistered: (function(_this) {
        return function() {
          _this.render();
          return $('#navigation').fadeOut(250);
        };
      })(this)
    });
  };

  return NavigationView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5hdmlnYXRpb24vTmF2aWdhdGlvblZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsY0FBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7Ozs7OzJCQUVKLEVBQUEsR0FBSzs7MkJBRUwsTUFBQSxHQUFXLFNBQVMsQ0FBQyxLQUFiLEdBQXdCO0lBQzlCLGVBQUEsRUFBbUIsUUFEVztJQUU5Qix3QkFBQSxFQUFnQyxXQUZGO0lBRzlCLGlCQUFBLEVBQTBCLGFBSEk7R0FBeEIsR0FJRDtJQUNMLGVBQUEsRUFBb0IsUUFEZjtJQUVMLHdCQUFBLEVBQWdDLFdBRjNCO0lBR0wsaUJBQUEsRUFBMEIsYUFIckI7OzsyQkFNUCx1QkFBQSxHQUF5QixTQUFBO0FBQ3ZCLFFBQUE7SUFBQSxhQUFBLEdBQWdCLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLHFCQUFWLENBQWdDLENBQUMsUUFBakMsQ0FBQTtJQUNoQixHQUFBLEdBQU0sSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsb0JBQVY7V0FDTixHQUFHLENBQUMsR0FBSixDQUNFO01BQUEsSUFBQSxFQUFPLElBQUksQ0FBQyxHQUFMLENBQVMsYUFBYSxDQUFDLElBQXZCLEVBQTZCLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxLQUFWLENBQUEsQ0FBQSxHQUFvQixHQUFHLENBQUMsS0FBSixDQUFBLENBQWpELENBQVA7S0FERjtFQUh1Qjs7MkJBTXpCLFVBQUEsR0FBWSxTQUFBO0lBQUksSUFBQyxDQUFBLHVCQUFELENBQUE7V0FBNEIsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsb0JBQVYsQ0FBK0IsQ0FBQyxJQUFoQyxDQUFBO0VBQWhDOzsyQkFFWixXQUFBLEdBQWEsU0FBQTtJQUFHLElBQUMsQ0FBQSx1QkFBRCxDQUFBO1dBQTRCLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLG9CQUFWLENBQStCLENBQUMsSUFBaEMsQ0FBQTtFQUEvQjs7MkJBRWIsV0FB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Y0FBVixDQUF5QixDQUFDLElBQTFCLENBQUEsRUFBNUY7O1dBRUEsSUFBQyxDQUFBLElBQUksQ0FBQyxNQUFOLENBQ0U7TUFBQSxlQUFBLEVBQWlCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUNmLEtBQUMsQ0FBQSxNQUFELENBQUE7aUJBQ0EsQ0FBQSxDQUFHLGFBQUgsQ0FBa0IsQ0FBQyxNQUFuQixDQUEwQixHQUExQjtRQUZlO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQjtNQUdBLGNBQUEsRUFBZ0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ2QsS0FBQyxDQUFBLE1BQUQsQ0FBQTtpQkFDQSxDQUFBLENBQUcsYUFBSCxDQUFrQixDQUFDLE9BQW5CLENBQTJCLEdBQTNCO1FBRmM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBSGhCO0tBREY7RUFUVTs7OztHQXBKZSxRQUFRLENBQUMiLCJmaWxlIjoibmF2aWdhdGlvbi9OYXZpZ2F0aW9uVmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIE5hdmlnYXRpb25WaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGVsIDogJyNuYXZpZ2F0aW9uJ1xuXG4gIGV2ZW50czogaWYgTW9kZXJuaXpyLnRvdWNoIHRoZW4ge1xuICAgICdjbGljayAjbG9nb3V0JyAgOiAnbG9nb3V0J1xuICAgICdjbGljayAjbmF2aWdhdGlvbi1sb2dvJyAgICAgIDogJ2xvZ29DbGljaydcbiAgICAnY2xpY2sgI3VzZXJuYW1lJyAgICAgICA6ICdnb3RvQWNjb3VudCdcbiAgfSBlbHNlIHtcbiAgICAnY2xpY2sgI2xvZ291dCcgICA6ICdsb2dvdXQnXG4gICAgJ2NsaWNrICNuYXZpZ2F0aW9uLWxvZ28nICAgICAgOiAnbG9nb0NsaWNrJ1xuICAgICdjbGljayAjdXNlcm5hbWUnICAgICAgIDogJ2dvdG9BY2NvdW50J1xuICB9XG5cbiAgcmVmcmVzaERyb3BEb3duUG9zaXRpb246IC0+XG4gICAgdXNlclBvc2lzdGlvbiA9IEAkZWwuZmluZChcIiN1c2VybmFtZS1jb250YWluZXJcIikucG9zaXRpb24oKVxuICAgICR1bCA9IEAkZWwuZmluZChcIiN1c2VybmFtZS1kcm9wZG93blwiKVxuICAgICR1bC5jc3NcbiAgICAgIGxlZnQgOiBNYXRoLm1pbih1c2VyUG9zaXN0aW9uLmxlZnQsICQod2luZG93KS53aWR0aCgpIC0gJHVsLndpZHRoKCkpXG5cbiAgdXNlck1lbnVJbjogPT4gIEByZWZyZXNoRHJvcERvd25Qb3NpdGlvbigpOyBAJGVsLmZpbmQoXCIjdXNlcm5hbWUtZHJvcGRvd25cIikuc2hvdygpXG5cbiAgdXNlck1lbnVPdXQ6ID0+IEByZWZyZXNoRHJvcERvd25Qb3NpdGlvbigpOyBAJGVsLmZpbmQoXCIjdXNlcm5hbWUtZHJvcGRvd25cIikuaGlkZSgpXG5cbiAgZ290b0FjY291bnQ6IC0+XG4gICAgaWYgQHVzZXIuaXNBZG1pbigpXG4gICAgICBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwiYWNjb3VudFwiLCB0cnVlXG5cbiAgbG9nb0NsaWNrOiAtPlxuICAgIGlmIEB1c2VyLmlzQWRtaW4oKVxuICAgICAgVGFuZ2VyaW5lLmFjdGl2aXR5ID0gXCJcIlxuICAgICAgQHJvdXRlci5sYW5kaW5nKHRydWUpXG4gICAgZWxzZVxuICAgICAgaWYgVGFuZ2VyaW5lLmFjdGl2aXR5ID09IFwiYXNzZXNzbWVudCBydW5cIlxuICAgICAgICBpZiBjb25maXJtIEB0ZXh0LmluY29tcGxldGVfbWFpblxuICAgICAgICAgIEByb3V0ZXIubGFuZGluZyh0cnVlKVxuICAgICAgZWxzZVxuICAgICAgICAgIEByb3V0ZXIubGFuZGluZyh0cnVlKVxuXG4gIGxvZ291dDogLT5cbiAgICBpZiBAdXNlci5pc0FkbWluKClcbiAgICAgIFRhbmdlcmluZS5hY3Rpdml0eSA9IFwiXCJcbiAgICAgIFRhbmdlcmluZS51c2VyLmxvZ291dCgpXG4gICAgZWxzZVxuICAgICAgaWYgVGFuZ2VyaW5lLmFjdGl2aXR5ID09IFwiYXNzZXNzbWVudCBydW5cIlxuICAgICAgICBpZiBjb25maXJtIEB0ZXh0LmluY29tcGxldGVfbG9nb3V0XG4gICAgICAgICAgVGFuZ2VyaW5lLmFjdGl2aXR5ID0gXCJcIlxuICAgICAgICAgIFRhbmdlcmluZS51c2VyLmxvZ291dCgpXG4gICAgICBlbHNlXG4gICAgICAgIGlmIGNvbmZpcm0gQHRleHQuY29uZmlybV9sb2dvdXRcbiAgICAgICAgICBUYW5nZXJpbmUuYWN0aXZpdHkgPSBcIlwiXG4gICAgICAgICAgVGFuZ2VyaW5lLnVzZXIubG9nb3V0KClcblxuICBvbkNsb3NlOiAtPiAjIGRvIG5vdGhpbmdcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgPT5cblxuICAgIEAkZWwuYWRkQ2xhc3MgXCJOYXZpZ2F0aW9uVmlld1wiXG5cbiAgICBAaTE4bigpXG4gICAgQHJlbmRlcigpXG5cbiAgICBAdXNlciAgID0gb3B0aW9ucy51c2VyXG4gICAgQHJvdXRlciA9IG9wdGlvbnMucm91dGVyXG5cbiAgICBAd2hvQW1JID0gQHRleHQudXNlclxuXG4gICAgQHJvdXRlci5vbiAnYWxsJywgQGhhbmRsZU1lbnVcbiAgICBAdXNlci5vbiAgICdsb2dpbiBsb2dvdXQnLCBAaGFuZGxlTWVudVxuXG4gIGkxOG46IC0+XG5cbiAgICBAdGV4dCA9XG5cbiAgICAgIFwibG9nb3V0XCIgICAgICAgICAgICA6IHQoJ05hdmlnYXRpb25WaWV3LmJ1dHRvbi5sb2dvdXQnKVxuXG4gICAgICBcImFjY291bnRfYnV0dG9uXCIgICAgOiB0KCdOYXZpZ2F0aW9uVmlldy5idXR0b24uYWNjb3VudCcpXG4gICAgICBcInNldHRpbmdzX2J1dHRvblwiICAgOiB0KCdOYXZpZ2F0aW9uVmlldy5idXR0b24uc2V0dGluZ3MnKVxuXG4gICAgICBcInVzZXJcIiAgICAgICAgICAgICAgOiB0KCdOYXZpZ2F0aW9uVmlldy5sYWJlbC51c2VyJylcbiAgICAgIFwidGVhY2hlclwiICAgICAgICAgICA6IHQoJ05hdmlnYXRpb25WaWV3LmxhYmVsLnRlYWNoZXInKVxuICAgICAgXCJlbnVtZXJhdG9yXCIgICAgICAgIDogdCgnTmF2aWdhdGlvblZpZXcubGFiZWwuZW51bWVyYXRvcicpXG4gICAgICBcInN0dWRlbnRfaWRcIiAgICAgICAgOiB0KCdOYXZpZ2F0aW9uVmlldy5sYWJlbC5zdHVkZW50X2lkJylcbiAgICAgIFwidmVyc2lvblwiICAgICAgICAgICA6IHQoJ05hdmlnYXRpb25WaWV3LmxhYmVsLnZlcnNpb24nKVxuXG4gICAgICBcImFjY291bnRcIiAgICAgICAgICAgOiB0KCdOYXZpZ2F0aW9uVmlldy5oZWxwLmFjY291bnQnKVxuICAgICAgXCJsb2dvXCIgICAgICAgICAgICAgIDogdCgnTmF2aWdhdGlvblZpZXcuaGVscC5sb2dvJylcblxuICAgICAgXCJpbmNvbXBsZXRlX2xvZ291dFwiIDogdChcIk5hdmlnYXRpb25WaWV3Lm1lc3NhZ2UuaW5jb21wbGV0ZV9sb2dvdXRcIilcbiAgICAgIFwiY29uZmlybV9sb2dvdXRcIiAgICA6IHQoXCJOYXZpZ2F0aW9uVmlldy5tZXNzYWdlLmxvZ291dF9jb25maXJtXCIpXG4gICAgICBcImluY29tcGxldGVfbWFpblwiICAgOiB0KFwiTmF2aWdhdGlvblZpZXcubWVzc2FnZS5pbmNvbXBsZXRlX21haW5fc2NyZWVuXCIpXG5cbiAgcmVuZGVyOiAtPlxuXG4gICAgQCRlbC5odG1sIFwiXG5cbiAgICAgIDxpbWcgaWQ9J25hdmlnYXRpb24tbG9nbycgc3JjPSdpbWFnZXMvbmF2aWdhdGlvbi1sb2dvLnBuZycgdGl0bGU9JyN7QHRleHQubG9nb30nPlxuXG4gICAgICA8dWw+XG5cbiAgICAgICAgPGxpIGlkPSdzdHVkZW50LWNvbnRhaW5lcicgY2xhc3M9J2hpZGRlbic+XG5cbiAgICAgICAgICA8bGFiZWw+I3tAdGV4dC5zdHVkZW50X2lkfTwvbGFiZWw+XG4gICAgICAgICAgPGRpdiBpZD0nc3R1ZGVudC1pZCc+PC9kaXY+XG5cbiAgICAgICAgPC9saT5cblxuICAgICAgICA8bGkgaWQ9J3VzZXJuYW1lLWNvbnRhaW5lcic+XG5cbiAgICAgICAgICA8bGFiZWwgdGl0bGU9JyN7QHRleHQuYWNjb3VudH0nPiN7QHdob0FtSX08L2xhYmVsPlxuICAgICAgICAgIDxkaXYgaWQ9J3VzZXJuYW1lJz4je1RhbmdlcmluZS51c2VyLm5hbWUoKSB8fCBcIlwifTwvZGl2PlxuXG4gICAgICAgICAgPHVsIGlkPSd1c2VybmFtZS1kcm9wZG93bic+XG4gICAgICAgICAgICA8bGk+PGEgaHJlZj0nI2FjY291bnQnPiN7QHRleHQuYWNjb3VudF9idXR0b259PC9hPjwvbGk+XG4gICAgICAgICAgICA8bGk+PGEgaHJlZj0nI3NldHRpbmdzJz4je0B0ZXh0LnNldHRpbmdzX2J1dHRvbn08L2E+PC9saT5cbiAgICAgICAgICA8L3VsPlxuXG4gICAgICAgIDwvbGk+XG5cbiAgICAgICAgPGxpIGlkPSdsb2dvdXQnPiN7QHRleHQubG9nb3V0fTwvbGk+XG5cbiAgICAgIDwvdWw+XG5cbiAgICBcIlxuXG4gICAgIyBzZXQgdXAgdXNlciBtZW51XG4gICAgaWYgQHVzZXI/LmlzQWRtaW4/KClcbiAgICAgIEAkZWwuZmluZChcIiN1c2VybmFtZS1jb250YWluZXJcIikuaG92ZXIgQHVzZXJNZW51SW4sIEB1c2VyTWVudU91dFxuXG4gICAgIyBTcGluIHRoZSBsb2dvIG9uIGFqYXggY2FsbHNcbiAgICAkKGRvY3VtZW50KS5hamF4U3RhcnQgLT5cbiAgICAgIGlmICQoXCIjbmF2aWdhdGlvbi1sb2dvXCIpLmF0dHIoXCJzcmNcIikgaXNudCBcImltYWdlcy9uYXZpZ2F0aW9uLWxvZ28tc3Bpbi5naWZcIlxuICAgICAgICAkKFwiI25hdmlnYXRpb24tbG9nb1wiKS5hdHRyIFwic3JjXCIsIFwiaW1hZ2VzL25hdmlnYXRpb24tbG9nby1zcGluLmdpZlwiXG4gICAgJChkb2N1bWVudCkuYWpheFN0b3AgLT5cbiAgICAgIGlmICQoXCIjbmF2aWdhdGlvbi1sb2dvXCIpLmF0dHIoXCJzcmNcIikgaXNudCBcImltYWdlcy9uYXZpZ2F0aW9uLWxvZ28ucG5nXCJcbiAgICAgICAgJChcIiNuYXZpZ2F0aW9uLWxvZ29cIikuYXR0ciBcInNyY1wiLCBcImltYWdlcy9uYXZpZ2F0aW9uLWxvZ28ucG5nXCJcblxuICBzZXRTdHVkZW50OiAoIGlkICkgLT5cbiAgICBpZiBpZCA9PSBcIlwiXG4gICAgICBAJGVsLmZpbmQoXCIjc3R1ZGVudC1jb250YWluZXJcIikuYWRkQ2xhc3MoXCJoaWRkZW5cIilcbiAgICAgIEAkZWwuZmluZCgnI3N0dWRlbnQtaWQnKS5odG1sKFwiXCIpXG4gICAgZWxzZVxuICAgICAgQCRlbC5maW5kKFwiI3N0dWRlbnQtY29udGFpbmVyXCIpLnJlbW92ZUNsYXNzKFwiaGlkZGVuXCIpXG4gICAgICBAJGVsLmZpbmQoJyNzdHVkZW50LWlkJykuaHRtbChpZClcblxuXG4gICMgQWRtaW5zIGdldCBhIG1hbmFnZSBidXR0b25cbiAgIyB0cmlnZ2VyZWQgb24gdXNlciBjaGFuZ2VzXG4gIGhhbmRsZU1lbnU6IChldmVudCkgPT5cblxuICAgICQoXCIjdXNlcm5hbWVfbGFiZWxcIikuaHRtbCBAd2hvQW1JXG5cbiAgICAkKCcjdXNlcm5hbWUnKS5odG1sIEB1c2VyLm5hbWUoKVxuXG4gICAgIyBAVE9ETyBUaGlzIG5lZWRzIGZpeGluZ1xuICAgIGlmIH53aW5kb3cubG9jYXRpb24udG9TdHJpbmcoKS5pbmRleE9mKFwibmFtZT1cIikgdGhlbiBAJGVsLmZpbmQoXCIjbG9nb3V0X2xpbmtcIikuaGlkZSgpIGVsc2UgIEAkZWwuZmluZChcIiNsb2dvdXRfbGlua1wiKS5zaG93KClcblxuICAgIEB1c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiA9PlxuICAgICAgICBAcmVuZGVyKClcbiAgICAgICAgJCggJyNuYXZpZ2F0aW9uJyApLmZhZGVJbigyNTApXG4gICAgICBpc1VucmVnaXN0ZXJlZDogPT5cbiAgICAgICAgQHJlbmRlcigpXG4gICAgICAgICQoICcjbmF2aWdhdGlvbicgKS5mYWRlT3V0KDI1MClcblxuXG4iXX0=
