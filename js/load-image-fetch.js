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

/* global define, module, require, Promise */

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
      if (global.Promise && typeof callback !== 'function') {
        return fetch(new Request(url, callback)).then(function (response) {
          return response.blob()
        })
      }
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
      /**
       * Promise executor
       *
       * @param {Function} resolve Resolution function
       * @param {Function} reject Rejection function
       */
      function executor(resolve, reject) {
        options = options || {} // eslint-disable-line no-param-reassign
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
          resolve(req.response)
        }
        req.onerror = req.onabort = req.ontimeout = function (err) {
          if (resolve === reject) {
            // Not using Promises
            reject(null, err)
          } else {
            reject(err)
          }
        }
        req.send(options.body)
      }
      if (global.Promise && typeof callback !== 'function') {
        options = callback // eslint-disable-line no-param-reassign
        return new Promise(executor)
      }
      return executor(callback, callback)
    }
  }
})
