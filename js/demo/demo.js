/*
 * JavaScript Load Image Demo JS
 * https://github.com/blueimp/JavaScript-Load-Image
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 */

/* global loadImage, HTMLCanvasElement, $ */

$(function () {
  'use strict'

  var result = $('#result')
  var exifNode = $('#exif')
  var iptcNode = $('#iptc')
  var thumbNode = $('#thumbnail')
  var actionsNode = $('#actions')
  var currentFile
  var coordinates
  var jcropAPI

  function displayTagData (node, tags) {
    var table = node.find('table').empty()
    var row = $('<tr></tr>')
    var cell = $('<td></td>')
    var prop
    for (prop in tags) {
      if (tags.hasOwnProperty(prop)) {
        table.append(
          row
            .clone()
            .append(cell.clone().text(prop))
            .append(cell.clone().text(tags[prop]))
        )
      }
    }
    node.show()
  }

  function displayThumbnailImage (node, thumbnail, options) {
    if (thumbnail) {
      thumbNode.empty()
      loadImage(
        thumbnail,
        function (img) {
          node.append(img).show()
        },
        options
      )
    }
  }

  function displayMetaData (data) {
    if (!data) return
    var exif = data.exif
    var iptc = data.iptc
    if (exif) {
      displayThumbnailImage(thumbNode, exif.get('Thumbnail'), {
        orientation: exif.get('Orientation')
      })
      displayTagData(exifNode, exif.getAll())
    }
    if (iptc) {
      displayTagData(iptcNode, iptc.getAll())
    }
  }

  function updateResults (img, data) {
    var fileName = currentFile.name
    var href = img.src
    var dataURLStart
    var content
    if (!(img.src || img instanceof HTMLCanvasElement)) {
      content = $('<span>Loading image file failed</span>')
    } else {
      if (!href) {
        href = img.toDataURL(currentFile.type + 'REMOVEME')
        // Check if file type is supported for the dataURL export:
        dataURLStart = 'data:' + currentFile.type
        if (href.slice(0, dataURLStart.length) !== dataURLStart) {
          fileName = fileName.replace(/\.\w+$/, '.png')
        }
      }
      content = $('<a target="_blank">')
        .append(img)
        .attr('download', fileName)
        .attr('href', href)
    }
    result.children().replaceWith(content)
    if (img.getContext) {
      actionsNode.show()
    }
    displayMetaData(data)
  }

  function displayImage (file, options) {
    currentFile = file
    if (!loadImage(file, updateResults, options)) {
      result
        .children()
        .replaceWith(
          $(
            '<span>' +
              'Your browser does not support the URL or FileReader API.' +
              '</span>'
          )
        )
    }
  }

  function dropChangeHandler (e) {
    e.preventDefault()
    e = e.originalEvent
    var target = e.dataTransfer || e.target
    var file = target && target.files && target.files[0]
    var options = {
      maxWidth: result.width(),
      canvas: true,
      pixelRatio: window.devicePixelRatio,
      downsamplingRatio: 0.5,
      orientation: true
    }
    if (!file) {
      return
    }
    exifNode.hide()
    iptcNode.hide()
    thumbNode.hide()
    displayImage(file, options)
  }

  // Hide URL/FileReader API requirement message in capable browsers:
  if (
    window.createObjectURL ||
    window.URL ||
    window.webkitURL ||
    window.FileReader
  ) {
    result.children().hide()
  }

  $(document)
    .on('dragover', function (e) {
      e.preventDefault()
      e = e.originalEvent
      e.dataTransfer.dropEffect = 'copy'
    })
    .on('drop', dropChangeHandler)

  $('#file-input').on('change', dropChangeHandler)

  $('#edit').on('click', function (event) {
    event.preventDefault()
    var imgNode = result.find('img, canvas')
    var img = imgNode[0]
    var pixelRatio = window.devicePixelRatio || 1
    imgNode
      .Jcrop(
        {
          setSelect: [
            40,
            40,
            img.width / pixelRatio - 40,
            img.height / pixelRatio - 40
          ],
          onSelect: function (coords) {
            coordinates = coords
          },
          onRelease: function () {
            coordinates = null
          }
        },
        function () {
          jcropAPI = this
        }
      )
      .parent()
      .on('click', function (event) {
        event.preventDefault()
      })
  })

  $('#crop').on('click', function (event) {
    event.preventDefault()
    var img = result.find('img, canvas')[0]
    var pixelRatio = window.devicePixelRatio || 1
    if (img && coordinates) {
      updateResults(
        loadImage.scale(img, {
          left: coordinates.x * pixelRatio,
          top: coordinates.y * pixelRatio,
          sourceWidth: coordinates.w * pixelRatio,
          sourceHeight: coordinates.h * pixelRatio,
          minWidth: result.width(),
          maxWidth: result.width(),
          pixelRatio: pixelRatio,
          downsamplingRatio: 0.5
        })
      )
      coordinates = null
    }
  })

  $('#cancel').on('click', function (event) {
    event.preventDefault()
    if (jcropAPI) {
      jcropAPI.release()
    }
  })
})
