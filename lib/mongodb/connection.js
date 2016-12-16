'use strict'

const mongoose = require('mongoose')
const _ = require('lodash')

mongoose.Promise = global.Promise

module.exports = function(configuration = []) {
  if (!_.isArray(configuration)) {
    throw new TypeError('Skelett "configuration.connections" must be an array.')
  }

  const connections = []

  for (let connection in configuration) {
    if (!_.isObject(configuration[connection])) {
      throw new TypeError(`Skelett "configuration.connections[${connection}]" must be an object.`)
    }

    let name = configuration[connection].name

    if (_.isUndefined(name)) {
      name = `c${connection.toString()}`
    }

    if (!_.isString(name)) {
      throw new TypeError(`Skelett "configuration.connections[${connection}].name" must be a string.`)
    }

    const uri = configuration[connection].uri

    if (!_.isString(uri)) {
      throw new TypeError(`Skelett "configuration.connections[${connection}].uri" must be a string.`)
    }

    connections[name] = mongoose.createConnection(uri)
      .on('error', (error) => {
        console.error(error)
      })
  }

  return connections
}
