.PHONY: js

MINIFY=js/load-image.js
MINIFY+= js/load-image-ios.js
MINIFY+= js/load-image-orientation.js
MINIFY+= js/load-image-meta.js
MINIFY+= js/load-image-exif.js
MINIFY+= js/load-image-exif-map.js

js:
	node_modules/.bin/uglifyjs ${MINIFY} -c -m -o js/load-image.min.js
