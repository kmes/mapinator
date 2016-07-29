import { Model } from 'backbone';

export default class AbstractServiceContainer extends Model {
    constructor( { StoreCollectionFactory, StoreModelFactory }, { url, normalizeRequestData, parseResponse } ) {
        var classProps = {
            defaults: {
                mapBounds: null,
                geocoder: null,

                stores: null, //Backbone.Collection

                map: null,
                easyMap: null,
                centerMarker: null,
                mapLocation: {
                    lat: null,
                    lng: null
                }
            }
        };
        super( classProps, { StoreCollectionFactory, StoreModelFactory }, { url, normalizeRequestData, parseResponse });
    }

    initialize( classProps, { StoreCollectionFactory, StoreModelFactory }, { url, normalizeRequestData, parseResponse } ) {
        this.set( 'mapBounds', new google.maps.LatLngBounds() );
        this.set( 'geocoder', new google.maps.Geocoder() );

        var stores = StoreCollectionFactory(
            {
                //url,
                url: 'http://www.maxizoo.local'+url,
                parse: parseResponse
            },
            null,
            {
                model: StoreModelFactory
            }
        );

        this.set( 'stores', stores );

        console.log( 'stores', this.get('stores') );

        if( typeof this.setLocation !== 'function' ) {
            this.setLocation = function() {
                throw new Error('setLocation method is not implements');
            };
            throw new Error('setLocation method is not implements');
        }
    }

    fitMapToMarkers() {
        this.get('easyMap').fitCenterZoomToMarkers();
    }
    fitMapToNearestMarkers( min ) {
        if( !min ) min = 1;

        var stores = this.get('stores');
        var minStores = stores.models.slice(0, min);

        //var mapBounds = this.get('mapBounds');
        //var mapBounds = this.get('map').getBounds();
        var mapBounds = new google.maps.LatLngBounds();
        var mapLocation = this.get('mapLocation');
        mapBounds.extend( new google.maps.LatLng(mapLocation.lat, mapLocation.lng) );
        for( var n in minStores ) {
            var store = minStores[n];
            console.log('store', n, store.get('lat'), store.get('lng'));
            if( !mapBounds.contains(new google.maps.LatLng( store.get('lat'), store.get('lng') )) ) {
                mapBounds.extend( new google.maps.LatLng( store.get('lat'), store.get('lng') ) );
            }
        }

        this.get('map').fitBounds( mapBounds );
    }
    getAddressFromLatLng( lat, lng, callback ) {
        if( !callback ) callback = function() {};

        var latLng = {
            lat: lat,
            lng: lng
        };

        this.get('geocoder').geocode(
            {
                location: latLng
            },
            function( results, status ) {
                if( status === google.maps.GeocoderStatus.OK && results[1] ) {
                    callback( results[1] );
                }
                else {
                    callback( false );
                }
            }
        );
    }


}

export function AbstractServiceContainerClassFactory() {
    return AbstractServiceContainer;
}