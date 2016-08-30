"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bloodhound = require("typeahead.js/dist/bloodhound");

var _bloodhound2 = _interopRequireDefault(_bloodhound);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PlacesBloodhoundEngine = function (_Bloodhound) {
    _inherits(PlacesBloodhoundEngine, _Bloodhound);

    function PlacesBloodhoundEngine() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, PlacesBloodhoundEngine);

        var _this = _possibleConstructorReturn(this, (PlacesBloodhoundEngine.__proto__ || Object.getPrototypeOf(PlacesBloodhoundEngine)).call(this, _extends({}, options, {
            datumTokenizer: function datumTokenizer(obj) {
                return _bloodhound2.default.tokenizers.whitespace(obj.description);
            },
            queryTokenizer: function queryTokenizer(query) {
                _this.onSearch(query);

                return _bloodhound2.default.tokenizers.whitespace(query);
            },
            identify: function identify(obj) {
                return obj.id;
            }
        })));

        _this.setServiceAdapter(options.serviceAdapter);
        return _this;
    }

    _createClass(PlacesBloodhoundEngine, [{
        key: "onSearch",
        value: function onSearch(query) {
            var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

            var self = this;

            this.getServiceAdapter().search(query, function (suggestions, status) {
                self.add(suggestions);

                callback(suggestions);
            });
        }
    }, {
        key: "setServiceAdapter",
        value: function setServiceAdapter(serviceAdapter) {
            return this.serviceAdapter = serviceAdapter;
        }
    }, {
        key: "getServiceAdapter",
        value: function getServiceAdapter() {
            return this.serviceAdapter || null;
        }
    }]);

    return PlacesBloodhoundEngine;
}(_bloodhound2.default);

exports.default = PlacesBloodhoundEngine;