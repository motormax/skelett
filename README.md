# Motormax Skelett

A humble bundle for agile application development using Express, Mongoose & JWT.

**Warning!** Project under development, use it at your own risk.

## Installation

```bash
$ npm install motormax-skelett
```

## Getting started

This tutorial assumes that you are familiar with Express, Mongoose & JWT.

### Configuration

Skelett has a variety of useful options that you can configure. The following code shows you how to set up and create an application with it.

```js
const skelett = require('motormax-skelett')

const configuration = {
  server: {
    // Server listening port.
    port: 3001 // 3000 by default.
  },
  // Mongoose promised connections. Optional.
  connections: [{
    // MongoDB database identifier.
    name: 'alpha', // `c0` by default.
    // MongoDB connection URI.
    uri: 'mongodb://127.0.0.1:27017/motormax_alpha'
  }, {
    name: 'beta', // `c1` by default.
    uri: 'mongodb://127.0.0.1:27017/motormax_beta'
  }],
  // Parses incoming `application/json` request bodies. Optional.
  jsonParser: true,
  // Auth0 JSON Web Tokens implementation. Optional.
  jwt: {
    // An existing MongoDB database identifier to create
    // a `jwt_users` collection.
    database: 'alpha',
    // Secret for HMAC algorithms, PEM encoded public key for RSA & ECDSA
    // are not supported yet.
    secret: 'afghanhound',
    // See https://github.com/auth0/node-jsonwebtoken for available options.
    options: {
      algorithm: 'HS384', // `HS256` by default.
      expiresIn: '1h' // `1d` by default.
    }
  },
  // Express response module extension. Optional.
  response: {
    // Custom JSON response that allows you to add additional HTTP headers
    // and meta info. In addition to this, the status code determines
    // the body structure according to it definition.
    skjson: {
      headers: {
        'Content-Language': 'en',
        'Content-Type': 'application/json'
      },
      // If it is defined, provides additional information in the response body.
      // You can add custom fields to this object.
      meta: {
        name: 'Motormax API', // `Motormax Application` by default.
        version: '2.0', // `1.0.0` by default.
      }
    }
  },
  // Helmet security middleware, enabled by default. Optional.
  // See https://github.com/helmetjs/helmet for available options.
  security: {
    frameguard: {
      action: 'allow-from',
      domain: 'http://motormax.la'
    }
  }
}

// Creates an application based on the configuration settings and gets
// an instance of Express.
const application = skelett.create(configuration)

// Time to code your application...
application.get('/', (request, response, next) {
  ...
})
```

### JWT authentication

Skelett provides a simple authentication mechanism using JSON Web Tokens. In a nutshell, uses a custom user model for token signing and validates it to authorize user access.

**Caution!** This implementation affects to all application endpoints.

#### Creating a JWT User

First, you need to configure `jwt` in order to create a JWT User; it is required for token negotiation. You can create it manually by inserting a document into the `jwt_users` collection or also by creating a new `JWTUser` as shown in the following example. This is a first approach, additional fields and password encoding are not supported yet.

```js
// Gets the model through the provided database identifier in the configuration.
const JWTUser = skelett.connections['alpha'].model('JWTUser')

const jwtUser = new JWTUser({
  username: 'dronchieri',
  password: 'P3t4Ls',
  permissions: ['backoffice:create', 'backoffice:read', 'backoffice:update']
})

jwtUser.save((error) => {
  if (error) {
    ...
  }

  // Saved!
})
```

#### Token negotiation

You can get a token by issuing a `POST` request with the following credentials to the JWT authentication endpoint.

##### Endpoint

```
http://<domain>[:<port>]/jwt/authentication
```

##### Body

```
application/x-www-form-urlencoded

username: dronchieri
password: P3t4Ls
```

##### Response

```json
{
  "data": [{
    "token": "<token>"
  }]
}
```

#### Token verification

Once the token is obtained, it must be sent with every request using the `X-Skelett-Token` HTTP header. If the token is valid, it will be decoded and attached to Skelett. It can be accessed through `skelett.user`.

### Middleware

Skelett exposes the following middleware functions to facilitate application development.

```js
// Express Router (https://github.com/expressjs/express)
skelett.router.get('/about', (request, response, next) => {
  response.send('About Motormax')
})

// Mongoose (https://github.com/Automattic/mongoose)
const employeeSchema = new skelett.odm.Schema({
  name: {
    first: String,
    last: String
  },
  company: String,
  position: String
})

const Employee = skelett.odm.model('Employee', employeeSchema)

const employee = new Employee({
  name: {
    first: 'Santiago',
    last: 'Raviolo'
  },
  company: 'Motormax',
  position: 'Unknown'
})

// Body parser (https://github.com/expressjs/body-parser)
const urlEncoded = skelett.bodyParser.urlencoded({ extended: true })

application.post('/contact', urlEncoded, (request, response, next) => {
  const name = request.body.name
  const email = request.body.email
  const phone = request.body.phone
  ...
})

// CORS (https://github.com/expressjs/cors)
application.use(skelett.cors())

// JWT access control: checks permissions and decides whether or not
// the user is enabled to access a given resource.
const accessControl = skelett.grantAccess(['backoffice:read'])

application.get('/backoffice', accessControl, (request, response, next) => {
  ...
})
```

## Issues

Before reporting an issue (e.g. bug, enhacement, feature), check the currently [open issues](https://github.com/motormax/skelett/issues) to make sure that you are not creating a duplicate.

Before reporting a bug, please make sure that Skelett is really the cause of the problem.

When reporting an issue, please provide as much context as possible. Thank you for your contribution.

## License

This project is licensed under the [MIT License](LICENSE).
