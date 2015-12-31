Tinytest.addAsync('Namespace loaded', function(test, done) {
  test.isNotUndefined(loadImage, "loadImage namespace undefined");
  done();
})
