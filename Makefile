.PHONY: js

js:
	node_modules/.bin/uglifyjs load-image.js -c -m -o load-image.min.js
