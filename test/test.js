/*
 * JavaScript Load Image Test
 * https://github.com/blueimp/JavaScript-Load-Image
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 */

/* global describe, before, after, it, Promise, ArrayBuffer */
/* eslint-disable no-unused-expressions */

;(function (expect, loadImage) {
  'use strict'

  var browser = {
    canCreateBlob: !!window.dataURLtoBlob
  }

  // black+white 60x40 GIF
  // Image data layout (B=black, F=white), scaled to 3x2:
  // BFF
  // BBB
  var b64DataGIF =
    'R0lGODlhPAAoAPECAAAAAP///wAAAAAAACH5BAUAAAIALAAAAAA8ACgAQAJihI+Zwe0Po3Sq' +
    '1okztvzoDwbdSJbmiaaqGbbTCrjyA9f2jef6Ts6+uPrNYEIZsdg6IkG8pvMJjUqnVOgypLxm' +
    'stpXsLv9gr2q8UZshnDTjTUbWH7TqvS6/Y7P6/f8vv9vVwAAOw=='
  var imageUrlGIF = 'data:image/gif;base64,' + b64DataGIF
  var blobGIF = browser.canCreateBlob && window.dataURLtoBlob(imageUrlGIF)
  var fileGIF
  try {
    fileGIF = new File([blobGIF], 'image.gif')
  } catch (_) {
    // No File constructor support
  }

  // black+white 3x2 GIF
  // Image data layout (B=black, F=white):
  // BFF
  // BBB
  var b64DataGIF2 =
    'R0lGODdhAwACAPEAAAAAAP///yZFySZFySH5BAEAAAIALAAAAAADAAIAAAIDRAJZADs='
  var imageUrlGIF2 = 'data:image/gif;base64,' + b64DataGIF2
  var blobGIF2 = browser.canCreateBlob && window.dataURLtoBlob(imageUrlGIF2)

  // black+white 3x2 JPEG, with the following meta information set:
  // - EXIF Orientation: 6 (Rotated 90° CCW)
  // - IPTC ObjectName: blueimp.net
  // Meta information has been set via exiftool (exiftool.org):
  // exiftool -all= -Orientation#=6 -YCbCrPositioning= -ResolutionUnit= \
  //   -YResolution= -XResolution= -ObjectName=blueimp.net black+white-3x2.jpg
  // Image data layout (B=black, F=white):
  // BFF
  // BBB
  var b64DataJPEG =
    '/9j/4QAiRXhpZgAATU0AKgAAAAgAAQESAAMAAAABAAYAAAAAAAD/7QA0UGhvdG9zaG9wIDMu' +
    'MAA4QklNBAQAAAAAABccAgUAC2JsdWVpbXAubmV0HAIAAAIABAD/2wCEAAEBAQEBAQEBAQEB' +
    'AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEB' +
    'AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEB' +
    'AQEBAQEBAQEBAf/AABEIAAIAAwMBEQACEQEDEQH/xABRAAEAAAAAAAAAAAAAAAAAAAAKEAEB' +
    'AQADAQEAAAAAAAAAAAAGBQQDCAkCBwEBAAAAAAAAAAAAAAAAAAAAABEBAAAAAAAAAAAAAAAA' +
    'AAAAAP/aAAwDAQACEQMRAD8AG8T9NfSMEVMhQvoP3fFiRZ+MTHDifa/95OFSZU5OzRzxkyej' +
    'v8ciEfhSceSXGjS8eSdLnZc2HDm4M3BxcXwH/9k='
  var imageUrlJPEG = 'data:image/jpeg;base64,' + b64DataJPEG
  var blobJPEG = browser.canCreateBlob && window.dataURLtoBlob(imageUrlJPEG)

  ;(function imageSmoothingTest($) {
    var canvas = document.createElement('canvas')
    if (!canvas.getContext) return
    var ctx = canvas.getContext('2d')
    if (ctx.msImageSmoothingEnabled) {
      $.imageSmoothingEnabled = ctx.msImageSmoothingEnabled
      $.imageSmoothingEnabledKey = 'msImageSmoothingEnabled'
    } else {
      $.imageSmoothingEnabled = ctx.imageSmoothingEnabled
      $.imageSmoothingEnabledKey = 'imageSmoothingEnabled'
    }
    $.imageSmoothingQuality = ctx.imageSmoothingQuality
  })(browser)

  // Test if the browser is using exact image data when transforming the canvas.
  // Both Internet Explorer and Edge Legacy have off-by-one changes to color and
  // transparency values when flipping images.
  ;(function exactImageDataTest($) {
    var img = document.createElement('img')
    img.onload = function () {
      var canvas = document.createElement('canvas')
      if (!canvas.getContext) return
      var ctx = canvas.getContext('2d')
      // horizontal flip:
      ctx.translate(img.width, 0)
      ctx.scale(-1, 1)
      ctx.drawImage(img, 0, 0)
      $.exactImageData =
        // Workaround for IE11 not supporting .join() for imageData.data:
        Array.prototype.slice
          .call(ctx.getImageData(0, 0, img.width, img.height).data)
          // Resulting image data layout (B=black, F=white): FB
          .join(',') === '255,255,255,255,0,0,0,255'
    }
    // black+white 2x1 GIF
    // Image data layout (B=black, F=white): BF
    img.src =
      'data:image/gif;base64,' +
      'R0lGODdhAgABAPEAAAAAAP///yZFySZFySH5BAEAAAIALAAAAAACAAEAAAICRAoAOw=='
  })(browser)

  /**
   * Helper function to create a blob object from the given image data
   *
   * @param {ArrayBuffer} data Image data
   * @param {string} type Image content type
   * @returns {Blob} Image Blob object
   */
  function createBlob(data, type) {
    try {
      return new Blob([data], { type: type })
    } catch (e) {
      var BlobBuilder =
        window.BlobBuilder ||
        window.WebKitBlobBuilder ||
        window.MozBlobBuilder ||
        window.MSBlobBuilder
      var builder = new BlobBuilder()
      builder.append(data)
      return builder.getBlob(type)
    }
  }

  /**
   * Request helper function.
   *
   * @param {string} url URL to request
   * @param {Function} callback Request callback
   */
  function request(url, callback) {
    var xhr = new XMLHttpRequest()
    xhr.onload = callback
    xhr.onerror = callback
    try {
      xhr.open('GET', url, true)
    } catch (e) {
      callback.call(xhr, e)
      return
    }
    xhr.send()
  }

  describe('Loading', function () {
    it('Return an object with onload and onerror methods', function () {
      var img = loadImage(blobGIF, function () {})
      expect(img).to.be.an.instanceOf(Object)
      expect(img.onload).to.be.an.instanceOf(Function)
      expect(img.onerror).to.be.an.instanceOf(Function)
    })

    it('Load image url as img element', function (done) {
      expect(
        loadImage(imageUrlGIF, function (img) {
          expect(img.nodeName.toLowerCase()).to.equal('img')
          expect(img.width).to.equal(60)
          expect(img.height).to.equal(40)
          done()
        })
      ).to.be.ok
    })

    it('Load image blob as img element', function (done) {
      expect(
        loadImage(blobGIF, function (img) {
          expect(img.nodeName.toLowerCase()).to.equal('img')
          expect(img.width).to.equal(60)
          expect(img.height).to.equal(40)
          done()
        })
      ).to.be.ok
    })

    it('Handle image loading error', function (done) {
      expect(
        loadImage('404', function (err) {
          expect(err).to.be.an.instanceOf(window.Event)
          expect(err.type).to.equal('error')
          done()
        })
      ).to.be.ok
    })

    it('Provide original image width+height in callback data', function (done) {
      expect(
        loadImage(imageUrlGIF, function (img, data) {
          expect(data.originalWidth).to.equal(60)
          expect(data.originalHeight).to.equal(40)
          done()
        })
      ).to.be.ok
    })

    it('Load image as canvas for canvas: true', function (done) {
      expect(
        loadImage(
          imageUrlGIF,
          function (img) {
            expect(img.getContext).to.be.an.instanceOf(Function)
            expect(img.nodeName.toLowerCase()).to.equal('canvas')
            done()
          },
          { canvas: true }
        )
      ).to.be.ok
    })

    describe('File', function () {
      if (!fileGIF) return

      it('Load image file as img element', function (done) {
        expect(
          loadImage(fileGIF, function (img) {
            expect(img.nodeName.toLowerCase()).to.equal('img')
            expect(img.width).to.equal(60)
            expect(img.height).to.equal(40)
            done()
          })
        ).to.be.ok
      })
    })

    describe('Object URL', function () {
      // Using XMLHttpRequest via the request helper function to test Object
      // URLs to work around Edge Legacy and IE caching image URLs.
      if (!window.XMLHttpRequest) return

      it('Keep object URL if noRevoke is set to true', function (done) {
        expect(
          loadImage(
            blobGIF,
            function (img) {
              request(img.src, function (event) {
                expect(event.type).to.equal('load')
                done()
              })
            },
            { noRevoke: true }
          )
        ).to.be.ok
      })

      it('Discard object URL if noRevoke is not set', function (done) {
        expect(
          loadImage(blobGIF, function (img) {
            request(img.src, function (event) {
              // IE throws an error that has no type property:
              expect(event.type).to.be.oneOf(['error', undefined])
              done()
            })
          })
        ).to.be.ok
      })
    })

    describe('Promise', function () {
      if (!window.Promise) return

      it('Load image url as img element', function () {
        return loadImage(imageUrlGIF).then(function (data) {
          var img = data.image
          expect(img.nodeName.toLowerCase()).to.equal('img')
          expect(img.width).to.equal(60)
          expect(img.height).to.equal(40)
        })
      })

      it('Load image blob as img element', function () {
        return loadImage(blobGIF).then(function (data) {
          var img = data.image
          expect(img.nodeName.toLowerCase()).to.equal('img')
          expect(img.width).to.equal(60)
          expect(img.height).to.equal(40)
        })
      })

      it('Handle image loading error', function () {
        return loadImage('404')
          .then(function () {
            throw new Error('Promise not rejected')
          })
          .catch(function (err) {
            expect(err).to.be.an.instanceOf(window.Event)
            expect(err.type).to.equal('error')
          })
      })

      it('Provide original image width+height in callback data', function () {
        return loadImage(imageUrlGIF).then(function (data) {
          expect(data.originalWidth).to.equal(60)
          expect(data.originalHeight).to.equal(40)
        })
      })

      it('Load image as canvas for canvas: true', function () {
        return loadImage(imageUrlGIF, { canvas: true }).then(function (data) {
          var img = data.image
          expect(img.getContext).to.be.an.instanceOf(Function)
          expect(img.nodeName.toLowerCase()).to.equal('canvas')
        })
      })
    })
  })

  describe('Exceptions', function () {
    var originalTransform = loadImage.transform

    before(function () {
      loadImage.transform = function (img, options, callback) {
        if (options.throwError) throw options.throwError
        callback(options.callbackError)
      }
    })

    after(function () {
      loadImage.transform = originalTransform
    })

    it('Pass error to callback', function (done) {
      var error = new Error('ERROR')
      expect(
        loadImage(
          imageUrlGIF,
          function (err) {
            expect(err).to.be.an.instanceOf(Error)
            expect(err.message).to.equal(error.message)
            done()
          },
          { callbackError: error }
        )
      ).to.be.ok
    })

    it('Pass exception error to callback', function (done) {
      var error = new Error('ERROR')
      expect(
        loadImage(
          imageUrlGIF,
          function (err) {
            expect(err).to.be.an.instanceOf(Error)
            expect(err.message).to.equal(error.message)
            done()
          },
          { throwError: error }
        )
      ).to.be.ok
    })

    it('Pass exception string to callback', function (done) {
      var error = 'ERROR'
      expect(
        loadImage(
          imageUrlGIF,
          function (err) {
            expect(err).to.be.a('string')
            expect(err).to.equal(error)
            done()
          },
          { throwError: error }
        )
      ).to.be.ok
    })

    describe('Promise', function () {
      it('Reject with error ', function () {
        var error = new Error('ERROR')
        return loadImage(imageUrlGIF, { callbackError: error })
          .then(function () {
            throw new Error('Promise not rejected')
          })
          .catch(function (err) {
            expect(err).to.be.an.instanceOf(Error)
            expect(err.message).to.equal(error.message)
          })
      })

      it('Reject with exception error ', function () {
        var error = new Error('ERROR')
        return loadImage(imageUrlGIF, { throwError: error })
          .then(function () {
            throw new Error('Promise not rejected')
          })
          .catch(function (err) {
            expect(err).to.be.an.instanceOf(Error)
            expect(err.message).to.equal(error.message)
          })
      })

      it('Reject with exception string ', function () {
        var error = 'ERROR'
        return loadImage(imageUrlGIF, { throwError: error })
          .then(function () {
            throw new Error('Promise not rejected')
          })
          .catch(function (err) {
            expect(err).to.be.a('string')
            expect(err).to.equal(error)
          })
      })
    })
  })

  describe('Scaling', function () {
    describe('max/min', function () {
      it('Scale to maxWidth', function (done) {
        expect(
          loadImage(
            blobGIF,
            function (img, data) {
              expect(img.width).to.equal(30)
              expect(img.height).to.equal(20)
              expect(data.originalWidth).to.equal(60)
              expect(data.originalHeight).to.equal(40)
              done()
            },
            { maxWidth: 30 }
          )
        ).to.be.ok
      })

      it('Scale to maxHeight', function (done) {
        expect(
          loadImage(
            blobGIF,
            function (img, data) {
              expect(img.width).to.equal(30)
              expect(img.height).to.equal(20)
              expect(data.originalWidth).to.equal(60)
              expect(data.originalHeight).to.equal(40)
              done()
            },
            { maxHeight: 20 }
          )
        ).to.be.ok
      })

      it('Scale to minWidth', function (done) {
        expect(
          loadImage(
            blobGIF,
            function (img, data) {
              expect(img.width).to.equal(120)
              expect(img.height).to.equal(80)
              expect(data.originalWidth).to.equal(60)
              expect(data.originalHeight).to.equal(40)
              done()
            },
            { minWidth: 120 }
          )
        ).to.be.ok
      })

      it('Scale to minHeight', function (done) {
        expect(
          loadImage(
            blobGIF,
            function (img, data) {
              expect(img.width).to.equal(120)
              expect(img.height).to.equal(80)
              expect(data.originalWidth).to.equal(60)
              expect(data.originalHeight).to.equal(40)
              done()
            },
            { minHeight: 80 }
          )
        ).to.be.ok
      })

      it('Scale to minWidth but respect maxWidth', function (done) {
        expect(
          loadImage(
            blobGIF,
            function (img) {
              expect(img.width).to.equal(120)
              expect(img.height).to.equal(80)
              done()
            },
            { minWidth: 240, maxWidth: 120 }
          )
        ).to.be.ok
      })

      it('Scale to minHeight but respect maxHeight', function (done) {
        expect(
          loadImage(
            blobGIF,
            function (img) {
              expect(img.width).to.equal(120)
              expect(img.height).to.equal(80)
              done()
            },
            { minHeight: 160, maxHeight: 80 }
          )
        ).to.be.ok
      })

      it('Scale to minWidth but respect maxHeight', function (done) {
        expect(
          loadImage(
            blobGIF,
            function (img) {
              expect(img.width).to.equal(120)
              expect(img.height).to.equal(80)
              done()
            },
            { minWidth: 240, maxHeight: 80 }
          )
        ).to.be.ok
      })

      it('Scale to minHeight but respect maxWidth', function (done) {
        expect(
          loadImage(
            blobGIF,
            function (img) {
              expect(img.width).to.equal(120)
              expect(img.height).to.equal(80)
              done()
            },
            { minHeight: 160, maxWidth: 120 }
          )
        ).to.be.ok
      })

      it('Scale up with the given pixelRatio', function (done) {
        expect(
          loadImage(
            blobGIF,
            function (img) {
              expect(img.width).to.equal(240)
              expect(img.height).to.equal(160)
              expect(img.style.width).to.equal('120px')
              // Check if pixelRatio scaling is idempotent:
              var img2 = loadImage.scale(img, { minWidth: 120, pixelRatio: 2 })
              expect(img2.width).to.equal(240)
              expect(img2.height).to.equal(160)
              expect(img2.style.width).to.equal('120px')
              done()
            },
            { minWidth: 120, canvas: true, pixelRatio: 2 }
          )
        ).to.be.ok
      })

      it('Scale down with the given pixelRatio', function (done) {
        expect(
          loadImage(
            blobGIF,
            function (img) {
              expect(img.width).to.equal(60)
              expect(img.height).to.equal(40)
              expect(img.style.width).to.equal('30px')
              // Check if pixelRatio scaling is idempotent:
              var img2 = loadImage.scale(img, { minWidth: 30, pixelRatio: 2 })
              expect(img2.width).to.equal(60)
              expect(img2.height).to.equal(40)
              expect(img2.style.width).to.equal('30px')
              done()
            },
            { maxWidth: 30, canvas: true, pixelRatio: 2 }
          )
        ).to.be.ok
      })

      it('Scale down with the given downsamplingRatio', function (done) {
        expect(
          loadImage(
            blobGIF,
            function (img) {
              expect(img.width).to.equal(15)
              expect(img.height).to.equal(10)
              done()
            },
            { maxWidth: 15, canvas: true, downsamplingRatio: 0.5 }
          )
        ).to.be.ok
      })

      it('Ignore max settings for smaller image dimensions', function (done) {
        expect(
          loadImage(
            blobGIF,
            function (img) {
              expect(img.width).to.equal(60)
              expect(img.height).to.equal(40)
              done()
            },
            { maxWidth: 120, maxHeight: 80 }
          )
        ).to.be.ok
      })

      it('Ignore min settings for larger image dimensions', function (done) {
        expect(
          loadImage(
            blobGIF,
            function (img) {
              expect(img.width).to.equal(60)
              expect(img.height).to.equal(40)
              done()
            },
            { minWidth: 30, minHeight: 20 }
          )
        ).to.be.ok
      })

      it('Accept a canvas element as source image', function (done) {
        expect(
          loadImage(
            blobGIF,
            function (img) {
              expect(img.getContext).to.be.an.instanceOf(Function)
              expect(img.nodeName.toLowerCase()).to.equal('canvas')
              // eslint-disable-next-line no-param-reassign
              img = loadImage.scale(img, {
                maxWidth: 30
              })
              expect(img.getContext).to.be.an.instanceOf(Function)
              expect(img.nodeName.toLowerCase()).to.equal('canvas')
              expect(img.width).to.equal(30)
              expect(img.height).to.equal(20)
              done()
            },
            { canvas: true }
          )
        ).to.be.ok
      })
    })

    describe('contain', function () {
      it('Scale up to contain image in max dimensions', function (done) {
        expect(
          loadImage(
            blobGIF,
            function (img) {
              expect(img.width).to.equal(120)
              expect(img.height).to.equal(80)
              done()
            },
            { maxWidth: 120, maxHeight: 120, contain: true }
          )
        ).to.be.ok
      })

      it('Scale down to contain image in max dimensions', function (done) {
        expect(
          loadImage(
            blobGIF,
            function (img) {
              expect(img.width).to.equal(30)
              expect(img.height).to.equal(20)
              done()
            },
            { maxWidth: 30, maxHeight: 30, contain: true }
          )
        ).to.be.ok
      })
    })

    describe('cover', function () {
      it('Scale up to cover max dimensions with image dimensions', function (done) {
        expect(
          loadImage(
            blobGIF,
            function (img) {
              expect(img.width).to.equal(180)
              expect(img.height).to.equal(120)
              done()
            },
            { maxWidth: 120, maxHeight: 120, cover: true }
          )
        ).to.be.ok
      })

      it('Scale down to cover max dimensions with image dimensions', function (done) {
        expect(
          loadImage(
            blobGIF,
            function (img) {
              expect(img.width).to.equal(30)
              expect(img.height).to.equal(20)
              done()
            },
            { maxWidth: 20, maxHeight: 20, cover: true }
          )
        ).to.be.ok
      })
    })

    describe('image smoothing', function () {
      if (!browser.imageSmoothingEnabled) {
        return
      }

      it('imageSmoothingEnabled defaults to true', function (done) {
        expect(
          loadImage(
            blobGIF,
            function (img) {
              expect(img.width).to.equal(120)
              expect(
                img.getContext('2d')[browser.imageSmoothingEnabledKey]
              ).to.equal(true)
              done()
            },
            { minWidth: 120, canvas: true }
          )
        ).to.be.ok
      })

      it('Sets imageSmoothingEnabled to false', function (done) {
        expect(
          loadImage(
            blobGIF,
            function (img) {
              expect(img.width).to.equal(120)
              expect(
                img.getContext('2d')[browser.imageSmoothingEnabledKey]
              ).to.equal(false)
              done()
            },
            { minWidth: 120, canvas: true, imageSmoothingEnabled: false }
          )
        ).to.be.ok
      })

      if (browser.imageSmoothingQuality !== 'low') {
        return
      }

      it('imageSmoothingQuality defaults to "low"', function (done) {
        expect(
          loadImage(
            blobGIF,
            function (img) {
              expect(img.width).to.equal(120)
              expect(img.getContext('2d').imageSmoothingQuality).to.equal('low')
              done()
            },
            { minWidth: 120, canvas: true }
          )
        ).to.be.ok
      })

      it('Sets imageSmoothingQuality to "medium"', function (done) {
        expect(
          loadImage(
            blobGIF,
            function (img) {
              expect(img.width).to.equal(120)
              expect(img.getContext('2d').imageSmoothingQuality).to.equal(
                'medium'
              )
              done()
            },
            { minWidth: 120, canvas: true, imageSmoothingQuality: 'medium' }
          )
        ).to.be.ok
      })

      it('Sets imageSmoothingQuality to "high"', function (done) {
        expect(
          loadImage(
            blobGIF,
            function (img) {
              expect(img.width).to.equal(120)
              expect(img.getContext('2d').imageSmoothingQuality).to.equal(
                'high'
              )
              done()
            },
            { minWidth: 120, canvas: true, imageSmoothingQuality: 'high' }
          )
        ).to.be.ok
      })

      it('Ignores imageSmoothingQuality if imageSmoothingEnabled is false', function (done) {
        expect(
          loadImage(
            blobGIF,
            function (img) {
              expect(img.width).to.equal(120)
              expect(img.getContext('2d').imageSmoothingQuality).to.equal('low')
              done()
            },
            {
              minWidth: 120,
              canvas: true,
              imageSmoothingQuality: 'high',
              imageSmoothingEnabled: false
            }
          )
        ).to.be.ok
      })
    })
  })

  describe('Cropping', function () {
    it('Crop to same values for maxWidth and maxHeight', function (done) {
      expect(
        loadImage(
          blobGIF,
          function (img) {
            expect(img.width).to.equal(30)
            expect(img.height).to.equal(30)
            done()
          },
          { maxWidth: 30, maxHeight: 30, crop: true }
        )
      ).to.be.ok
    })

    it('Crop to different values for maxWidth and maxHeight', function (done) {
      expect(
        loadImage(
          blobGIF,
          function (img) {
            expect(img.width).to.equal(30)
            expect(img.height).to.equal(40)
            done()
          },
          { maxWidth: 30, maxHeight: 40, crop: true }
        )
      ).to.be.ok
    })

    it('Crop using the given sourceWidth/sourceHeight dimensions', function (done) {
      expect(
        loadImage(
          blobGIF,
          function (img) {
            expect(img.width).to.equal(30)
            expect(img.height).to.equal(30)
            done()
          },
          { sourceWidth: 30, sourceHeight: 30, crop: true }
        )
      ).to.be.ok
    })

    it('Crop using the given left/top coordinates', function (done) {
      expect(
        loadImage(
          blobGIF,
          function (img) {
            expect(img.width).to.equal(40)
            expect(img.height).to.equal(20)
            done()
          },
          { left: 20, top: 20, crop: true }
        )
      ).to.be.ok
    })

    it('Crop using the given right/bottom coordinates', function (done) {
      expect(
        loadImage(
          blobGIF,
          function (img) {
            expect(img.width).to.equal(40)
            expect(img.height).to.equal(20)
            done()
          },
          { right: 20, bottom: 20, crop: true }
        )
      ).to.be.ok
    })

    it('Crop using the given 2:1 aspectRatio', function (done) {
      expect(
        loadImage(
          blobGIF,
          function (img) {
            expect(img.width).to.equal(60)
            expect(img.height).to.equal(30)
            done()
          },
          { aspectRatio: 2 }
        )
      ).to.be.ok
    })

    it('Crop using the given 1:2 aspectRatio', function (done) {
      expect(
        loadImage(
          blobGIF,
          function (img) {
            expect(img.width).to.equal(20)
            expect(img.height).to.equal(40)
            done()
          },
          { aspectRatio: 1 / 2 }
        )
      ).to.be.ok
    })

    it('Crop using maxWidth/maxHeight and pixelRatio', function (done) {
      expect(
        loadImage(
          blobGIF,
          function (img) {
            expect(img.width).to.equal(80)
            expect(img.height).to.equal(80)
            expect(img.style.width).to.equal('40px')
            done()
          },
          { maxWidth: 40, maxHeight: 40, crop: true, pixelRatio: 2 }
        )
      ).to.be.ok
    })

    it('Crop using sourceWidth/sourceHeight and pixelRatio', function (done) {
      expect(
        loadImage(
          blobGIF,
          function (img) {
            expect(img.width).to.equal(80)
            expect(img.height).to.equal(80)
            expect(img.style.width).to.equal('40px')
            done()
          },
          { sourceWidth: 40, sourceHeight: 40, crop: true, pixelRatio: 2 }
        )
      ).to.be.ok
    })

    it('Crop using maxWidth/maxHeight and downsamplingRatio', function (done) {
      expect(
        loadImage(
          blobGIF,
          function (img) {
            expect(img.width).to.equal(10)
            expect(img.height).to.equal(10)
            done()
          },
          { maxWidth: 10, maxHeight: 10, crop: true, downsamplingRatio: 0.5 }
        )
      ).to.be.ok
    })
  })

  describe('Orientation', function () {
    describe('EXIF Orientation: undefined', function () {
      it('1: keep original', function (done) {
        expect(
          loadImage(
            blobGIF,
            function (img) {
              expect(img.width).to.equal(60)
              expect(img.height).to.equal(40)
              done()
            },
            { orientation: 1 }
          )
        ).to.be.ok
      })

      it('2: horizontal flip', function (done) {
        expect(
          loadImage(
            blobGIF,
            function (img) {
              expect(img.width).to.equal(60)
              expect(img.height).to.equal(40)
              done()
            },
            { orientation: 2 }
          )
        ).to.be.ok
      })

      it('3: 180° rotate left', function (done) {
        expect(
          loadImage(
            blobGIF,
            function (img) {
              expect(img.width).to.equal(60)
              expect(img.height).to.equal(40)
              done()
            },
            { orientation: 3 }
          )
        ).to.be.ok
      })

      it('4: vertical flip', function (done) {
        expect(
          loadImage(
            blobGIF,
            function (img) {
              expect(img.width).to.equal(60)
              expect(img.height).to.equal(40)
              done()
            },
            { orientation: 4 }
          )
        ).to.be.ok
      })

      it('5: vertical flip + 90° rotate right', function (done) {
        expect(
          loadImage(
            blobGIF,
            function (img) {
              expect(img.width).to.equal(40)
              expect(img.height).to.equal(60)
              done()
            },
            { orientation: 5 }
          )
        ).to.be.ok
      })

      it('6: 90° rotate right', function (done) {
        expect(
          loadImage(
            blobGIF,
            function (img) {
              expect(img.width).to.equal(40)
              expect(img.height).to.equal(60)
              done()
            },
            { orientation: 6 }
          )
        ).to.be.ok
      })

      it('7: horizontal flip + 90° rotate right', function (done) {
        expect(
          loadImage(
            blobGIF,
            function (img) {
              expect(img.width).to.equal(40)
              expect(img.height).to.equal(60)
              done()
            },
            { orientation: 7 }
          )
        ).to.be.ok
      })

      it('8: 90° rotate left', function (done) {
        expect(
          loadImage(
            blobGIF,
            function (img) {
              expect(img.width).to.equal(40)
              expect(img.height).to.equal(60)
              done()
            },
            { orientation: 8 }
          )
        ).to.be.ok
      })
      it('Adjust constraints to new coordinates', function (done) {
        expect(
          loadImage(
            blobGIF,
            function (img) {
              expect(img.width).to.equal(20)
              expect(img.height).to.equal(30)
              done()
            },
            { orientation: 6, maxWidth: 20, maxHeight: 30 }
          )
        ).to.be.ok
      })

      it('Rotate left with the given pixelRatio', function (done) {
        expect(
          loadImage(
            blobGIF,
            function (img) {
              expect(img.width).to.equal(80)
              expect(img.height).to.equal(120)
              expect(img.style.width).to.equal('40px')
              done()
            },
            { orientation: 8, pixelRatio: 2 }
          )
        ).to.be.ok
      })

      it('Rotate right with the given pixelRatio', function (done) {
        expect(
          loadImage(
            blobGIF,
            function (img) {
              expect(img.width).to.equal(80)
              expect(img.height).to.equal(120)
              expect(img.style.width).to.equal('40px')
              done()
            },
            { orientation: 6, pixelRatio: 2 }
          )
        ).to.be.ok
      })

      it('Ignore too small orientation value', function (done) {
        expect(
          loadImage(
            blobGIF,
            function (img) {
              expect(img.width).to.equal(60)
              expect(img.height).to.equal(40)
              done()
            },
            { orientation: -1 }
          )
        ).to.be.ok
      })

      it('Ignore too large orientation value', function (done) {
        expect(
          loadImage(
            blobGIF,
            function (img) {
              expect(img.width).to.equal(60)
              expect(img.height).to.equal(40)
              done()
            },
            { orientation: 9 }
          )
        ).to.be.ok
      })

      describe('Cropping', function () {
        it('1: keep original, right: 1, bottom: 1', function (done) {
          expect(
            loadImage(
              blobGIF2,
              function (img) {
                expect(img.width).to.equal(2)
                expect(img.height).to.equal(1)
                // Image data layout after orientation (B=black, F=white):
                // BF
                var imageData = img.getContext('2d').getImageData(0, 0, 2, 1)
                  .data
                // 0:0 opaque black
                expect(imageData[0]).to.equal(0)
                expect(imageData[1]).to.equal(0)
                expect(imageData[2]).to.equal(0)
                expect(imageData[3]).to.equal(255)
                // 1:0 opaque white
                expect(imageData[0 + 4]).to.equal(255)
                expect(imageData[1 + 4]).to.equal(255)
                expect(imageData[2 + 4]).to.equal(255)
                expect(imageData[3 + 4]).to.equal(255)
                done()
              },
              {
                orientation: 1,
                right: 1,
                bottom: 1,
                meta: true,
                canvas: true,
                imageSmoothingEnabled: false
              }
            )
          ).to.be.ok
        })

        it('2: horizontal flip, bottom: 1, left: 1', function (done) {
          expect(
            loadImage(
              blobGIF2,
              function (img) {
                expect(img.width).to.equal(2)
                expect(img.height).to.equal(1)
                if (!browser.exactImageData) {
                  done()
                  return
                }
                // Image data layout after orientation (B=black, F=white):
                // FB
                var imageData = img.getContext('2d').getImageData(0, 0, 2, 1)
                  .data
                // 0:0 opaque white
                expect(imageData[0]).to.equal(255)
                expect(imageData[1]).to.equal(255)
                expect(imageData[2]).to.equal(255)
                expect(imageData[3]).to.equal(255)
                // 1:0 opaque black
                expect(imageData[0 + 4]).to.equal(0)
                expect(imageData[1 + 4]).to.equal(0)
                expect(imageData[2 + 4]).to.equal(0)
                expect(imageData[3 + 4]).to.equal(255)
                done()
              },
              {
                orientation: 2,
                bottom: 1,
                left: 1,
                meta: true,
                canvas: true,
                imageSmoothingEnabled: false
              }
            )
          ).to.be.ok
        })

        it('3: 180° rotate left, top: 1, left: 1', function (done) {
          expect(
            loadImage(
              blobGIF2,
              function (img) {
                expect(img.width).to.equal(2)
                expect(img.height).to.equal(1)
                // Image data layout after orientation (B=black, F=white):
                // FB
                var imageData = img.getContext('2d').getImageData(0, 0, 2, 1)
                  .data
                // 0:0 opaque white
                expect(imageData[0]).to.equal(255)
                expect(imageData[1]).to.equal(255)
                expect(imageData[2]).to.equal(255)
                expect(imageData[3]).to.equal(255)
                // 1:0 opaque black
                expect(imageData[0 + 4]).to.equal(0)
                expect(imageData[1 + 4]).to.equal(0)
                expect(imageData[2 + 4]).to.equal(0)
                expect(imageData[3 + 4]).to.equal(255)
                done()
              },
              {
                orientation: 3,
                top: 1,
                left: 1,
                meta: true,
                canvas: true,
                imageSmoothingEnabled: false
              }
            )
          ).to.be.ok
        })

        it('4: vertical flip, top: 1, right: 1', function (done) {
          expect(
            loadImage(
              blobGIF2,
              function (img) {
                expect(img.width).to.equal(2)
                expect(img.height).to.equal(1)
                if (!browser.exactImageData) {
                  done()
                  return
                }
                // Image data layout after orientation (B=black, F=white):
                // BF
                var imageData = img.getContext('2d').getImageData(0, 0, 2, 1)
                  .data
                // 0:0 opaque black
                expect(imageData[0]).to.equal(0)
                expect(imageData[1]).to.equal(0)
                expect(imageData[2]).to.equal(0)
                expect(imageData[3]).to.equal(255)
                // 1:0 opaque white
                expect(imageData[0 + 4]).to.equal(255)
                expect(imageData[1 + 4]).to.equal(255)
                expect(imageData[2 + 4]).to.equal(255)
                expect(imageData[3 + 4]).to.equal(255)
                done()
              },
              {
                orientation: 4,
                top: 1,
                right: 1,
                meta: true,
                canvas: true,
                imageSmoothingEnabled: false
              }
            )
          ).to.be.ok
        })

        it('5: vertical flip + 90° rotate right, right: 1, bottom: 1', function (done) {
          expect(
            loadImage(
              blobGIF2,
              function (img) {
                expect(img.width).to.equal(1)
                expect(img.height).to.equal(2)
                if (!browser.exactImageData) {
                  done()
                  return
                }
                // Image data layout after orientation (B=black, F=white):
                // B
                // F
                var imageData = img.getContext('2d').getImageData(0, 0, 1, 2)
                  .data
                // 0:0 opaque black
                expect(imageData[0]).to.equal(0)
                expect(imageData[1]).to.equal(0)
                expect(imageData[2]).to.equal(0)
                expect(imageData[3]).to.equal(255)
                // 0:1 opaque white
                expect(imageData[0 + 4]).to.equal(255)
                expect(imageData[1 + 4]).to.equal(255)
                expect(imageData[2 + 4]).to.equal(255)
                expect(imageData[3 + 4]).to.equal(255)
                done()
              },
              {
                orientation: 5,
                right: 1,
                bottom: 1,
                meta: true,
                canvas: true,
                imageSmoothingEnabled: false
              }
            )
          ).to.be.ok
        })

        it('6: 90° rotate right, bottom: 1, left: 1', function (done) {
          expect(
            loadImage(
              blobGIF2,
              function (img) {
                expect(img.width).to.equal(1)
                expect(img.height).to.equal(2)
                // Image data layout after orientation (B=black, F=white):
                // B
                // F
                var imageData = img.getContext('2d').getImageData(0, 0, 1, 2)
                  .data
                // 0:0 opaque black
                expect(imageData[0]).to.equal(0)
                expect(imageData[1]).to.equal(0)
                expect(imageData[2]).to.equal(0)
                expect(imageData[3]).to.equal(255)
                // 0:1 opaque white
                expect(imageData[0 + 4]).to.equal(255)
                expect(imageData[1 + 4]).to.equal(255)
                expect(imageData[2 + 4]).to.equal(255)
                expect(imageData[3 + 4]).to.equal(255)
                done()
              },
              {
                orientation: 6,
                bottom: 1,
                left: 1,
                meta: true,
                canvas: true,
                imageSmoothingEnabled: false
              }
            )
          ).to.be.ok
        })

        it('7: horizontal flip + 90° rotate right, top: 1, left: 1', function (done) {
          expect(
            loadImage(
              blobGIF2,
              function (img) {
                expect(img.width).to.equal(1)
                expect(img.height).to.equal(2)
                if (!browser.exactImageData) {
                  done()
                  return
                }
                // Image data layout after orientation (B=black, F=white):
                // F
                // B
                var imageData = img.getContext('2d').getImageData(0, 0, 1, 2)
                  .data
                // 0:0 opaque white
                expect(imageData[0]).to.equal(255)
                expect(imageData[1]).to.equal(255)
                expect(imageData[2]).to.equal(255)
                expect(imageData[3]).to.equal(255)
                // 0:1 opaque black
                expect(imageData[0 + 4]).to.equal(0)
                expect(imageData[1 + 4]).to.equal(0)
                expect(imageData[2 + 4]).to.equal(0)
                expect(imageData[3 + 4]).to.equal(255)
                done()
              },
              {
                orientation: 7,
                top: 1,
                left: 1,
                meta: true,
                canvas: true,
                imageSmoothingEnabled: false
              }
            )
          ).to.be.ok
        })

        it('8: 90° rotate left, top: 1, right: 1', function (done) {
          expect(
            loadImage(
              blobGIF2,
              function (img) {
                expect(img.width).to.equal(1)
                expect(img.height).to.equal(2)
                // Image data layout after orientation (B=black, F=white):
                // F
                // B
                var imageData = img.getContext('2d').getImageData(0, 0, 1, 2)
                  .data
                // 0:0 opaque white
                expect(imageData[0]).to.equal(255)
                expect(imageData[1]).to.equal(255)
                expect(imageData[2]).to.equal(255)
                expect(imageData[3]).to.equal(255)
                // 0:1 opaque black
                expect(imageData[0 + 4]).to.equal(0)
                expect(imageData[1 + 4]).to.equal(0)
                expect(imageData[2 + 4]).to.equal(0)
                expect(imageData[3 + 4]).to.equal(255)
                done()
              },
              {
                orientation: 8,
                top: 1,
                right: 1,
                meta: true,
                canvas: true,
                imageSmoothingEnabled: false
              }
            )
          ).to.be.ok
        })
      })
    })

    describe('EXIF Orientation: 6', function () {
      it('1: keep original', function (done) {
        expect(
          loadImage(
            blobJPEG,
            function (img) {
              expect(img.width).to.equal(3)
              expect(img.height).to.equal(2)
              // Image data layout after orientation (B=black, F=white):
              // BFF
              // BBB
              var imageData = img.getContext('2d').getImageData(0, 0, 3, 2).data
              // 0:0 opaque black
              expect(imageData[0]).to.equal(0)
              expect(imageData[1]).to.equal(0)
              expect(imageData[2]).to.equal(0)
              expect(imageData[3]).to.equal(255)
              // 1:0 opaque white
              expect(imageData[0 + 4]).to.equal(255)
              expect(imageData[1 + 4]).to.equal(255)
              expect(imageData[2 + 4]).to.equal(255)
              expect(imageData[3 + 4]).to.equal(255)
              // 2:0 opaque white
              expect(imageData[0 + 8]).to.equal(255)
              expect(imageData[1 + 8]).to.equal(255)
              expect(imageData[2 + 8]).to.equal(255)
              expect(imageData[3 + 8]).to.equal(255)
              // 0:1 opaque black
              expect(imageData[0 + 12]).to.equal(0)
              expect(imageData[1 + 12]).to.equal(0)
              expect(imageData[2 + 12]).to.equal(0)
              expect(imageData[3 + 12]).to.equal(255)
              // 1:1 opaque black
              expect(imageData[0 + 16]).to.equal(0)
              expect(imageData[1 + 16]).to.equal(0)
              expect(imageData[2 + 16]).to.equal(0)
              expect(imageData[3 + 16]).to.equal(255)
              // 2:1 opaque black
              expect(imageData[0 + 20]).to.equal(0)
              expect(imageData[1 + 20]).to.equal(0)
              expect(imageData[2 + 20]).to.equal(0)
              expect(imageData[3 + 20]).to.equal(255)
              done()
            },
            {
              orientation: 1,
              meta: true,
              canvas: true,
              imageSmoothingEnabled: false
            }
          )
        ).to.be.ok
      })

      it('2: horizontal flip', function (done) {
        expect(
          loadImage(
            blobJPEG,
            function (img) {
              expect(img.width).to.equal(3)
              expect(img.height).to.equal(2)
              if (!browser.exactImageData) {
                done()
                return
              }
              // Image data layout after orientation (B=black, F=white):
              // FFB
              // BBB
              var imageData = img.getContext('2d').getImageData(0, 0, 3, 2).data
              // 0:0 opaque white
              expect(imageData[0]).to.equal(255)
              expect(imageData[1]).to.equal(255)
              expect(imageData[2]).to.equal(255)
              expect(imageData[3]).to.equal(255)
              // 1:0 opaque white
              expect(imageData[0 + 4]).to.equal(255)
              expect(imageData[1 + 4]).to.equal(255)
              expect(imageData[2 + 4]).to.equal(255)
              expect(imageData[3 + 4]).to.equal(255)
              // 2:0 opaque black
              expect(imageData[0 + 8]).to.equal(0)
              expect(imageData[1 + 8]).to.equal(0)
              expect(imageData[2 + 8]).to.equal(0)
              expect(imageData[3 + 8]).to.equal(255)
              // 0:1 opaque black
              expect(imageData[0 + 12]).to.equal(0)
              expect(imageData[1 + 12]).to.equal(0)
              expect(imageData[2 + 12]).to.equal(0)
              expect(imageData[3 + 12]).to.equal(255)
              // 1:1 opaque black
              expect(imageData[0 + 16]).to.equal(0)
              expect(imageData[1 + 16]).to.equal(0)
              expect(imageData[2 + 16]).to.equal(0)
              expect(imageData[3 + 16]).to.equal(255)
              // 2:1 opaque black
              expect(imageData[0 + 20]).to.equal(0)
              expect(imageData[1 + 20]).to.equal(0)
              expect(imageData[2 + 20]).to.equal(0)
              expect(imageData[3 + 20]).to.equal(255)
              done()
            },
            {
              orientation: 2,
              meta: true,
              canvas: true,
              imageSmoothingEnabled: false
            }
          )
        ).to.be.ok
      })

      it('3: 180° rotate left', function (done) {
        expect(
          loadImage(
            blobJPEG,
            function (img) {
              expect(img.width).to.equal(3)
              expect(img.height).to.equal(2)
              // Image data layout after orientation (B=black, F=white):
              // BBB
              // FFB
              var imageData = img.getContext('2d').getImageData(0, 0, 3, 2).data
              // 0:0 opaque black
              expect(imageData[0]).to.equal(0)
              expect(imageData[1]).to.equal(0)
              expect(imageData[2]).to.equal(0)
              expect(imageData[3]).to.equal(255)
              // 1:0 opaque black
              expect(imageData[0 + 4]).to.equal(0)
              expect(imageData[1 + 4]).to.equal(0)
              expect(imageData[2 + 4]).to.equal(0)
              expect(imageData[3 + 4]).to.equal(255)
              // 2:0 opaque black
              expect(imageData[0 + 8]).to.equal(0)
              expect(imageData[1 + 8]).to.equal(0)
              expect(imageData[2 + 8]).to.equal(0)
              expect(imageData[3 + 8]).to.equal(255)
              // 0:1 opaque white
              expect(imageData[0 + 12]).to.equal(255)
              expect(imageData[1 + 12]).to.equal(255)
              expect(imageData[2 + 12]).to.equal(255)
              expect(imageData[3 + 12]).to.equal(255)
              // 1:1 opaque white
              expect(imageData[0 + 16]).to.equal(255)
              expect(imageData[1 + 16]).to.equal(255)
              expect(imageData[2 + 16]).to.equal(255)
              expect(imageData[3 + 16]).to.equal(255)
              // 2:1 opaque black
              expect(imageData[0 + 20]).to.equal(0)
              expect(imageData[1 + 20]).to.equal(0)
              expect(imageData[2 + 20]).to.equal(0)
              expect(imageData[3 + 20]).to.equal(255)
              done()
            },
            {
              orientation: 3,
              meta: true,
              canvas: true,
              imageSmoothingEnabled: false
            }
          )
        ).to.be.ok
      })

      it('4: vertical flip', function (done) {
        expect(
          loadImage(
            blobJPEG,
            function (img) {
              expect(img.width).to.equal(3)
              expect(img.height).to.equal(2)
              if (!browser.exactImageData) {
                done()
                return
              }
              // Image data layout after orientation (B=black, F=white):
              // BBB
              // BFF
              var imageData = img.getContext('2d').getImageData(0, 0, 3, 2).data
              // 0:0 opaque black
              expect(imageData[0]).to.equal(0)
              expect(imageData[1]).to.equal(0)
              expect(imageData[2]).to.equal(0)
              expect(imageData[3]).to.equal(255)
              // 1:0 opaque black
              expect(imageData[0 + 4]).to.equal(0)
              expect(imageData[1 + 4]).to.equal(0)
              expect(imageData[2 + 4]).to.equal(0)
              expect(imageData[3 + 4]).to.equal(255)
              // 2:0 opaque black
              expect(imageData[0 + 8]).to.equal(0)
              expect(imageData[1 + 8]).to.equal(0)
              expect(imageData[2 + 8]).to.equal(0)
              expect(imageData[3 + 8]).to.equal(255)
              // 0:1 opaque black
              expect(imageData[0 + 12]).to.equal(0)
              expect(imageData[1 + 12]).to.equal(0)
              expect(imageData[2 + 12]).to.equal(0)
              expect(imageData[3 + 12]).to.equal(255)
              // 1:1 opaque white
              expect(imageData[0 + 16]).to.equal(255)
              expect(imageData[1 + 16]).to.equal(255)
              expect(imageData[2 + 16]).to.equal(255)
              expect(imageData[3 + 16]).to.equal(255)
              // 2:1 opaque white
              expect(imageData[0 + 20]).to.equal(255)
              expect(imageData[1 + 20]).to.equal(255)
              expect(imageData[2 + 20]).to.equal(255)
              expect(imageData[3 + 20]).to.equal(255)
              done()
            },
            {
              orientation: 4,
              meta: true,
              canvas: true,
              imageSmoothingEnabled: false
            }
          )
        ).to.be.ok
      })

      it('5: vertical flip + 90° rotate right', function (done) {
        expect(
          loadImage(
            blobJPEG,
            function (img) {
              expect(img.width).to.equal(2)
              expect(img.height).to.equal(3)
              if (!browser.exactImageData) {
                done()
                return
              }
              // Image data layout after orientation (B=black, F=white):
              // BB
              // FB
              // FB
              var imageData = img.getContext('2d').getImageData(0, 0, 2, 3).data
              // 0:0 opaque black
              expect(imageData[0]).to.equal(0)
              expect(imageData[1]).to.equal(0)
              expect(imageData[2]).to.equal(0)
              expect(imageData[3]).to.equal(255)
              // 1:0 opaque black
              expect(imageData[0 + 4]).to.equal(0)
              expect(imageData[1 + 4]).to.equal(0)
              expect(imageData[2 + 4]).to.equal(0)
              expect(imageData[3 + 4]).to.equal(255)
              // 0:1 opaque white
              expect(imageData[0 + 8]).to.equal(255)
              expect(imageData[1 + 8]).to.equal(255)
              expect(imageData[2 + 8]).to.equal(255)
              expect(imageData[3 + 8]).to.equal(255)
              // 1:1 opaque black
              expect(imageData[0 + 12]).to.equal(0)
              expect(imageData[1 + 12]).to.equal(0)
              expect(imageData[2 + 12]).to.equal(0)
              expect(imageData[3 + 12]).to.equal(255)
              // 0:2 opaque white
              expect(imageData[0 + 16]).to.equal(255)
              expect(imageData[1 + 16]).to.equal(255)
              expect(imageData[2 + 16]).to.equal(255)
              expect(imageData[3 + 16]).to.equal(255)
              // 1:2 opaque black
              expect(imageData[0 + 20]).to.equal(0)
              expect(imageData[1 + 20]).to.equal(0)
              expect(imageData[2 + 20]).to.equal(0)
              expect(imageData[3 + 20]).to.equal(255)
              done()
            },
            {
              orientation: 5,
              meta: true,
              canvas: true,
              imageSmoothingEnabled: false
            }
          )
        ).to.be.ok
      })

      it('6: 90° rotate right', function (done) {
        expect(
          loadImage(
            blobJPEG,
            function (img) {
              expect(img.width).to.equal(2)
              expect(img.height).to.equal(3)
              // Image data layout after orientation (B=black, F=white):
              // BB
              // BF
              // BF
              var imageData = img.getContext('2d').getImageData(0, 0, 2, 3).data
              // 0:0 opaque black
              expect(imageData[0]).to.equal(0)
              expect(imageData[1]).to.equal(0)
              expect(imageData[2]).to.equal(0)
              expect(imageData[3]).to.equal(255)
              // 1:0 opaque black
              expect(imageData[0 + 4]).to.equal(0)
              expect(imageData[1 + 4]).to.equal(0)
              expect(imageData[2 + 4]).to.equal(0)
              expect(imageData[3 + 4]).to.equal(255)
              // 0:1 opaque black
              expect(imageData[0 + 8]).to.equal(0)
              expect(imageData[1 + 8]).to.equal(0)
              expect(imageData[2 + 8]).to.equal(0)
              expect(imageData[3 + 8]).to.equal(255)
              // 1:1 opaque white
              expect(imageData[0 + 12]).to.equal(255)
              expect(imageData[1 + 12]).to.equal(255)
              expect(imageData[2 + 12]).to.equal(255)
              expect(imageData[3 + 12]).to.equal(255)
              // 0:2 opaque black
              expect(imageData[0 + 16]).to.equal(0)
              expect(imageData[1 + 16]).to.equal(0)
              expect(imageData[2 + 16]).to.equal(0)
              expect(imageData[3 + 16]).to.equal(255)
              // 1:2 opaque white
              expect(imageData[0 + 20]).to.equal(255)
              expect(imageData[1 + 20]).to.equal(255)
              expect(imageData[2 + 20]).to.equal(255)
              expect(imageData[3 + 20]).to.equal(255)
              done()
            },
            {
              orientation: 6,
              meta: true,
              canvas: true,
              imageSmoothingEnabled: false
            }
          )
        ).to.be.ok
      })

      it('7: horizontal flip + 90° rotate right', function (done) {
        expect(
          loadImage(
            blobJPEG,
            function (img) {
              expect(img.width).to.equal(2)
              expect(img.height).to.equal(3)
              if (!browser.exactImageData) {
                done()
                return
              }
              // Image data layout after orientation (B=black, F=white):
              // BF
              // BF
              // BB
              var imageData = img.getContext('2d').getImageData(0, 0, 2, 3).data
              // 0:0 opaque black
              expect(imageData[0]).to.equal(0)
              expect(imageData[1]).to.equal(0)
              expect(imageData[2]).to.equal(0)
              expect(imageData[3]).to.equal(255)
              // 1:0 opaque white
              expect(imageData[0 + 4]).to.equal(255)
              expect(imageData[1 + 4]).to.equal(255)
              expect(imageData[2 + 4]).to.equal(255)
              expect(imageData[3 + 4]).to.equal(255)
              // 0:1 opaque black
              expect(imageData[0 + 8]).to.equal(0)
              expect(imageData[1 + 8]).to.equal(0)
              expect(imageData[2 + 8]).to.equal(0)
              expect(imageData[3 + 8]).to.equal(255)
              // 1:1 opaque white
              expect(imageData[0 + 12]).to.equal(255)
              expect(imageData[1 + 12]).to.equal(255)
              expect(imageData[2 + 12]).to.equal(255)
              expect(imageData[3 + 12]).to.equal(255)
              // 0:2 opaque black
              expect(imageData[0 + 16]).to.equal(0)
              expect(imageData[1 + 16]).to.equal(0)
              expect(imageData[2 + 16]).to.equal(0)
              expect(imageData[3 + 16]).to.equal(255)
              // 1:2 opaque black
              expect(imageData[0 + 20]).to.equal(0)
              expect(imageData[1 + 20]).to.equal(0)
              expect(imageData[2 + 20]).to.equal(0)
              expect(imageData[3 + 20]).to.equal(255)
              done()
            },
            {
              orientation: 7,
              meta: true,
              canvas: true,
              imageSmoothingEnabled: false
            }
          )
        ).to.be.ok
      })

      it('8: 90° rotate left', function (done) {
        expect(
          loadImage(
            blobJPEG,
            function (img) {
              expect(img.width).to.equal(2)
              expect(img.height).to.equal(3)
              // Image data layout after orientation (B=black, F=white):
              // FB
              // FB
              // BB
              var imageData = img.getContext('2d').getImageData(0, 0, 2, 3).data
              // 0:0 opaque white
              expect(imageData[0]).to.equal(255)
              expect(imageData[1]).to.equal(255)
              expect(imageData[2]).to.equal(255)
              expect(imageData[3]).to.equal(255)
              // 1:0 opaque black
              expect(imageData[0 + 4]).to.equal(0)
              expect(imageData[1 + 4]).to.equal(0)
              expect(imageData[2 + 4]).to.equal(0)
              expect(imageData[3 + 4]).to.equal(255)
              // 0:1 opaque white
              expect(imageData[0 + 8]).to.equal(255)
              expect(imageData[1 + 8]).to.equal(255)
              expect(imageData[2 + 8]).to.equal(255)
              expect(imageData[3 + 8]).to.equal(255)
              // 1:1 opaque black
              expect(imageData[0 + 12]).to.equal(0)
              expect(imageData[1 + 12]).to.equal(0)
              expect(imageData[2 + 12]).to.equal(0)
              expect(imageData[3 + 12]).to.equal(255)
              // 0:2 opaque black
              expect(imageData[0 + 16]).to.equal(0)
              expect(imageData[1 + 16]).to.equal(0)
              expect(imageData[2 + 16]).to.equal(0)
              expect(imageData[3 + 16]).to.equal(255)
              // 1:2 opaque black
              expect(imageData[0 + 20]).to.equal(0)
              expect(imageData[1 + 20]).to.equal(0)
              expect(imageData[2 + 20]).to.equal(0)
              expect(imageData[3 + 20]).to.equal(255)
              done()
            },
            {
              orientation: 8,
              meta: true,
              canvas: true,
              imageSmoothingEnabled: false
            }
          )
        ).to.be.ok
      })

      it('true: follow EXIF Orientation value', function (done) {
        expect(
          loadImage(
            blobJPEG,
            function (img) {
              expect(img.width).to.equal(2)
              expect(img.height).to.equal(3)
              // Image data layout after orientation (B=black, F=white):
              // BB
              // BF
              // BF
              var imageData = img.getContext('2d').getImageData(0, 0, 2, 3).data
              // 0:0 opaque black
              expect(imageData[0]).to.equal(0)
              expect(imageData[1]).to.equal(0)
              expect(imageData[2]).to.equal(0)
              expect(imageData[3]).to.equal(255)
              // 1:0 opaque black
              expect(imageData[0 + 4]).to.equal(0)
              expect(imageData[1 + 4]).to.equal(0)
              expect(imageData[2 + 4]).to.equal(0)
              expect(imageData[3 + 4]).to.equal(255)
              // 0:1 opaque black
              expect(imageData[0 + 8]).to.equal(0)
              expect(imageData[1 + 8]).to.equal(0)
              expect(imageData[2 + 8]).to.equal(0)
              expect(imageData[3 + 8]).to.equal(255)
              // 1:1 opaque white
              expect(imageData[0 + 12]).to.equal(255)
              expect(imageData[1 + 12]).to.equal(255)
              expect(imageData[2 + 12]).to.equal(255)
              expect(imageData[3 + 12]).to.equal(255)
              // 0:2 opaque black
              expect(imageData[0 + 16]).to.equal(0)
              expect(imageData[1 + 16]).to.equal(0)
              expect(imageData[2 + 16]).to.equal(0)
              expect(imageData[3 + 16]).to.equal(255)
              // 1:2 opaque white
              expect(imageData[0 + 20]).to.equal(255)
              expect(imageData[1 + 20]).to.equal(255)
              expect(imageData[2 + 20]).to.equal(255)
              expect(imageData[3 + 20]).to.equal(255)
              done()
            },
            {
              orientation: true,
              meta: true,
              canvas: true,
              imageSmoothingEnabled: false
            }
          )
        ).to.be.ok
      })

      it('Only use EXIF data and canvas if necessary', function (done) {
        expect(
          loadImage(
            blobJPEG,
            function (img, data) {
              expect(img.width).to.equal(2)
              expect(img.height).to.equal(3)
              expect(data).to.be.ok
              if (loadImage.orientation) {
                expect(data.exif).to.be.undefined
                expect(img.getContext).to.be.undefined
              } else {
                expect(img.getContext).to.be.an.instanceOf(Function)
                expect(data.exif).to.be.ok
                expect(data.exif.get('Orientation')).to.equal(6)
              }
              done()
            },
            { orientation: true }
          )
        ).to.be.ok
      })

      it('Scale image after EXIF based orientation', function (done) {
        expect(
          loadImage(
            blobJPEG,
            function (img) {
              expect(img.width).to.equal(20)
              expect(img.height).to.equal(30)
              done()
            },
            { orientation: true, minWidth: 20, minHeight: 30 }
          )
        ).to.be.ok
      })

      it('Provide original image width+height from before orientation', function (done) {
        expect(
          loadImage(
            blobJPEG,
            function (img, data) {
              expect(data.originalWidth).to.equal(3)
              expect(data.originalHeight).to.equal(2)
              done()
            },
            { meta: true, minWidth: 20, minHeight: 30 }
          )
        ).to.be.ok
      })

      describe('Cropping', function () {
        it('1: keep original, right: 1, bottom: 1', function (done) {
          expect(
            loadImage(
              blobJPEG,
              function (img) {
                expect(img.width).to.equal(2)
                expect(img.height).to.equal(1)
                // Image data layout after orientation (B=black, F=white):
                // BF
                var imageData = img.getContext('2d').getImageData(0, 0, 2, 1)
                  .data
                // 0:0 opaque black
                expect(imageData[0]).to.equal(0)
                expect(imageData[1]).to.equal(0)
                expect(imageData[2]).to.equal(0)
                expect(imageData[3]).to.equal(255)
                // 1:0 opaque white
                expect(imageData[0 + 4]).to.equal(255)
                expect(imageData[1 + 4]).to.equal(255)
                expect(imageData[2 + 4]).to.equal(255)
                expect(imageData[3 + 4]).to.equal(255)
                done()
              },
              {
                orientation: 1,
                right: 1,
                bottom: 1,
                meta: true,
                canvas: true,
                imageSmoothingEnabled: false
              }
            )
          ).to.be.ok
        })

        it('2: horizontal flip, bottom: 1, left: 1', function (done) {
          expect(
            loadImage(
              blobJPEG,
              function (img) {
                expect(img.width).to.equal(2)
                expect(img.height).to.equal(1)
                if (!browser.exactImageData) {
                  done()
                  return
                }
                // Image data layout after orientation (B=black, F=white):
                // FB
                var imageData = img.getContext('2d').getImageData(0, 0, 2, 1)
                  .data
                // 0:0 opaque white
                expect(imageData[0]).to.equal(255)
                expect(imageData[1]).to.equal(255)
                expect(imageData[2]).to.equal(255)
                expect(imageData[3]).to.equal(255)
                // 1:0 opaque black
                expect(imageData[0 + 4]).to.equal(0)
                expect(imageData[1 + 4]).to.equal(0)
                expect(imageData[2 + 4]).to.equal(0)
                expect(imageData[3 + 4]).to.equal(255)
                done()
              },
              {
                orientation: 2,
                bottom: 1,
                left: 1,
                meta: true,
                canvas: true,
                imageSmoothingEnabled: false
              }
            )
          ).to.be.ok
        })

        it('3: 180° rotate left, top: 1, left: 1', function (done) {
          expect(
            loadImage(
              blobJPEG,
              function (img) {
                expect(img.width).to.equal(2)
                expect(img.height).to.equal(1)
                // Image data layout after orientation (B=black, F=white):
                // FB
                var imageData = img.getContext('2d').getImageData(0, 0, 2, 1)
                  .data
                // 0:0 opaque white
                expect(imageData[0]).to.equal(255)
                expect(imageData[1]).to.equal(255)
                expect(imageData[2]).to.equal(255)
                expect(imageData[3]).to.equal(255)
                // 1:0 opaque black
                expect(imageData[0 + 4]).to.equal(0)
                expect(imageData[1 + 4]).to.equal(0)
                expect(imageData[2 + 4]).to.equal(0)
                expect(imageData[3 + 4]).to.equal(255)
                done()
              },
              {
                orientation: 3,
                top: 1,
                left: 1,
                meta: true,
                canvas: true,
                imageSmoothingEnabled: false
              }
            )
          ).to.be.ok
        })

        it('4: vertical flip, top: 1, right: 1', function (done) {
          expect(
            loadImage(
              blobJPEG,
              function (img) {
                expect(img.width).to.equal(2)
                expect(img.height).to.equal(1)
                if (!browser.exactImageData) {
                  done()
                  return
                }
                // Image data layout after orientation (B=black, F=white):
                // BF
                var imageData = img.getContext('2d').getImageData(0, 0, 2, 1)
                  .data
                // 0:0 opaque black
                expect(imageData[0]).to.equal(0)
                expect(imageData[1]).to.equal(0)
                expect(imageData[2]).to.equal(0)
                expect(imageData[3]).to.equal(255)
                // 1:0 opaque white
                expect(imageData[0 + 4]).to.equal(255)
                expect(imageData[1 + 4]).to.equal(255)
                expect(imageData[2 + 4]).to.equal(255)
                expect(imageData[3 + 4]).to.equal(255)
                done()
              },
              {
                orientation: 4,
                top: 1,
                right: 1,
                meta: true,
                canvas: true,
                imageSmoothingEnabled: false
              }
            )
          ).to.be.ok
        })

        it('5: vertical flip + 90° rotate right, right: 1, bottom: 1', function (done) {
          expect(
            loadImage(
              blobJPEG,
              function (img) {
                expect(img.width).to.equal(1)
                expect(img.height).to.equal(2)
                if (!browser.exactImageData) {
                  done()
                  return
                }
                // Image data layout after orientation (B=black, F=white):
                // B
                // F
                var imageData = img.getContext('2d').getImageData(0, 0, 1, 2)
                  .data
                // 0:0 opaque black
                expect(imageData[0]).to.equal(0)
                expect(imageData[1]).to.equal(0)
                expect(imageData[2]).to.equal(0)
                expect(imageData[3]).to.equal(255)
                // 0:1 opaque white
                expect(imageData[0 + 4]).to.equal(255)
                expect(imageData[1 + 4]).to.equal(255)
                expect(imageData[2 + 4]).to.equal(255)
                expect(imageData[3 + 4]).to.equal(255)
                done()
              },
              {
                orientation: 5,
                right: 1,
                bottom: 1,
                meta: true,
                canvas: true,
                imageSmoothingEnabled: false
              }
            )
          ).to.be.ok
        })

        it('6: 90° rotate right, bottom: 1, left: 1', function (done) {
          expect(
            loadImage(
              blobJPEG,
              function (img) {
                expect(img.width).to.equal(1)
                expect(img.height).to.equal(2)
                // Image data layout after orientation (B=black, F=white):
                // B
                // F
                var imageData = img.getContext('2d').getImageData(0, 0, 1, 2)
                  .data
                // 0:0 opaque black
                expect(imageData[0]).to.equal(0)
                expect(imageData[1]).to.equal(0)
                expect(imageData[2]).to.equal(0)
                expect(imageData[3]).to.equal(255)
                // 0:1 opaque white
                expect(imageData[0 + 4]).to.equal(255)
                expect(imageData[1 + 4]).to.equal(255)
                expect(imageData[2 + 4]).to.equal(255)
                expect(imageData[3 + 4]).to.equal(255)
                done()
              },
              {
                orientation: 6,
                bottom: 1,
                left: 1,
                meta: true,
                canvas: true,
                imageSmoothingEnabled: false
              }
            )
          ).to.be.ok
        })

        it('7: horizontal flip + 90° rotate right, top: 1, left: 1', function (done) {
          expect(
            loadImage(
              blobJPEG,
              function (img) {
                expect(img.width).to.equal(1)
                expect(img.height).to.equal(2)
                if (!browser.exactImageData) {
                  done()
                  return
                }
                // Image data layout after orientation (B=black, F=white):
                // F
                // B
                var imageData = img.getContext('2d').getImageData(0, 0, 1, 2)
                  .data
                // 0:0 opaque white
                expect(imageData[0]).to.equal(255)
                expect(imageData[1]).to.equal(255)
                expect(imageData[2]).to.equal(255)
                expect(imageData[3]).to.equal(255)
                // 0:1 opaque black
                expect(imageData[0 + 4]).to.equal(0)
                expect(imageData[1 + 4]).to.equal(0)
                expect(imageData[2 + 4]).to.equal(0)
                expect(imageData[3 + 4]).to.equal(255)
                done()
              },
              {
                orientation: 7,
                top: 1,
                left: 1,
                meta: true,
                canvas: true,
                imageSmoothingEnabled: false
              }
            )
          ).to.be.ok
        })

        it('8: 90° rotate left, top: 1, right: 1', function (done) {
          expect(
            loadImage(
              blobJPEG,
              function (img) {
                expect(img.width).to.equal(1)
                expect(img.height).to.equal(2)
                // Image data layout after orientation (B=black, F=white):
                // F
                // B
                var imageData = img.getContext('2d').getImageData(0, 0, 1, 2)
                  .data
                // 0:0 opaque white
                expect(imageData[0]).to.equal(255)
                expect(imageData[1]).to.equal(255)
                expect(imageData[2]).to.equal(255)
                expect(imageData[3]).to.equal(255)
                // 0:1 opaque black
                expect(imageData[0 + 4]).to.equal(0)
                expect(imageData[1 + 4]).to.equal(0)
                expect(imageData[2 + 4]).to.equal(0)
                expect(imageData[3 + 4]).to.equal(255)
                done()
              },
              {
                orientation: 8,
                top: 1,
                right: 1,
                meta: true,
                canvas: true,
                imageSmoothingEnabled: false
              }
            )
          ).to.be.ok
        })

        it('true: follow EXIF Orientation value, bottom: 1, left: 1', function (done) {
          expect(
            loadImage(
              blobJPEG,
              function (img) {
                expect(img.width).to.equal(1)
                expect(img.height).to.equal(2)
                // Image data layout after orientation (B=black, F=white):
                // B
                // F
                var imageData = img.getContext('2d').getImageData(0, 0, 1, 2)
                  .data
                // 0:0 opaque black
                expect(imageData[0]).to.equal(0)
                expect(imageData[1]).to.equal(0)
                expect(imageData[2]).to.equal(0)
                expect(imageData[3]).to.equal(255)
                // 0:1 opaque white
                expect(imageData[0 + 4]).to.equal(255)
                expect(imageData[1 + 4]).to.equal(255)
                expect(imageData[2 + 4]).to.equal(255)
                expect(imageData[3 + 4]).to.equal(255)
                done()
              },
              {
                orientation: true,
                left: 1,
                bottom: 1,
                meta: true,
                canvas: true,
                imageSmoothingEnabled: false
              }
            )
          ).to.be.ok
        })

        it('true: follow EXIF Orientation value, top: 1, left: 1', function (done) {
          expect(
            loadImage(
              blobJPEG,
              function (img) {
                expect(img.width).to.equal(1)
                expect(img.height).to.equal(2)
                // Image data layout after orientation (B=black, F=white):
                // F
                // F
                var imageData = img.getContext('2d').getImageData(0, 0, 1, 2)
                  .data
                // 0:0 opaque black
                expect(imageData[0]).to.equal(255)
                expect(imageData[1]).to.equal(255)
                expect(imageData[2]).to.equal(255)
                expect(imageData[3]).to.equal(255)
                // 0:1 opaque black
                expect(imageData[0 + 4]).to.equal(255)
                expect(imageData[1 + 4]).to.equal(255)
                expect(imageData[2 + 4]).to.equal(255)
                expect(imageData[3 + 4]).to.equal(255)
                done()
              },
              {
                orientation: true,
                top: 1,
                left: 1,
                meta: true,
                canvas: true,
                imageSmoothingEnabled: false
              }
            )
          ).to.be.ok
        })

        it('true: follow EXIF Orientation value, top: 1, right: 1', function (done) {
          expect(
            loadImage(
              blobJPEG,
              function (img) {
                expect(img.width).to.equal(1)
                expect(img.height).to.equal(2)
                // Image data layout after orientation (B=black, F=white):
                // B
                // B
                var imageData = img.getContext('2d').getImageData(0, 0, 1, 2)
                  .data
                // 0:0 opaque black
                expect(imageData[0]).to.equal(0)
                expect(imageData[1]).to.equal(0)
                expect(imageData[2]).to.equal(0)
                expect(imageData[3]).to.equal(255)
                // 0:1 opaque black
                expect(imageData[0 + 4]).to.equal(0)
                expect(imageData[1 + 4]).to.equal(0)
                expect(imageData[2 + 4]).to.equal(0)
                expect(imageData[3 + 4]).to.equal(255)
                done()
              },
              {
                orientation: true,
                top: 1,
                right: 1,
                meta: true,
                canvas: true,
                imageSmoothingEnabled: false
              }
            )
          ).to.be.ok
        })

        it('true: follow EXIF Orientation value, right: 1, bottom: 1', function (done) {
          expect(
            loadImage(
              blobJPEG,
              function (img) {
                expect(img.width).to.equal(1)
                expect(img.height).to.equal(2)
                // Image data layout after orientation (B=black, F=white):
                // B
                // B
                var imageData = img.getContext('2d').getImageData(0, 0, 1, 2)
                  .data
                // 0:0 opaque black
                expect(imageData[0]).to.equal(0)
                expect(imageData[1]).to.equal(0)
                expect(imageData[2]).to.equal(0)
                expect(imageData[3]).to.equal(255)
                // 0:1 opaque black
                expect(imageData[0 + 4]).to.equal(0)
                expect(imageData[1 + 4]).to.equal(0)
                expect(imageData[2 + 4]).to.equal(0)
                expect(imageData[3 + 4]).to.equal(255)
                done()
              },
              {
                orientation: true,
                right: 1,
                bottom: 1,
                meta: true,
                canvas: true,
                imageSmoothingEnabled: false
              }
            )
          ).to.be.ok
        })
      })
    })
  })

  describe('Metadata', function () {
    if (!window.DataView || !loadImage.blobSlice) return

    it('Parse EXIF tags', function (done) {
      loadImage.parseMetaData(blobJPEG, function (data) {
        expect(data.exif).to.be.ok
        expect(data.exif.get('Orientation')).to.equal(6)
        done()
      })
    })

    it('Do not parse EXIF tags if disabled', function (done) {
      loadImage.parseMetaData(
        blobJPEG,
        function (data) {
          expect(data.exif).to.be.undefined
          done()
        },
        { disableExif: true }
      )
    })

    it('Parse EXIF tag offsets', function (done) {
      loadImage.parseMetaData(blobJPEG, function (data) {
        expect(data.exifOffsets).to.be.ok
        expect(data.exifOffsets.get('Orientation')).to.equal(0x16)
        expect(data.exifTiffOffset).to.equal(0xc)
        expect(data.exifLittleEndian).to.equal(false)
        done()
      })
    })

    it('Do not parse EXIF tag offsets if disabled', function (done) {
      loadImage.parseMetaData(
        blobJPEG,
        function (data) {
          expect(data.exifOffsets).to.be.undefined
          done()
        },
        { disableExifOffsets: true }
      )
    })

    it('Only parse included EXIF tags', function (done) {
      loadImage.parseMetaData(
        blobJPEG,
        function (data) {
          expect(data.exif).to.be.ok
          expect(data.exif.get('Orientation')).to.equal(6)
          loadImage.parseMetaData(
            blobJPEG,
            function (data) {
              expect(data.exif).to.be.ok
              expect(data.exif.get('Orientation')).to.be.undefined
              done()
            },
            { includeExifTags: { 0x0132: true } } // DateTime
          )
        },
        { includeExifTags: { 0x0112: true } } // Orientation
      )
    })

    it('Do not parse excluded EXIF tags', function (done) {
      loadImage.parseMetaData(
        blobJPEG,
        function (data) {
          expect(data.exif).to.be.ok
          expect(data.exif.get('Orientation')).to.equal(6)
          loadImage.parseMetaData(
            blobJPEG,
            function (data) {
              expect(data.exif).to.be.ok
              expect(data.exif.get('Orientation')).to.be.undefined
              done()
            },
            { excludeExifTags: { 0x0112: true } } // Orientation
          )
        },
        { excludeExifTags: { 0x0132: true } } // DateTime
      )
    })

    it('Parse IPTC tags', function (done) {
      loadImage.parseMetaData(blobJPEG, function (data) {
        expect(data.iptc).to.be.ok
        expect(data.iptc.get('ObjectName')).to.equal('blueimp.net')
        done()
      })
    })

    it('Do not parse IPTC tags if disabled', function (done) {
      loadImage.parseMetaData(
        blobJPEG,
        function (data) {
          expect(data.iptc).to.be.undefined
          done()
        },
        { disableIptc: true }
      )
    })

    it('Parse IPTC tag offsets', function (done) {
      loadImage.parseMetaData(blobJPEG, function (data) {
        expect(data.iptcOffsets).to.be.ok
        expect(data.iptcOffsets.get('ObjectName')).to.equal(0x44)
        done()
      })
    })

    it('Do not parse IPTC tag offsets if disabled', function (done) {
      loadImage.parseMetaData(
        blobJPEG,
        function (data) {
          expect(data.iptcOffsets).to.be.undefined
          done()
        },
        { disableIptcOffsets: true }
      )
    })

    it('Only parse included IPTC tags', function (done) {
      loadImage.parseMetaData(
        blobJPEG,
        function (data) {
          expect(data.iptc).to.be.ok
          expect(data.iptc.get('ApplicationRecordVersion')).to.be.undefined
          expect(data.iptc.get('ObjectName')).to.equal('blueimp.net')
          loadImage.parseMetaData(
            blobJPEG,
            function (data) {
              expect(data.iptc).to.be.ok
              expect(data.iptc.get('ApplicationRecordVersion')).to.equal(4)
              expect(data.iptc.get('ObjectName')).to.be.undefined
              done()
            },
            { includeIptcTags: { 0: true } } // ApplicationRecordVersion
          )
        },
        { includeIptcTags: { 5: true } } // ObjectName
      )
    })

    it('Do not parse excluded IPTC tags', function (done) {
      loadImage.parseMetaData(
        blobJPEG,
        function (data) {
          expect(data.iptc).to.be.ok
          expect(data.iptc.get('ApplicationRecordVersion')).to.equal(4)
          expect(data.iptc.get('ObjectName')).to.be.undefined
          loadImage.parseMetaData(
            blobJPEG,
            function (data) {
              expect(data.iptc).to.be.ok
              expect(data.iptc.get('ApplicationRecordVersion')).to.be.undefined
              expect(data.iptc.get('ObjectName')).to.equal('blueimp.net')
              done()
            },
            { excludeIptcTags: { 0: true } } // Orientation
          )
        },
        { excludeIptcTags: { 5: true } } // DateTime
      )
    })

    it('Parse the complete image head', function (done) {
      loadImage.parseMetaData(blobJPEG, function (data) {
        expect(data.imageHead).to.be.ok
        loadImage.parseMetaData(
          createBlob(data.imageHead, 'image/jpeg'),
          function (data) {
            expect(data.exif).to.be.ok
            expect(data.exif.get('Orientation')).to.equal(6)
            done()
          }
        )
      })
    })

    it('Do not parse the complete image head if disabled', function (done) {
      loadImage.parseMetaData(
        blobJPEG,
        function (data) {
          expect(data.imageHead).to.be.undefined
          done()
        },
        { disableImageHead: true }
      )
    })

    it('Parse metadata automatically', function (done) {
      expect(
        loadImage(
          blobJPEG,
          function (img, data) {
            expect(data).to.be.ok
            expect(data.imageHead).to.be.ok
            expect(data.exif).to.be.ok
            expect(data.exif.get('Orientation')).to.equal(6)
            expect(data.iptc).to.be.ok
            expect(data.iptc.get('ObjectName')).to.equal('blueimp.net')
            done()
          },
          { meta: true }
        )
      ).to.be.ok
    })

    it('Write EXIF Orientation tag and replace image head', function (done) {
      loadImage(
        blobJPEG,
        function (img, data) {
          expect(data.imageHead).to.be.ok
          expect(data.exif).to.be.ok
          expect(data.exif.get('Orientation')).to.equal(6)
          expect(data.iptc).to.be.ok
          expect(data.iptc.get('ObjectName')).to.equal('blueimp.net')
          // Reset EXIF Orientation data:
          var buffer = loadImage.writeExifData(
            data.imageHead,
            data,
            'Orientation',
            1
          )
          // Check if Orientation writer changes image head buffer in place:
          expect(buffer).to.equal(data.imageHead)
          img.toBlob(function (blob) {
            loadImage.replaceHead(blob, data.imageHead, function (newBlob) {
              loadImage(
                newBlob,
                function (img, data) {
                  expect(img.width).to.equal(40)
                  expect(img.height).to.equal(60)
                  expect(data.imageHead).to.be.ok
                  expect(data.exif).to.be.ok
                  expect(data.exif.get('Orientation')).to.equal(1)
                  expect(data.iptc).to.be.ok
                  expect(data.iptc.get('ObjectName')).to.equal('blueimp.net')
                  done()
                },
                { meta: true }
              )
            })
          }, 'image/jpeg')
        },
        { meta: true, orientation: true, canvas: true, minWidth: 40 }
      )
    })

    describe('Promise', function () {
      if (!window.Promise) return

      it('Parse the complete image head', function () {
        return loadImage.parseMetaData(blobJPEG).then(function (data) {
          expect(data.imageHead).to.be.ok
          return loadImage
            .parseMetaData(createBlob(data.imageHead, 'image/jpeg'))
            .then(function (data) {
              expect(data.exif).to.be.ok
              expect(data.exif.get('Orientation')).to.equal(6)
            })
        })
      })

      it('Write EXIF Orientation tag and replace image head', function () {
        return loadImage(blobJPEG, {
          meta: true,
          orientation: true,
          canvas: true,
          minWidth: 40
        })
          .then(function (data) {
            expect(data.imageHead).to.be.ok
            expect(data.exif).to.be.ok
            expect(data.exif.get('Orientation')).to.equal(6)
            expect(data.iptc).to.be.ok
            expect(data.iptc.get('ObjectName')).to.equal('blueimp.net')
            // Reset EXIF Orientation data:
            var buffer = loadImage.writeExifData(
              data.imageHead,
              data,
              'Orientation',
              1
            )
            // Check if Orientation writer changes image head buffer in place:
            expect(buffer).to.equal(data.imageHead)
            return new Promise(function (resolve) {
              data.image.toBlob(function (blob) {
                data.blob = blob
                resolve(data)
              }, 'image/jpeg')
            })
          })
          .then(function (data) {
            return loadImage.replaceHead(data.blob, data.imageHead)
          })
          .then(function (blob) {
            return loadImage(blob, { meta: true }).then(function (data) {
              var img = data.image
              expect(img.width).to.equal(40)
              expect(img.height).to.equal(60)
              expect(data.imageHead).to.be.ok
              expect(data.exif).to.be.ok
              expect(data.exif.get('Orientation')).to.equal(1)
              expect(data.iptc).to.be.ok
              expect(data.iptc.get('ObjectName')).to.equal('blueimp.net')
            })
          })
      })
    })
  })

  describe('Fetch', function () {
    if (
      !(window.fetch && window.Request) &&
      !(window.XMLHttpRequest && window.ProgressEvent)
    ) {
      return
    }

    it('Fetch image URL as blob', function (done) {
      // IE does not allow XMLHttpRequest access to data URLs,
      // so we use an ObjectURL instead of imageUrlJPEG directly:
      loadImage.fetchBlob(loadImage.createObjectURL(blobJPEG), function (blob) {
        expect(blob).to.be.an.instanceOf(Blob)
        done()
      })
    })

    it('Fetch image URL as blob if meta option is true', function (done) {
      expect(
        loadImage(
          // IE does not allow XMLHttpRequest access to data URLs,
          // so we use an ObjectURL instead of imageUrlJPEG directly:
          loadImage.createObjectURL(blobJPEG),
          function (img, data) {
            expect(data).to.be.ok
            expect(data.imageHead).to.be.ok
            expect(data.exif).to.be.ok
            expect(data.exif.get('Orientation')).to.equal(6)
            expect(data.iptc).to.be.ok
            expect(data.iptc.get('ObjectName')).to.equal('blueimp.net')
            done()
          },
          { meta: true }
        )
      ).to.be.ok
    })

    it('Load image URL as img if meta option is false', function (done) {
      expect(
        loadImage(imageUrlJPEG, function (img, data) {
          expect(data.imageHead).to.be.undefined
          expect(data.exif).to.be.undefined
          expect(data.iptc).to.be.undefined
          done()
        })
      ).to.be.ok
    })

    describe('Promise', function () {
      if (!window.Promise) return

      it('Fetch image URL as blob', function () {
        // IE does not allow XMLHttpRequest access to data URLs,
        // so we use an ObjectURL instead of imageUrlJPEG directly:
        return loadImage
          .fetchBlob(loadImage.createObjectURL(blobJPEG))
          .then(function (blob) {
            expect(blob).to.be.an.instanceOf(Blob)
          })
      })
    })
  })
})(this.chai.expect, this.loadImage)
