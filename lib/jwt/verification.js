'use strict'

const jwt = require('jsonwebtoken')

const skelett = require('../skelett')

skelett.router.use((request, response, next) => {
  if (request.method === 'OPTIONS') {
    return next()
  }

  const token = request.get('X-Skelett-Token')

  if (token) {
    return jwt.verify(
      token,
      skelett._configuration.jwt.secret,
      (error, decoded) => {
        if (error) {
          const reason = error.name !== 'TokenExpiredError'
            ? 'Invalid'
            : 'Expired'

          return response
            .status(401)
            .skjson({
              status: 401,
              detail: `${reason} token.`
            })
        }

        skelett.user = decoded

        next()
      }
    )
  }

  response
    .status(403)
    .skjson({
      status: 403,
      detail: 'Token not provided.'
    })
})

module.exports = skelett.router
