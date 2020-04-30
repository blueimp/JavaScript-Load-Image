/*
 * JavaScript Load Image Fetch
 * https://github.com/blueimp/JavaScript-Load-Image
 *
 * Copyright 2017, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 */

/* global define, module, require */

;(function (factory) {
  'use strict'
  if (typeof define === 'function' && define.amd) {
    // Register as an anonymous AMD module:
    define(['./load-image'], factory)
  } else if (typeof module === 'object' && module.exports) {
    factory(require('./load-image'))
  } else {
    // Browser globals:
    factory(window.loadImage)
  }
})(function (loadImage) {
  'use strict'

  var global = loadImage.global

  if (global.fetch && global.Request) {
    loadImage.fetchBlob = function (url, callback, options) {
      fetch(new Request(url, options))
        .then(function (response) {
          return response.blob()
        })
        .then(callback)
        .catch(function (err) {
          callback(null, err)
        })
    }
  } else if (global.XMLHttpRequest && global.ProgressEvent) {
    // Browser supports XHR Level 2 and XHR responseType blob
    loadImage.fetchBlob = function (url, callback, options) {
      // eslint-disable-next-line no-param-reassign
      options = options || {}
      var req = new XMLHttpRequest()
      req.open(options.method || 'GET', url)
      if (options.headers) {
        Object.keys(options.headers).forEach(function (key) {
          req.setRequestHeader(key, options.headers[key])
        })
      }
      req.withCredentials = options.credentials === 'include'
      req.responseType = 'blob'
      req.onload = function () {
        callback(req.response)
      }
      req.onerror = req.onabort = req.ontimeout = function (err) {
        callback(null, err)
      }
      req.send(options.body)
    }
  }
})
