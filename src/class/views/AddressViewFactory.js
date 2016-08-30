import { View } from 'backbone';

import PlacesBloodhoundEngine from '../vendor/PlacesBloodhoundEngine';
//import PlacesAdapter from '../vendor/PlacesAdapter';
import typeaheadFactory from '../vendor/typeaheadFactory';

import backboneFactory from '../vendor/backboneFactory';


const addressView = {
    events: {
        'click': 'pickerHandler',
        'keyup': 'pickerHandler',
        'typeahead:select': 'pickerHandler'
    },
    initialize: function( options ) {
        var view = this;

        var serviceAdapter = options.serviceContainer.get('placesAdapter');

        typeaheadFactory( view.el, {
            source: new PlacesBloodhoundEngine({ serviceAdapter })
        });

        view.$el.bind('typeahead:select', function( evt, result ) {
            serviceAdapter.fetchLatLng({ placeId: result['place_id'] }, function( result ) {
                if( !result ) throw new Error('Error to fetch place position');

                view.$el.trigger('address:select', {
                    ...result,
                    lat: result.geometry.location.lat(),
                    lng: result.geometry.location.lng()
                });
            });

        });
    },
    pickerHandler: function( evt, result ) {
        var view = this;
        var input = view.el;
        var $input = jQuery( input );

        switch( evt.type ) {
            case 'keyup' :
                var keyCode = evt.keyCode || evt.which;
                if( keyCode == 40 || keyCode == 38 ) {
                    break;
                }
                setTimeout(function() {
                    jQuery('.tt-dataset-0').find('.tt-suggestion').eq(0).addClass('tt-cursor');
                }, 200);
                break;
            case 'click' :
                input.setSelectionRange(0, input.value.length);
                break;
        }
    }
};

export default backboneFactory( addressView, View );