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

/* global loadImage, $ */

$(function () {
  'use strict'

  var resultNode = $('#result')
  var metaNode = $('#meta')
  var thumbNode = $('#thumbnail')
  var actionsNode = $('#actions')
  var orientationNode = $('#orientation')
  var imageSmoothingNode = $('#image-smoothing')
  var fileInputNode = $('#file-input')
  var urlNode = $('#url')
  var editNode = $('#edit')
  var cropNode = $('#crop')
  var cancelNode = $('#cancel')
  var coordinates
  var jcropAPI

  /**
   * Displays tag data
   *
   * @param {*} node jQuery node
   * @param {object} tags Tags map
   * @param {string} title Tags title
   */
  function displayTagData(node, tags, title) {
    var table = $('<table></table>')
    var row = $('<tr></tr>')
    var cell = $('<td></td>')
    var headerCell = $('<th colspan="2"></th>')
    var prop
    table.append(row.clone().append(headerCell.clone().text(title)))
    for (prop in tags) {
      if (Object.prototype.hasOwnProperty.call(tags, prop)) {
        if (typeof tags[prop] === 'object') {
          displayTagData(node, tags[prop], prop)
          continue
        }
        table.append(
          row
            .clone()
            .append(cell.clone().text(prop))
            .append(cell.clone().text(tags[prop]))
        )
      }
    }
    node.append(table).show()
  }

  /**
   * Displays the thumbnal image
   *
   * @param {*} node jQuery node
   * @param {string} thumbnail Thumbnail URL
   * @param {object} [options] Options object
   */
  function displayThumbnailImage(node, thumbnail, options) {
    if (thumbnail) {
      var link = $('<a></a>')
        .attr('href', loadImage.createObjectURL(thumbnail))
        .attr('download', 'thumbnail.jpg')
        .appendTo(node)
      loadImage(
        thumbnail,
        function (img) {
          link.append(img)
          node.show()
        },
        options
      )
    }
  }

  /**
   * Displays metadata
   *
   * @param {object} [data] Metadata object
   */
  function displayMetaData(data) {
    if (!data) return
    metaNode.data(data)
    var exif = data.exif
    var iptc = data.iptc
    if (exif) {
      var thumbnail = exif.get('Thumbnail')
      if (thumbnail) {
        displayThumbnailImage(thumbNode, thumbnail.get('Blob'), {
          orientation: exif.get('Orientation')
        })
      }
      displayTagData(metaNode, exif.getAll(), 'TIFF')
    }
    if (iptc) {
      displayTagData(metaNode, iptc.getAll(), 'IPTC')
    }
  }

  /**
   * Removes meta data from the page
   */
  function removeMetaData() {
    metaNode.hide().removeData().find('table').remove()
    thumbNode.hide().empty()
  }

  /**
   * Updates the results view
   *
   * @param {*} img Image or canvas element
   * @param {object} [data] Metadata object
   * @param {boolean} [keepMetaData] Keep meta data if true
   */
  function updateResults(img, data, keepMetaData) {
    var isCanvas = window.HTMLCanvasElement && img instanceof HTMLCanvasElement
    if (!keepMetaData) {
      removeMetaData()
      if (data) {
        displayMetaData(data)
      }
      if (isCanvas) {
        actionsNode.show()
      } else {
        actionsNode.hide()
      }
    }
    if (!(isCanvas || img.src)) {
      resultNode
        .children()
        .replaceWith($('<span>Loading image file failed</span>'))
      return
    }
    var content = $('<a></a>').append(img)
    resultNode.children().replaceWith(content)
    if (data.imageHead) {
      if (data.exif) {
        // Reset Exif Orientation data:
        loadImage.writeExifData(data.imageHead, data, 'Orientation', 1)
      }
      img.toBlob(function (blob) {
        if (!blob) return
        loadImage.replaceHead(blob, data.imageHead, function (newBlob) {
          content
            .attr('href', loadImage.createObjectURL(newBlob))
            .attr('download', 'image.jpg')
        })
      }, 'image/jpeg')
    }
  }

  /**
   * Displays the image
   *
   * @param {File|Blob|string} file File or Blob object or image URL
   */
  function displayImage(file) {
    var options = {
      maxWidth: resultNode.width(),
      canvas: true,
      pixelRatio: window.devicePixelRatio,
      downsamplingRatio: 0.5,
      orientation: Number(orientationNode.val()) || true,
      imageSmoothingEnabled: imageSmoothingNode.is(':checked'),
      meta: true
    }
    if (!loadImage(file, updateResults, options)) {
      removeMetaData()
      resultNode
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

  /**
   * Handles drop and file selection change events
   *
   * @param {event} event Drop or file selection change event
   */
  function fileChangeHandler(event) {
    event.preventDefault()
    var originalEvent = event.originalEvent
    var target = originalEvent.dataTransfer || originalEvent.target
    var file = target && target.files && target.files[0]
    if (!file) {
      return
    }
    displayImage(file)
  }

  /**
   * Handles URL change events
   */
  function urlChangeHandler() {
    var url = $(this).val()
    if (url) displayImage(url)
  }

  // Show the URL/FileReader API requirement message if not supported:
  if (
    window.createObjectURL ||
    window.URL ||
    window.webkitURL ||
    window.FileReader
  ) {
    resultNode.children().hide()
  } else {
    resultNode.children().show()
  }

  $(document)
    .on('dragover', function (e) {
      e.preventDefault()
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'
    })
    .on('drop', fileChangeHandler)

  fileInputNode.on('change', fileChangeHandler)

  urlNode.on('change paste input', urlChangeHandler)

  orientationNode.on('change', function () {
    var img = resultNode.find('img, canvas')[0]
    if (img) {
      updateResults(
        loadImage.scale(img, {
          maxWidth: resultNode.width() * (window.devicePixelRatio || 1),
          pixelRatio: window.devicePixelRatio,
          orientation: Number(orientationNode.val()) || true,
          imageSmoothingEnabled: imageSmoothingNode.is(':checked')
        }),
        metaNode.data(),
        true
      )
    }
  })

  editNode.on('click', function (event) {
    event.preventDefault()
    var imgNode = resultNode.find('img, canvas')
    var img = imgNode[0]
    var pixelRatio = window.devicePixelRatio || 1
    var margin = img.width / pixelRatio >= 140 ? 40 : 0
    imgNode
      // eslint-disable-next-line new-cap
      .Jcrop(
        {
          setSelect: [
            margin,
            margin,
            img.width / pixelRatio - margin,
            img.height / pixelRatio - margin
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

  cropNode.on('click', function (event) {
    event.preventDefault()
    var img = resultNode.find('img, canvas')[0]
    var pixelRatio = window.devicePixelRatio || 1
    if (img && coordinates) {
      updateResults(
        loadImage.scale(img, {
          left: coordinates.x * pixelRatio,
          top: coordinates.y * pixelRatio,
          sourceWidth: coordinates.w * pixelRatio,
          sourceHeight: coordinates.h * pixelRatio,
          maxWidth: resultNode.width() * pixelRatio,
          contain: true,
          pixelRatio: pixelRatio,
          imageSmoothingEnabled: imageSmoothingNode.is(':checked')
        }),
        metaNode.data(),
        true
      )
      coordinates = null
    }
  })

  cancelNode.on('click', function (event) {
    event.preventDefault()
    if (jcropAPI) {
      jcropAPI.release()
      jcropAPI.disable()
    }
  })
})
