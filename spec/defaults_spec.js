describe(".defaults()", function() {
  it("is a function", function() {
    expect(will_pickdate.defaults).to.be.a("function");
  });

  it("returns an object", function() {
    expect(will_pickdate.defaults()).to.be.an("object");
  });

  it("doesn't return the same object", function() {
    expect(will_pickdate.defaults()).to.not.be(will_pickdate.defaults());
  });

  it("returns the same values", function() {
    expect(will_pickdate.defaults()).to.eql(will_pickdate.defaults());
  });

  describe(".extend()", function() {
    it("is a function", function() {
      expect(will_pickdate.defaults.extend).to.be.a("function");
    });

    it("extends the defaults with the passed object", function() {
      var object = {
        a: 1
      , b: 2
      };

      will_pickdate.defaults.extend(object);

      for(var i = 0; i < Object.keys(object).length; i++)
        expect(will_pickdate.defaults()[Object.keys(object)[i]]).to.equal(
          object[Object.keys(object)[i]]
        );
    });
  });
});
