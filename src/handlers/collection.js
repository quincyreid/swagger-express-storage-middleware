'use strict';

let debug = require('debug')('swagger:storage');

import _ from 'lodash';

const methods = {
  GET: find,
  HEAD: find,
  OPTIONS: find,
  // POST: mergeCollection,
  // PATCH: mergeCollection,
  // PUT: overwriteCollection,
  // DELETE: deleteCollection,
};

let Storage;

export default function handler(storage) {
  Storage = storage;
  return (req, res, next) => {
    return methods[req.method](req, res, next);
  }
}

function find(req, res, next) {
  let query = _.omit(req.query, _.isUndefined);
  Storage.find(req.swagger.resourceType, query, (err, resources) => {
    if (resources) {
      res.status(200);
      res.swagger.data = resources;
    }
    return next(err);
  });
}
