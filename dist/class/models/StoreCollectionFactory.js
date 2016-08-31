'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _backbone = require('backbone');

var _backboneFactory = require('../vendor/backboneFactory');

var _backboneFactory2 = _interopRequireDefault(_backboneFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var storeCollection = {
    /*initialize: function( options, classProps ) {
        console.log('initialize', arguments);
    },*/

    fetchStores: function fetchStores(_ref) {
        var lat = _ref.lat;
        var lng = _ref.lng;
        var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

        return this.fetch({
            data: {
                lat: lat,
                lng: lng
            },
            success: function success(data) {
                callback(data);
            },
            error: function error(_error) {
                callback(false, _error);
            }
        });
    }
};

exports.default = (0, _backboneFactory2.default)(storeCollection, _backbone.Collection);