/*
 * JavaScript Load Image Demo JS
 * https://github.com/blueimp/JavaScript-Load-Image
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*global window, document, loadImage, HTMLCanvasElement, $ */

$(function () {
    'use strict';

    var result = $('#result'),
        exifNode = $('#exif'),
        thumbNode = $('#thumbnail'),
        actionsNode = $('#actions'),
        currentFile,
        replaceResults = function (img) {
            var content;
            if (!(img.src || img instanceof HTMLCanvasElement)) {
                content = $('<span>Loading image file failed</span>');
            } else {
                content = $('<a target="_blank">').append(img)
                    .attr('download', currentFile.name)
                    .attr('href', img.src || img.toDataURL());
            }
            result.children().replaceWith(content);
            if (img.getContext) {
                actionsNode.show();
            }
        },
        displayImage = function (file, options) {
            currentFile = file;
            if (!loadImage(
                    file,
                    replaceResults,
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
                loadImage(thumbnail, function (img) {
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
                    maxWidth: result.width(),
                    canvas: true
                };
            if (!file) {
                return;
            }
            exifNode.hide();
            thumbNode.hide();
            loadImage.parseMetaData(file, function (data) {
                if (data.exif) {
                    options.orientation = data.exif.get('Orientation');
                    displayExifData(data.exif);
                }
                displayImage(file, options);
            });
        },
        coordinates;
    // Hide URL/FileReader API requirement message in capable browsers:
    if (window.createObjectURL || window.URL || window.webkitURL || window.FileReader) {
        result.children().hide();
    }
    $(document)
        .on('dragover', function (e) {
            e.preventDefault();
            e = e.originalEvent;
            e.dataTransfer.dropEffect = 'copy';
        })
        .on('drop', dropChangeHandler);
    $('#file-input').on('change', dropChangeHandler);
    $('#edit').on('click', function (event) {
        event.preventDefault();
        var imgNode = result.find('img, canvas'),
            img = imgNode[0];
        imgNode.Jcrop({
            setSelect: [40, 40, img.width - 40, img.height - 40],
            onSelect: function (coords) {
                coordinates = coords;
            },
            onRelease: function () {
                coordinates = null;
            }
        }).parent().on('click', function (event) {
            event.preventDefault();
        });
    });
    $('#crop').on('click', function (event) {
        event.preventDefault();
        var img = result.find('img, canvas')[0];
        if (img && coordinates) {
            replaceResults(loadImage.scale(img, {
                left: coordinates.x,
                top: coordinates.y,
                sourceWidth: coordinates.w,
                sourceHeight: coordinates.h,
                minWidth: result.width()
            }));
            coordinates = null;
        }
    });

});
