'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _backbone = require('backbone');

var _typeaheadFactory = require('../vendor/typeaheadFactory');

var _typeaheadFactory2 = _interopRequireDefault(_typeaheadFactory);

var _backboneFactory = require('../vendor/backboneFactory');

var _backboneFactory2 = _interopRequireDefault(_backboneFactory);

var _bloodhound = require('typeahead.js/dist/bloodhound.js');

var _bloodhound2 = _interopRequireDefault(_bloodhound);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//console.log('Bloodhound', Bloodhound);

var addressView = {
    events: {
        'click': 'pickerHandler',
        'keyup': 'pickerHandler'
    },
    initialize: function initialize(options) {
        var view = this;

        var placeService = new google.maps.places.AutocompleteService();

        /*typeaheadFactory({
            jQuery,
            el: view.el,
            options: null,
            datasets: {
                name: 'locations',
                display: ( suggestion ) => suggestion.description,
                async: true,
                source: function( query, syncResults, asyncResults ) {
                    placeService.getQueryPredictions({ input: query }, function(suggestions, status) {
                        console.log('suggestions', suggestions.map((sug) => sug.description));
                         asyncResults( suggestions );
                    });
                }
            }
        });*/

        /*var sourcePlaces = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('description'),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            identify: (obj) => obj.description,
         });*/

        (0, _typeaheadFactory2.default)(window, view.el, {
            name: 'places',
            //display: 'description',
            //async: true,
            source: function source(query, sync) {
                //window.ssync = sync;
                placeService.getQueryPredictions({ input: query }, function (suggestions, status) {
                    var sugList = suggestions.map(function (sug) {
                        return sug.description;
                    });

                    console.log('suggestions', suggestions);
                    console.log('sugList', sugList);

                    sync(sugList);
                });
            }
        });
    },
    pickerHandler: function pickerHandler(evt, result) {
        var view = this;

        switch (evt.type) {
            case 'keyup':
                var keyCode = evt.keyCode || evt.which;
                if (keyCode == 40 || keyCode == 38) {
                    break;
                }
                setTimeout(function () {
                    $('.tt-dataset-0').find('.tt-suggestion').eq(0).addClass('tt-cursor');
                }, 200);
                break;
            case 'click':
                view.el.setSelectionRange(0, view.el.value.length);
                break;
        }
    }
};

exports.default = (0, _backboneFactory2.default)(addressView, _backbone.View);