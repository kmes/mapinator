import jQuery from 'jquery';

var $ = window ? window.jQuery || window.$ || (window.jQuery = jQuery) : jQuery;

import EasyMaps from './vendor/EasyMaps.js';

import AbstractServiceContainer from './models/AbstractServiceContainer';

import StoreModelClassFactory from './models/StoreModelClassFactory';
import StoreCollectionFactory from './models/StoreCollectionFactory';
import AddressViewFactory from './views/AddressViewFactory';
import MapViewFactory from './views/MapViewFactory';

import * as Helper from './helper/helper';

export default class Mapinator {
    constructor( config ) {
        this.config = config;

        this.serviceContainer = this.createServiceContainer( config );
        this.serviceContainer.set('jQuery', $);
        //this.bindServiceContainer( this.serviceContainer );

        this.addressView = this.createAddressView( config, this.serviceContainer );

        this.mapView = this.createMapView( config, this.serviceContainer );
        this.mapView.$el.bind('map:loaded', ( evt ) => {
            this.serviceContainer.setLocation( config.mapLocation );
            this.mapView.$el.unbind('map:loaded');
        });

        this.bindEvents();

        this.refreshStores( config.mapLocation );
    }

    refreshStores( location, callback = () => {} ) {
        this.showLoading();

        return this.serviceContainer.get('stores').fetchStores( location, ( stores ) => {
            callback( stores );

            this.hideLoading();
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

    bindEvents() {
        var serviceContainer = this.serviceContainer;

        serviceContainer.listenToOnce( serviceContainer.get('stores'), 'sync', function( stores ) {
            serviceContainer.get('easyMap').fitCenterZoomToMarkers();

            this.listenTo( this.get('stores'), 'sync', function( stores ) {
                //map load markers in mapView sync to storeCollection
                this.fitMapToNearestMarkers( 2 );
            });
        });

        this.addressView.$el.bind('address:select', function( evt, result ) {
            serviceContainer.setLocation({
                lat: result.lat,
                lng: result.lng
            });
        });

        this.mapView.$el.bind('map:bounds_changed', function( evt, bounds ) {
            serviceContainer.set('mapBounds', bounds);

            console.log('new bounds', bounds);
        });

        serviceContainer.on('change:mapLocation', function( serviceContainer, mapLocation ) {
            var easyMap = serviceContainer.get('easyMap');
            easyMap.setCenter(mapLocation.lat, mapLocation.lng);
            //easyMap.setZoom(10);
        });
    }

    createServiceContainer({ storesUrl }) {
        var ServiceContainer = AbstractServiceContainer.extend({
            comparator: 'distance',
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
        });

        return new ServiceContainer(
            {
                StoreCollectionFactory,
                StoreModelClassFactory
            },
            {
                url: storesUrl,
                normalizeRequestData: function( requestData ) {
                    return requestData;
                },
                parseResponse: function( response ) {
                    return response.collections.map(function( data ) {
                        return {
                            id: data.id,
                            title: data.title,
                            lat: parseFloat( data.lat ),
                            lng: parseFloat( data.lng ),
                            phone: data.phone,
                            sanitizedPhone: Helper.sanitizePhone( data.phone ),
                            street: data.street,
                            distance: data.distance || '',
                            indication: data.indication,
                            calendar: data.hours,
                            extraCalendar: data.extrahours
                        };
                    });
                }
            }
        );
    }
    bindServiceContainer( serviceContainer ) {
        serviceContainer.on('change:mapLocation', function( serviceContainer, mapLocation ) {
            var easyMap = serviceContainer.get('easyMap');
            easyMap.setCenter(mapLocation.lat, mapLocation.lng);
            easyMap.setZoom(10);
        });
        serviceContainer.listenToOnce( serviceContainer.get('stores'), 'sync', function( stores ) {
            this.get('easyMap').fitCenterZoomToMarkers();

            this.listenTo( this.get('stores'), 'sync', function( stores ) {
                this.fitMapToNearestMarkers( 2 );
            });
        });

        return serviceContainer;
    }

    createAddressView( config, serviceContainer ) {
        return AddressViewFactory({}, {
            el: config.addressSelector,
            cancelAddressButton: '.cancel-address',
            serviceContainer: serviceContainer,
            /*mapSelector: config.mapSelector,
            mapLocation: config.mapLocation,
            mapOptions: config.mapOptions,*/
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
            markerIcon: typeof config.iconPath === 'function' ? config.iconPath() : config.iconPath,
            infoWindow: function( data ) {
                if( !data ) return false;

                var $info = jQuery( config.infoWindowProto ).clone(true, true);

                $info.removeClass('hidden');

                $info.find('.title').html( data.title );
                $info.find('.street').html( data.street );

                var phone = data.phone && data.phone.trim() ? $info.find('.phone').html() + data.phone : '';
                $info.find('.phone').html( phone );


                var href = $info.find('.link-hours').attr('href');
                $info.find('.link-hours').attr('href', href+data.id);

                return jQuery('<div></div>').append( $info ).html();
            },
            collection: serviceContainer.get('stores')
        });
    }
}