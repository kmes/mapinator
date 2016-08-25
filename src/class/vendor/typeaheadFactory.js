import typeahead, { Bloodhound } from "typeahead.js-browserify";

export default function typeaheadFactory( window, selector, datasets ) {
    //require('typeahead.js/dist/typeahead.bundle.js');

    /*var placesSource = new Bloodhound({
        //queryTokenizer: Bloodhound.tokenizers.whitespace,
        //datumTokenizer: Bloodhound.tokenizers.whitespace,
        queryTokenizer: (d) => Bloodhound.tokenizers.whitespace,
        datumTokenizer: (d) => Bloodhound.tokenizers.whitespace(d.description),
        //identify: (obj) => obj.description,
        local: [
            {
                description: 'milano'
            },
            {
                description: 'Milano'
            }
        ]
    });*/

    var placesSource = new Bloodhound({
        datumTokenizer: (obj) => Bloodhound.tokenizers.whitespace(obj.description),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: [
            {
                description: 'milano assago'
            },
            {
                description: 'Milanoo'
            }
        ]
    });

    return (function( window, placesSource ) {
        console.log(typeof window);
        typeahead.loadjQueryPlugin();

        //return window.jQuery( selector ).typeahead( {}, datasets );

        return window.jQuery( selector ).typeahead( {}, {
            display: 'description',
            source: placesSource
        });


    }.bind(window))( window, placesSource );

}