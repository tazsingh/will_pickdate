var jsdom = require("jsdom")
  , window = jsdom.jsdom().createWindow()
  , jQuery = require("jquery");

require("../js/jquery.mousewheel.js");
require("../js/will_pickdate.js");

require("./initialization_spec.js");
