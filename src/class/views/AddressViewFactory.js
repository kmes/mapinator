import { View } from 'backbone';

import backboneFactory from '../vendor/backboneFactory';

const addressView = {
    events: {
        'click': 'pickerHandler',
        'keyup': 'pickerHandler'
    },
    initialize: function( options ) {
        var view = this;

        var addressPicker = new options.AddressPicker({
            map: {
                id: options.mapSelector,
                displayMarker: false,
                zoom: options.mapOptions.zoom,
                center: options.mapLocation ? new google.maps.LatLng( options.mapLocation.lat, options.mapLocation.lng ) : null
            },
            marker: {
                draggable: false,
                visible: false
            },
            zoomForLocation: 18,
            draggable: true,
            reverseGeocoding: true,
            autocompleteService: {
                //types: ['(cities)'],
                componentRestrictions: {country: 'IT'}
            }
        });

        console.log('addressPicker', addressPicker, addressPicker.ttAdapter());

        var placeService = new google.maps.places.AutocompleteService();

        $( view.$el ).typeahead( null, {
             displayKey: 'description',
             //source: addressPicker.ttAdapter()
            source: function( query, syncSuggestions, asyncSuggestions ) {
                console.log('source', arguments);

                placeService.getQueryPredictions({ input: query }, function(predictions, status) {
                    console.log('predictions', predictions);

                    asyncSuggestions( predictions );
                });
            }
        });

        if( options.addressText ) {
            this.$el.val( options.addressText );
        }

        //var placeService = addressPicker.placeService;

        console.log('placeService', placeService);

        //addressPicker.bindDefaultTypeaheadEvent( view.$el );
        /*view.$el.bind('typeahead:selected', addressPicker.updateMap);*/
        view.$el.bind('typeahead:selected', function(evt, place) {
            placeService.getDetails(place, function( result ) {
                var location = {
                    lat: result.geometry.location.lat(),
                    lng: result.geometry.location.lng()
                };
                options.serviceContainer.setLocation( location, true );

                view.$el.blur();

                /*view.collection.fetch({
                 data: location
                 });*/
            });
        });
        //view.$el.bind('typeahead:cursorchanged', addressPicker.updateMap);

        options.serviceContainer.set('addressPicker', addressPicker );
        options.serviceContainer.set('map', addressPicker.map );
        options.serviceContainer.set('placeService', placeService );

        if( options.cancelAddressSelector ) {
            $( options.cancelAddressSelector ).on('click', function( evt ) {
                view.$el.val('');
            });
        }
    },
    pickerHandler: function( evt, result ) {
        var view = this;

        //console.log('event', evt.keyCode);

        switch( evt.type ) {
            case 'keyup' :
                var keyCode = evt.keyCode || evt.which;
                if( keyCode == 40 || keyCode == 38 ) {
                    break;
                }
                setTimeout(function() {
                    $('.tt-dataset-0').find('.tt-suggestion').eq(0).addClass('tt-cursor');
                }, 200);
                break;
            case 'click' :
                view.el.setSelectionRange(0, view.el.value.length);
                break;
        }
    }
};

export default backboneFactory( addressView, View );