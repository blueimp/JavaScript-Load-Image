.PHONY: js

js:
	uglifyjs -nc load-image.js > load-image.min.js
