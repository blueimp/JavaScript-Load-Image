/*
 * JavaScript Load Image Test 1.2.1
 * https://github.com/blueimp/JavaScript-Load-Image
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*global window, describe, it, expect */

(function (expect, loadImage) {
    'use strict';

    // 80x60px GIF image (color black, base64 data):
	var b64Data = 'R0lGODdhUAA8AIABAAAAAP///ywAAAAAUAA8AAACS4SPqcvtD6' +
            'OctNqLs968+w+G4kiW5omm6sq27gvH8kzX9o3n+s73/g8MCofE' +
            'ovGITCqXzKbzCY1Kp9Sq9YrNarfcrvcLDovH5PKsAAA7',
	    imageUrl = 'data:image/gif;base64,' + b64Data,
	    blob = window.dataURLtoBlob && window.dataURLtoBlob(imageUrl);

    describe('Loading', function () {

        it('Return the img element or FileReader object to allow aborting the image load', function () {
            var img = loadImage(blob, function () {});
            expect(img).to.be.an(Object);
            expect(img.onload).to.be.a('function');
            expect(img.onerror).to.be.a('function');
        });

        it('Load image url', function (done) {
            expect(loadImage(imageUrl, function (img) {
                done();
                expect(img.width).to.be(80);
                expect(img.height).to.be(60);
            })).to.be.ok();
        });

        it('Load image blob', function (done) {
            expect(loadImage(blob, function (img) {
                done();
                expect(img.width).to.be(80);
                expect(img.height).to.be(60);
            })).to.be.ok();
        });

        it('Return image loading error to callback', function (done) {
            expect(loadImage('404', function (img) {
                done();
                expect(img).to.be.a(window.Event);
                expect(img.type).to.be('error');
            })).to.be.ok();
        });

        it('Keep object URL if options.noRevoke is true', function (done) {
            expect(loadImage(blob, function (img) {
                loadImage(img.src, function (img2) {
                    done();
                    expect(img.width).to.be(img2.width);
                    expect(img.height).to.be(img2.height);
                });
            }, {noRevoke: true})).to.be.ok();
        });

        it('Discard object URL if options.noRevoke is undefined or false', function (done) {
            expect(loadImage(blob, function (img) {
                loadImage(img.src, function (img2) {
                    done();
                    expect(img2).to.be.a(window.Event);
                    expect(img2.type).to.be('error');
                });
            })).to.be.ok();
        });

    });

    describe('Scaling', function () {

        it('Scale to options.maxWidth', function (done) {
            expect(loadImage(blob, function (img) {
                done();
                expect(img.width).to.be(40);
                expect(img.height).to.be(30);
            }, {maxWidth: 40})).to.be.ok();
        });

        it('Scale to options.maxHeight', function (done) {
            expect(loadImage(blob, function (img) {
                done();
                expect(img.width).to.be(20);
                expect(img.height).to.be(15);
            }, {maxHeight: 15})).to.be.ok();
        });

        it('Scale to options.minWidth', function (done) {
            expect(loadImage(blob, function (img) {
                done();
                expect(img.width).to.be(160);
                expect(img.height).to.be(120);
            }, {minWidth: 160})).to.be.ok();
        });

        it('Scale to options.minHeight', function (done) {
            expect(loadImage(blob, function (img) {
                done();
                expect(img.width).to.be(320);
                expect(img.height).to.be(240);
            }, {minHeight: 240})).to.be.ok();
        });

        it('Scale to options.minWidth but respect options.maxWidth', function (done) {
            expect(loadImage(blob, function (img) {
                done();
                expect(img.width).to.be(160);
                expect(img.height).to.be(120);
            }, {minWidth: 240, maxWidth: 160})).to.be.ok();
        });

        it('Scale to options.minHeight but respect options.maxHeight', function (done) {
            expect(loadImage(blob, function (img) {
                done();
                expect(img.width).to.be(160);
                expect(img.height).to.be(120);
            }, {minHeight: 180, maxHeight: 120})).to.be.ok();
        });

        it('Scale to options.minWidth but respect options.maxHeight', function (done) {
            expect(loadImage(blob, function (img) {
                done();
                expect(img.width).to.be(160);
                expect(img.height).to.be(120);
            }, {minWidth: 240, maxHeight: 120})).to.be.ok();
        });

        it('Scale to options.minHeight but respect options.maxWidth', function (done) {
            expect(loadImage(blob, function (img) {
                done();
                expect(img.width).to.be(160);
                expect(img.height).to.be(120);
            }, {minHeight: 180, maxWidth: 160})).to.be.ok();
        });

        it('Do not scale to max settings without min settings', function (done) {
            expect(loadImage(blob, function (img) {
                done();
                expect(img.width).to.be(80);
                expect(img.height).to.be(60);
            }, {maxWidth: 160, maxHeight: 120})).to.be.ok();
        });

        it('Do not scale to min settings without max settings', function (done) {
            expect(loadImage(blob, function (img) {
                done();
                expect(img.width).to.be(80);
                expect(img.height).to.be(60);
            }, {minWidth: 40, minHeight: 30})).to.be.ok();
        });

    });

    describe('Canvas', function () {

        it('Return img element to callback if options.canvas is not true', function (done) {
            expect(loadImage(blob, function (img) {
                done();
                expect(img.getContext).to.not.be.ok();
                expect(img.nodeName.toLowerCase()).to.be('img');
            })).to.be.ok();
        });

        it('Return canvas element to callback if options.canvas is true', function (done) {
            expect(loadImage(blob, function (img) {
                done();
                expect(img.getContext).to.be.ok();
                expect(img.nodeName.toLowerCase()).to.be('canvas');
            }, {canvas: true})).to.be.ok();
        });

        it('Return scaled canvas element to callback', function (done) {
            expect(loadImage(blob, function (img) {
                done();
                expect(img.getContext).to.be.ok();
                expect(img.nodeName.toLowerCase()).to.be('canvas');
                expect(img.width).to.be(40);
                expect(img.height).to.be(30);
            }, {canvas: true, maxWidth: 40})).to.be.ok();
        });

        it('Accept a canvas element as parameter for loadImage.scale', function (done) {
            expect(loadImage(blob, function (img) {
                done();
                img = loadImage.scale(img, {
                    maxWidth: 40
                });
                expect(img.getContext).to.be.ok();
                expect(img.nodeName.toLowerCase()).to.be('canvas');
                expect(img.width).to.be(40);
                expect(img.height).to.be(30);
            }, {canvas: true})).to.be.ok();
        });

    });

}(
    this.expect,
    this.loadImage
));
