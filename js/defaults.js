(function() {
  var defaults = {};

  will_pickdate.defaults = function() {
    return JSON.parse(JSON.stringify(defaults));
  };

  will_pickdate.defaults.extend = function(extension) {
    var keys = Object.keys(extension);

    for(var i = 0; i < keys.length; i++)
      defaults[keys[i]] = extension[keys[i]];
  };
})();
