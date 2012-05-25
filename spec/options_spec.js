describe("Options", function() {
  it("should expose its options", function() {
    expect($("window").will_pickdate().options).to.be.a("object");
  })

  it("should return the same set of options", function() {
    expect($("window").will_pickdate().options).to.be($("window").will_pickdate().options);
  })

  it("should return a different set of options with different selectors", function() {
    expect($("window").will_pickdate().options).not.to.be($("document").will_pickdate().options);
  })

  it("should override existing options", function() {
    expect($("window").will_pickdate().options.whatever).not.to.be($("window").will_pickdate({
      whatever: "something else"
    }).options.whatever);
  })

  it("should not override existing options if not specified", function() {
    expect($("window").will_pickdate({
      whatever: "something"
    }).options.whatever).to.be($("window").will_pickdate({
      something: "else"
    }).options.whatever);
  })

  describe("Default Options", function() {
    it("should allow me to get the default options", function() {
      expect($.will_pickdate.defaults).to.be.a("function");
      expect($.will_pickdate.defaults()).to.be.an("object");
    })

    it("should allow me to set default options", function() {
      expect($.will_pickdate.extendDefaults).to.be.a("function");
    })

    it("should set those default options for new selections", function() {
      $.will_pickdate.extendDefaults({
        some_default: true
      });

      $("window").will_pickdate().clearOptions();

      expect($("window").will_pickdate().options.some_default).to.be($.will_pickdate.defaults().some_default);
    })
  })

  describe("Shared Options", function() {
    it("should have a clear options function for a selector", function() {
      expect($("window").will_pickdate().clearOptions).to.be.a("function");
    })

    it("should have a global clear options function", function() {
      expect($.will_pickdate.clearAllOptions).to.be.a("function");
    })

    it("should clear options for a selector", function() {
      var options = {
        something: "cool"
      };

      expect($("window").will_pickdate(options).options.something).to.be(options.something);

      $("window").will_pickdate().clearOptions();

      expect($("window").will_pickdate().options.something).not.to.be(options.something);
    })

    it("should clear options globally", function() {
      var options = {
        something: "awesome"
      }

      expect($("window").will_pickdate(options).options.something).to.be(options.something);
      expect($("document").will_pickdate(options).options.something).to.be(options.something);

      $.will_pickdate.clearAllOptions();

      expect($("window").will_pickdate().options.something).not.to.be(options.something);
      expect($("document").will_pickdate().options.something).not.to.be(options.something);
    })
  })
})
