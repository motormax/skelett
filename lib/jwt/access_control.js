'use strict'

const _ = require('lodash/core')
const intersection = require('lodash/intersection')
const uniq = require('lodash/uniq')

const skelett = require('../skelett')

skelett.grantAccess = function(argument) {
  if (_.isString(argument)) {
    argument = [argument]
  }

  if (!_.isArray(argument) || _.isEmpty(argument) || !argument.every(isStringElement)) {
    throw new TypeError('Skelett "grantAccess()" argument must be a string or an array of strings.')
  }

  argument = uniq(argument)

  function isStringElement(element) {
    return _.isString(element)
  }

  return function(request, response, next) {
    const permissions = uniq(skelett.user._doc.permissions)
    const commonElements = intersection(permissions, argument)

    if (commonElements.length !== argument.length) {
      return response
        .status(401)
        .skjson({
          status: 401,
          detail: 'Access denied.'
        })
    }

    next()
  }
}
