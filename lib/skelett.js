'use strict'

const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const helmet = require('helmet')
const mongoose = require('mongoose')
const _ = require('lodash/core')
const _first = require('lodash/first')
const _inRange = require('lodash/inRange')
const _isPlainObject = require('lodash/isPlainObject')

const DEFAULT_SERVER_PORT = 3000

class Skelett {
  constructor() {
    this._application = express()
    this.router = express.Router()
    this.odm = mongoose
    this.bodyParser = bodyParser
    this.cors = cors
  }

  create(configuration = {}) {
    if (!this._created) {
      if (!_isPlainObject(configuration)) {
        throw new TypeError('Skelett "configuration" must be a plain object.')
      }

      this._configuration = configuration

      if (_.isUndefined(this._configuration.server)) {
        this._configuration.server = {}
      }

      if (!_isPlainObject(this._configuration.server)) {
        throw new TypeError('Skelett "configuration.server" must be a plain object.')
      }

      if (_.isUndefined(this._configuration.server.port)) {
        this._configuration.server.port = DEFAULT_SERVER_PORT
      }

      const serverPortErrorMessage = 'Skelett "configuration.server.port" must be a natural number in the range of 1 to 65535.'

      if (!_.isFinite(this._configuration.server.port) || this._configuration.server.port % 1 !== 0) {
        throw new TypeError(serverPortErrorMessage)
      }

      if (!_inRange(this._configuration.server.port, 1, 65536)) {
        throw new RangeError(serverPortErrorMessage)
      }

      this.connections = require('./mongodb/connection')(this._configuration.connections)

      if (!_.isUndefined(this._configuration.jwt)) {
        if (!_isPlainObject(this._configuration.jwt)) {
          throw new TypeError('Skelett "configuration.jwt" must be a plain object.')
        }

        if (_.isUndefined(this._configuration.jwt.database)) {
          this._configuration.jwt.database = _first(_.keys(this.connections))
        }

        if (!_.isString(this._configuration.jwt.database)) {
          throw new TypeError('Skelett "configuration.jwt.database" must be a string.')
        }

        if (!_.isString(this._configuration.jwt.secret)) {
          throw new TypeError('Skelett "configuration.jwt.secret" must be a string.')
        }

        if (_.isUndefined(this._configuration.jwt.options)) {
          this._configuration.jwt.options = {}
        }

        if (!_isPlainObject(this._configuration.jwt.options)) {
          throw new TypeError('Skelett "configuration.jwt.options" must be a plain object.')
        }

        if (_.isUndefined(this._configuration.jwt.options.expiresIn)) {
          this._configuration.jwt.options.expiresIn = '1d'
        }

        this._application
          .use(require('./jwt/authentication'))
          .use(require('./jwt/verification'))

        require('./jwt/access_control')
      }

      if (!_.isUndefined(this._configuration.jsonParser)) {
        if (!_.isBoolean(this._configuration.jsonParser)) {
          throw new TypeError('Skelett "configuration.jsonParser" must be a boolean.')
        }

        if (this._configuration.jsonParser) {
          this._application.use(this.bodyParser.json())
        }
      }

      if (_.isUndefined(this._configuration.security)) {
        this._configuration.security = {}
      }

      if (!_isPlainObject(this._configuration.security)) {
        throw new TypeError('Skelett "configuration.security" must be a plain object.')
      }

      this._application.use(helmet(this._configuration.security))

      require('./extensions/express')(this._configuration)

      this._application.listen(this._configuration.server.port)

      this._created = true
    }

    return this._application
  }
}

module.exports = new Skelett
