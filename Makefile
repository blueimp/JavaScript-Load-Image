.PHONY: js

MINIFY_LIST=load-image.js load-image-ios.js load-image-meta.js load-image-exif.js load-image-exif-map.js

js:
	node_modules/.bin/uglifyjs ${MINIFY_LIST} -c -m -o load-image.min.js
