# JavaScript Load Image

> A JavaScript library to load and transform image files.

## Contents

- [Demo](#demo)
- [Description](#description)
- [Setup](#setup)
- [Usage](#usage)
  - [Image loading](#image-loading)
  - [Image scaling](#image-scaling)
- [Requirements](#requirements)
- [API](#api)
- [Options](#options)
  - [maxWidth](#maxwidth)
  - [maxHeight](#maxheight)
  - [minWidth](#minwidth)
  - [minHeight](#minheight)
  - [sourceWidth](#sourcewidth)
  - [sourceHeight](#sourceheight)
  - [top](#top)
  - [right](#right)
  - [bottom](#bottom)
  - [left](#left)
  - [contain](#contain)
  - [cover](#cover)
  - [aspectRatio](#aspectratio)
  - [pixelRatio](#pixelratio)
  - [downsamplingRatio](#downsamplingratio)
  - [imageSmoothingEnabled](#imagesmoothingenabled)
  - [imageSmoothingQuality](#imagesmoothingquality)
  - [crop](#crop)
  - [orientation](#orientation)
  - [meta](#meta)
  - [canvas](#canvas)
  - [crossOrigin](#crossorigin)
  - [noRevoke](#norevoke)
- [Meta data parsing](#meta-data-parsing)
  - [Image head](#image-head)
  - [Exif parser](#exif-parser)
  - [Exif writer](#exif-writer)
  - [IPTC parser](#iptc-parser)
- [License](#license)
- [Credits](#credits)

## Demo

[JavaScript Load Image Demo](https://blueimp.github.io/JavaScript-Load-Image/)

## Description

JavaScript Load Image is a library to load images provided as File or Blob
objects or via URL. It returns an optionally scaled and/or cropped HTML img or
canvas element. It also provides methods to parse image meta data to extract
IPTC and Exif tags as well as embedded thumbnail images and to restore the
complete image header after resizing.

## Setup

Include the (combined and minified) JavaScript Load Image script in your HTML
markup:

```html
<script src="js/load-image.all.min.js"></script>
```

Or alternatively, choose which components you want to include:

```html
<script src="js/load-image.js"></script>

<script src="js/load-image-scale.js"></script>
<script src="js/load-image-meta.js"></script>
<script src="js/load-image-fetch.js"></script>
<script src="js/load-image-orientation.js"></script>

<script src="js/load-image-exif.js"></script>
<script src="js/load-image-exif-map.js"></script>

<script src="js/load-image-iptc.js"></script>
<script src="js/load-image-iptc-map.js"></script>
```

## Usage

### Image loading

In your application code, use the `loadImage()` function like this:

```js
document.getElementById('file-input').onchange = function (e) {
  loadImage(
    e.target.files[0],
    function (img) {
      document.body.appendChild(img)
    },
    { maxWidth: 600 } // Options
  )
}
```

### Image scaling

It is also possible to use the image scaling functionality with an existing
image:

```js
var scaledImage = loadImage.scale(
  img, // img or canvas element
  { maxWidth: 600 }
)
```

## Requirements

The JavaScript Load Image library has zero dependencies.

However, JavaScript Load Image is a very suitable complement to the
[Canvas to Blob](https://github.com/blueimp/JavaScript-Canvas-to-Blob) library.

## API

The `loadImage()` function accepts a
[File](https://developer.mozilla.org/en/DOM/File) or
[Blob](https://developer.mozilla.org/en/DOM/Blob) object or a simple image URL
(e.g. `'https://example.org/image.png'`) as first argument.

If a [File](https://developer.mozilla.org/en/DOM/File) or
[Blob](https://developer.mozilla.org/en/DOM/Blob) is passed as parameter, it
returns a HTML `img` element if the browser supports the
[URL](https://developer.mozilla.org/en/DOM/window.URL) API or a
[FileReader](https://developer.mozilla.org/en/DOM/FileReader) object if
supported, or `false`.  
It always returns a HTML
[img](https://developer.mozilla.org/en/docs/HTML/Element/Img) element when
passing an image URL:

```js
document.getElementById('file-input').onchange = function (e) {
  var loadingImage = loadImage(
    e.target.files[0],
    function (img) {
      document.body.appendChild(img)
    },
    { maxWidth: 600 }
  )
  if (!loadingImage) {
    // Alternative code ...
  }
}
```

The `img` element or
[FileReader](https://developer.mozilla.org/en/DOM/FileReader) object returned by
the `loadImage()` function allows to abort the loading process by setting the
`onload` and `onerror` event handlers to null:

```js
document.getElementById('file-input').onchange = function (e) {
  var loadingImage = loadImage(
    e.target.files[0],
    function (img) {
      document.body.appendChild(img)
    },
    { maxWidth: 600 }
  )
  loadingImage.onload = loadingImage.onerror = null
}
```

The second argument must be a `callback` function, which is called when the
image has been loaded or an error occurred while loading the image. The callback
function is passed two arguments.  
The first is either an HTML `img` element, a
[canvas](https://developer.mozilla.org/en/HTML/Canvas) element, or an
[Event](https://developer.mozilla.org/en/DOM/event) object of type `error`.  
The second is on object with the original image dimensions as properties and
potentially additional [meta data](#meta-data-parsing):

```js
var imageUrl = 'https://example.org/image.png'
loadImage(
  imageUrl,
  function (img, data) {
    if (img.type === 'error') {
      console.error('Error loading image ' + imageUrl)
    } else {
      document.body.appendChild(img)
      console.log('Original image width: ', data.originalWidth)
      console.log('Original image height: ', data.originalHeight)
    }
  },
  { maxWidth: 600 }
)
```

## Options

The optional third argument to `loadImage()` is a map of options.

They can be used the following way:

```js
loadImage(
  fileOrBlobOrUrl,
  function (img) {
    document.body.appendChild(img)
  },
  {
    maxWidth: 600,
    maxHeight: 300,
    minWidth: 100,
    minHeight: 50,
    canvas: true
  }
)
```

All settings are optional. By default, the image is returned as HTML `img`
element without any image size restrictions.

### maxWidth

Defines the maximum width of the img/canvas element.

### maxHeight

Defines the maximum height of the img/canvas element.

### minWidth

Defines the minimum width of the img/canvas element.

### minHeight

Defines the minimum height of the img/canvas element.

### sourceWidth

The width of the sub-rectangle of the source image to draw into the destination
canvas.  
 Defaults to the source image width and requires `canvas: true`.

### sourceHeight

The height of the sub-rectangle of the source image to draw into the destination
canvas.  
 Defaults to the source image height and requires `canvas: true`.

### top

The top margin of the sub-rectangle of the source image.  
 Defaults to `0` and requires `canvas: true`.

### right

The right margin of the sub-rectangle of the source image.  
 Defaults to `0` and requires `canvas: true`.

### bottom

The bottom margin of the sub-rectangle of the source image.  
 Defaults to `0` and requires `canvas: true`.

### left

The left margin of the sub-rectangle of the source image.  
 Defaults to `0` and requires `canvas: true`.

### contain

Scales the image up/down to contain it in the max dimensions if set to `true`.  
 This emulates the CSS feature [background-image: contain](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Scaling_background_images#contain).

### cover

Scales the image up/down to cover the max dimensions with the image dimensions
if set to `true`.  
 This emulates the CSS feature [background-image: cover](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Scaling_background_images#cover).

### aspectRatio

Crops the image to the given aspect ratio (e.g. `16/9`).  
 Setting the `aspectRatio` also enables the `crop` option.

### pixelRatio

Defines the ratio of the canvas pixels to the physical image pixels on the
screen.  
 Should be set to `window.devicePixelRatio` unless the scaled image is not rendered
on screen.  
 Defaults to `1` and requires `canvas: true`.

### downsamplingRatio

Defines the ratio in which the image is downsampled.  
 By default, images are downsampled in one step. With a ratio of `0.5`, each step
scales the image to half the size, before reaching the target dimensions.  
 Requires `canvas: true`.

### imageSmoothingEnabled

If set to `false`,
[disables image smoothing](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/imageSmoothingEnabled).  
 Defaults to `true` and requires `canvas: true`.

### imageSmoothingQuality

Sets the
[quality of image smoothing](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/imageSmoothingQuality).  
 Possible values: `'low'`, `'medium'`, `'high'`  
 Defaults to `'low'` and requires `canvas: true`.

### crop

Crops the image to the maxWidth/maxHeight constraints if set to `true`.  
 Enabling the `crop` option also enables the `canvas` option.

### orientation

Transform the canvas according to the specified Exif orientation, which can be
an `integer` in the range of `1` to `8` or the boolean value `true`.  
 When set to `true`, it will set the orientation value based on the EXIF data of
the image, which will be parsed automatically if the exif library is available.

Setting `orientation` to an integer in the range of `2` to `8` enables the
`canvas` option.  
 Setting `orientation` to `true` enables the `canvas` and `meta` options, unless
the browser supports automatic image orientation (see [browser support for image-orientation](https://caniuse.com/#feat=css-image-orientation)).

### meta

Automatically parses the image meta data if set to `true`.  
 The meta data is passed to the callback as part of the second argument.  
 If the file is given as URL and the browser supports the
[fetch API](https://developer.mozilla.org/en/docs/Web/API/Fetch_API), fetches
the file as Blob to be able to parse the meta data.

### canvas

Returns the image as [canvas](https://developer.mozilla.org/en/HTML/Canvas)
element if set to `true`.

### crossOrigin

Sets the crossOrigin property on the img element for loading
[CORS enabled images](https://developer.mozilla.org/en-US/docs/HTML/CORS_Enabled_Image).

### noRevoke

By default, the
[created object URL](https://developer.mozilla.org/en/DOM/window.URL.createObjectURL)
is revoked after the image has been loaded, except when this option is set to
`true`.

## Meta data parsing

If the Load Image Meta extension is included, it is also possible to parse image
meta data automatically with the `meta` option:

```js
loadImage(
  fileOrBlobOrUrl,
  function (img, data) {
    console.log('Original image head: ', data.imageHead)
    console.log('Exif data: ', data.exif) // requires exif extension
    console.log('IPTC data: ', data.iptc) // requires iptc extension
  },
  { meta: true }
)
```

Or alternatively via `loadImage.parseMetaData`, which can be used with an
available `File` or `Blob` object as first argument:

```js
loadImage.parseMetaData(
  fileOrBlob,
  function (data) {
    console.log('Original image head: ', data.imageHead)
    console.log('Exif data: ', data.exif) // requires exif extension
    console.log('IPTC data: ', data.iptc) // requires iptc extension
  },
  {
    maxMetaDataSize: 262144
  }
)
```

The Meta data extension also adds additional options used for the
`parseMetaData` method:

- `maxMetaDataSize`: Maximum number of bytes of meta data to parse.
- `disableImageHead`: Disable parsing the original image head.
- `disableMetaDataParsers`: Disable parsing meta data (image head only)

### Image head

Resized JPEG images can be combined with their original image head via
`loadImage.replaceHead`, which requires the resized image as `Blob` object as
first argument and an `ArrayBuffer` image head as second argument. The third
argument must be a `callback` function, which is called with the new `Blob`
object:

```js
loadImage(
  fileOrBlobOrUrl,
  function (img, data) {
    if (data.imageHead && data.exif) {
      img.toBlob(function (blob) {
        loadImage.replaceHead(blob, data.imageHead, function (newBlob) {
          // do something with newBlob
        })
      }, 'image/jpeg')
    }
  },
  { meta: true, canvas: true, maxWidth: 800 }
)
```

**Note:**  
Blob objects of resized images can be created via
[canvas.toBlob](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob).
For browsers which don't have native support, a
[canvas.toBlob polyfill](https://github.com/blueimp/JavaScript-Canvas-to-Blob)
is available.

### Exif parser

If you include the Load Image Exif Parser extension, the argument passed to the
callback for `parseMetaData` will contain the following additional properties if
Exif data could be found in the given image:

- `exif`: The parsed Exif tags
- `exifOffsets`: The parsed Exif tag offsets
- `exifTiffOffset`: TIFF header offset (used for offset pointers)
- `exifLittleEndian`: little endian order if true, big endian if false

The `exif` object stores the parsed Exif tags:

```js
var orientation = data.exif[0x0112] // Orientation
```

The `exif` and `exifOffsets` objects also provide a `get()` method to retrieve
the tag value/offset via the tag's mapped name:

```js
var orientation = data.exif.get('Orientation')
var orientationOffset = data.exifOffsets.get('Orientation')
```

By default, only the following names are mapped:

- `Orientation`
- `Thumbnail`
- `Exif`
- `GPSInfo`
- `Interoperability`

If you also include the Load Image Exif Map library, additional tag mappings
become available, as well as three additional methods:

- `exif.getText()`
- `exif.getName()`
- `exif.getAll()`

```js
var flashText = data.exif.getText('Flash') // e.g.: 'Flash fired, auto mode',

var name = data.exif.getName(0x0112) // Orientation

// A map of all parsed tags with their mapped names/text as keys/values:
var allTags = data.exif.getAll()
```

The Exif parser also adds additional options for the parseMetaData method, to
disable certain aspects of the parser:

- `disableExif`: Disables Exif parsing when `true`.
- `disableExifThumbnail`: Disables parsing of Thumbnail data when `true`.
- `disableExifOffsets`: Disables storing Exif tag offsets when `true`.
- `includeExifTags`: A map of Exif tags to include for parsing (includes all but
  the excluded tags by default).
- `excludeExifTags`: A map of Exif tags to exclude from parsing (defaults to
  exclude `Exif` `MakerNote`).

An example parsing only Orientation, Thumbnail and ExifVersion tags:

```js
loadImage.parseMetaData(
  fileOrBlob,
  function (data) {
    console.log('Exif data: ', data.exif)
  },
  {
    includeExifTags: {
      0x0112: true, // Orientation
      0x0201: true, // JPEGInterchangeFormat (Thumbnail data offset)
      0x0202: true, // JPEGInterchangeFormatLength (Thumbnail data length)
      0x8769: {
        // ExifIFDPointer
        0x9000: true // ExifVersion
      }
    }
  }
)
```

An example excluding `Exif` `MakerNote` and `GPSInfo`:

```js
loadImage.parseMetaData(
  fileOrBlob,
  function (data) {
    console.log('Exif data: ', data.exif)
  },
  {
    excludeExifTags: {
      0x8769: {
        // ExifIFDPointer
        0x927c: true // MakerNote
      },
      0x8825: true // GPSInfoIFDPointer
    }
  }
)
```

### Exif writer

The Exif parser extension also includes a minimal writer that allows to override
the Exif `Orientation` value in the parsed `imageHead` `ArrayBuffer`:

```js
loadImage(
  fileOrBlobOrUrl,
  function (img, data) {
    if (data.imageHead && data.exif) {
      // Reset Exif Orientation data:
      loadImage.writeExifData(data.imageHead, data, 'Orientation', 1)
      img.toBlob(function (blob) {
        loadImage.replaceHead(blob, data.imageHead, function (newBlob) {
          // do something with newBlob
        })
      }, 'image/jpeg')
    }
  },
  { meta: true, orientation: true, canvas: true, maxWidth: 800 }
)
```

### IPTC parser

If you include the Load Image IPTC Parser extension, the argument passed to the
callback for `parseMetaData` will contain the following additional properties if
IPTC data could be found in the given image:

- `iptc`: The parsed IPTC tags
- `iptcOffsets`: The parsed IPTC tag offsets

The `iptc` object stores the parsed IPTC tags:

```js
var objectname = data.iptc[5]
```

The `iptc` and `iptcOffsets` objects also provide a `get()` method to retrieve
the tag value/offset via the tag's mapped name:

```js
var objectname = data.iptc.get('ObjectName')
```

By default, only the following names are mapped:

- `ObjectName`

If you also include the Load Image IPTC Map library, additional tag mappings
become available, as well as three additional methods:

- `iptc.getText()`
- `iptc.getName()`
- `iptc.getAll()`

```js
var keywords = data.iptc.getText('Keywords') // e.g.: ['Weather','Sky']

var name = data.iptc.getName(5) // ObjectName

// A map of all parsed tags with their mapped names/text as keys/values:
var allTags = data.iptc.getAll()
```

The IPTC parser also adds additional options for the parseMetaData method, to
disable certain aspects of the parser:

- `disableIptc`: Disables IPTC parsing when true.
- `disableIptcOffsets`: Disables storing IPTC tag offsets when `true`.
- `includeIptcTags`: A map of IPTC tags to include for parsing (includes all but
  the excluded tags by default).
- `excludeIptcTags`: A map of IPTC tags to exclude from parsing (defaults to
  exclude `ObjectPreviewData`).

An example parsing only the `ObjectName` tag:

```js
loadImage.parseMetaData(
  fileOrBlob,
  function (data) {
    console.log('IPTC data: ', data.iptc)
  },
  {
    includeIptcTags: {
      5: true // ObjectName
    }
  }
)
```

An example excluding `ApplicationRecordVersion` and `ObjectPreviewData`:

```js
loadImage.parseMetaData(
  fileOrBlob,
  function (data) {
    console.log('IPTC data: ', data.iptc)
  },
  {
    excludeIptcTags: {
      0: true, // ApplicationRecordVersion
      202: true // ObjectPreviewData
    }
  }
)
```

## License

The JavaScript Load Image script is released under the
[MIT license](https://opensource.org/licenses/MIT).

## Credits

- Image meta data handling implementation based on the help and contribution of
  Achim Stöhr.
- Exif tags mapping based on Jacob Seidelin's
  [exif-js](https://github.com/jseidelin/exif-js) library.
- IPTC parser implementation by [Dave Bevan](https://github.com/bevand10).
