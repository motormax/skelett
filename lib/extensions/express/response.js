'use strict'

const express = require('express')
const _ = require('lodash/core')
const _inRange = require('lodash/inRange')
const _isPlainObject = require('lodash/isPlainObject')

const DEFAULT_APPLICATION_NAME = 'Motormax Application'
const DEFAULT_APPLICATION_VERSION = '1.0.0'

module.exports = function(configuration = {}) {
  if (!_isPlainObject(configuration)) {
    throw new TypeError('Skelett "configuration.response" must be a plain object.')
  }

  let headers = false
  const body = {}

  if (!_.isUndefined(configuration.skjson)) {
    if (!_isPlainObject(configuration.skjson)) {
      throw new TypeError('Skelett "configuration.response.skjson" must be a plain object.')
    }

    if (!_.isUndefined(configuration.skjson.headers)) {
      if (!_isPlainObject(configuration.skjson.headers)) {
        throw new TypeError('Skelett "configuration.response.skjson.headers" must be a plain object.')
      }

      for (let key in configuration.skjson.headers) {
        if (!_.isString(configuration.skjson.headers[key])
          || _.isEmpty(configuration.skjson.headers[key])) {
          throw new TypeError(`Skelett "configuration.response.skjson.headers.${key}" must be a non empty object.`)
        }
      }

      headers = true
    }

    if (!_.isUndefined(configuration.skjson.meta)) {
      if (!_isPlainObject(configuration.skjson.meta)) {
        throw new TypeError('Skelett "configuration.response.skjson.meta" must be a plain object.')
      }

      if (_.isUndefined(configuration.skjson.meta.name)) {
        configuration.skjson.meta.name = DEFAULT_APPLICATION_NAME
      }

      if (!_.isString(configuration.skjson.meta.name)) {
        throw new TypeError('Skelett "configuration.response.skjson.meta.name" must be a string.')
      }

      if (_.isUndefined(configuration.skjson.meta.version)) {
        configuration.skjson.meta.version = DEFAULT_APPLICATION_VERSION
      }

      if (!_.isString(configuration.skjson.meta.version)) {
        throw new TypeError('Skelett "configuration.response.skjson.meta.version" must be a string.')
      }

      body.meta = configuration.skjson.meta
    }
  }

  express.response.skjson = function(data) {
    if (headers) {
      for (let key in configuration.skjson.headers) {
        this.set(key, configuration.skjson.headers[key])
      }
    }

    delete body.data
    delete body.errors

    if (_inRange(this.statusCode, 200, 400)
      || _inRange(this.statusCode, 600, 1000)) {
      body.data = [data]
    } else if (_inRange(this.statusCode, 400, 600)) {
      body.errors = [data]
    }

    this.json(body)
  }
}
