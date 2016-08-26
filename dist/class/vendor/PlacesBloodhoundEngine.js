'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeahead = require('typeahead.js-browserify');

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
                return _typeahead.Bloodhound.tokenizers.whitespace(obj.description);
            },
            queryTokenizer: function queryTokenizer(query) {
                _this.onSearch(query);

                return _typeahead.Bloodhound.tokenizers.whitespace(query);
            },
            identify: function identify(obj) {
                return obj.id;
            }
        })));

        _this.setPlaceService(options.placeService);
        return _this;
    }

    _createClass(PlacesBloodhoundEngine, [{
        key: 'onSearch',
        value: function onSearch(query) {
            var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

            var self = this;

            this.searchPlace(query, function (suggestions, status) {
                self.add(suggestions);

                //console.log('sug added', suggestions);

                callback(suggestions);
            });
        }
    }, {
        key: 'setPlaceService',
        value: function setPlaceService(placeService) {
            return this.placeService = placeService;
        }
    }, {
        key: 'getPlaceService',
        value: function getPlaceService() {
            return this.placeService || null;
        }
    }, {
        key: 'searchPlace',
        value: function searchPlace(query) {
            var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

            var self = this;

            var placeService = this.getPlaceService();
            if (!placeService) {
                callback(false);
                return false;
            }

            placeService.getPlacePredictions({
                input: query,
                types: ['(cities)'],
                componentRestrictions: {
                    country: 'it'
                }
            }, function (suggestions, status) {
                console.log('suggestions', suggestions);
                callback(suggestions, status);
            });
        }
    }]);

    return PlacesBloodhoundEngine;
}(_typeahead.Bloodhound);

exports.default = PlacesBloodhoundEngine;