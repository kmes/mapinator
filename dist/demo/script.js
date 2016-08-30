var config = {
    mapSelector: '#map',
    mapView: null,
    /*mapOptions: {
        zoom: 5,
        /!*center:  {
            lat: 41.9027835,
            lng: 12.4963655
        },*!/
        mapTypeControl: false,
        streetViewControl: false,
        scrollwheel: false
    },*/
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
    getStoreIconPath: function() {
        return jQuery( this.storeMarkerIcon ).attr('src');
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


