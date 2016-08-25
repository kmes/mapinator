'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.default = typeaheadFactory;

var _typeahead = require('typeahead.js-browserify');

var _typeahead2 = _interopRequireDefault(_typeahead);

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

    var placesSource = new _typeahead.Bloodhound({
        datumTokenizer: function datumTokenizer(obj) {
            return _typeahead.Bloodhound.tokenizers.whitespace(obj.description);
        },
        /*datumTokenizer: function(obj) {
            //console.log('datumTokenizer', obj);
            console.log( 'tokenizers', Bloodhound.tokenizers.whitespace(obj.description) );
             //return obj.description;
             return Bloodhound.tokenizers.whitespace(obj.description);
             //return Bloodhound.tokenizers.whitespace.call(this, arguments);
            //return Bloodhound.tokenizers.obj.whitespace('value').call(this, arguments);
             //return Bloodhound.tokenizers.obj.whitespace('description')( obj );
        },
        queryTokenizer: function(query) {
            //console.log('queryTokenizer', query);
            console.log( 'tokenizers', Bloodhound.tokenizers.whitespace( query ) );
             //return query;
             return Bloodhound.tokenizers.whitespace(query);
        },*/
        /*identify: (obj) => {
            console.log('identify', obj);
             return obj.description;
        },*/
        queryTokenizer: _typeahead.Bloodhound.tokenizers.whitespace,
        local: [{
            description: 'milano assago'
        }, {
            description: 'Milanoo'
        }]
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