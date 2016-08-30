'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _backbone = require('backbone');

var _PlacesBloodhoundEngine = require('../vendor/PlacesBloodhoundEngine');

var _PlacesBloodhoundEngine2 = _interopRequireDefault(_PlacesBloodhoundEngine);

var _typeaheadFactory = require('../vendor/typeaheadFactory');

var _typeaheadFactory2 = _interopRequireDefault(_typeaheadFactory);

var _backboneFactory = require('../vendor/backboneFactory');

var _backboneFactory2 = _interopRequireDefault(_backboneFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//import PlacesAdapter from '../vendor/PlacesAdapter';
var addressView = {
    events: {
        'keyup': 'pickerHandler',
        'click': 'pickerHandler'
    },
    initialize: function initialize(options) {
        var view = this;

        var serviceAdapter = options.serviceContainer.get('placesAdapter');
        var placeEngine = new _PlacesBloodhoundEngine2.default({ serviceAdapter: serviceAdapter });

        (0, _typeaheadFactory2.default)(view.el, {
            source: placeEngine
        });

        view.el.value = options.address;

        view.$el.bind('typeahead:select', function (evt, result) {
            if (result.lat && result.lng) {
                view.$el.trigger('address:select', result);
                return;
            }

            serviceAdapter.fetchLatLng({ placeId: result['place_id'] }, function (placeDetails) {
                if (!placeDetails) throw new Error('Error to fetch place position');

                /*var newResult = {
                    ...result,
                    lat: placeDetails.geometry.location.lat(),
                    lng: placeDetails.geometry.location.lng()
                };*/
                result.lat = placeDetails.geometry.location.lat();
                result.lng = placeDetails.geometry.location.lng();

                //console.log('fetchLatLng', result);

                //placeEngine.add( [newResult] );

                view.$el.trigger('address:select', result);
            });
        });
    },
    pickerHandler: function pickerHandler(evt, result) {
        var view = this;
        var input = view.el;
        var $input = jQuery(input);

        var selectFirst = function selectFirst() {
            setTimeout(function () {
                if (!jQuery('.tt-dataset-0').length || !jQuery('.tt-dataset-0').find('.tt-suggestion').length) return;
                jQuery('.tt-dataset-0').find('.tt-suggestion').eq(0).addClass('tt-cursor');
            }, 200);
        };

        switch (evt.type) {
            case 'keyup':
                var keyCode = evt.keyCode || evt.which;
                if (keyCode == 40 || keyCode == 38) {
                    break;
                }
                selectFirst();
                break;
            case 'click':
                input.setSelectionRange(0, input.value.length);
                selectFirst();
                break;
        }
    }
};

exports.default = (0, _backboneFactory2.default)(addressView, _backbone.View);