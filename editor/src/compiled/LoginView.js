var LoginView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

LoginView = (function(superClass) {
  extend(LoginView, superClass);

  function LoginView() {
    this.onClose = bind(this.onClose, this);
    this.afterRender = bind(this.afterRender, this);
    this.render = bind(this.render, this);
    this.recenter = bind(this.recenter, this);
    return LoginView.__super__.constructor.apply(this, arguments);
  }

  LoginView.prototype.className = 'LoginView';

  LoginView.prototype.events = Modernizr.touch ? {
    'keypress input': 'keyHandler',
    'change input': 'onInputChange',
    'change select#name': 'onSelectChange',
    'click .mode': 'updateMode',
    'click button': 'action',
    'click .recent': 'showRecent',
    'blur .recent': 'blurRecent',
    'keyup #new_name': 'checkNewName'
  } : {
    'keypress input': 'keyHandler',
    'change input': 'onInputChange',
    'change select#name': 'onSelectChange',
    'click .mode': 'updateMode',
    'click button': 'action',
    'click .recent': 'showRecent',
    'blur .recent': 'blurRecent',
    'keyup #new_name': 'checkNewName'
  };

  LoginView.prototype.initialize = function(options) {
    $(window).on('orientationchange scroll resize', this.recenter);
    this.mode = "login";
    this.i18n();
    this.users = options.users;
    this.user = Tangerine.user;
    this.user.on("login", this.goOn);
    this.user.on("pass-error", (function(_this) {
      return function(error) {
        return _this.passError(error);
      };
    })(this));
    this.user.on("name-error", (function(_this) {
      return function(error) {
        return _this.nameError(error);
      };
    })(this));
    this.oldBackground = $("body").css("background");
    $("body").css("background", "white");
    return $("#footer").hide();
  };

  LoginView.prototype.checkNewName = function(event) {
    var $target, name;
    $target = $(event.target);
    name = $target.val().toLowerCase() || '';
    if (name.length > 4 && indexOf.call(this.users.pluck("name"), name) >= 0) {
      return this.nameError(this.text['error_name_taken']);
    } else {
      return this.clearErrors();
    }
  };

  LoginView.prototype.onInputChange = function(event) {
    var $target, type;
    $target = $(event.target);
    type = $target.attr("type");
    if (!(type === 'text' || (type == null))) {

    }
  };

  LoginView.prototype.showRecent = function() {
    return this.$el.find("#name").autocomplete({
      source: this.user.recentUsers(),
      minLength: 0
    }).autocomplete("search", "");
  };

  LoginView.prototype.blurRecent = function() {
    this.$el.find("#name").autocomplete("close");
    return this.initAutocomplete();
  };

  LoginView.prototype.recenter = function() {
    return this.$el.middleCenter();
  };

  LoginView.prototype.i18n = function() {
    return this.text = {
      "login": t('LoginView.button.login'),
      "sign_up": t('LoginView.button.sign_up'),
      "login_tab": t('LoginView.label.login'),
      "sign_up_tab": t('LoginView.label.sign_up'),
      "user": _(t('LoginView.label.user')).escape(),
      "teacher": _(t('LoginView.label.teacher')).escape(),
      "enumerator": _(t('LoginView.label.enumerator')).escape(),
      "password": t('LoginView.label.password'),
      "password_confirm": t('LoginView.label.password_confirm'),
      "error_name": t('LoginView.message.error_name_empty'),
      "error_pass": t('LoginView.message.error_password_empty'),
      "error_name_taken": t('LoginView.message.error_name_taken')
    };
  };

  LoginView.prototype.onSelectChange = function(event) {
    var $target;
    $target = $(event.target);
    if ($target.val() === "*new") {
      return this.updateMode("signup");
    } else {
      return this.$el.find("#pass").focus();
    }
  };

  LoginView.prototype.goOn = function() {
    return Tangerine.router.landing();
  };

  LoginView.prototype.updateMode = function(event) {
    var $login, $signup, $target;
    $target = $(event.target);
    this.mode = $target.attr('data-mode');
    $target.parent().find(".selected").removeClass("selected");
    $target.addClass("selected");
    $login = this.$el.find(".login");
    $signup = this.$el.find(".signup");
    switch (this.mode) {
      case "login":
        $login.show();
        $signup.hide();
        break;
      case "signup":
        $login.hide();
        $signup.show();
    }
    return this.$el.find("input")[0].focus();
  };

  LoginView.prototype.render = function() {
    var html, nameName;
    nameName = this.text.user;
    nameName = nameName.titleize();
    html = "<img src='images/tangerine_logo_small.png' id='login_logo'> <div id='name_message' class='messages'></div> <input type='text' id='name' placeholder='" + nameName + "'> <div id='pass_message' class='messages'></div> <input id='pass' type='password' placeholder='" + this.text.password + "'> <button class='login'>" + this.text.login + "</button>";
    this.$el.html(html);
    this.nameMsg = this.$el.find(".name_message");
    this.passMsg = this.$el.find(".pass_message");
    return this.trigger("rendered");
  };

  LoginView.prototype.afterRender = function() {
    return this.recenter();
  };

  LoginView.prototype.onClose = function() {
    $("#footer").show();
    return $("body").css("background", this.oldBackground);
  };

  LoginView.prototype.keyHandler = function(event) {
    var char, isSpecial, key;
    key = {
      ENTER: 13,
      TAB: 9,
      BACKSPACE: 8
    };
    $('.messages').html('');
    char = event.which;
    if (char != null) {
      isSpecial = char === key.ENTER || event.keyCode === key.TAB || event.keyCode === key.BACKSPACE;
      if (char === key.ENTER) {
        return this.action();
      }
    } else {
      return true;
    }
  };

  LoginView.prototype.action = function() {
    if (this.mode === "login") {
      this.login();
    }
    if (this.mode === "signup") {
      this.signup();
    }
    return false;
  };

  LoginView.prototype.signup = function() {
    var $name, $pass1, $pass2, e, error1, name, pass1, pass2;
    name = ($name = this.$el.find("#new_name")).val().toLowerCase();
    pass1 = ($pass1 = this.$el.find("#new_pass_1")).val();
    pass2 = ($pass2 = this.$el.find("#new_pass_2")).val();
    if (pass1 !== pass2) {
      this.passError(this.text.pass_mismatch);
    }
    try {
      return this.user.signup(name, pass1);
    } catch (error1) {
      e = error1;
      console.log(e);
      return this.nameError(e);
    }
  };

  LoginView.prototype.login = function() {
    var $name, $pass, e, error1, name, pass;
    name = ($name = this.$el.find("#name")).val();
    pass = ($pass = this.$el.find("#pass")).val();
    this.clearErrors();
    if (name === "") {
      this.nameError(this.text.error_name);
    }
    if (pass === "") {
      this.passError(this.text.error_pass);
    }
    if (this.errors === 0) {
      try {
        this.user.login(name, pass);
      } catch (error1) {
        e = error1;
        this.nameError(e);
      }
    }
    return false;
  };

  LoginView.prototype.passError = function(error) {
    this.errors++;
    this.passMsg.html(error);
    return this.$el.find("#pass").focus();
  };

  LoginView.prototype.nameError = function(error) {
    this.errors++;
    this.nameMsg.html(error);
    return this.$el.find("#name").focus();
  };

  LoginView.prototype.clearErrors = function() {
    this.nameMsg.html("");
    this.passMsg.html("");
    return this.errors = 0;
  };

  return LoginView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInVzZXIvTG9naW5WaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFNBQUE7RUFBQTs7Ozs7QUFBTTs7Ozs7Ozs7Ozs7c0JBRUosU0FBQSxHQUFXOztzQkFFWCxNQUFBLEdBQ0ssU0FBUyxDQUFDLEtBQWIsR0FDRTtJQUFBLGdCQUFBLEVBQXVCLFlBQXZCO0lBQ0EsY0FBQSxFQUF1QixlQUR2QjtJQUVBLG9CQUFBLEVBQXVCLGdCQUZ2QjtJQUdBLGFBQUEsRUFBa0IsWUFIbEI7SUFJQSxjQUFBLEVBQWtCLFFBSmxCO0lBS0EsZUFBQSxFQUFrQixZQUxsQjtJQU1BLGNBQUEsRUFBdUIsWUFOdkI7SUFPQSxpQkFBQSxFQUF1QixjQVB2QjtHQURGLEdBVUU7SUFBQSxnQkFBQSxFQUF1QixZQUF2QjtJQUNBLGNBQUEsRUFBdUIsZUFEdkI7SUFFQSxvQkFBQSxFQUF1QixnQkFGdkI7SUFHQSxhQUFBLEVBQXVCLFlBSHZCO0lBSUEsY0FBQSxFQUF1QixRQUp2QjtJQUtBLGVBQUEsRUFBdUIsWUFMdkI7SUFNQSxjQUFBLEVBQXVCLFlBTnZCO0lBT0EsaUJBQUEsRUFBdUIsY0FQdkI7OztzQkFTSixVQUFBLEdBQVksU0FBQyxPQUFEO0lBQ1YsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLEVBQVYsQ0FBYSxpQ0FBYixFQUFnRCxJQUFDLENBQUEsUUFBakQ7SUFDQSxJQUFDLENBQUEsSUFBRCxHQUFRO0lBQ1IsSUFBQyxDQUFBLElBQUQsQ0FBQTtJQUNBLElBQUMsQ0FBQSxLQUFELEdBQVMsT0FBTyxDQUFDO0lBQ2pCLElBQUMsQ0FBQSxJQUFELEdBQVEsU0FBUyxDQUFDO0lBQ2xCLElBQUMsQ0FBQSxJQUFJLENBQUMsRUFBTixDQUFTLE9BQVQsRUFBa0IsSUFBQyxDQUFBLElBQW5CO0lBQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxFQUFOLENBQVMsWUFBVCxFQUF1QixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsS0FBRDtlQUFXLEtBQUMs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R0FBRyxDQUFDLElBQUwsQ0FBVSxPQUFWLENBQWtCLENBQUMsS0FBbkIsQ0FBQTtFQUhTOztzQkFLWCxXQUFBLEdBQWEsU0FBQTtJQUNYLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLEVBQWQ7SUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxFQUFkO1dBQ0EsSUFBQyxDQUFBLE1BQUQsR0FBVTtFQUhDOzs7O0dBMU1TLFFBQVEsQ0FBQyIsImZpbGUiOiJ1c2VyL0xvZ2luVmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIExvZ2luVmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWU6ICdMb2dpblZpZXcnXG5cbiAgZXZlbnRzOlxuICAgIGlmIE1vZGVybml6ci50b3VjaFxuICAgICAgJ2tleXByZXNzIGlucHV0JyAgICAgOiAna2V5SGFuZGxlcidcbiAgICAgICdjaGFuZ2UgaW5wdXQnICAgICAgIDogJ29uSW5wdXRDaGFuZ2UnXG4gICAgICAnY2hhbmdlIHNlbGVjdCNuYW1lJyA6ICdvblNlbGVjdENoYW5nZSdcbiAgICAgICdjbGljayAubW9kZScgICA6ICd1cGRhdGVNb2RlJ1xuICAgICAgJ2NsaWNrIGJ1dHRvbicgIDogJ2FjdGlvbidcbiAgICAgICdjbGljayAucmVjZW50JyA6ICdzaG93UmVjZW50J1xuICAgICAgJ2JsdXIgLnJlY2VudCcgICAgICAgOiAnYmx1clJlY2VudCdcbiAgICAgICdrZXl1cCAjbmV3X25hbWUnICAgIDogJ2NoZWNrTmV3TmFtZSdcbiAgICBlbHNlXG4gICAgICAna2V5cHJlc3MgaW5wdXQnICAgICA6ICdrZXlIYW5kbGVyJ1xuICAgICAgJ2NoYW5nZSBpbnB1dCcgICAgICAgOiAnb25JbnB1dENoYW5nZSdcbiAgICAgICdjaGFuZ2Ugc2VsZWN0I25hbWUnIDogJ29uU2VsZWN0Q2hhbmdlJ1xuICAgICAgJ2NsaWNrIC5tb2RlJyAgICAgICAgOiAndXBkYXRlTW9kZSdcbiAgICAgICdjbGljayBidXR0b24nICAgICAgIDogJ2FjdGlvbidcbiAgICAgICdjbGljayAucmVjZW50JyAgICAgIDogJ3Nob3dSZWNlbnQnXG4gICAgICAnYmx1ciAucmVjZW50JyAgICAgICA6ICdibHVyUmVjZW50J1xuICAgICAgJ2tleXVwICNuZXdfbmFtZScgICAgOiAnY2hlY2tOZXdOYW1lJ1xuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgICQod2luZG93KS5vbignb3JpZW50YXRpb25jaGFuZ2Ugc2Nyb2xsIHJlc2l6ZScsIEByZWNlbnRlcilcbiAgICBAbW9kZSA9IFwibG9naW5cIlxuICAgIEBpMThuKClcbiAgICBAdXNlcnMgPSBvcHRpb25zLnVzZXJzXG4gICAgQHVzZXIgPSBUYW5nZXJpbmUudXNlclxuICAgIEB1c2VyLm9uIFwibG9naW5cIiwgQGdvT25cbiAgICBAdXNlci5vbiBcInBhc3MtZXJyb3JcIiwgKGVycm9yKSA9PiBAcGFzc0Vycm9yIGVycm9yXG4gICAgQHVzZXIub24gXCJuYW1lLWVycm9yXCIsIChlcnJvcikgPT4gQG5hbWVFcnJvciBlcnJvclxuICAgIEBvbGRCYWNrZ3JvdW5kID0gJChcImJvZHlcIikuY3NzKFwiYmFja2dyb3VuZFwiKVxuICAgICQoXCJib2R5XCIpLmNzcyhcImJhY2tncm91bmRcIiwgXCJ3aGl0ZVwiKVxuICAgICQoXCIjZm9vdGVyXCIpLmhpZGUoKVxuXG4gIGNoZWNrTmV3TmFtZTogKGV2ZW50KSAtPlxuICAgICR0YXJnZXQgPSAkKGV2ZW50LnRhcmdldClcbiAgICBuYW1lID0gKCAkdGFyZ2V0LnZhbCgpLnRvTG93ZXJDYXNlKCkgfHwgJycgKVxuICAgIGlmIG5hbWUubGVuZ3RoID4gNCBhbmQgbmFtZSBpbiBAdXNlcnMucGx1Y2soXCJuYW1lXCIpXG4gICAgICBAbmFtZUVycm9yKEB0ZXh0WydlcnJvcl9uYW1lX3Rha2VuJ10pXG4gICAgZWxzZVxuICAgICAgQGNsZWFyRXJyb3JzKClcblxuXG4gIG9uSW5wdXRDaGFuZ2U6IChldmVudCkgLT5cbiAgICAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpXG4gICAgdHlwZSA9ICR0YXJnZXQuYXR0cihcInR5cGVcIilcbiAgICByZXR1cm4gdW5sZXNzIHR5cGUgaXMgJ3RleHQnIG9yIG5vdCB0eXBlP1xuXG4gIHNob3dSZWNlbnQ6IC0+XG4gICAgQCRlbC5maW5kKFwiI25hbWVcIikuYXV0b2NvbXBsZXRlKFxuICAgICAgc291cmNlOiBAdXNlci5yZWNlbnRVc2VycygpXG4gICAgICBtaW5MZW5ndGg6IDBcbiAgICApLmF1dG9jb21wbGV0ZShcInNlYXJjaFwiLCBcIlwiKVxuXG4gIGJsdXJSZWNlbnQ6IC0+XG4gICAgQCRlbC5maW5kKFwiI25hbWVcIikuYXV0b2NvbXBsZXRlKFwiY2xvc2VcIilcbiAgICBAaW5pdEF1dG9jb21wbGV0ZSgpXG5cbiAgcmVjZW50ZXI6ID0+XG4gICAgQCRlbC5taWRkbGVDZW50ZXIoKVxuXG4gIGkxOG46IC0+XG4gICAgQHRleHQgPVxuICAgICAgXCJsb2dpblwiICAgICAgOiB0KCdMb2dpblZpZXcuYnV0dG9uLmxvZ2luJylcbiAgICAgIFwic2lnbl91cFwiICAgIDogdCgnTG9naW5WaWV3LmJ1dHRvbi5zaWduX3VwJylcblxuICAgICAgXCJsb2dpbl90YWJcIiAgOiB0KCdMb2dpblZpZXcubGFiZWwubG9naW4nKVxuICAgICAgXCJzaWduX3VwX3RhYlwiICA6IHQoJ0xvZ2luVmlldy5sYWJlbC5zaWduX3VwJylcblxuICAgICAgXCJ1c2VyXCIgICAgICAgOiBfKHQoJ0xvZ2luVmlldy5sYWJlbC51c2VyJykpLmVzY2FwZSgpXG4gICAgICBcInRlYWNoZXJcIiAgICA6IF8odCgnTG9naW5WaWV3LmxhYmVsLnRlYWNoZXInKSkuZXNjYXBlKClcbiAgICAgIFwiZW51bWVyYXRvclwiIDogXyh0KCdMb2dpblZpZXcubGFiZWwuZW51bWVyYXRvcicpKS5lc2NhcGUoKVxuICAgICAgXCJwYXNzd29yZFwiICAgOiB0KCdMb2dpblZpZXcubGFiZWwucGFzc3dvcmQnKVxuICAgICAgXCJwYXNzd29yZF9jb25maXJtXCIgOiB0KCdMb2dpblZpZXcubGFiZWwucGFzc3dvcmRfY29uZmlybScpXG4gICAgICBcImVycm9yX25hbWVcIiA6IHQoJ0xvZ2luVmlldy5tZXNzYWdlLmVycm9yX25hbWVfZW1wdHknKVxuICAgICAgXCJlcnJvcl9wYXNzXCIgOiB0KCdMb2dpblZpZXcubWVzc2FnZS5lcnJvcl9wYXNzd29yZF9lbXB0eScpXG4gICAgICBcImVycm9yX25hbWVfdGFrZW5cIiA6IHQoJ0xvZ2luVmlldy5tZXNzYWdlLmVycm9yX25hbWVfdGFrZW4nKVxuXG5cbiAgb25TZWxlY3RDaGFuZ2U6IChldmVudCkgLT5cbiAgICAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpXG4gICAgaWYgJHRhcmdldC52YWwoKSA9PSBcIipuZXdcIlxuICAgICAgQHVwZGF0ZU1vZGUgXCJzaWdudXBcIlxuICAgIGVsc2VcbiAgICAgIEAkZWwuZmluZChcIiNwYXNzXCIpLmZvY3VzKClcblxuICBnb09uOiAtPiBUYW5nZXJpbmUucm91dGVyLmxhbmRpbmcoKVxuXG4gIHVwZGF0ZU1vZGU6IChldmVudCkgLT5cbiAgICAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpXG4gICAgQG1vZGUgPSAkdGFyZ2V0LmF0dHIoJ2RhdGEtbW9kZScpXG4gICAgJHRhcmdldC5wYXJlbnQoKS5maW5kKFwiLnNlbGVjdGVkXCIpLnJlbW92ZUNsYXNzKFwic2VsZWN0ZWRcIilcbiAgICAkdGFyZ2V0LmFkZENsYXNzKFwic2VsZWN0ZWRcIilcbiAgICAkbG9naW4gID0gQCRlbC5maW5kKFwiLmxvZ2luXCIpXG4gICAgJHNpZ251cCA9IEAkZWwuZmluZChcIi5zaWdudXBcIilcblxuICAgIHN3aXRjaCBAbW9kZVxuICAgICAgd2hlbiBcImxvZ2luXCJcbiAgICAgICAgJGxvZ2luLnNob3coKVxuICAgICAgICAkc2lnbnVwLmhpZGUoKVxuICAgICAgd2hlbiBcInNpZ251cFwiXG4gICAgICAgICRsb2dpbi5oaWRlKClcbiAgICAgICAgJHNpZ251cC5zaG93KClcblxuICAgIEAkZWwuZmluZChcImlucHV0XCIpWzBdLmZvY3VzKClcblxuICByZW5kZXI6ID0+XG5cbiAgICBuYW1lTmFtZSA9ICBAdGV4dC51c2VyXG5cbiAgICBuYW1lTmFtZSA9IG5hbWVOYW1lLnRpdGxlaXplKClcblxuICAgIGh0bWwgPSBcIlxuICAgICAgPGltZyBzcmM9J2ltYWdlcy90YW5nZXJpbmVfbG9nb19zbWFsbC5wbmcnIGlkPSdsb2dpbl9sb2dvJz5cbiAgICAgIDxkaXYgaWQ9J25hbWVfbWVzc2FnZScgY2xhc3M9J21lc3NhZ2VzJz48L2Rpdj5cbiAgICAgIDxpbnB1dCB0eXBlPSd0ZXh0JyBpZD0nbmFtZScgcGxhY2Vob2xkZXI9JyN7bmFtZU5hbWV9Jz5cbiAgICAgIDxkaXYgaWQ9J3Bhc3NfbWVzc2FnZScgY2xhc3M9J21lc3NhZ2VzJz48L2Rpdj5cbiAgICAgIDxpbnB1dCBpZD0ncGFzcycgdHlwZT0ncGFzc3dvcmQnIHBsYWNlaG9sZGVyPScje0B0ZXh0LnBhc3N3b3JkfSc+XG4gICAgICA8YnV0dG9uIGNsYXNzPSdsb2dpbic+I3tAdGV4dC5sb2dpbn08L2J1dHRvbj5cbiAgICBcIlxuXG4gICAgQCRlbC5odG1sIGh0bWxcblxuXG4gICAgQG5hbWVNc2cgPSBAJGVsLmZpbmQoXCIubmFtZV9tZXNzYWdlXCIpXG4gICAgQHBhc3NNc2cgPSBAJGVsLmZpbmQoXCIucGFzc19tZXNzYWdlXCIpXG5cbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcblxuICBhZnRlclJlbmRlcjogPT5cbiAgICBAcmVjZW50ZXIoKVxuXG4gIG9uQ2xvc2U6ID0+XG4gICAgJChcIiNmb290ZXJcIikuc2hvdygpXG4gICAgJChcImJvZHlcIikuY3NzKFwiYmFja2dyb3VuZFwiLCBAb2xkQmFja2dyb3VuZClcblxuICBrZXlIYW5kbGVyOiAoZXZlbnQpIC0+XG5cbiAgICBrZXkgPVxuICAgICAgRU5URVIgICAgIDogMTNcbiAgICAgIFRBQiAgICAgICA6IDlcbiAgICAgIEJBQ0tTUEFDRSA6IDhcblxuICAgICQoJy5tZXNzYWdlcycpLmh0bWwoJycpXG4gICAgY2hhciA9IGV2ZW50LndoaWNoXG4gICAgaWYgY2hhcj9cbiAgICAgIGlzU3BlY2lhbCA9XG4gICAgICAgIGNoYXIgaXMga2V5LkVOVEVSICAgICAgICAgICAgICBvclxuICAgICAgICBldmVudC5rZXlDb2RlIGlzIGtleS5UQUIgICAgICAgb3JcbiAgICAgICAgZXZlbnQua2V5Q29kZSBpcyBrZXkuQkFDS1NQQUNFXG4gICAgICByZXR1cm4gQGFjdGlvbigpIGlmIGNoYXIgaXMga2V5LkVOVEVSXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIHRydWVcblxuICBhY3Rpb246IC0+XG4gICAgQGxvZ2luKCkgIGlmIEBtb2RlIGlzIFwibG9naW5cIlxuICAgIEBzaWdudXAoKSBpZiBAbW9kZSBpcyBcInNpZ251cFwiXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgc2lnbnVwOiAtPlxuICAgIG5hbWUgID0gKCRuYW1lICA9IEAkZWwuZmluZChcIiNuZXdfbmFtZVwiKSkudmFsKCkudG9Mb3dlckNhc2UoKVxuICAgIHBhc3MxID0gKCRwYXNzMSA9IEAkZWwuZmluZChcIiNuZXdfcGFzc18xXCIpKS52YWwoKVxuICAgIHBhc3MyID0gKCRwYXNzMiA9IEAkZWwuZmluZChcIiNuZXdfcGFzc18yXCIpKS52YWwoKVxuXG4gICAgQHBhc3NFcnJvcihAdGV4dC5wYXNzX21pc21hdGNoKSBpZiBwYXNzMSBpc250IHBhc3MyXG5cbiAgICB0cnlcbiAgICAgIEB1c2VyLnNpZ251cCBuYW1lLCBwYXNzMVxuICAgIGNhdGNoIGVcbiAgICAgIGNvbnNvbGUubG9nIGVcbiAgICAgIEBuYW1lRXJyb3IoZSlcblxuICBsb2dpbjogLT5cbiAgICBuYW1lID0gKCRuYW1lID0gQCRlbC5maW5kKFwiI25hbWVcIikpLnZhbCgpXG4gICAgcGFzcyA9ICgkcGFzcyA9IEAkZWwuZmluZChcIiNwYXNzXCIpKS52YWwoKVxuXG4gICAgQGNsZWFyRXJyb3JzKClcblxuICAgIEBuYW1lRXJyb3IoQHRleHQuZXJyb3JfbmFtZSkgaWYgbmFtZSA9PSBcIlwiXG4gICAgQHBhc3NFcnJvcihAdGV4dC5lcnJvcl9wYXNzKSBpZiBwYXNzID09IFwiXCJcblxuICAgIGlmIEBlcnJvcnMgPT0gMFxuICAgICAgdHJ5XG4gICAgICAgIEB1c2VyLmxvZ2luIG5hbWUsIHBhc3NcbiAgICAgIGNhdGNoIGVcbiAgICAgICAgQG5hbWVFcnJvciBlXG5cbiAgICByZXR1cm4gZmFsc2VcblxuICBwYXNzRXJyb3I6IChlcnJvcikgLT5cbiAgICBAZXJyb3JzKytcbiAgICBAcGFzc01zZy5odG1sIGVycm9yXG4gICAgQCRlbC5maW5kKFwiI3Bhc3NcIikuZm9jdXMoKVxuXG4gIG5hbWVFcnJvcjogKGVycm9yKSAtPlxuICAgIEBlcnJvcnMrK1xuICAgIEBuYW1lTXNnLmh0bWwgZXJyb3JcbiAgICBAJGVsLmZpbmQoXCIjbmFtZVwiKS5mb2N1cygpXG5cbiAgY2xlYXJFcnJvcnM6IC0+XG4gICAgQG5hbWVNc2cuaHRtbCBcIlwiXG4gICAgQHBhc3NNc2cuaHRtbCBcIlwiXG4gICAgQGVycm9ycyA9IDBcbiJdfQ==
