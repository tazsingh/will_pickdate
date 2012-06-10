;(function($) {
  var VERSION = "0.3.0"
    , selectorOptions = {}
    , resetOptionsForSelector
    , defaults = {};

  resetOptionsForSelector = function(selector) {
    selectorOptions[selector] = $.extend({}, defaults);
  }

  $.will_pickdate = {
    version: VERSION
  , defaults: function() {
      return $.extend({}, defaults);
    }
  , extendDefaults: function(extendedDefaults) {
      defaults = $.extend(defaults, extendedDefaults);
    }
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
    , container: {}
    , version: VERSION
    }
  }
})(jQuery);
