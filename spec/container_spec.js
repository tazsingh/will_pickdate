describe("Container", function() {
  it("should have a global container object", function() {
    expect($.will_pickdate.container).to.be.an("object");
  })

  it("should have a container for a selector", function() {
    expect($("window").will_pickdate().container).to.be.an("object");
  })
})
