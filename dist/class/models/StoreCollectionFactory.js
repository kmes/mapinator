'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _backbone = require('backbone');

var _backboneFactory = require('../vendor/backboneFactory');

var _backboneFactory2 = _interopRequireDefault(_backboneFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var storeCollection = {
    /*initialize: function( options, classProps ) {
        console.log('initialize', arguments);
    },*/

    fetchStores: function fetchStores() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
        var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

        return this.fetch(_extends({}, options, {

            success: function success(data) {
                callback(data);
            },
            error: function error(_error) {
                callback(false, _error);
            }
        }));
    }
};

exports.default = (0, _backboneFactory2.default)(storeCollection, _backbone.Collection);