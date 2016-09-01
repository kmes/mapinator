'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _backbone = require('backbone');

var _backbone2 = _interopRequireDefault(_backbone);

var _backboneFactory = require('../vendor/backboneFactory');

var _backboneFactory2 = _interopRequireDefault(_backboneFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mapView = {
    initialize: function initialize(_ref) {
        var serviceContainer = _ref.serviceContainer;
        var EasyMaps = _ref.EasyMaps;
        var mapLocation = _ref.mapLocation;
        var mapZoom = _ref.mapZoom;
        var mapControls = _ref.mapControls;
        var markerIcon = _ref.markerIcon;
        var infoWindow = _ref.infoWindow;

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
        var collection = _ref2.collection;
        var easyMap = _ref2.easyMap;
        var iconPath = _ref2.iconPath;
        var infoWindowCreator = _ref2.infoWindowCreator;

        this.removeAllMarkers(easyMap);
        this.loadMarkers({ collection: collection, easyMap: easyMap, iconPath: iconPath, infoWindowCreator: infoWindowCreator });
    },

    loadMarkers: function loadMarkers(_ref3) {
        var collection = _ref3.collection;
        var easyMap = _ref3.easyMap;
        var iconPath = _ref3.iconPath;
        var infoWindowCreator = _ref3.infoWindowCreator;

        for (var n in collection.models) {
            var model = collection.models[n];

            var markerConfig = {
                position: {
                    lat: model.get('lat'),
                    lng: model.get('lng')
                },
                icon: {
                    path: iconPath,
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
};

exports.default = (0, _backboneFactory2.default)(mapView, _backbone2.default.View);