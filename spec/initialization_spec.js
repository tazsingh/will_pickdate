describe("Initialization", function() {
  it("should have its dependencies fulfulled", function() {
    expect($).to.be(jQuery);
    expect($.fn.mousewheel).not.to.be(undefined);
  })

  it("should be defined", function() {
    expect($.fn.will_pickdate).not.to.be(undefined);
  })

  it("should operate on a selector", function() {
    expect($("window").will_pickdate()).to.be.ok();
  })

  it("should tell me its version", function() {
    expect($("window").will_pickdate().version).not.to.be(undefined);
    expect($("window").will_pickdate().version).to.be.a("string");
  })
})
