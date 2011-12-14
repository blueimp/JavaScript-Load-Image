/*
 * JavaScript Load Image Test 1.1
 * https://github.com/blueimp/JavaScript-Load-Image
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://creativecommons.org/licenses/MIT/
 */

(function ($) {
    'use strict';

    // 80x60px GIF image (color black, base64 data):
	var b64Data = 'R0lGODdhUAA8AIABAAAAAP///ywAAAAAUAA8AAACS4SPqcvtD6' +
            'OctNqLs968+w+G4kiW5omm6sq27gvH8kzX9o3n+s73/g8MCofE' +
            'ovGITCqXzKbzCY1Kp9Sq9YrNarfcrvcLDovH5PKsAAA7',
	    imageUrl = 'data:image/gif;base64,' + b64Data,
	    BlobBuilder = $.MozBlobBuilder || $.WebKitBlobBuilder || $.BlobBuilder,
	    builder = new BlobBuilder(),
	    blob;
	builder.append($.Base64Binary.decodeArrayBuffer(b64Data));
	blob = builder.getBlob('image/gif');

    $.module('Loading');

    $.test('Return the img element or FileReader object to allow aborting the image load', function () {
        var img = $.loadImage(blob, function () {});
        $.strictEqual(img && typeof img.onload, 'function');
    });

    $.asyncTest('Load image url', function () {
        $.ok($.loadImage(imageUrl, function (img) {
            $.start();
            $.strictEqual(img.width, 80);
            $.strictEqual(img.height, 60);
        }));
    });

    $.asyncTest('Load image blob', function () {
        $.ok($.loadImage(blob, function (img) {
            $.start();
            $.strictEqual(img.width, 80);
            $.strictEqual(img.height, 60);
        }));
    });

    $.asyncTest('Return image loading error to callback', function () {
        $.ok($.loadImage('404', function (img) {
            $.start();
            $.ok(img instanceof $.Event);
            $.strictEqual(img.type, 'error');
        }));
    });

    $.module('Scaling');

    $.asyncTest('Scale to options.maxWidth', function () {
        $.ok($.loadImage(blob, function (img) {
            $.start();
            $.strictEqual(img.width, 40);
            $.strictEqual(img.height, 30);
        }, {maxWidth: 40}));
    });

    $.asyncTest('Scale to options.maxHeight', function () {
        $.ok($.loadImage(blob, function (img) {
            $.start();
            $.strictEqual(img.width, 20);
            $.strictEqual(img.height, 15);
        }, {maxHeight: 15}));
    });

    $.asyncTest('Scale to options.minWidth', function () {
        $.ok($.loadImage(blob, function (img) {
            $.start();
            $.strictEqual(img.width, 160);
            $.strictEqual(img.height, 120);
        }, {minWidth: 160}));
    });

    $.asyncTest('Scale to options.minHeight', function () {
        $.ok($.loadImage(blob, function (img) {
            $.start();
            $.strictEqual(img.width, 320);
            $.strictEqual(img.height, 240);
        }, {minHeight: 240}));
    });

    $.module('Canvas');

    $.asyncTest('Return img element to callback if options.canvas is not true', function () {
        $.ok($.loadImage(blob, function (img) {
            $.start();
            $.ok(!img.getContext);
            $.strictEqual(img.nodeName.toLowerCase(), 'img');
        }));
    });

    $.asyncTest('Return canvas element to callback if options.canvas is true', function () {
        $.ok($.loadImage(blob, function (img) {
            $.start();
            $.ok(img.getContext);
            $.strictEqual(img.nodeName.toLowerCase(), 'canvas');
        }, {canvas: true}));
    });

    $.asyncTest('Return scaled canvas element to callback', function () {
        $.ok($.loadImage(blob, function (img) {
            $.start();
            $.ok(img.getContext);
            $.strictEqual(img.nodeName.toLowerCase(), 'canvas');
            $.strictEqual(img.width, 40);
            $.strictEqual(img.height, 30);
        }, {canvas: true, maxWidth: 40}));
    });

}(this));
