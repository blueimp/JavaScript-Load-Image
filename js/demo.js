/*
 * JavaScript Load Image Demo JS 1.7.3
 * https://github.com/blueimp/JavaScript-Load-Image
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*global window, document, HTMLCanvasElement, $ */

$(function () {
    'use strict';

    var result = $('#result'),
        exifNode = $('#exif'),
        thumbNode = $('#thumbnail'),
        displayImage = function (file, options) {
            if (!window.loadImage(
                    file,
                    function (img) {
                        if (!(img.src || img instanceof HTMLCanvasElement)) {
                            img = $('<span>Loading image file failed</span>');
                        }
                        result.children().replaceWith(img);
                    },
                    options
                )) {
                result.children().replaceWith(
                    $('<span>Your browser does not support the URL or FileReader API.</span>')
                );
            }
        },
        displayExifData = function (exif) {
            var thumbnail = exif.get('Thumbnail'),
                tags = exif.getAll(),
                table = exifNode.find('table').empty(),
                row = $('<tr></tr>'),
                cell = $('<td></td>'),
                prop;
            if (thumbnail) {
                thumbNode.empty();
                window.loadImage(thumbnail, function (img) {
                    thumbNode.append(img).show();
                }, {orientation: exif.get('Orientation')});
            }
            for (prop in tags) {
                if (tags.hasOwnProperty(prop)) {
                    table.append(
                        row.clone()
                            .append(cell.clone().text(prop))
                            .append(cell.clone().text(tags[prop]))
                    );
                }
            }
            exifNode.show();
        },
        dropChangeHandler = function (e) {
            e.preventDefault();
            e = e.originalEvent;
            var target = e.dataTransfer || e.target,
                file = target && target.files && target.files[0],
                options = {
                    maxWidth: result.children().outerWidth(),
                    canvas: true
                };
            if (!file) {
                return;
            }
            exifNode.hide();
            thumbNode.hide();
            window.loadImage.parseMetaData(file, function (data) {
                if (data.exif) {
                    options.orientation = data.exif.get('Orientation');
                    displayExifData(data.exif);
                }
                displayImage(file, options);
            });
        };
    $(document)
        .on('dragover', function (e) {
            e.preventDefault();
            e = e.originalEvent;
            e.dataTransfer.dropEffect = 'copy';
        })
        .on('drop', dropChangeHandler);
    $('#file-input').on('change', dropChangeHandler);

});
