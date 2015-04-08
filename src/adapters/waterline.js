'use strict';

let debug = require('debug')('swagger:storage');

import _ from 'lodash';

import Storage from '../';

import Waterline from 'waterline';

export default class WaterlineAdapter extends Storage {

  constructor(config) {

    super();

    if (! config) {
      throw new Error('Waterline configuration is required');
    }

    this.config = config;

    this.engine = new Waterline();

  }

  initialize(resources, callback) {

    for (let resource in resources) {

      let schema = {};

      schema.attributes = _.pick(resources[resource].properties, ['type', 'enum']);
      // schema.attributes = _.clone(resources[resource].properties, true);

      schema.identity = resource.toLowerCase();

      // @todo This should be customisable.
      schema.connection = 'default';

      // Load the resource into Waterline.
      this.engine.loadCollection(Waterline.Collection.extend(schema));

    }

    this.engine.initialize(this.config, (err, details) => {

      // Store the initialized Waterline models.
      this.models = details.collections;

      // Store the Waterline connections.
      this.connections = details.connections;

      debug('Initialized Waterline storage engine.');

      if (typeof callback === 'function') {
        return callback(err);
      }

    });

  }

  find(model, query, callback) {
    debug('Finding %s', model);
    this.getModel(model).find(query).exec(function(error, resources) {
      return callback(error, resources);
    });
  }

  // @todo Does this method serve any real purpose?
  findOne(model, query, callback) {
    debug('Finding %s', model);
    this.getModel(model).findOne(query).exec(function(error, resource) {
      return callback(error, resource);
    });
  }

  // @todo Allow customizing ID parameter name.
  findById(model, id, callback) {
    debug('Finding %s %s', model, id);
    this.getModel(model).findOne({ id: id }).exec(function(error, resource) {
      callback(error, resource);
    });
  }

  create(model, properties, callback) {
    debug('Creating %s', model);
    this.getModel(model).create(properties).exec(function(error, resource) {
      return callback(error, resource);
    });
  }

  update(model, id, properties, callback) {
    debug('Updating %s %s', model, id);
    // Don't pass ID in updated properties.
    delete properties.id;
    this.getModel(model).update({ id: id }, properties).exec(function(error, resource) {
      return callback(error, resource);
    });
  }

  destroy(model, id, callback) {
    debug('Deleting %s %s', model, id);
    // @todo Use findById logic? Why does exec return array?
    this.getModel(model).destroy({ id: id }).exec(function(error, resources) {
      return callback(error, resources[0] || undefined);
    });
  }

}
