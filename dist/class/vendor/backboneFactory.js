'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _backboneClassFactory = require('./backboneClassFactory');

var _backboneClassFactory2 = _interopRequireDefault(_backboneClassFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function backboneFactory(customObj, BackboneClass) {

    return function () {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
        }

        var classProps = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
        return new (Function.prototype.bind.apply(BackboneClass.extend(Object.assign({}, customObj, classProps)), [null].concat(args)))();
    };

    /*return ( classProps = {}, ...args ) =>
        new (backboneClassFactory( customObj, BackboneClass ))( ...args )*/
}

exports.default = backboneFactory;