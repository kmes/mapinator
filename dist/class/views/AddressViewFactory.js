'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
//import PlacesAdapter from '../vendor/PlacesAdapter';


var _backbone = require('backbone');

var _PlacesBloodhoundEngine = require('../vendor/PlacesBloodhoundEngine');

var _PlacesBloodhoundEngine2 = _interopRequireDefault(_PlacesBloodhoundEngine);

var _typeaheadFactory = require('../vendor/typeaheadFactory');

var _typeaheadFactory2 = _interopRequireDefault(_typeaheadFactory);

var _backboneFactory = require('../vendor/backboneFactory');

var _backboneFactory2 = _interopRequireDefault(_backboneFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var addressView = {
    events: {
        'click': 'pickerHandler',
        'keyup': 'pickerHandler',
        'typeahead:select': 'pickerHandler'
    },
    initialize: function initialize(options) {
        var view = this;

        var serviceAdapter = options.serviceContainer.get('placesAdapter');

        (0, _typeaheadFactory2.default)(view.el, {
            source: new _PlacesBloodhoundEngine2.default({ serviceAdapter: serviceAdapter })
        });

        view.$el.bind('typeahead:select', function (evt, result) {
            serviceAdapter.fetchLatLng({ placeId: result['place_id'] }, function (result) {
                if (!result) throw new Error('Error to fetch place position');

                view.$el.trigger('address:select', _extends({}, result, {
                    lat: result.geometry.location.lat(),
                    lng: result.geometry.location.lng()
                }));
            });
        });
    },
    pickerHandler: function pickerHandler(evt, result) {
        var view = this;
        var input = view.el;
        var $input = jQuery(input);

        switch (evt.type) {
            case 'keyup':
                var keyCode = evt.keyCode || evt.which;
                if (keyCode == 40 || keyCode == 38) {
                    break;
                }
                setTimeout(function () {
                    jQuery('.tt-dataset-0').find('.tt-suggestion').eq(0).addClass('tt-cursor');
                }, 200);
                break;
            case 'click':
                input.setSelectionRange(0, input.value.length);
                break;
        }
    }
};

exports.default = (0, _backboneFactory2.default)(addressView, _backbone.View);