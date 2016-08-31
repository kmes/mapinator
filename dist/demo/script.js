var config = {
    mapSelector: '#map',
    mapView: null,
    address: 'Italia',
    mapLocation:  {
        lat: 41.9027835,
        lng: 12.4963655
    },
    mapZoom: 10,
    mapControls: {
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
    getMapLocation: function() {
        return this.mapLocation;
    },

    addressSelector: '#addressSearch',
    addressView: null,

    storePanelSelector: '',
    storePanel: null,

    storePanelContainerSelector: '.stores-container',
    storePanelContainer: null,

    storeMarkerIcon: '.marker-prototype .marker-store',
    iconPath: function() {
        return jQuery( this.storeMarkerIcon ).attr('src');
    },

    infoWindowProto: '.store-info-prototype',

    serviceContainer: null,

    //storesUrl: 'http://www.maxizoo.local'+'/ajax/store/list',
    storesUrl: '/stores.json',

    storesContainer: '.stores-container',
    storeProto: '.store-prototype > *',
    store: '.store-panel',
    openingRow: '.opening-row',
    extraOpeningTitle: '.extra-opening-title',
    extraClosingTitle: '.extra-closing-title',
    extraOpeningRow: '.extra-opening-row',
    extraClosingRow: '.extra-closing-row'
};

jQuery('.cancel-address').on('click', function( evt ) {
    jQuery('#addressSearch').val('');
});


var mapinator = new Mapinator({
    storesUrl: function() {
        console.log('url', this);
        return '/stores.json';
    },
    storesComparator: 'distance',
    parseResponse: function( response ) {
        return response.collections.map(function( data ) {
            return {
                id: data.id,
                title: data.title,
                lat: parseFloat( data.lat ),
                lng: parseFloat( data.lng ),
                phone: data.phone,
                sanitizedPhone: (function( phone ) { return phone; })( data.phone ),
                street: data.street,
                distance: data.distance || '',
                indication: data.indication,
                calendar: data.hours,
                extraCalendar: data.extrahours
            };
        });
    },
    mapSelector: '#map',
    addressSelector: '#addressSearch',
    address: 'Italia',
    mapLocation:  {
        lat: 41.9027835,
        lng: 12.4963655
    },
    mapZoom: 10,
    mapControls: {
        'mapTypeControl': false,
        'navigationControl': false,
        'scrollwheel': false,
        'streetViewControl': false,
        'panControl': false,
        'zoomControl': true,
        'scaleControl': true,
        'overviewMapControl': false,
        'disableDoubleClickZoom': false,
        'draggable': true
    },
    iconPath: function() {
        return jQuery( config.storeMarkerIcon ).attr('src');
    },
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
});

console.log( mapinator );

mapinator.serviceContainer.once('change:mapLoaded', function( serviceContainer, mapLoaded ) {
    mapinator.refreshStores( serviceContainer.get('mapLocation'), () => {
        mapinator.fitMapToMarkers();

        serviceContainer.on('change:mapLocation', function( serviceContainer, mapLocation ) {
            console.log('change:mapLocation', mapLocation);

            mapinator.refreshStores( mapLocation, ( stores ) => {
                mapinator.fitMapToNearestMarkers( 2, mapLocation );
            });
        });
    });
});

mapinator.serviceContainer.on('change:mapBounds', function( serviceContainer, mapBounds ) {
    console.log('change:mapBounds', mapBounds);
    //todo: mostra storePanel
});




