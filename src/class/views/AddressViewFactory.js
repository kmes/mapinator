import { View } from 'backbone';

import PlacesBloodhoundEngine from '../vendor/PlacesBloodhoundEngine';
//import PlacesAdapter from '../vendor/PlacesAdapter';
import typeaheadFactory from '../vendor/typeaheadFactory';
import backboneFactory from '../vendor/backboneFactory';


const addressView = {
    events: {
        'keyup': 'pickerHandler',
        'click': 'pickerHandler'
    },
    initialize: function( options ) {
        var view = this;

        var serviceAdapter = options.serviceContainer.get('placesAdapter');
        var placeEngine = new PlacesBloodhoundEngine({ serviceAdapter });

        typeaheadFactory( view.el, {
            source: placeEngine
        });

        view.el.value = options.address;

        view.$el.bind('typeahead:select', function( evt, result ) {
            if( result.lat && result.lng ) {
                view.$el.trigger('address:select', result);
                return;
            }

            serviceAdapter.fetchLatLng({ placeId: result['place_id'] }, function( placeDetails ) {
                if( !placeDetails ) throw new Error('Error to fetch place position');

                /*var newResult = {
                    ...result,
                    lat: placeDetails.geometry.location.lat(),
                    lng: placeDetails.geometry.location.lng()
                };*/
                result.lat = placeDetails.geometry.location.lat();
                result.lng = placeDetails.geometry.location.lng();

                //console.log('fetchLatLng', result);

                //placeEngine.add( [newResult] );

                view.$el.trigger( 'address:select', result );
            });



        });

        if( typeof options.cancelAddressButton === 'string' || options.cancelAddressButton instanceof HTMLElement ) {
            jQuery( options.cancelAddressButton ).bind('click', function( evt ) {
                console.log('click');

                view.el.value = '';
                view.el.focus();
            });
        }

    },
    pickerHandler: function( evt, result ) {
        var view = this;
        var input = view.el;
        var $input = jQuery( input );

        var selectFirst = function() {
            setTimeout(function() {
                if( !jQuery('.tt-dataset-0').length || !jQuery('.tt-dataset-0').find('.tt-suggestion').length ) return;
                jQuery('.tt-dataset-0').find('.tt-suggestion').eq(0).addClass('tt-cursor');
            }, 200);
        };

        switch( evt.type ) {
            case 'keyup' :
                var keyCode = evt.keyCode || evt.which;
                if( keyCode == 40 || keyCode == 38 ) {
                    break;
                }
                selectFirst();
                break;
            case 'click' :
                input.setSelectionRange(0, input.value.length);
                selectFirst();
                break;
        }
    }
};

export default backboneFactory( addressView, View );