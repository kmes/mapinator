var config = {
    mapSelector: '#map',
    mapView: null,
    mapOptions: {
        zoom: 4,
        center:  {
            lat: 41.2053167,
            lng: 8.085248
        },
        mapTypeControl: false,
        streetViewControl: false,
        scrollwheel: false
    },
    addresstext: 'Italia',
    mapLocation: {
        lat: 41.2053167,
        lng: 8.085248
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
    getStoreIconPath: function() {
        return $( this.storeMarkerIcon ).attr('src');
    },

    infoWindowProto: '.store-info-prototype',

    serviceContainer: null,

    storesUrl: '/ajax/store/list',

    storesContainer: '.stores-container',
    storeProto: '.store-prototype > *',
    store: '.store-panel',
    openingRow: '.opening-row',
    extraOpeningTitle: '.extra-opening-title',
    extraClosingTitle: '.extra-closing-title',
    extraOpeningRow: '.extra-opening-row',
    extraClosingRow: '.extra-closing-row'
};


var mapinator = new Mapinator( config );

console.log( mapinator );


