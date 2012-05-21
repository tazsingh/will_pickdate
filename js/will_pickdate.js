(function($) {
  var will_pickdate
    , VERSION = "0.3.0"
    , selector_options = {};

  $.fn.will_pickdate = function(options) {
    var selector = this.selector;

    selector_options[selector] = $.extend(selector_options[selector] || {}, options);

    return {
      options: selector_options[selector]
    , version: VERSION
    }
  }
})(jQuery);
