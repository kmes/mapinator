//import Backbone from 'backbone';

import backboneFactory from '../vendor/backboneFactory';

const mapView = {
    initialize: function( { serviceContainer, EasyMaps, mapLocation, mapZoom, mapControls, markerIcon, infoWindow } ) {
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

        easyMap.addEventListener('onLoaded', function() {
            easyMap.setZoom( mapZoom );

            view.$el.trigger('map:loaded');
        });

        var map = easyMap.mapObj;

        serviceContainer.set('easyMap', easyMap);
        serviceContainer.set('map', map);

        map.addListener('bounds_changed', function() {
            window.clearTimeout( view._t );
            view._t = window.setTimeout(function() {
                view.$el.trigger('map:bounds_changed', map.getBounds());
            }, 800);
        });

        this.listenTo(this.collection, 'sync', function( collection, resp, req ) {
            view.refreshMap({ collection, easyMap, iconPath: markerIcon, infoWindowCreator: infoWindow });
        });
    },

    refreshMap: function({ collection, easyMap, iconPath, infoWindowCreator }) {
        this.removeAllMarkers( easyMap );
        this.loadMarkers({ collection, easyMap, iconPath, infoWindowCreator });
    },

    loadMarkers: function({ collection, easyMap, iconPath, infoWindowCreator })  {
        for( var n in collection.models ) {
            var model = collection.models[ n ];

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
            if( typeof infoWindowCreator === 'function' ) {
                var content = infoWindowCreator( model.attributes, model );
                if( content ) {
                    markerConfig.infoWindow = {
                        content: content
                    };
                }
            }
            easyMap.addMarker( markerConfig );
        }

        //todo: togliere?
        //easyMap.fitCenterZoomToMarkers();
    },

    removeAllMarkers: function( easyMap ) {
        easyMap.removeAllMarker();
    }
};

export default backboneFactory( mapView, Backbone.View );