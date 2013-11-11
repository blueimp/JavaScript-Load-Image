/*
 * JavaScript Load Image Gruntfile
 * https://github.com/blueimp/JavaScript-Load-Image
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*global module */

module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({
        jshint: {
            all: [
                'Gruntfile.js',
                'js/load-image.js',
                'js/load-image-ios.js',
                'js/load-image-orientation.js',
                'js/load-image-meta.js',
                'js/load-image-exif.js',
                'js/load-image-exif-map.js',
                'js/demo.js',
                'test/test.js'
            ]
        },
        mocha: {
            all: {
                src: ['test/index.html'],
                options: {
                    run: true,
                    bail: true,
                    log: true,
                    reporter: 'Spec'
                },
                mocha: {
                    ignoreLeaks: false
                }
            }
        },
        uglify: {
            production: {
                src: [
                    'js/load-image.js',
                    'js/load-image-ios.js',
                    'js/load-image-orientation.js',
                    'js/load-image-meta.js',
                    'js/load-image-exif.js',
                    'js/load-image-exif-map.js'
                ],
                dest: 'js/load-image.min.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-bump-build-git');

    grunt.registerTask('test', ['jshint', 'mocha']);
    grunt.registerTask('default', ['test', 'uglify']);

};
