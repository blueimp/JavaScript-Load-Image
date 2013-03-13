.PHONY: js

js:
	uglifyjs load-image.js -c -o load-image.min.js
