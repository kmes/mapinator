//import jQuery from 'jquery';

var $ = window ? window.jQuery || window.$ || (window.jQuery = jQuery) : jQuery;

import EasyMaps from './vendor/EasyMaps.js';

import AbstractServiceContainer from './models/AbstractServiceContainer';

import StoreModelClassFactory from './models/StoreModelClassFactory';
import StoreCollectionFactory from './models/StoreCollectionFactory';
import AddressViewFactory from './views/AddressViewFactory';
import MapViewFactory from './views/MapViewFactory';

export default class Mapinator {
    constructor( config ) {
        this.config = config;

        this.serviceContainer = this.createServiceContainer( config );
        this.serviceContainer.set('jQuery', $);

        this.addressView = this.createAddressView( config, this.serviceContainer );

        this.mapView = this.createMapView( config, this.serviceContainer );
        this.mapView.$el.bind('map:loaded', ( evt ) => {
            this.serviceContainer.setLocation( config.mapLocation );

            this.serviceContainer.set('mapLoaded', true);

            this.mapView.$el.unbind('map:loaded');
        });

        this.bindEvents();

    }
    bindEvents() {
        var serviceContainer = this.serviceContainer;

        this.addressView.$el.bind('address:select', function( evt, result ) {
            serviceContainer.setLocation({
                lat: result.lat,
                lng: result.lng
            });
        });
        serviceContainer.on('change:mapLocation', function( serviceContainer, mapLocation ) {
            serviceContainer.get('easyMap').setCenter( mapLocation.lat, mapLocation.lng );
            //easyMap.setZoom(10);
        });

        this.mapView.$el.bind('map:bounds_changed', function( evt, bounds ) {
            serviceContainer.set('mapBounds', bounds);
        });
    }

    refreshStores( options, callback = () => {} ) {
        this.showLoading();

        this.serviceContainer.get('stores').once('sync', ( serviceContainer, stores ) => {
            callback( stores );

            this.hideLoading();
        });


        return this.serviceContainer.get('stores').fetchStores({
            url: typeof this.config.storesUrl === 'function' ? this.config.storesUrl( this.serviceContainer ) : this.config.storesUrl,

            ...options,

            data: typeof this.config.parseRequest === 'function' ? this.config.parseRequest( options.data ) : options.data
        });
    }
    showLoading() {
        var { startLoading = () => {} } = this.config;

        startLoading();
    }
    hideLoading() {
        var { endLoading = () => {} } = this.config;

        endLoading();
    }

    fitMapToMarkers() {
        this.serviceContainer.get('easyMap').fitCenterZoomToMarkers();
    }

    fitMapToNearestMarkers( min, center ) {
        if( !min ) min = 1;

        var serviceContainer = this.serviceContainer;
        var mapLocation = center || serviceContainer.get('mapLocation');

        var bounds = new google.maps.LatLngBounds();
        bounds.extend( new google.maps.LatLng(mapLocation.lat, mapLocation.lng) );

        var stores = serviceContainer.get('stores').models;

        var centerLatLng = new google.maps.LatLng( center.lat, center.lng );
        stores.sort(function( a, b ) {
            var aDist = google.maps.geometry.spherical.computeDistanceBetween( new google.maps.LatLng(a.get('lat'), a.get('lng')), centerLatLng );
            var bDist = google.maps.geometry.spherical.computeDistanceBetween( new google.maps.LatLng(b.get('lat'), b.get('lng')), centerLatLng );

            return aDist - bDist;
        });

        var minStores = stores.slice(0, min);
        for( var n in minStores ) {
            var store = minStores[n];

            //console.log('store', n, store.get('lat'), store.get('lng'));

            if( !bounds.contains(new google.maps.LatLng( store.get('lat'), store.get('lng') )) ) {
                bounds.extend(new google.maps.LatLng( store.get('lat'), store.get('lng') ));
            }
        }

        serviceContainer.get('easyMap').setZoom( 30 );

        serviceContainer.get('map').fitBounds( bounds );
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

    createServiceContainer({ storesUrl, placesOptions, storesComparator, parseRequest = (req) => req, parseResponse = (resp) => resp }) {

        var serviceContainerConfig =             {
            comparator: storesComparator,
            getLocation: function() {
                return this.get('mapLocation');
            },
            setLocation: function( location, toFetch ) {
                this.set('mapLocation', {
                    lat: location.lat,
                    lng: location.lng
                });

                if( this.has('centerMarker') ) {
                    this.get('centerMarker').setMap( null );
                    this.set('centerMarker', null);
                }
                var map = this.get('map');
                this.set('centerMarker', new google.maps.Marker({
                    position: location,
                    map: map
                }));

                if( toFetch ) {
                    this.get('stores').fetch({
                        data: location
                    });
                }

                return this.get('mapLocation');
            },
            getVisibleStores: function( mapBounds ) {
                return this.get('stores').filter(function( model ) {
                    var latLng = new google.maps.LatLng( model.get('lat'), model.get('lng') );

                    return mapBounds.contains( latLng );
                });
            },
            refreshDistances: function( centerLocation ) {

            }
        };

        for( var name in serviceContainerConfig ) {
            AbstractServiceContainer.prototype[ name ] = serviceContainerConfig[ name ];
        }

        return new AbstractServiceContainer(
            {
                StoreCollectionFactory,
                StoreModelClassFactory,
                placesOptions
            },
            {
                url: storesUrl,
                parseResponse
            }
        );
    }
    createAddressView( config, serviceContainer ) {
        return AddressViewFactory({}, {
            el: config.addressSelector,
            serviceContainer: serviceContainer,
            address: config.address,

            collection: serviceContainer.get('stores'),

            jQuery: serviceContainer.get('jQuery')
        });
    }
    createMapView( config, serviceContainer ) {
        return MapViewFactory({}, {
            el: config.mapSelector,
            serviceContainer: serviceContainer,
            EasyMaps: EasyMaps,
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
}