Package.describe({
  name: 'marvin:javascript-load-image',
  version: '2.1.0',
  summary: 'A JavaScript library to load and transform image files.',
  git: 'https://github.com/blueimp/JavaScript-Load-Image',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@1.2.1');
  api.use(["jquery"]);

  api.addFiles('js/load-image.all.min.js', 'client');
});

Package.onTest(function(api) {
  api.use([
    'ecmascript',
    'tinytest',
  ]);

  api.use('marvin:javascript-load-image');
  api.addFiles('test/meteor-tests.js', 'client');
});
