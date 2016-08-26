'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.default = typeaheadFactory;

var _typeahead = require('typeahead.js-browserify');

var _typeahead2 = _interopRequireDefault(_typeahead);

var _PlacesBloodhoundEngine = require('./PlacesBloodhoundEngine');

var _PlacesBloodhoundEngine2 = _interopRequireDefault(_PlacesBloodhoundEngine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function typeaheadFactory(window, selector, datasets) {
    //require('typeahead.js/dist/typeahead.bundle.js');

    /*var placesSource = new Bloodhound({
        //queryTokenizer: Bloodhound.tokenizers.whitespace,
        //datumTokenizer: Bloodhound.tokenizers.whitespace,
        queryTokenizer: (d) => Bloodhound.tokenizers.whitespace,
        datumTokenizer: (d) => Bloodhound.tokenizers.whitespace(d.description),
        //identify: (obj) => obj.description,
        local: [
            {
                description: 'milano'
            },
            {
                description: 'Milano'
            }
        ]
    });*/

    /*var placeService = new google.maps.places.AutocompleteService();
     var placesSource = new Bloodhound({
        datumTokenizer: (obj) => Bloodhound.tokenizers.whitespace(obj.description),
        queryTokenizer: function(query) {
            var engine = this;
            placeService.getQueryPredictions({ input: query }, function(suggestions, status) {
                engine.add( suggestions );
            });
             return Bloodhound.tokenizers.whitespace( query );
        },
        local:
        [
            {
                description: 'milano assago'
            },
            {
                description: 'Milanoo'
            }
        ]
    });*/

    var placesSource = new _PlacesBloodhoundEngine2.default({
        placeService: new google.maps.places.AutocompleteService()
    });

    return function (window, placesSource) {
        console.log(typeof window === 'undefined' ? 'undefined' : _typeof(window));
        _typeahead2.default.loadjQueryPlugin();

        //return window.jQuery( selector ).typeahead( {}, datasets );

        return window.jQuery(selector).typeahead({}, {
            display: 'description',
            source: placesSource
        });
    }.bind(window)(window, placesSource);
}