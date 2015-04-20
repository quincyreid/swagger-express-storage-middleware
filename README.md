# Swagger Express Storage Middleware

Storage engine middleware for use with [Swagger Express Middleware](https://github.com/BigstickCarpet/swagger-express-middleware).

Currently supports the following adapters:

- [Waterline](https://github.com/balderdashy/waterline)

## Install

```bash
npm install swagger-express-storage-middleware --save
```

## Usage

```javascript
var path = require('path');
var express =  require('express');
var swagger = require('swagger-express-middleware');
// Load the correct adapter layer.
var Storage = require('swagger-express-storage-middleware/lib/adapters/waterline');

var app = express();
var spec = path.join(__dirname, 'api/spec.yaml');
var storage = new Storage(require('./storage/disk-adapter'));

swagger(spec, app, function(err, middleware, api, metadata) {

  storage.initialize(api.definitions, function(err) {

    // All middleware loaded via 'middleware' comes from the Swagger Express Middleware package.
    app.use(middleware.metadata());

    app.use(middleware.files());

    app.use(middleware.CORS());

    app.use(middleware.parseRequest());

    app.use(middleware.validateRequest());

    app.use(function(req, res, next) {
      // debugger;
      return next();
    });

    // Load the storage middleware.
    app.use(storage.middleware());

    // The storage middleware sets a `res.swagger.data` property, if a resource
    // is found. However, it needs to be returned to the client (this allows
    // the application to do more processing, if desired).
    app.use(function(req, res, next) {
      // debugger;
      if (res.swagger.data) {
        return res.json(res.swagger.data);
      } else if (res.statusCode === 204) {
        return res.end();
      }
      return next();
    });

    var server = app.listen(process.env.PORT || 3000, function(err) {
      console.log('%s is now running on port %d', api.info.title, server.address().port);
    });

  });

});
```
