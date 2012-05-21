(function($) {
  var will_pickdate
    , VERSION = "0.3.0"
    , selector_options = {};

  $.fn.will_pickdate = function(options) {
    var that = this;

    selector_options[this.selector] = $.extend(selector_options[this.selector] || {}, options);

    return new (function() {
      this.options = selector_options[that.selector];
      this.version = VERSION;
    })
  }
})(jQuery);
