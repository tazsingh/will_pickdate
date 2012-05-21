(function($) {
  var will_pickdate
    , VERSION = "0.3.0"
    , selector_options = {};

  will_pickdate = function(options) {
    var that = this;

    selector_options[this.selector] = $.extend(selector_options[this.selector] || {}, options);

    return new (function() {
      this.options = selector_options[that.selector];
    })
  }

  will_pickdate.version = VERSION;

  $.fn.will_pickdate = will_pickdate;
})(jQuery);
