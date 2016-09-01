'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PlacesAdapter = function () {
    function PlacesAdapter() {
        _classCallCheck(this, PlacesAdapter);

        this.placeService = new google.maps.places.AutocompleteService();
        this.geocoder = new google.maps.Geocoder();
    }

    _createClass(PlacesAdapter, [{
        key: 'search',
        value: function search(query) {
            var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

            this.placeService.getPlacePredictions({
                input: query,
                types: ['geocode'],
                componentRestrictions: {
                    country: 'it'
                }
            }, function (suggestions, status) {
                //console.log('suggestions', suggestions);

                callback(suggestions, status);
            });
        }
    }, {
        key: 'fetchLatLng',
        value: function fetchLatLng(options) {
            var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

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