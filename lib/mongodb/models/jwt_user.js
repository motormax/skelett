'use strict'

const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  username: String,
  password: String,
  permissions: Array
}, {
  collection: 'jwt_users'
})

const JWTUser = mongoose.model('JWTUser', schema)

module.exports = JWTUser
