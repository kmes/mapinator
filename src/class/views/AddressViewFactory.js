import { View } from 'backbone';

import typeaheadFactory from '../vendor/typeaheadFactory';

import backboneFactory from '../vendor/backboneFactory';

const addressView = {
    events: {
        'click': 'pickerHandler',
        'keyup': 'pickerHandler'
    },
    initialize: function( options ) {
        var view = this;

        var placeService = new google.maps.places.AutocompleteService();

        typeaheadFactory( options.jQuery, view.el, {
            display: 'description',
            async: true,
            source: function( query, sync, async ) {
                placeService.getQueryPredictions({ input: query }, function(suggestions, status) {
                    console.log('suggestions', suggestions);

                    async( suggestions );
                });
            }
        });

        /*if( options.addressText ) {
            this.$el.val( options.addressText );
        }

        view.$el.bind('typeahead:selected', function(evt, place) {
            placeService.getDetails(place, function( result ) {
                var location = {
                    lat: result.geometry.location.lat(),
                    lng: result.geometry.location.lng()
                };
                options.serviceContainer.setLocation( location, true );

                view.$el.blur();

                /!*view.collection.fetch({
                 data: location
                 });*!/
            });
        });
        options.serviceContainer.set('map', addressPicker.map );
        options.serviceContainer.set('placeService', placeService );

        if( options.cancelAddressSelector ) {
            $( options.cancelAddressSelector ).on('click', function( evt ) {
                view.$el.val('');
            });
        }*/
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