'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//import jQuery from 'jquery';

var $ = window ? window.jQuery || window.$ || (window.jQuery = jQuery) : jQuery;

var Mapinator = function () {
    function Mapinator(config) {
        var _this = this;

        _classCallCheck(this, Mapinator);

        this.config = config;

        this.serviceContainer = this.createServiceContainer(config);
        this.serviceContainer.set('jQuery', $);

        this.addressView = this.createAddressView(config, this.serviceContainer);

        this.mapView = this.createMapView(config, this.serviceContainer);
        this.mapView.$el.bind('map:loaded', function (evt) {
            _this.serviceContainer.setLocation(config.mapLocation);

            _this.serviceContainer.set('mapLoaded', true);

            _this.mapView.$el.unbind('map:loaded');
        });

        this.bindEvents();
    }

    _createClass(Mapinator, [{
        key: 'bindEvents',
        value: function bindEvents() {
            var serviceContainer = this.serviceContainer;

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
        value: function refreshStores(options) {
            var _this2 = this;

            var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

            this.showLoading();

            this.serviceContainer.get('stores').once('sync', function (serviceContainer, stores) {
                callback(stores);

                _this2.hideLoading();
            });

            return this.serviceContainer.get('stores').fetchStores(_extends({
                url: typeof this.config.storesUrl === 'function' ? this.config.storesUrl(this.serviceContainer) : this.config.storesUrl

            }, options, {

                data: typeof this.config.parseRequest === 'function' ? this.config.parseRequest(options.data) : options.data
            }));
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
            var storesComparator = _ref.storesComparator;
            var _ref$parseRequest = _ref.parseRequest;
            var parseRequest = _ref$parseRequest === undefined ? function (req) {
                return req;
            } : _ref$parseRequest;
            var _ref$parseResponse = _ref.parseResponse;
            var parseResponse = _ref$parseResponse === undefined ? function (resp) {
                return resp;
            } : _ref$parseResponse;

            var ServiceContainer = _AbstractServiceContainer2.default.extend({
                comparator: storesComparator,
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
                parseResponse: parseResponse
            });
        }
    }, {
        key: 'createAddressView',
        value: function createAddressView(config, serviceContainer) {
            return (0, _AddressViewFactory2.default)({}, {
                el: config.addressSelector,
                serviceContainer: serviceContainer,
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
                infoWindow: config.infoWindow,
                collection: serviceContainer.get('stores')
            });
        }
    }]);

    return Mapinator;
}();

exports.default = Mapinator;