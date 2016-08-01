'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _backbone = require('backbone');

var _typeaheadFactory = require('../vendor/typeaheadFactory');

var _typeaheadFactory2 = _interopRequireDefault(_typeaheadFactory);

var _backboneFactory = require('../vendor/backboneFactory');

var _backboneFactory2 = _interopRequireDefault(_backboneFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var addressView = {
    events: {
        'click': 'pickerHandler',
        'keyup': 'pickerHandler'
    },
    initialize: function initialize(options) {
        var view = this;

        var placeService = new google.maps.places.AutocompleteService();

        (0, _typeaheadFactory2.default)(options.jQuery, view.el, {
            display: 'description',
            async: true,
            source: function source(query, sync, async) {
                placeService.getQueryPredictions({ input: query }, function (suggestions, status) {
                    console.log('suggestions', suggestions);

                    async(suggestions);
                });
            }
        });

        /*if( options.addressText ) {
            this.$el.val( options.addressText );
        }
         view.$el.bind('typeahead:selected', function(evt, place) {
            placeService.getDetails(place, function( result ) {
                var location = {
                    lat: result.geometry.location.lat(),
                    lng: result.geometry.location.lng()
                };
                options.serviceContainer.setLocation( location, true );
                 view.$el.blur();
                 /!*view.collection.fetch({
                 data: location
                 });*!/
            });
        });
        options.serviceContainer.set('map', addressPicker.map );
        options.serviceContainer.set('placeService', placeService );
         if( options.cancelAddressSelector ) {
            $( options.cancelAddressSelector ).on('click', function( evt ) {
                view.$el.val('');
            });
        }*/
    },
    pickerHandler: function pickerHandler(evt, result) {
        var view = this;

        //console.log('event', evt.keyCode);

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