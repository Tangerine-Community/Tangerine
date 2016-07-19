var Question,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Question = (function(superClass) {
  extend(Question, superClass);

  function Question() {
    return Question.__super__.constructor.apply(this, arguments);
  }

  Question.prototype.url = "question";

  Question.prototype.config = {
    types: ["multiple", "single", "open"]
  };

  Question.prototype["default"] = {
    order: 0,
    prompt: "Is this an example question?",
    hint: "[hint or answer]",
    type: "single",
    otherWriteIn: false,
    options: [],
    linkedGridScore: 0,
    skipLink: null,
    skipRequirement: null
  };

  Question.prototype.initialize = function(options) {};

  return Question;

})(Backbone.Model);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInF1ZXN0aW9uL1F1ZXN0aW9uLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxJQUFBLFFBQUE7RUFBQTs7O0FBQU07Ozs7Ozs7cUJBRUosR0FBQSxHQUFLOztxQkFFTCxNQUFBLEdBQ0U7SUFBQSxLQUFBLEVBQVEsQ0FBRSxVQUFGLEVBQWMsUUFBZCxFQUF3QixNQUF4QixDQUFSOzs7cUJBRUYsVUFBQSxHQUNFO0lBQUEsS0FBQSxFQUFTLENBQVQ7SUFDQSxNQUFBLEVBQVMsOEJBRFQ7SUFFQSxJQUFBLEVBQVMsa0JBRlQ7SUFLQSxJQUFBLEVBQU8sUUFMUDtJQVFBLFlBQUEsRUFBZSxLQVJmO0lBU0EsT0FBQSxFQUFlLEVBVGY7SUFZQSxlQUFBLEVBQWtCLENBWmxCO0lBZUEsUUFBQSxFQUFrQixJQWZsQjtJQWdCQSxlQUFBLEVBQWtCLElBaEJsQjs7O3FCQWtCRixVQUFBLEdBQVksU0FBRSxPQUFGLEdBQUE7Ozs7R0ExQlMsUUFBUSxDQUFDIiwiZmlsZSI6InF1ZXN0aW9uL1F1ZXN0aW9uLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiIyBAVE9ETyBJIHRoaW5rIHRoaXMgY2FuIGJlIHJlbW92ZWQuIHVybCBzaG91bGQgc3RheSBcbmNsYXNzIFF1ZXN0aW9uIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblxuICB1cmw6IFwicXVlc3Rpb25cIlxuXG4gIGNvbmZpZzpcbiAgICB0eXBlcyA6IFsgXCJtdWx0aXBsZVwiLCBcInNpbmdsZVwiLCBcIm9wZW5cIiBdXG5cbiAgZGVmYXVsdDpcbiAgICBvcmRlciAgOiAwXG4gICAgcHJvbXB0IDogXCJJcyB0aGlzIGFuIGV4YW1wbGUgcXVlc3Rpb24/XCJcbiAgICBoaW50ICAgOiBcIltoaW50IG9yIGFuc3dlcl1cIlxuXG4gICAgIyBtYWluIHF1ZXN0aW9uIHR5cGVzXG4gICAgdHlwZSA6IFwic2luZ2xlXCJcblxuICAgICMgcXVlc3Rpb24gZmVhdHVyZXNcbiAgICBvdGhlcldyaXRlSW4gOiBmYWxzZVxuICAgIG9wdGlvbnMgICAgICA6IFtdICMgdHJpY2t5IGJpdCwgY29udGFpbnMgYGxhYmVsYCxgdmFsdWVgIHByb3BlcnR5XG5cbiAgICAjIG91dHNpZGUgcmVxdWlyZW1lbnRzXG4gICAgbGlua2VkR3JpZFNjb3JlIDogMFxuXG4gICAgIyBXaXRoaW4gc3VidGVzdCByZXF1aXJlbWVudHNcbiAgICBza2lwTGluayAgICAgICAgOiBudWxsXG4gICAgc2tpcFJlcXVpcmVtZW50IDogbnVsbFxuXG4gIGluaXRpYWxpemU6ICggb3B0aW9ucyApLT5cbiAgICBcbiAgICBcbiJdfQ==
