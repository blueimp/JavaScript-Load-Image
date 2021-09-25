#!/bin/sh
cd "$(dirname "$0")/.."
cp node_modules/blueimp-canvas-to-blob/js/canvas-to-blob.js js/vendor/
cp node_modules/jquery/dist/jquery.js js/vendor/
cp node_modules/promise-polyfill/dist/polyfill.js js/vendor/promise-polyfill.js
cp node_modules/chai/chai.js test/vendor/
cp node_modules/mocha/mocha.js test/vendor/
cp node_modules/mocha/mocha.css test/vendor/
