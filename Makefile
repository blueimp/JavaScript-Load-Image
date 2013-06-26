.PHONY: js

MINIFY_LIST=js/load-image.js js/load-image-ios.js js/load-image-meta.js js/load-image-exif.js js/load-image-exif-map.js

js:
	node_modules/.bin/uglifyjs ${MINIFY_LIST} -c -m -o js/load-image.min.js
