(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

            var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

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
            var _config$startLoading = this.config.startLoading,
                startLoading = _config$startLoading === undefined ? function () {} : _config$startLoading;


            startLoading();
        }
    }, {
        key: 'hideLoading',
        value: function hideLoading() {
            var _config$endLoading = this.config.endLoading,
                endLoading = _config$endLoading === undefined ? function () {} : _config$endLoading;


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

            var stores = serviceContainer.get('stores').models;

            var centerLatLng = new google.maps.LatLng(center.lat, center.lng);
            stores.sort(function (a, b) {
                var aDist = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(a.get('lat'), a.get('lng')), centerLatLng);
                var bDist = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(b.get('lat'), b.get('lng')), centerLatLng);

                return aDist - bDist;
            });

            var minStores = stores.slice(0, min);
            for (var n in minStores) {
                var store = minStores[n];

                //console.log('store', n, store.get('lat'), store.get('lng'));

                if (!bounds.contains(new google.maps.LatLng(store.get('lat'), store.get('lng')))) {
                    bounds.extend(new google.maps.LatLng(store.get('lat'), store.get('lng')));
                }
            }

            serviceContainer.get('easyMap').setZoom(30);

            serviceContainer.get('map').fitBounds(bounds);
        }

        /*fitMapToNearestMarkers( min, center ) {
            if( !min ) min = 1;
             var serviceContainer = this.serviceContainer;
            var mapLocation = center || serviceContainer.get('mapLocation');
             var bounds = new google.maps.LatLngBounds();
            bounds.extend( new google.maps.LatLng(mapLocation.lat, mapLocation.lng) );
             var minStores = serviceContainer.get('stores').models.slice(0, min);
            for( var n in minStores ) {
                var store = minStores[n];
                 //console.log('store', n, store.get('lat'), store.get('lng'));
                 if( !bounds.contains(new google.maps.LatLng( store.get('lat'), store.get('lng') )) ) {
                    bounds.extend(new google.maps.LatLng( store.get('lat'), store.get('lng') ));
                }
            }
             serviceContainer.get('easyMap').setZoom( 30 );
             serviceContainer.get('map').fitBounds( bounds );
        }*/

    }, {
        key: 'createServiceContainer',
        value: function createServiceContainer(_ref) {
            var storesUrl = _ref.storesUrl,
                placesOptions = _ref.placesOptions,
                storesComparator = _ref.storesComparator,
                _ref$parseRequest = _ref.parseRequest,
                parseRequest = _ref$parseRequest === undefined ? function (req) {
                return req;
            } : _ref$parseRequest,
                _ref$parseResponse = _ref.parseResponse,
                parseResponse = _ref$parseResponse === undefined ? function (resp) {
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
                StoreModelClassFactory: _StoreModelClassFactory2.default,
                placesOptions: placesOptions
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
                markerIcon: config.iconPath,
                infoWindow: config.infoWindow,
                collection: serviceContainer.get('stores')
            });
        }
    }]);

    return Mapinator;
}();

exports.default = Mapinator;

},{"./models/AbstractServiceContainer":2,"./models/StoreCollectionFactory":3,"./models/StoreModelClassFactory":4,"./vendor/EasyMaps.js":5,"./views/AddressViewFactory":11,"./views/MapViewFactory":12}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.AbstractServiceContainerClassFactory = AbstractServiceContainerClassFactory;

var _PlacesAdapter = require('../vendor/PlacesAdapter');

var _PlacesAdapter2 = _interopRequireDefault(_PlacesAdapter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } //import Backbone from 'backbone';

var AbstractServiceContainer = function (_Backbone$Model) {
    _inherits(AbstractServiceContainer, _Backbone$Model);

    function AbstractServiceContainer(_ref, _ref2) {
        var StoreCollectionFactory = _ref.StoreCollectionFactory,
            StoreModelClassFactory = _ref.StoreModelClassFactory,
            placesOptions = _ref.placesOptions;
        var url = _ref2.url,
            parseResponse = _ref2.parseResponse;

        _classCallCheck(this, AbstractServiceContainer);

        var classProps = {
            defaults: {
                jQuery: null,

                mapBounds: null,
                geocoder: null,

                stores: null, //Backbone.Collection

                map: null,
                easyMap: null,
                centerMarker: null,
                mapLocation: {
                    lat: null,
                    lng: null
                },
                mapLoaded: false
            }
        };
        return _possibleConstructorReturn(this, (AbstractServiceContainer.__proto__ || Object.getPrototypeOf(AbstractServiceContainer)).call(this, classProps, { StoreCollectionFactory: StoreCollectionFactory, StoreModelClassFactory: StoreModelClassFactory, placesOptions: placesOptions }, { url: url, parseResponse: parseResponse }));
    }

    _createClass(AbstractServiceContainer, [{
        key: 'initialize',
        value: function initialize(classProps, _ref3, _ref4) {
            var StoreCollectionFactory = _ref3.StoreCollectionFactory,
                StoreModelClassFactory = _ref3.StoreModelClassFactory,
                placesOptions = _ref3.placesOptions;
            var url = _ref4.url,
                parseResponse = _ref4.parseResponse;

            this.set('mapBounds', new google.maps.LatLngBounds());
            this.set('geocoder', new google.maps.Geocoder());

            this.set('placesAdapter', new _PlacesAdapter2.default(placesOptions));

            var stores = StoreCollectionFactory({
                url: url,
                parse: parseResponse
            }, null, {
                model: StoreModelClassFactory()
            });

            this.set('stores', stores);

            //console.log( 'stores', this.get('stores') );

            if (typeof this.setLocation !== 'function') {
                this.setLocation = function () {
                    throw new Error('setLocation method is not implements');
                };
                throw new Error('setLocation method is not implements');
            }
        }
    }, {
        key: 'fitMapToMarkers',
        value: function fitMapToMarkers() {
            this.get('easyMap').fitCenterZoomToMarkers();
        }
    }, {
        key: 'fitMapToNearestMarkers',
        value: function fitMapToNearestMarkers(min) {
            if (!min) min = 1;

            var stores = this.get('stores');
            var minStores = stores.models.slice(0, min);

            //var mapBounds = this.get('mapBounds');
            //var mapBounds = this.get('map').getBounds();
            var mapBounds = new google.maps.LatLngBounds();
            var mapLocation = this.get('mapLocation');
            mapBounds.extend(new google.maps.LatLng(mapLocation.lat, mapLocation.lng));
            for (var n in minStores) {
                var store = minStores[n];
                //console.log('store', n, store.get('lat'), store.get('lng'));
                if (!mapBounds.contains(new google.maps.LatLng(store.get('lat'), store.get('lng')))) {
                    mapBounds.extend(new google.maps.LatLng(store.get('lat'), store.get('lng')));
                }
            }

            this.get('map').fitBounds(mapBounds);
        }
    }, {
        key: 'getAddressFromLatLng',
        value: function getAddressFromLatLng(lat, lng, callback) {
            if (!callback) callback = function callback() {};

            this.get('placesAdapter').fetchPlaceByLatLng({ location: { lat: lat, lng: lng } }, function (result) {
                var address = result['formatted_address'] || null;

                callback(address, result);
            });
        }
    }]);

    return AbstractServiceContainer;
}(Backbone.Model);

exports.default = AbstractServiceContainer;
function AbstractServiceContainerClassFactory() {
    return AbstractServiceContainer;
}

},{"../vendor/PlacesAdapter":6}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; //import Backbone from 'backbone';

var _backboneFactory = require('../vendor/backboneFactory');

var _backboneFactory2 = _interopRequireDefault(_backboneFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var storeCollection = {
    /*initialize: function( options, classProps ) {
        console.log('initialize', arguments);
    },*/

    fetchStores: function fetchStores() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

        return this.fetch(_extends({}, options, {

            success: function success(data) {
                callback(data);
            },
            error: function error(_error) {
                callback(false, _error);
            }
        }));
    }
};

exports.default = (0, _backboneFactory2.default)(storeCollection, Backbone.Collection);

},{"../vendor/backboneFactory":9}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _backboneClassFactory = require('../vendor/backboneClassFactory');

var _backboneClassFactory2 = _interopRequireDefault(_backboneClassFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var storeModel = {
  /*initialize: function( options, classProps ) {
   console.log('initialize', arguments);
   }*/
}; //import Backbone from 'backbone';

exports.default = (0, _backboneClassFactory2.default)(storeModel, Backbone.Model);

},{"../vendor/backboneClassFactory":8}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function EasyMaps(properties) {
    var that = this;

    this.$ = properties.jQuery || jQuery;

    var config = properties || {};
    if (!config.center) {
        config.center = {
            lat: 0,
            lng: 0
        };
    }

    if (!config.center.lat) {
        config.center.lat = 0;
    }
    if (!config.center.lng) {
        config.center.lng = 0;
    }

    that.mapObj = null;
    that.domElem = null;
    that.center = null;
    that.zoom = 8;

    that.bounds = null;

    that.eventListener = {
        onLoaded: function onLoaded() {}
    };

    for (var evt in that.eventListener) {
        if (config[evt]) {
            that.addEventListener(evt, config[evt]);
        }
    }

    that.mapSettings = config.mapSettings || {
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    if (!that.mapSettings.mapTypeId) {
        that.mapSettings.mapTypeId = google.maps.MapTypeId.ROADMAP;
    }

    if (config.noControls) {

        that.mapSettings['mapTypeControl'] = false;
        that.mapSettings['navigationControl'] = false;
        that.mapSettings['scrollwheel'] = false;
        that.mapSettings['streetViewControl'] = false;

        that.mapSettings['panControl'] = false;
        that.mapSettings['zoomControl'] = false;
        that.mapSettings['mapTypeControl'] = false;
        that.mapSettings['scaleControl'] = false;
        that.mapSettings['streetViewControl'] = false;
        that.mapSettings['overviewMapControl'] = false;

        that.mapSettings['disableDoubleClickZoom'] = true;
        that.mapSettings['draggable'] = false;
    }

    if (config.controls) {

        if (_typeof(config.controls) === 'object') {
            for (var name in config.controls) {
                that.mapSettings[name] = config.controls[name];
            }
        }
    }

    that.markerSettings = {
        w: 32,
        h: 32,
        unit: 'px'
    };
    that.infoWindowSettings = {
        maxW: 400,
        maxH: 500,
        unit: 'px'
    };

    that.markerList = [];
    that.markerObjList = [];

    that.infoWindowObjList = [];

    that.clusterList = [];
    that.clusterObjList = [];
    that.clusterGridRule = {};
    for (var i = 1; i <= 22; i++) {
        that.clusterGridRule[i] = i * 2;
    }

    that.circleList = [];
    that.circleObjList = [];

    if (!config.elem && !config.map) return;

    that.resetBounds();

    if (config.elem) that.setDomElem(config.elem, false);
    that.setCenter(config.center.lat, config.center.lng, false);
    that.setZoom(config.zoom, false);

    that.initMap(config.map);
};

EasyMaps.prototype.addEventListener = function (event, fnHandler) {
    var that = this;

    if (that.eventListener[event] && typeof fnHandler === 'function') {
        that.eventListener[event] = fnHandler;
        return true;
    } else {
        return false;
    }
};

EasyMaps.prototype.onLoaded = function (fnHandler) {
    var that = this;

    var eventName = 'onLoaded';

    return that.addEventListener(eventName, fnHandler);
};

EasyMaps.prototype.resetBounds = function () {
    var that = this;

    that.bounds = new google.maps.LatLngBounds();

    return that.bounds;
};

EasyMaps.prototype.setDomElem = function (elem) {
    return this.domElem = elem instanceof HTMLElement ? elem : document.querySelector(elem);
};

EasyMaps.prototype.getCenter = function () {
    var that = this;

    return that.center;
};
EasyMaps.prototype.setCenter = function (lat, lng, render) {
    var that = this;
    render = typeof render !== 'undefined' ? render : true;
    that.center = {
        lat: parseFloat(lat),
        lng: parseFloat(lng)
    };

    if (render) {
        //set center on map
        that.mapObj.setCenter(new google.maps.LatLng(that.center.lat, that.center.lng));
        return that.mapObj;
    } else {
        return that.center;
    }
};
EasyMaps.prototype.getZoom = function () {
    var that = this;

    return that.mapObj.getZoom();
};
EasyMaps.prototype.setZoom = function (zoomNumb, render) {
    if (!zoomNumb) return false;
    var that = this;
    render = typeof render !== 'undefined' ? render : true;
    that.zoom = parseInt(zoomNumb);

    if (render) {
        //set zoom on map
        that.mapObj.setZoom(that.zoom);
        return that.mapObj;
    } else {
        return that.zoom;
    }
};
EasyMaps.prototype.fitCenterZoomToMarkers = function (render) {
    var that = this;
    render = typeof render !== 'undefined' ? render : true;

    var area = null;

    var markers = that.markerObjList;
    for (var n in markers) {
        var pos = markers[n].getPosition();
        var lat = pos.lat();
        var lng = pos.lng();

        if (!area) {
            area = {
                'x1': lat,
                'x2': lat,
                'y1': lng,
                'y2': lng
            };
        }

        area['x1'] = lat < area['x1'] ? lat : area['x1'];
        area['x2'] = lat > area['x2'] ? lat : area['x2'];
        area['y1'] = lng < area['y1'] ? lng : area['y1'];
        area['y2'] = lng > area['y2'] ? lng : area['y2'];
    }

    if (!area) {
        area = {
            'x1': that.center.lat,
            'x2': that.center.lat,
            'y1': that.center.lng,
            'y2': that.center.lng
        };
    }

    that.resetBounds();

    that.bounds.extend(new google.maps.LatLng(area['x1'], area['y1']));
    //that.bounds.extend( new google.maps.LatLng( area['x2'], area['y1'] ) );
    //that.bounds.extend( new google.maps.LatLng( area['x1'], area['y2'] ) );
    that.bounds.extend(new google.maps.LatLng(area['x2'], area['y2']));

    var oldCenter = that.center;
    var oldZoom = that.zoom;

    that.mapObj.fitBounds(that.bounds);

    var actualCenter = that.mapObj.getCenter();
    var newCenter = {
        'lat': actualCenter.k,
        'lng': actualCenter.B
    };
    var newZoom = that.mapObj.getZoom();

    if (render) {
        that.center = newCenter;
        that.zoom = newZoom;
    } else {
        that.setCenter(oldCenter);
        that.setZoom(oldZoom);
    }
};
EasyMaps.prototype.initMap = function (map) {
    var that = this;

    var options = that.mapSettings;

    options['center'] = new google.maps.LatLng(that.center.lat, that.center.lng);
    options['zoom'] = that.zoom;

    /*var options = {
     zoom: that.zoom,
     center: new google.maps.LatLng( that.center.lat, that.center.lng ),
     mapTypeId: google.maps.MapTypeId.ROADMAP
     };*/

    that.mapObj = map || new google.maps.Map(that.domElem, options);

    google.maps.event.addListenerOnce(that.mapObj, 'idle', function () {
        that.eventListener['onLoaded']();
    });

    return that.mapObj;
};

EasyMaps.prototype.addMarker = function (markerData, render, clusterData, callback) {
    var that = this;

    if (!callback) callback = function callback() {};

    render = typeof render !== "undefined" ? render : true;
    var markerList = typeof markerData.length !== 'undefined' ? markerData : [markerData];
    //var markerList = markerData[0] ? markerData : [ markerData ];

    //options - OK
    //icon - OK
    //info window - OK
    //cluster

    /*	google.maps.event.addDomListener( that.mapObj, 'bounds_changed', function() {
     //google.maps.event.clearListeners( that.mapObj, 'idle');
     console.log('idle');
     callback();
     });*/

    google.maps.event.addDomListener(that.mapObj, 'idle', function () {
        clearTimeout(that.markerTimer);
        that.markerTimer = setTimeout(function () {
            google.maps.event.clearListeners(that.mapObj, 'idle');

            setTimeout(function () {
                callback();
            }, 400);
        }, 400);
    });

    var markerGroup = [];

    for (var n in markerList) {
        that.markerList.push(markerList[n]);
        var pos = {
            lat: parseFloat(markerList[n]['position']['lat']),
            lng: parseFloat(markerList[n]['position']['lng'])
        };
        var posObj = new google.maps.LatLng(pos.lat, pos.lng);
        var markerConf = {
            position: posObj,
            map: that.mapObj
        };

        if (markerList[n]['icon']) {
            var iconData = markerList[n]['icon'];
            if (iconData['path']) {
                markerConf['icon'] = {
                    //anchor: new google.maps.Point( -16, -16 ),
                    scaledSize: new google.maps.Size(iconData['w'] || that.markerSettings.w, iconData['h'] || that.markerSettings.h, iconData['unit'] || that.markerSettings.unit, iconData['unit'] || that.markerSettings.unit),
                    url: iconData['path']
                };
            }
            if (iconData['shadow']) {
                markerConf['shadow'] = iconData['shadow'];
            }
            if (iconData['flat']) {
                markerConf['flat'] = !!iconData['flat'];
            }
        }

        if (markerList[n]['title']) {
            markerConf['title'] = markerList[n]['title'];
        }
        var marker = new google.maps.Marker(markerConf);

        that.markerObjList.push(marker);

        markerGroup.push(marker);

        /*(function( marker ) {
         google.maps.event.addListener( marker, 'mouseover', function(e) {
         var zIndex = marker.getZIndex();
         marker.setZIndex( zIndex+10000 );
         });
         google.maps.event.addListener( marker, 'mouseout', function(e) {
         var zIndex = marker.getZIndex();
         marker.setZIndex( zIndex-10000 );
         });
         })( marker );*/

        if (markerList[n]['infoWindow']) {
            var infoWindowData = markerList[n]['infoWindow'];

            var openHandler = infoWindowData['open'] || function () {};

            var infoWindowConf = {
                content: infoWindowData['content']
            };
            var infoWindow = new google.maps.InfoWindow(infoWindowConf);
            that.infoWindowObjList.push(infoWindow);

            (function (marker, infoWindow, openHandler) {
                google.maps.event.addListener(marker, 'click', function () {

                    that.closeAllInfoWindow();

                    infoWindow.open(that.mapObj, marker);
                    openHandler(infoWindow, marker);
                    /*google.maps.event.addListener( marker, 'mouseout', function() {
                     infoWindow.close();
                     google.maps.event.clearListeners( marker, 'mouseout' );
                     });
                     google.maps.event.addListener( marker, 'click', function() {
                     google.maps.event.clearListeners( marker, 'mouseout' );
                     });*/
                });
            })(marker, infoWindow, openHandler);
        }
    }

    if (clusterData) {
        that.addCluster(markerGroup, clusterData);
    }
};

EasyMaps.prototype.closeAllInfoWindow = function () {
    var that = this;

    for (var n in that.infoWindowObjList) {
        var infoWindow = that.infoWindowObjList[n];
        infoWindow.close();
    }
};

EasyMaps.prototype.addCluster = function (markerGroup, conf) {
    var that = this;

    conf = conf || {};

    var clusterConf = {
        maxZoom: conf.maxZoom || 18,
        gridSize: conf.size || 10
    };

    if (conf.icon) {
        clusterConf['styles'] = [{
            url: conf.icon,
            width: conf.width || 50,
            height: conf.height || 50,
            anchor: conf.anchor || [3, 0],
            textSize: conf.textSize || 10,
            textColor: conf.textColor || '#000'
        }];
    }

    var cluster = new MarkerClusterer(that.mapObj, markerGroup, clusterConf);

    var clusterData = {
        'conf': clusterConf,
        'markerGroup': markerGroup
    };

    that.clusterList.push(clusterData);
    that.clusterObjList.push(cluster);

    /*(function( cluster, clusterData ) {
     google.maps.event.addListener( that.mapObj, 'zoom_changed', function() {
     var gridZoomMatch = clusterData.gridRule;
      var zoom = that.mapObj.getZoom();
      for( var maxZoom in gridZoomMatch ) {
     if( zoom <= maxZoom ) {
     zoom = maxZoom;
     }
     }
     var gridSize = gridZoomMatch[ zoom ] || false;
     if( gridSize ) {
     cluster.setGridSize( gridSize );
     cluster.resetViewport();
     }
     console.log( 'actualGridSize: ' + cluster.getGridSize() );
     });
     })( cluster, clusterData );*/
};

EasyMaps.prototype.removeAllCluster = function (render) {
    var that = this;

    render = typeof render !== "undefined" ? render : true;

    that.clusterList = [];
    if (render) {
        for (var n in that.clusterObjList) {
            //that.clusterObjList[ n ].setMap( null );
        }
        that.clusterObjList = [];
    }
};

EasyMaps.prototype.removeAllMarker = function (render) {
    var that = this;

    render = typeof render !== "undefined" ? render : true;

    that.markerList = [];
    if (render) {
        for (var n in that.markerObjList) {
            that.markerObjList[n].setMap(null);
        }
        that.markerObjList = [];

        that.infoWindowObjList = [];
    }

    that.removeAllCluster(render);
};

EasyMaps.prototype.addCircle = function (circleData, render) {
    var that = this;

    render = typeof render !== "undefined" ? render : true;

    var cirleStyleList = {
        'stroke': '',
        'fill': ''
    };

    var radiusAmp = 1;

    var circleList = typeof circleData.length !== 'undefined' ? circleData : [circleData];
    for (var n in circleList) {
        that.circleList.push(circleList[n]);
        var pos = {
            lat: parseFloat(circleList[n]['position']['lat']),
            lng: parseFloat(circleList[n]['position']['lng'])
        };
        var posObj = new google.maps.LatLng(pos.lat, pos.lng);
        var radius = parseInt(circleList[n]['radius']) * radiusAmp;

        var circleConf = {
            center: posObj,
            map: that.mapObj,
            radius: radius
        };

        for (var style in cirleStyleList) {
            if (circleList[n][style]) {
                var strokeData = circleList[n][style];
                for (var type in strokeData) {
                    var confName = style + type.substr(0, 1).toUpperCase() + type.substr(1);
                    circleConf[confName] = strokeData[type];
                }
            }
        }

        var circle = new google.maps.Circle(circleConf);
        that.circleObjList.push(circle);
    }
};

EasyMaps.prototype.removeAllCircle = function (render) {
    var that = this;

    render = typeof render !== "undefined" ? render : true;

    that.circleList = [];
    if (render) {
        for (var n in that.circleObjList) {
            that.circleObjList[n].setMap(null);
        }
        that.circleObjList = [];
    }
};

EasyMaps.prototype.autocomplete = function (domElement, fnCallback) {
    var that = this;

    if (!domElement) {
        domElement = this;
    } else if (typeof domElement === 'function') {
        fnCallback = domElement;
        domElement = this;
    } else {
        fnCallback = fnCallback || function () {};
    }

    var pacContainer = '.pac-container';

    var fnFinal = function fnFinal(place, el) {
        fnCallback(place, el);
    };

    //var defaultCenter = 'Italia';

    var $inputList = that.$(domElement);
    $inputList.each(function (i, el) {
        (function (el) {
            var inputCenter = el;

            var autocomplete = new google.maps.places.Autocomplete(inputCenter, {
                types: ["geocode"],
                componentRestrictions: { country: 'it' }
            });

            var setPacItem;

            that.$(el).click(function (e) {

                setTimeout(function () {
                    that.$(e.target).select();
                    autocomplete.pacContainer = autocomplete.pacContainer || that.$(pacContainer).filter(':visible');
                }, 200);

                var isChanged = false;

                that.$(el).unbind('keypress blur').bind('keypress blur', function (e) {
                    var $this = that.$(this);

                    if (e.type == 'blur') {
                        if (!isChanged) {
                            return true;
                        }
                        isChanged = false;
                    } else {
                        isChanged = true;
                    }

                    var $pacContainer = autocomplete.pacContainer;
                    var $pacItem = $pacContainer.find(".pac-item");
                    var $firstMatch = $pacItem.filter(':first');

                    //console.log( $firstMatch.length );

                    var pacItemSelected = 'pac-item-selected';

                    setTimeout(function () {
                        $pacItem.removeClass(pacItemSelected);
                        $firstMatch.addClass(pacItemSelected);
                    }, 400);

                    if (e.which == 13 || e.type == 'blur') {
                        //google.maps.event.clearListeners( autocomplete, 'place_changed' );

                        var delay = e.type == 'blur' ? 400 : 400;

                        setPacItem = setTimeout(function () {

                            //$firstMatch = $pacItem.filter('.'+pacItemSelected).length ? $pacItem.filter('.'+pacItemSelected) : $firstMatch;
                            var allText = $firstMatch.text();
                            var lastText = $firstMatch.children('span:last').text();
                            var firstResult = allText.replace(lastText, ', ' + lastText);

                            $this.val(firstResult);
                            $this.attr('value', firstResult);

                            if (e.type != 'blur') {
                                //$this.blur();
                            }

                            var t = setInterval(function () {
                                if ($this.val() != firstResult) {
                                    $this.val(firstResult);
                                    clearInterval(t);
                                }
                            }, 200);

                            var geocoder = new google.maps.Geocoder();
                            geocoder.geocode({ "address": firstResult }, function (results, status) {
                                var place = false;

                                if (status == google.maps.GeocoderStatus.OK) {
                                    place = results[0];

                                    //$firstMatch.addClass( pacItemSelected );
                                    $pacContainer.css("display", "none");
                                }
                                //console.log('geocode');
                                fnFinal(place, el);
                            });
                        }, delay);
                    }
                });
            });

            google.maps.event.addListener(autocomplete, 'place_changed', function () {
                var place = autocomplete.getPlace();
                //console.log( place );
                if (place.geometry && place.geometry.location) {
                    that.$(el).unbind('keypress blur');
                    clearInterval(setPacItem);
                    //console.log('listener');
                    fnFinal(place, el);
                }
            });
        })(el);
    });
};

exports.default = EasyMaps;

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PlacesAdapter = function () {
    function PlacesAdapter() {
        var autocompletionRequest = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, PlacesAdapter);

        this.placeService = new google.maps.places.AutocompleteService();
        this.geocoder = new google.maps.Geocoder();

        this.defaultAutocompletionRequest = {
            input: 'italy',
            types: ['geocode'],
            componentRestrictions: {
                country: 'it'
            }
        };

        this.setAutocompletionRequest(autocompletionRequest);
    }

    _createClass(PlacesAdapter, [{
        key: 'setAutocompletionRequest',
        value: function setAutocompletionRequest() {
            var autocompletionRequest = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            var defaultAutocompletionRequest = this.defaultAutocompletionRequest;

            return this.autocompletionRequest = _extends({}, defaultAutocompletionRequest, autocompletionRequest);
        }
    }, {
        key: 'getAutocompletionRequest',
        value: function getAutocompletionRequest() {
            var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

            if (query) {
                this.autocompletionRequest.query = query;
            }

            return this.autocompletionRequest;
        }
    }, {
        key: 'search',
        value: function search(query) {
            var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

            this.placeService.getPlacePredictions(this.getAutocompletionRequest(query), function (suggestions, status) {
                //console.log('suggestions', suggestions);

                callback(suggestions, status);
            });
        }
    }, {
        key: 'fetchPlaceByLatLng',
        value: function fetchPlaceByLatLng(options) {
            var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

            this.geocoder.geocode(options, function (results, status) {
                if (status !== 'OK' || !results.length) {
                    callback(false);
                    return false;
                }

                callback(results.shift());
            });
        }
    }]);

    return PlacesAdapter;
}();

exports.default = PlacesAdapter;

},{}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

//import Bloodhound from "typeahead.js/dist/bloodhound";

var PlacesBloodhoundEngine = function (_Bloodhound) {
    _inherits(PlacesBloodhoundEngine, _Bloodhound);

    function PlacesBloodhoundEngine() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, PlacesBloodhoundEngine);

        var _this = _possibleConstructorReturn(this, (PlacesBloodhoundEngine.__proto__ || Object.getPrototypeOf(PlacesBloodhoundEngine)).call(this, _extends({}, options, {
            datumTokenizer: function datumTokenizer(obj) {
                return Bloodhound.tokenizers.whitespace(obj.description);
            },
            queryTokenizer: function queryTokenizer(query) {
                _this.onSearch(query);

                return Bloodhound.tokenizers.whitespace(query);
            },
            identify: function identify(obj) {
                return obj.id;
            }
        })));

        _this.setServiceAdapter(options.serviceAdapter);
        return _this;
    }

    _createClass(PlacesBloodhoundEngine, [{
        key: "onSearch",
        value: function onSearch(query) {
            var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

            var self = this;

            this.getServiceAdapter().search(query, function (suggestions, status) {
                self.add(suggestions);

                callback(suggestions);
            });
        }
    }, {
        key: "setServiceAdapter",
        value: function setServiceAdapter(serviceAdapter) {
            return this.serviceAdapter = serviceAdapter;
        }
    }, {
        key: "getServiceAdapter",
        value: function getServiceAdapter() {
            return this.serviceAdapter || null;
        }
    }]);

    return PlacesBloodhoundEngine;
}(Bloodhound);

exports.default = PlacesBloodhoundEngine;

},{}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
function backboneClassFactory(customObj, BackboneClass) {

    return function () {
        var classProps = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        return BackboneClass.extend(Object.assign({}, customObj, classProps));
    };
}

exports.default = backboneClassFactory;

},{}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _backboneClassFactory = require('./backboneClassFactory');

var _backboneClassFactory2 = _interopRequireDefault(_backboneClassFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function backboneFactory(customObj, BackboneClass) {

    return function () {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
        }

        var classProps = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        return new (Function.prototype.bind.apply(BackboneClass.extend(Object.assign({}, customObj, classProps)), [null].concat(args)))();
    };

    /*return ( classProps = {}, ...args ) =>
        new (backboneClassFactory( customObj, BackboneClass ))( ...args )*/
}

exports.default = backboneFactory;

},{"./backboneClassFactory":8}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = typeaheadFactory;
function typeaheadFactory(selector) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    //require('typeahead.js');

    var $input = jQuery(selector);

    return $input.typeahead({}, _extends({
        display: 'description'
    }, options));
}

},{}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

            serviceAdapter.fetchPlaceByLatLng({ placeId: result['place_id'] }, function (placeDetails) {
                if (!placeDetails) throw new Error('Error to fetch place position');

                result.lat = placeDetails.geometry.location.lat();
                result.lng = placeDetails.geometry.location.lng();

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
}; //import Backbone from 'backbone';

exports.default = (0, _backboneFactory2.default)(addressView, Backbone.View);

},{"../vendor/PlacesBloodhoundEngine":7,"../vendor/backboneFactory":9,"../vendor/typeaheadFactory":10}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _backboneFactory = require('../vendor/backboneFactory');

var _backboneFactory2 = _interopRequireDefault(_backboneFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mapView = {
    initialize: function initialize(_ref) {
        var serviceContainer = _ref.serviceContainer,
            EasyMaps = _ref.EasyMaps,
            mapLocation = _ref.mapLocation,
            mapZoom = _ref.mapZoom,
            mapControls = _ref.mapControls,
            markerIcon = _ref.markerIcon,
            infoWindow = _ref.infoWindow;

        var view = this;

        var jQuery = serviceContainer.get('jQuery');

        var easyMap = new EasyMaps({
            jQuery: jQuery,
            //map: map,
            elem: view.el,
            center: mapLocation,
            zoom: mapZoom,
            controls: mapControls
        });

        easyMap.addEventListener('onLoaded', function () {
            easyMap.setZoom(mapZoom);

            view.$el.trigger('map:loaded');
        });

        var map = easyMap.mapObj;

        serviceContainer.set('easyMap', easyMap);
        serviceContainer.set('map', map);

        map.addListener('bounds_changed', function () {
            window.clearTimeout(view._t);
            view._t = window.setTimeout(function () {
                view.$el.trigger('map:bounds_changed', map.getBounds());
            }, 800);
        });

        this.listenTo(this.collection, 'sync', function (collection, resp, req) {
            view.refreshMap({ collection: collection, easyMap: easyMap, iconPath: markerIcon, infoWindowCreator: infoWindow });
        });
    },

    refreshMap: function refreshMap(_ref2) {
        var collection = _ref2.collection,
            easyMap = _ref2.easyMap,
            iconPath = _ref2.iconPath,
            infoWindowCreator = _ref2.infoWindowCreator;

        this.removeAllMarkers(easyMap);
        this.loadMarkers({ collection: collection, easyMap: easyMap, iconPath: iconPath, infoWindowCreator: infoWindowCreator });
    },

    loadMarkers: function loadMarkers(_ref3) {
        var collection = _ref3.collection,
            easyMap = _ref3.easyMap,
            iconPath = _ref3.iconPath,
            infoWindowCreator = _ref3.infoWindowCreator;

        for (var n in collection.models) {
            var model = collection.models[n];

            var markerConfig = {
                position: {
                    lat: model.get('lat'),
                    lng: model.get('lng')
                },
                icon: {
                    path: typeof iconPath === 'function' ? iconPath(model) : iconPath,
                    w: 41,
                    h: 47
                }
            };
            if (typeof infoWindowCreator === 'function') {
                var content = infoWindowCreator(model.attributes, model);
                if (content) {
                    markerConfig.infoWindow = {
                        content: content
                    };
                }
            }
            easyMap.addMarker(markerConfig);
        }

        //todo: togliere?
        //easyMap.fitCenterZoomToMarkers();
    },

    removeAllMarkers: function removeAllMarkers(easyMap) {
        easyMap.removeAllMarker();
    }
}; //import Backbone from 'backbone';

exports.default = (0, _backboneFactory2.default)(mapView, Backbone.View);

},{"../vendor/backboneFactory":9}],13:[function(require,module,exports){
'use strict';

var _Mapinator = require('./class/Mapinator');

var _Mapinator2 = _interopRequireDefault(_Mapinator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//import AbstractServiceContainer from './class/models/AbstractServiceContainer';

window.Mapinator = _Mapinator2.default;
//window.AbstractServiceContainer = AbstractServiceContainer;

},{"./class/Mapinator":1}]},{},[13]);
