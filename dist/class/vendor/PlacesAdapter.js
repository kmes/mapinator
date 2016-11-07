'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PlacesAdapter = function () {
    function PlacesAdapter() {
        var autocompletionRequest = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, PlacesAdapter);

        this.placeService = new google.maps.places.AutocompleteService();
        this.geocoder = new google.maps.Geocoder();

        this.defaultAutocompletionRequest = {
            input: 'italy',
            types: ['geocode'],
            componentRestrictions: {
                country: 'it'
            }
        };

        this.setAutocompletionRequest(autocompletionRequest);
    }

    _createClass(PlacesAdapter, [{
        key: 'setAutocompletionRequest',
        value: function setAutocompletionRequest() {
            var autocompletionRequest = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            var defaultAutocompletionRequest = this.defaultAutocompletionRequest;

            return this.autocompletionRequest = _extends({}, defaultAutocompletionRequest, autocompletionRequest);
        }
    }, {
        key: 'getAutocompletionRequest',
        value: function getAutocompletionRequest() {
            var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

            if (query) {
                this.autocompletionRequest.query = query;
            }

            return this.autocompletionRequest;
        }
    }, {
        key: 'search',
        value: function search(query) {
            var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

            this.placeService.getPlacePredictions(this.getAutocompletionRequest(query), function (suggestions, status) {
                //console.log('suggestions', suggestions);

                callback(suggestions, status);
            });
        }
    }, {
        key: 'fetchPlaceByLatLng',
        value: function fetchPlaceByLatLng(options) {
            var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

            this.geocoder.geocode(options, function (results, status) {
                if (status !== 'OK' || !results.length) {
                    callback(false);
                    return false;
                }

                callback(results.shift());
            });
        }
    }]);

    return PlacesAdapter;
}();

exports.default = PlacesAdapter;