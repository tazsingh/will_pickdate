(function($) {
  var VERSION = "0.3.0"
    , selectorOptions = {}
    , resetOptionsForSelector;

  resetOptionsForSelector = function(selector) {
    selectorOptions[selector] = $.extend({}, $.will_pickdate.defaults);
  }

  $.will_pickdate = {
    version: VERSION
  , defaults: {}
  , clearAllOptions: function() {
      selectorOptions = {};
    }
  }

  $.fn.will_pickdate = function(options) {
    var selector = this.selector;

    if(typeof selectorOptions[selector] === "undefined") {
      resetOptionsForSelector(selector);
    }

    selectorOptions[selector] = $.extend(selectorOptions[selector], options);

    return {
      options: selectorOptions[selector]
    , clearOptions: function() {
        resetOptionsForSelector(selector);
      }
    , version: VERSION

    }
  }
})(jQuery);
