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
        var StoreCollectionFactory = _ref.StoreCollectionFactory;
        var StoreModelClassFactory = _ref.StoreModelClassFactory;
        var url = _ref2.url;
        var parseResponse = _ref2.parseResponse;

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
        return _possibleConstructorReturn(this, (AbstractServiceContainer.__proto__ || Object.getPrototypeOf(AbstractServiceContainer)).call(this, classProps, { StoreCollectionFactory: StoreCollectionFactory, StoreModelClassFactory: StoreModelClassFactory }, { url: url, parseResponse: parseResponse }));
    }

    _createClass(AbstractServiceContainer, [{
        key: 'initialize',
        value: function initialize(classProps, _ref3, _ref4) {
            var StoreCollectionFactory = _ref3.StoreCollectionFactory;
            var StoreModelClassFactory = _ref3.StoreModelClassFactory;
            var url = _ref4.url;
            var parseResponse = _ref4.parseResponse;

            this.set('mapBounds', new google.maps.LatLngBounds());
            this.set('geocoder', new google.maps.Geocoder());

            this.set('placesAdapter', new _PlacesAdapter2.default());

            var stores = StoreCollectionFactory({
                url: url,
                parse: parseResponse
            }, null, {
                model: StoreModelClassFactory()
            });

            this.set('stores', stores);

            console.log('stores', this.get('stores'));

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
                console.log('store', n, store.get('lat'), store.get('lng'));
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

            var latLng = {
                lat: lat,
                lng: lng
            };

            this.get('geocoder').geocode({
                location: latLng
            }, function (results, status) {
                if (status === google.maps.GeocoderStatus.OK && results[1]) {
                    callback(results[1]);
                } else {
                    callback(false);
                }
            });
        }
    }]);

    return AbstractServiceContainer;
}(Backbone.Model);

exports.default = AbstractServiceContainer;
function AbstractServiceContainerClassFactory() {
    return AbstractServiceContainer;
}