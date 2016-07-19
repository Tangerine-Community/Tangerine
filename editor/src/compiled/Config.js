var Config,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Config = (function(superClass) {
  extend(Config, superClass);

  function Config() {
    return Config.__super__.constructor.apply(this, arguments);
  }

  Config.prototype.url = "config";

  Config.prototype.save = null;

  Config.prototype.getDefault = function(key) {
    return this.get("defaults")[key];
  };

  return Config;

})(Backbone.Model);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbmZpZy9Db25maWcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsTUFBQTtFQUFBOzs7QUFBTTs7Ozs7OzttQkFFSixHQUFBLEdBQU07O21CQUVOLElBQUEsR0FBTzs7bUJBRVAsVUFBQSxHQUFZLFNBQUMsR0FBRDtXQUNWLElBQUMsQ0FBQSxHQUFELENBQUssVUFBTCxDQUFpQixDQUFBLEdBQUE7RUFEUDs7OztHQU5PLFFBQVEsQ0FBQyIsImZpbGUiOiJjb25maWcvQ29uZmlnLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgQ29uZmlnIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblxuICB1cmwgOiBcImNvbmZpZ1wiXG5cbiAgc2F2ZSA6IG51bGxcblxuICBnZXREZWZhdWx0OiAoa2V5KSAtPlxuICAgIEBnZXQoXCJkZWZhdWx0c1wiKVtrZXldXG5cbiJdfQ==
