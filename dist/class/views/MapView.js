'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _backbone = require('backbone');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MapView = function (_View) {
    _inherits(MapView, _View);

    function MapView(options) {
        _classCallCheck(this, MapView);

        var classProps = {};

        return _possibleConstructorReturn(this, Object.getPrototypeOf(MapView).call(this, classProps, options));
    }

    _createClass(MapView, [{
        key: 'initialize',
        value: function initialize(classProps, _ref) {
            var serviceContainer = _ref.serviceContainer;
            var EasyMaps = _ref.EasyMaps;
            var markerIcon = _ref.markerIcon;
            var infoWindow = _ref.infoWindow;

            var view = this;

            var map = serviceContainer.get('map');

            var easyMap = new EasyMaps({
                map: map,
                controls: {
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
                }
            });
            serviceContainer.set('easyMap', easyMap);

            map.addListener('bounds_changed', function () {
                window.clearTimeout(view._t);
                view._t = window.setTimeout(function () {
                    serviceContainer.set('mapBounds', map.getBounds());
                }, 800);
            });

            this.listenTo(this.collection, 'sync', function (collection, resp, req) {
                view.refreshMap(collection, easyMap, markerIcon, infoWindow);
            });
        }
    }, {
        key: 'refreshMap',
        value: function refreshMap(collection, easyMap, iconPath, infoWindowCreator) {
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
    }]);

    return MapView;
}(_backbone.View);

exports.default = MapView;