# JavaScript Load Image

## Demo
[JavaScript Load Image Demo](http://blueimp.github.io/JavaScript-Load-Image/)

## Setup
Include the (minified) JavaScript Load Image script in your HTML markup:

```html
<script src="load-image.min.js"></script>
```

Or alternatively, choose which components you want to include:

```html
<script src="load-image.js"></script>
<script src="load-image-ios.js"></script>
<script src="load-image-meta.js"></script>
<script src="load-image-exif.js"></script>
<script src="load-image-exif-map.js"></script>
```

## Usage

### Image loading
In your application code, use the **loadImage()** function like this:

```js
document.getElementById('file-input').onchange = function (e) {
    loadImage(
        e.target.files[0],
        function (img) {
            document.body.appendChild(img);
        },
        {maxWidth: 600} // Options
    );
};
```

### Image scaling
It is also possible to use the image scaling functionality with an existing image:

```js
var scaledImage = loadImage.scale(
    img, // img or canvas element
    {maxWidth: 600}
);
```

## Requirements
The JavaScript Load Image library has zero dependencies.

However, JavaScript Load Image is a very suitable complement to the [Canvas to Blob](https://github.com/blueimp/JavaScript-Canvas-to-Blob) library.

## API
The **loadImage()** function accepts a [File](https://developer.mozilla.org/en/DOM/File) or [Blob](https://developer.mozilla.org/en/DOM/Blob) object or a simple image URL (e.g. "http://example.org/image.png") as first argument.

If a [File](https://developer.mozilla.org/en/DOM/File) or [Blob](https://developer.mozilla.org/en/DOM/Blob) is passed as parameter, it returns a HTML **img** element if the browser supports the [URL](https://developer.mozilla.org/en/DOM/window.URL) API or a [FileReader](https://developer.mozilla.org/en/DOM/FileReader) object if supported, or **false**.  
It always returns a HTML [img](https://developer.mozilla.org/en/docs/HTML/Element/Img) element when passing an image URL:

```js
document.getElementById('file-input').onchange = function (e) {
    var loadingImage = loadImage(
        e.target.files[0],
        function (img) {
            document.body.appendChild(img);
        },
        {maxWidth: 600}
    );
    if (!loadingImage) {
        // Alternative code ...
    }
};
```

The **img** element or [FileReader](https://developer.mozilla.org/en/DOM/FileReader) object returned by the **loadImage()** function allows to abort the loading process by setting the **onload** and **onerror** event handlers to null:

```js
document.getElementById('file-input').onchange = function (e) {
    var loadingImage = loadImage(
        e.target.files[0],
        function (img) {
            document.body.appendChild(img);
        },
        {maxWidth: 600}
    );
    loadingImage.onload = loadingImage.onerror = null;
};
```

The second argument must be a **callback** function, which is called when the image has been loaded or an error occurred while loading the image. The callback function is passed one argument, which is either a HTML **img** element, a [canvas](https://developer.mozilla.org/en/HTML/Canvas) element, or an [Event](https://developer.mozilla.org/en/DOM/event) object of type **error**:

```js
var imageUrl = "http://example.org/image.png";
loadImage(
    imageUrl,
    function (img) {
        if(img.type === "error") {
            console.log("Error loading image " + imageUrl);
        } else {
            document.body.appendChild(img);
        }
    },
    {maxWidth: 600}
);
```

## Options
The optional third argument to **loadImage()** is a map of options:

* **maxWidth**: Defines the maximum width of the img/canvas element.
* **maxHeight**: Defines the maximum height of the img/canvas element.
* **minWidth**: Defines the minimum width of the img/canvas element.
* **minHeight**: Defines the minimum height of the img/canvas element.
* **crop**: Defines if the canvas element should be cropped to the maxWidth/maxHeight constraints.
* **orientation**: Allows to transform the canvas coordinates according to the EXIF orientation specification.
* **canvas**: Defines if the returned element should be a [canvas](https://developer.mozilla.org/en/HTML/Canvas) element.
* **crossOrigin**: Sets the crossOrigin property on the img element for loading [CORS enabled images](https://developer.mozilla.org/en-US/docs/HTML/CORS_Enabled_Image).
* **noRevoke**: By default, the [created object URL](https://developer.mozilla.org/en/DOM/window.URL.createObjectURL) is revoked after the image has been loaded, except when this option is set to *true*.

They can be used the following way:

```js
loadImage(
    fileOrBlobOrUrl,
    function (img) {
        document.body.appendChild(img);
    },
    {
        maxWidth: 600,
        maxHeight: 300,
        minWidth: 100,
        minHeight: 50,
        canvas: true,
        noRevoke: true
    }
);
```

All settings are optional. By default, the image is returned as HTML **img** element without any image size restrictions.

## Meta data parsing
If the Load Image Meta extension is included, it is also possible to parse image meta data.  
The extension provides the method **loadImage.parseMetaData**, which can be used the following way:

```js
loadImage.parseMetaData(
    fileOrBlob,
    function (data) {
        // Combine data.imageHead with the image body of a resized file
        // to create scaled images with the original image meta data, e.g.:
        var blob = new Blob([
            data.imageHead,
            // Resized images always have a head size of 20,
            // including the JPEG marker and a minimal JFIF header:
            loadImage.blobSlice.call(resizedImage, 20)
        ], {type: resizedImage.type});
    },
    {
        disableImageHead: false
    }
);
```

The third argument is an options object which allows to disable the imageHead creation and is also passed along to segment parsers registered via loadImage extensions, e.g. the Exif parser.

**Note:**  
Blob objects of resized images can be created via [canvas.toBlob()](https://github.com/blueimp/JavaScript-Canvas-to-Blob).

### Exif parser
If you include the Load Image Exif Parser extension, the **parseMetaData** callback **data** contains the additional property **exif** if Exif data could be found in the given image.  
The **exif** object stores the parsed Exif tags:

```js
var orientation = data.exif[0x0112];
```

It also provides an **exif.get()** method to retrieve the tag value via the tag's mapped name:

```js
var orientation = data.exif.get('Orientation');
```

By default, the only available mapped names are **Orientation** and **Thumbnail**.  
If you also include the Load Image Exif Map library, additional tag mappings become available, as well as two additional methods, **exif.getText()** and **exif.getAll()**:

```js
var flashText = data.exif.getText('Flash'); // e.g.: 'Flash fired, auto mode',

// A map of all parsed tags with their mapped names as keys and their text values:
var allTags = data.exif.getAll();
```

The Exif parser also adds additional options for the parseMetaData method, to disable certain aspects of the parser:

* **disableExif**: Disables Exif parsing.
* **disableExifThumbnail**: Disables parsing of the Exif Thumbnail.
* **disableExifSub**: Disables parsing of the Exif Sub IFD.
* **disableExifGps**: Disables parsing of the Exif GPS Info IFD.

## iOS scaling fixes
Scaling megapixel images in iOS (iPhone, iPad, iPod) can result in distorted (squashed) images.  
The Load Image iOS scaling fixes extension resolves these issues.

## License
The JavaScript Load Image script is released under the [MIT license](http://www.opensource.org/licenses/MIT).

## Credits

* Image meta data handling implementation based on the help and contribution of Achim Stöhr.
* Exif tags mapping based on Jacob Seidelin's [exif-js](https://github.com/jseidelin/exif-js).
* iOS image scaling fixes based on Shinichi Tomita's [ios-imagefile-megapixel](https://github.com/stomita/ios-imagefile-megapixel).
