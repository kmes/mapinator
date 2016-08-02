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

        typeaheadFactory({
            jQuery,
            el: view.el,
            options: null,
            datasets: {
                name: 'locations',
                display: ( suggestion ) => suggestion.description,
                async: true,
                source: function( query, syncResults, asyncResults ) {
                    placeService.getQueryPredictions({ input: query }, function(suggestions, status) {
                        console.log('suggestions', suggestions.map((sug) => sug.description));

                        asyncResults( suggestions );
                    });
                }
            }
        });

        typeaheadFactory( options.jQuery, view.el, {
            //isplay: 'description',
            async: true,
            source: function( query, sync, async ) {
                placeService.getQueryPredictions({ input: query }, function(suggestions, status) {
                    console.log('suggestions', suggestions.map((sug) => sug.description));

                    sync( suggestions );
                });
            }
        });
    },
    pickerHandler: function( evt, result ) {
        var view = this;

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