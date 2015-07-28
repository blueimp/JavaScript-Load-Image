// package metadata file for Meteor.js

Package.describe({
  name: 'blueimp:javascript-load-image',  // http://atmospherejs.com/twbs/bootstrap
  summary: 'JavaScript Load Image is a library to load images provided as File or Blob objects or via URL',
  version: '1.13.1',
  git: 'https://github.com/blueimp/JavaScript-Load-Image'
});

Package.onUse(function (api) {
  api.versionsFrom('METEOR@1.0');

  api.addFiles([
    'js/load-image.js',
    'js/load-image-ios.js',
    'js/load-image-orientation.js',
    'js/load-image-meta.js',
    'js/load-image-exif.js',
    'js/load-image-exif-map.js',
    'js/integrations.js'
  ], 'client');

  api.export('LoadImage');
});
