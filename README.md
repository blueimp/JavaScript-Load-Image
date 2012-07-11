# JavaScript Load Image

## Demo
[JavaScript Load Image Demo](http://blueimp.github.com/JavaScript-Load-Image/)

## Usage
Include the (minified) JavaScript Load Image script in your HTML markup:

```html
<script src="load-image.min.js"></script>
```

In your application code, use the **loadImage()** function like this:

```js
document.getElementById('file-input').onchange = function (e) {
    window.loadImage(
        e.target.files[0],
        function (img) {
            document.body.appendChild(img);
        },
        {maxWidth: 600}
    );
};
```

## Requirements
The JavaScript Load Image function has zero dependencies.

However, JavaScript Load Image is a very suitable complement to the [Canvas to Blob](https://github.com/blueimp/JavaScript-Canvas-to-Blob) function.

## API
The **loadImage()** function accepts a [File](https://developer.mozilla.org/en/DOM/File) or [Blob](https://developer.mozilla.org/en/DOM/Blob) object or a simple image URL (e.g. "http://example.org/image.png") as first argument.

If a [File](https://developer.mozilla.org/en/DOM/File) or [Blob](https://developer.mozilla.org/en/DOM/Blob) is passed as parameter, it returns a HTML **img** element if the browser supports the [URL](https://developer.mozilla.org/en/DOM/window.URL) API or a [FileReader](https://developer.mozilla.org/en/DOM/FileReader) object if supported, or **false**.  
It always returns a HTML **img** element when passing an image URL:

```js
document.getElementById('file-input').onchange = function (e) {
    var loadingImage = window.loadImage(
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
    var loadingImage = window.loadImage(
        e.target.files[0],
        function (img) {
            document.body.appendChild(img);
        },
        {maxWidth: 600}
    );
    loadingImage.onload = loadingImage.onerror = null;
};
```

The second argument must be a **callback** function, which is called when the image has been loaded or an error occurred while loading the image. The callback function is passed one argument, which is either a HTML **img** element, a [canvas](https://developer.mozilla.org/en/HTML/Canvas) element, or an [Event](https://developer.mozilla.org/en/DOM/event) object of type "**error**":

```js
var imageUrl = "http://example.org/image.png";
window.loadImage(
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

The optional third argument is a map of options:

* **maxWidth**: Defines the maximum width of the img/canvas element.
* **maxHeight**: Defines the maximum height of the img/canvas element.
* **minWidth**: Defines the minimum width of the img/canvas element.
* **minHeight**: Defines the minimum height of the img/canvas element.
* **canvas**: Defines if the returned element should be a [canvas](https://developer.mozilla.org/en/HTML/Canvas) element.
* **noRevoke**: By default, the [created object URL](https://developer.mozilla.org/en/DOM/window.URL.createObjectURL) is revoked after the image has been loaded, except when this option is set to *true*.

They can be used the following way:

```js
window.loadImage(
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

## License
The JavaScript Load Image script is released under the [MIT license](http://www.opensource.org/licenses/MIT).
