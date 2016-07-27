'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _backbone = require('backbone');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var StoreCollection = function (_Collection) {
    _inherits(StoreCollection, _Collection);

    function StoreCollection(_ref) {
        var url = _ref.url;
        var parseResponse = _ref.parseResponse;

        _classCallCheck(this, StoreCollection);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(StoreCollection).call(this, {}, {
            url: url,
            parse: parseResponse
        }));
    }

    _createClass(StoreCollection, [{
        key: 'fetchStores',
        value: function fetchStores(location) {
            var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

            return this.fetch({
                data: {
                    lat: location.lat,
                    lng: location.lng
                },
                success: function success(data) {
                    callback(data);
                },
                error: function error(_error) {
                    callback(false, _error);
                }
            });
        }
    }]);

    return StoreCollection;
}(_backbone.Collection);

exports.default = StoreCollection;