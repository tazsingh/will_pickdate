describe("will_pickdate", function() {
  it("is a function", function() {
    expect(will_pickdate).to.be.a("function");
  });

  describe(".VERSION", function() {
    it("is a string", function() {
      expect(will_pickdate.VERSION).to.be.a("string");
    });
  });
});
