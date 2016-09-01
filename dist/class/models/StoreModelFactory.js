'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _backbone = require('backbone');

var _backbone2 = _interopRequireDefault(_backbone);

var _backboneFactory = require('../vendor/backboneFactory');

var _backboneFactory2 = _interopRequireDefault(_backboneFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var storeModel = {
  /*initialize: function( options, classProps ) {
   console.log('initialize', arguments);
   }*/
};

exports.default = (0, _backboneFactory2.default)(storeModel, _backbone2.default.Model);