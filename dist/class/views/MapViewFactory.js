'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _backbone = require('backbone');

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
                serviceContainer.set('mapBounds', map.getBounds());
            }, 800);
        });

        this.listenTo(this.collection, 'sync', function (collection, resp, req) {
            view.refreshMap(collection, easyMap, markerIcon, infoWindow);
        });
    },

    refreshMap: function refreshMap(collection, easyMap, iconPath, infoWindowCreator) {
        easyMap.removeAllMarker();
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
    }
};

exports.default = (0, _backboneFactory2.default)(mapView, _backbone.View);