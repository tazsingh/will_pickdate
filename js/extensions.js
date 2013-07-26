if(!Object.keys) {
  Object.keys = (function() {
    var hasOwnProperty = Object.prototype.hasOwnProperty
      , hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString')
      , dontEnums = [
          'toString'
        , 'toLocaleString'
        , 'valueOf'
        , 'hasOwnProperty'
        , 'isPrototypeOf'
        , 'propertyIsEnumerable'
        , 'constructor'
      , ]
      , dontEnumsLength = dontEnums.length;

    return function(object) {
      if (typeof object !== 'object' && typeof object !== 'function' || object === null)
        throw new TypeError('Object.keys called on non-object');

      var result = [];

      for(var prop in object)
        if(hasOwnProperty.call(object, prop))
          result.push(prop);

      if(hasDontEnumBug)
        for (var i = 0; i < dontEnumsLength; i++)
          if (hasOwnProperty.call(obj, dontEnums[i]))
            result.push(dontEnums[i]);

      return result;
    }
  })()
};
