'use strict'

const jwt = require('jsonwebtoken')

const skelett = require('../skelett')

const urlEncoded = skelett.bodyParser.urlencoded({ extended: true })

require('../mongodb/models/jwt_user')()

const JWTUser = skelett
  .connections[skelett._configuration.jwt.database]
  .model('JWTUser')

skelett.router.post('/jwt/authentication', urlEncoded, (request, response) => {
  const username = request.body.username
  const password = request.body.password

  JWTUser
    .findOne({
      username: username,
      password: password
    })
    .exec()
    .catch((error) => {
      console.error(error)

      return response
        .status(500)
        .skjson({
          status: 500,
          detail: 'Oops, looks like something went wrong. Please try again.'
        })
    })
    .then((user) => {
      if (!user) {
        return response
          .status(401)
          .skjson({
            status: 401,
            detail: 'Invalid credentials.'
          })
      }

      const token = jwt.sign(
        user,
        skelett._configuration.jwt.secret,
        skelett._configuration.jwt.options
      )

      response
        .status(201)
        .skjson({ token: token })
    })
})

module.exports = skelett.router
