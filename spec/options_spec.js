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

  describe("Shared Options", function() {
    
  })
})
