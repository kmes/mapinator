'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _index = require('./vendor/index');

var _AbstractServiceContainer = require('./models/AbstractServiceContainer');

var _AbstractServiceContainer2 = _interopRequireDefault(_AbstractServiceContainer);

var _StoreModelFactory = require('./models/StoreModelFactory');

var _StoreModelFactory2 = _interopRequireDefault(_StoreModelFactory);

var _StoreCollectionFactory = require('./models/StoreCollectionFactory');

var _StoreCollectionFactory2 = _interopRequireDefault(_StoreCollectionFactory);

var _AddressViewFactory = require('./views/AddressViewFactory');

var _AddressViewFactory2 = _interopRequireDefault(_AddressViewFactory);

var _MapViewFactory = require('./views/MapViewFactory');

var _MapViewFactory2 = _interopRequireDefault(_MapViewFactory);

var _helper = require('./helper/helper');

var Helper = _interopRequireWildcard(_helper);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Mapinator = function () {
    function Mapinator(config) {
        _classCallCheck(this, Mapinator);

        this.config = config;

        this.serviceContainer = this.createServiceContainer(config);
        this.bindServiceContainer(this.serviceContainer);

        this.addressView = this.createAddressView(config, this.serviceContainer);
        //this.mapView = this.createMapView( config, this.serviceContainer );

        //this.serviceContainer.setLocation( config.mapLocation, true );
    }

    _createClass(Mapinator, [{
        key: 'createServiceContainer',
        value: function createServiceContainer(_ref) {
            var storesUrl = _ref.storesUrl;

            //var { storesUrl } = config;
            var ServiceContainer = _AbstractServiceContainer2.default.extend({
                comparator: 'distance',
                getLocation: function getLocation() {
                    return this.get('mapLocation');
                },
                setLocation: function setLocation(location, toFetch) {
                    this.set('mapLocation', {
                        lat: location.lat,
                        lng: location.lng
                    });

                    if (this.has('centerMarker')) {
                        this.get('centerMarker').setMap(null);
                        this.set('centerMarker', null);
                    }
                    var map = this.get('map');
                    this.set('centerMarker', new google.maps.Marker({
                        position: location,
                        map: map
                    }));

                    if (toFetch) {
                        this.get('stores').fetch({
                            data: location
                        });
                    }

                    return this.get('mapLocation');
                },
                getVisibleStores: function getVisibleStores(mapBounds) {
                    return this.get('stores').filter(function (model) {
                        var latLng = new google.maps.LatLng(model.get('lat'), model.get('lng'));

                        return mapBounds.contains(latLng);
                    });
                },
                refreshDistances: function refreshDistances(centerLocation) {}
            });

            return new ServiceContainer({
                StoreCollectionFactory: _StoreCollectionFactory2.default,
                StoreModelFactory: _StoreModelFactory2.default
            }, {
                url: storesUrl,
                normalizeRequestData: function normalizeRequestData(requestData) {
                    return requestData;
                },
                parseResponse: function parseResponse(response) {
                    return response.collections.map(function (data) {
                        return {
                            id: data.id,
                            title: data.title,
                            lat: parseFloat(data.lat),
                            lng: parseFloat(data.lng),
                            phone: data.phone,
                            sanitizedPhone: Helper.sanitizePhone(data.phone),
                            street: data.street,
                            distance: data.distance || '',
                            indication: data.indication,
                            calendar: data.hours,
                            extraCalendar: data.extrahours
                        };
                    });
                }
            });
        }
    }, {
        key: 'bindServiceContainer',
        value: function bindServiceContainer(serviceContainer) {
            serviceContainer.on('change:mapLocation', function (serviceContainer, mapLocation) {
                var easyMap = serviceContainer.get('easyMap');
                easyMap.setCenter(mapLocation.lat, mapLocation.lng);
                easyMap.setZoom(10);
            });
            serviceContainer.listenToOnce(serviceContainer.get('stores'), 'sync', function (stores) {
                this.get('easyMap').fitCenterZoomToMarkers();

                this.listenTo(this.get('stores'), 'sync', function (stores) {
                    this.fitMapToNearestMarkers(2);
                });
            });

            return serviceContainer;
        }
    }, {
        key: 'createAddressView',
        value: function createAddressView(config, serviceContainer) {
            return (0, _AddressViewFactory2.default)({}, {
                el: config.addressSelector,
                cancelAddressSelector: '.cancel-address',
                serviceContainer: serviceContainer,
                mapSelector: config.mapSelector,
                AddressPicker: AddressPicker,
                mapLocation: config.mapLocation,
                mapOptions: config.mapOptions,
                addressText: config.addresstext,

                collection: serviceContainer.get('stores')
            });
        }
    }, {
        key: 'createMapView',
        value: function createMapView(config, serviceContainer) {
            return (0, _MapViewFactory2.default)({}, {
                el: config.mapSelector,
                serviceContainer: serviceContainer,
                EasyMaps: _index.EasyMaps,
                markerIcon: config.getStoreIconPath(),
                infoWindow: function infoWindow(data) {
                    if (!data) return false;

                    var $info = $(config.infoWindowProto).clone(true, true);

                    $info.removeClass('hidden');

                    $info.find('.title').html(data.title);
                    $info.find('.street').html(data.street);

                    var phone = data.phone.trim() ? $info.find('.phone').html() + data.phone : '';
                    $info.find('.phone').html(phone);

                    var href = $info.find('.link-hours').attr('href');
                    $info.find('.link-hours').attr('href', href + data.id);

                    return $('<div></div>').append($info).html();
                },
                collection: serviceContainer.get('stores')
            });
        }
    }]);

    return Mapinator;
}();

exports.default = Mapinator;