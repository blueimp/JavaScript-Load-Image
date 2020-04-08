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

/* global describe, it */
/* eslint-disable no-unused-expressions */

;(function (expect, loadImage) {
  'use strict'

  var canCreateBlob = !!window.dataURLtoBlob
  // black 60x40 GIF
  // Image data layout (B=black, F=white), scaled to 3x2:
  // BFF
  // BBB
  var b64DataGIF =
    'R0lGODlhPAAoAPECAAAAAP///wAAAAAAACH5BAUAAAIALAAAAAA8ACgAQAJihI+Zwe0Po3Sq' +
    '1okztvzoDwbdSJbmiaaqGbbTCrjyA9f2jef6Ts6+uPrNYEIZsdg6IkG8pvMJjUqnVOgypLxm' +
    'stpXsLv9gr2q8UZshnDTjTUbWH7TqvS6/Y7P6/f8vv9vVwAAOw=='
  var imageUrlGIF = 'data:image/gif;base64,' + b64DataGIF
  var blobGIF = canCreateBlob && window.dataURLtoBlob(imageUrlGIF)
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
  var blobJPEG = canCreateBlob && window.dataURLtoBlob(imageUrlJPEG)
  /**
   * Helper function to create a blob object from the given image data
   *
   * @param {*} data Image data
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
      builder.append(data.buffer || data)
      return builder.getBlob(type)
    }
  }

  describe('Loading', function () {
    it('Return an object with onload and onerror methods', function () {
      var img = loadImage(blobGIF, function () {})
      expect(img).to.be.an.instanceOf(Object)
      expect(img.onload).to.be.a('function')
      expect(img.onerror).to.be.a('function')
    })

    it('Load image url', function (done) {
      expect(
        loadImage(imageUrlGIF, function (img) {
          expect(img.width).to.equal(60)
          expect(img.height).to.equal(40)
          done()
        })
      ).to.be.ok
    })

    it('Load image blob', function (done) {
      expect(
        loadImage(blobGIF, function (img) {
          expect(img.width).to.equal(60)
          expect(img.height).to.equal(40)
          done()
        })
      ).to.be.ok
    })

    it('Return image loading error to callback', function (done) {
      expect(
        loadImage('404', function (img) {
          expect(img).to.be.an.instanceOf(window.Event)
          expect(img.type).to.equal('error')
          done()
        })
      ).to.be.ok
    })

    it('Keep object URL if noRevoke is true', function (done) {
      expect(
        loadImage(
          blobGIF,
          function (img) {
            loadImage(img.src, function (img2) {
              expect(img.width).to.equal(img2.width)
              expect(img.height).to.equal(img2.height)
              done()
            })
          },
          { noRevoke: true }
        )
      ).to.be.ok
    })

    it('Discard object URL if noRevoke is undefined/false', function (done) {
      expect(
        loadImage(blobGIF, function (img) {
          loadImage(img.src, function (img2) {
            expect(img2).to.be.an.instanceOf(window.Event)
            expect(img2.type).to.equal('error')
            done()
          })
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
              expect(img.style.height).to.equal('80px')
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
              expect(img.style.height).to.equal('20px')
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
      if (
        !document.createElement('canvas').getContext('2d').imageSmoothingEnabled
      ) {
        return
      }

      it('imageSmoothingEnabled defaults to true', function (done) {
        expect(
          loadImage(
            blobGIF,
            function (img) {
              expect(img.width).to.equal(120)
              expect(img.getContext('2d').imageSmoothingEnabled).to.equal(true)
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
              expect(img.getContext('2d').imageSmoothingEnabled).to.equal(false)
              done()
            },
            { minWidth: 120, canvas: true, imageSmoothingEnabled: false }
          )
        ).to.be.ok
      })

      if (
        document.createElement('canvas').getContext('2d')
          .imageSmoothingQuality !== 'low'
      ) {
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
            expect(img.style.height).to.equal('40px')
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
            expect(img.style.height).to.equal('40px')
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
    it('Should keep the orientation', function (done) {
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

    it('Should rotate left', function (done) {
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

    it('Should rotate right', function (done) {
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

    it('Should adjust constraints to new coordinates', function (done) {
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

    it('Should adjust left and top to new coordinates', function (done) {
      expect(
        loadImage(
          blobGIF,
          function (img) {
            expect(img.width).to.equal(20)
            expect(img.height).to.equal(30)
            done()
          },
          { orientation: 5, left: 20, top: 30 }
        )
      ).to.be.ok
    })

    it('Should adjust right and bottom to new coordinates', function (done) {
      expect(
        loadImage(
          blobGIF,
          function (img) {
            expect(img.width).to.equal(20)
            expect(img.height).to.equal(30)
            done()
          },
          { orientation: 5, right: 20, bottom: 30 }
        )
      ).to.be.ok
    })

    it('Should adjust left and bottom to new coordinates', function (done) {
      expect(
        loadImage(
          blobGIF,
          function (img) {
            expect(img.width).to.equal(20)
            expect(img.height).to.equal(30)
            done()
          },
          { orientation: 7, left: 20, bottom: 30 }
        )
      ).to.be.ok
    })

    it('Should adjust right and top to new coordinates', function (done) {
      expect(
        loadImage(
          blobGIF,
          function (img) {
            expect(img.width).to.equal(20)
            expect(img.height).to.equal(30)
            done()
          },
          { orientation: 7, right: 20, top: 30 }
        )
      ).to.be.ok
    })

    it('Should rotate left with the given pixelRatio', function (done) {
      expect(
        loadImage(
          blobGIF,
          function (img) {
            expect(img.width).to.equal(80)
            expect(img.height).to.equal(120)
            expect(img.style.width).to.equal('40px')
            expect(img.style.height).to.equal('60px')
            done()
          },
          { orientation: 8, pixelRatio: 2 }
        )
      ).to.be.ok
    })

    it('Should rotate right with the given pixelRatio', function (done) {
      expect(
        loadImage(
          blobGIF,
          function (img) {
            expect(img.width).to.equal(80)
            expect(img.height).to.equal(120)
            expect(img.style.width).to.equal('40px')
            expect(img.style.height).to.equal('60px')
            done()
          },
          { orientation: 6, pixelRatio: 2 }
        )
      ).to.be.ok
    })

    it('Should ignore too small orientation value', function (done) {
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

    it('Should ignore too large orientation value', function (done) {
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

    it('Should rotate right based on the exif orientation value', function (done) {
      expect(
        loadImage(
          blobJPEG,
          function (img, data) {
            expect(data).to.be.ok
            expect(data.exif).to.be.ok
            expect(data.exif.get('Orientation')).to.equal(6)
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
            // 0:1 opaque black
            expect(imageData[0 + 4]).to.equal(0)
            expect(imageData[1 + 4]).to.equal(0)
            expect(imageData[2 + 4]).to.equal(0)
            expect(imageData[3 + 4]).to.equal(255)
            // 1:0 opaque black
            expect(imageData[0 + 8]).to.equal(0)
            expect(imageData[1 + 8]).to.equal(0)
            expect(imageData[2 + 8]).to.equal(0)
            expect(imageData[3 + 8]).to.equal(255)
            // 1:1 opaque white
            expect(imageData[0 + 12]).to.equal(255)
            expect(imageData[1 + 12]).to.equal(255)
            expect(imageData[2 + 12]).to.equal(255)
            expect(imageData[3 + 12]).to.equal(255)
            // 2:0 opaque black
            expect(imageData[0 + 16]).to.equal(0)
            expect(imageData[1 + 16]).to.equal(0)
            expect(imageData[2 + 16]).to.equal(0)
            expect(imageData[3 + 16]).to.equal(255)
            // 2:1 opaque white
            expect(imageData[0 + 20]).to.equal(255)
            expect(imageData[1 + 20]).to.equal(255)
            expect(imageData[2 + 20]).to.equal(255)
            expect(imageData[3 + 20]).to.equal(255)
            done()
          },
          { orientation: true }
        )
      ).to.be.ok
    })

    it('Should scale image after exif based orientation', function (done) {
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
  })

  describe('Canvas', function () {
    it('Return img element to callback if canvas is not true', function (done) {
      expect(
        loadImage(blobGIF, function (img) {
          expect(img.getContext).to.be.undefined
          expect(img.nodeName.toLowerCase()).to.equal('img')
          done()
        })
      ).to.be.ok
    })

    it('Return canvas element to callback if canvas is true', function (done) {
      expect(
        loadImage(
          blobGIF,
          function (img) {
            expect(img.getContext).to.be.ok
            expect(img.nodeName.toLowerCase()).to.equal('canvas')
            done()
          },
          { canvas: true }
        )
      ).to.be.ok
    })

    it('Return scaled canvas element to callback', function (done) {
      expect(
        loadImage(
          blobGIF,
          function (img) {
            expect(img.getContext).to.be.ok
            expect(img.nodeName.toLowerCase()).to.equal('canvas')
            expect(img.width).to.equal(30)
            expect(img.height).to.equal(20)
            done()
          },
          { canvas: true, maxWidth: 30 }
        )
      ).to.be.ok
    })

    it('Accept a canvas element as parameter for loadImage.scale', function (done) {
      expect(
        loadImage(
          blobGIF,
          function (img) {
            // eslint-disable-next-line no-param-reassign
            img = loadImage.scale(img, {
              maxWidth: 30
            })
            expect(img.getContext).to.be.ok
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

  describe('Metadata', function () {
    it('Should parse Exif tags', function (done) {
      loadImage.parseMetaData(blobJPEG, function (data) {
        expect(data.exif).to.be.ok
        expect(data.exif.get('Orientation')).to.equal(6)
        done()
      })
    })

    it('Should parse IPTC tags', function (done) {
      loadImage.parseMetaData(blobJPEG, function (data) {
        expect(data.iptc).to.be.ok
        expect(data.iptc.get('ObjectName')).to.equal('blueimp.net')
        done()
      })
    })

    it('Should parse the complete image head', function (done) {
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

    it('Should parse meta data automatically', function (done) {
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
  })

  describe('Fetch', function () {
    if (
      !('fetch' in window && 'Request' in window) &&
      !('XMLHttpRequest' in window && 'ProgressEvent' in window)
    ) {
      return
    }

    it('Should fetch image URL as blob if meta option is true', function (done) {
      expect(
        loadImage(
          imageUrlJPEG,
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

    it('Should load image URL as img if meta option is false', function (done) {
      expect(
        loadImage(imageUrlJPEG, function (img, data) {
          expect(data.imageHead).to.be.undefined
          expect(data.exif).to.be.undefined
          expect(data.iptc).to.be.undefined
          done()
        })
      ).to.be.ok
    })
  })
})(this.chai.expect, this.loadImage)
