'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _backbone = require('backbone');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AddressView = function (_View) {
    _inherits(AddressView, _View);

    function AddressView() {
        _classCallCheck(this, AddressView);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(AddressView).apply(this, arguments));
    }

    _createClass(AddressView, [{
        key: 'contructor',
        value: function contructor() {
            this.events = {
                'click': 'pickerHandler',
                'keyup': 'pickerHandler'
            };
        }
    }, {
        key: 'pickerHandler',
        value: function pickerHandler(evt, result) {
            var view = this;

            //console.log('event', evt.keyCode);

            switch (evt.type) {
                case 'keyup':
                    var keyCode = evt.keyCode || evt.which;
                    if (keyCode == 40 || keyCode == 38) {
                        break;
                    }
                    setTimeout(function () {
                        (0, _backbone.$)('.tt-dataset-0').find('.tt-suggestion').eq(0).addClass('tt-cursor');
                    }, 200);
                    break;
                case 'click':
                    view.el.setSelectionRange(0, view.el.value.length);
                    break;
            }
        }
    }, {
        key: 'initialize',
        value: function initialize(options) {
            var view = this;

            var addressPicker = new options.AddressPicker({
                map: {
                    id: options.mapSelector,
                    displayMarker: false,
                    zoom: options.mapOptions.zoom,
                    center: options.mapLocation ? new google.maps.LatLng(options.mapLocation.lat, options.mapLocation.lng) : null
                },
                marker: {
                    draggable: false,
                    visible: false
                },
                zoomForLocation: 18,
                draggable: true,
                reverseGeocoding: true,
                autocompleteService: {
                    //types: ['(cities)'],
                    componentRestrictions: { country: 'IT' }
                }
            });
            /*view.$el.typeahead( null, {
                displayKey: 'description',
                source: addressPicker.ttAdapter()
            });*/

            if (options.addressText) {
                this.$el.val(options.addressText);
            }

            var placeService = addressPicker.placeService;

            //addressPicker.bindDefaultTypeaheadEvent( view.$el );
            /*view.$el.bind('typeahead:selected', addressPicker.updateMap);*/
            view.$el.bind('typeahead:selected', function (evt, place) {
                placeService.getDetails(place, function (result) {
                    var location = {
                        lat: result.geometry.location.lat(),
                        lng: result.geometry.location.lng()
                    };
                    options.serviceContainer.setLocation(location, true);

                    view.$el.blur();

                    /*view.collection.fetch({
                     data: location
                     });*/
                });
            });
            //view.$el.bind('typeahead:cursorchanged', addressPicker.updateMap);

            options.serviceContainer.set('addressPicker', addressPicker);
            options.serviceContainer.set('map', addressPicker.map);
            options.serviceContainer.set('placeService', placeService);

            if (options.cancelAddressSelector) {
                (0, _backbone.$)(options.cancelAddressSelector).on('click', function (evt) {
                    view.$el.val('');
                });
            }
        }
    }]);

    return AddressView;
}(_backbone.View);

exports.default = AddressView;