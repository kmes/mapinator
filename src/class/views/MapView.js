import { View } from 'backbone';

export default class MapView extends View {
    constructor({ serviceContainer, EasyMaps, markerIcon, infoWindow }) {
        var classProps = {};

        super( classProps, { serviceContainer, EasyMaps, markerIcon, infoWindow });
    }

    initialize({ serviceContainer, EasyMaps, markerIcon, infoWindow }) {
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

        map.addListener('bounds_changed', function() {
            window.clearTimeout( view._t );
            view._t = window.setTimeout(function() {
                serviceContainer.set('mapBounds', map.getBounds());
            }, 800);
        });

        this.listenTo(this.collection, 'sync', function( collection, resp, req ) {
            view.refreshMap( collection, easyMap, markerIcon, infoWindow );
        });
    }

    refreshMap( collection, easyMap, iconPath, infoWindowCreator ) {
        easyMap.removeAllMarker();
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
    }
}