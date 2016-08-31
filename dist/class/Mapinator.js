'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _EasyMaps = require('./vendor/EasyMaps.js');

var _EasyMaps2 = _interopRequireDefault(_EasyMaps);

var _AbstractServiceContainer = require('./models/AbstractServiceContainer');

var _AbstractServiceContainer2 = _interopRequireDefault(_AbstractServiceContainer);

var _StoreModelClassFactory = require('./models/StoreModelClassFactory');

var _StoreModelClassFactory2 = _interopRequireDefault(_StoreModelClassFactory);

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

var $ = window ? window.jQuery || window.$ || (window.jQuery = _jquery2.default) : _jquery2.default;

var Mapinator = function () {
    function Mapinator(config) {
        var _this = this;

        _classCallCheck(this, Mapinator);

        this.config = config;

        this.serviceContainer = this.createServiceContainer(config);
        this.serviceContainer.set('jQuery', $);
        //this.bindServiceContainer( this.serviceContainer );

        this.addressView = this.createAddressView(config, this.serviceContainer);

        this.mapView = this.createMapView(config, this.serviceContainer);
        this.mapView.$el.bind('map:loaded', function (evt) {
            _this.serviceContainer.setLocation(config.mapLocation);

            _this.serviceContainer.set('mapLoaded', true);

            //this.refreshStores( config.mapLocation );

            _this.mapView.$el.unbind('map:loaded');
        });

        this.bindEvents();

        //
    }

    _createClass(Mapinator, [{
        key: 'bindEvents',
        value: function bindEvents() {
            var serviceContainer = this.serviceContainer;

            /*serviceContainer.listenToOnce( serviceContainer.get('stores'), 'sync', function( stores ) {
                serviceContainer.get('easyMap').fitCenterZoomToMarkers();
                 this.listenTo( this.get('stores'), 'sync', function( stores ) {
                    //map load markers in mapView sync to storeCollection
                    //this.fitMapToNearestMarkers( 2 );
                });
            });*/

            this.addressView.$el.bind('address:select', function (evt, result) {
                serviceContainer.setLocation({
                    lat: result.lat,
                    lng: result.lng
                });
            });
            serviceContainer.on('change:mapLocation', function (serviceContainer, mapLocation) {
                serviceContainer.get('easyMap').setCenter(mapLocation.lat, mapLocation.lng);
                //easyMap.setZoom(10);
            });

            this.mapView.$el.bind('map:bounds_changed', function (evt, bounds) {
                serviceContainer.set('mapBounds', bounds);
            });
        }
    }, {
        key: 'refreshStores',
        value: function refreshStores(location) {
            var _this2 = this;

            var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

            this.showLoading();

            this.serviceContainer.get('stores').once('sync', function (serviceContainer, stores) {
                callback(stores);

                _this2.hideLoading();
            });

            return this.serviceContainer.get('stores').fetchStores(location);
        }
    }, {
        key: 'showLoading',
        value: function showLoading() {
            var _config$startLoading = this.config.startLoading;
            var startLoading = _config$startLoading === undefined ? function () {} : _config$startLoading;


            startLoading();
        }
    }, {
        key: 'hideLoading',
        value: function hideLoading() {
            var _config$endLoading = this.config.endLoading;
            var endLoading = _config$endLoading === undefined ? function () {} : _config$endLoading;


            endLoading();
        }
    }, {
        key: 'fitMapToMarkers',
        value: function fitMapToMarkers() {
            this.serviceContainer.get('easyMap').fitCenterZoomToMarkers();
        }
    }, {
        key: 'fitMapToNearestMarkers',
        value: function fitMapToNearestMarkers(min, center) {
            if (!min) min = 1;

            var serviceContainer = this.serviceContainer;
            var mapLocation = center || serviceContainer.get('mapLocation');

            var bounds = new google.maps.LatLngBounds();
            bounds.extend(new google.maps.LatLng(mapLocation.lat, mapLocation.lng));

            var minStores = serviceContainer.get('stores').models.slice(0, min);
            for (var n in minStores) {
                var store = minStores[n];

                console.log('store', n, store.get('lat'), store.get('lng'));

                if (!bounds.contains(new google.maps.LatLng(store.get('lat'), store.get('lng')))) {
                    bounds.extend(new google.maps.LatLng(store.get('lat'), store.get('lng')));
                }
            }

            serviceContainer.get('easyMap').setZoom(30);

            serviceContainer.get('map').fitBounds(bounds);
        }
    }, {
        key: 'createServiceContainer',
        value: function createServiceContainer(_ref) {
            var storesUrl = _ref.storesUrl;

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
                StoreModelClassFactory: _StoreModelClassFactory2.default
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
        /*bindServiceContainer( serviceContainer ) {
            serviceContainer.on('change:mapLocation', function( serviceContainer, mapLocation ) {
                var easyMap = serviceContainer.get('easyMap');
                easyMap.setCenter(mapLocation.lat, mapLocation.lng);
                easyMap.setZoom(10);
            });
            serviceContainer.listenToOnce( serviceContainer.get('stores'), 'sync', function( stores ) {
                this.get('easyMap').fitCenterZoomToMarkers();
                 this.listenTo( this.get('stores'), 'sync', function( stores ) {
                    this.fitMapToNearestMarkers( 2 );
                });
            });
             return serviceContainer;
        }*/

    }, {
        key: 'createAddressView',
        value: function createAddressView(config, serviceContainer) {
            return (0, _AddressViewFactory2.default)({}, {
                el: config.addressSelector,
                cancelAddressButton: '.cancel-address',
                serviceContainer: serviceContainer,
                /*mapSelector: config.mapSelector,
                mapLocation: config.mapLocation,
                mapOptions: config.mapOptions,*/
                address: config.address,

                collection: serviceContainer.get('stores'),

                jQuery: serviceContainer.get('jQuery')
            });
        }
    }, {
        key: 'createMapView',
        value: function createMapView(config, serviceContainer) {
            return (0, _MapViewFactory2.default)({}, {
                el: config.mapSelector,
                serviceContainer: serviceContainer,
                EasyMaps: _EasyMaps2.default,
                mapLocation: config.mapLocation,
                mapZoom: config.mapZoom,
                mapControls: config.mapControls || {
                    'mapTypeControl': false,
                    'navigationControl': false,
                    'scrollwheel': false,
                    'streetViewControl': false,
                    'panControl': false,
                    'zoomControl': false,
                    'scaleControl': true,
                    'overviewMapControl': false,
                    'disableDoubleClickZoom': false,
                    'draggable': true
                },
                markerIcon: typeof config.iconPath === 'function' ? config.iconPath() : config.iconPath,
                infoWindow: function infoWindow(data) {
                    if (!data) return false;

                    var $info = (0, _jquery2.default)(config.infoWindowProto).clone(true, true);

                    $info.removeClass('hidden');

                    $info.find('.title').html(data.title);
                    $info.find('.street').html(data.street);

                    var phone = data.phone && data.phone.trim() ? $info.find('.phone').html() + data.phone : '';
                    $info.find('.phone').html(phone);

                    var href = $info.find('.link-hours').attr('href');
                    $info.find('.link-hours').attr('href', href + data.id);

                    return (0, _jquery2.default)('<div></div>').append($info).html();
                },
                collection: serviceContainer.get('stores')
            });
        }
    }]);

    return Mapinator;
}();

exports.default = Mapinator;