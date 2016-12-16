'use strict'

const bodyParser = require('body-parser')
const express = require('express')
const mongoose = require('mongoose')
const _ = require('lodash')

const DEFAULT_SERVER_PORT = 3000

class Skelett {
  constructor() {
    this._application = express()
    this.odm = mongoose
    this.bodyParser = bodyParser
  }

  create(configuration = {}) {
    if (!this._created) {
      if (!_.isPlainObject(configuration)) {
        throw new TypeError('Skelett "configuration" must be a plain object.')
      }

      this._configuration = configuration

      if (_.isUndefined(this._configuration.server)) {
        this._configuration.server = {}
      }

      if (!_.isPlainObject(this._configuration.server)) {
        throw new TypeError('Skelett "configuration.server" must be a plain object.')
      }

      if (_.isUndefined(this._configuration.server.port)) {
        this._configuration.server.port = DEFAULT_SERVER_PORT
      }

      const serverPortErrorMessage = 'Skelett "configuration.server.port" must be a natural number in the range of 1 to 65535.'

      if (!_.isFinite(this._configuration.server.port) || this._configuration.server.port % 1 !== 0) {
        throw new TypeError(serverPortErrorMessage)
      }

      if (!_.inRange(this._configuration.server.port, 1, 65536)) {
        throw new RangeError(serverPortErrorMessage)
      }

      this.connections = require('./mongodb/connection')(this._configuration.connections)

      if (!_.isUndefined(this._configuration.jsonParser)) {
        if (!_.isBoolean(this._configuration.jsonParser)) {
          throw new TypeError('Skelett "configuration.jsonParser" must be a boolean.')
        }

        if (this._configuration.jsonParser) {
          this._application.use(this.bodyParser.json())
        }
      }

      require('./extensions/express')(this._configuration)

      this._application.listen(this._configuration.server.port)

      this._created = true
    }

    return this._application
  }
}

module.exports = new Skelett
