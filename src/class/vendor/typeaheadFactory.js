export default function typeaheadFactory( selector, options = {} ) {
    require('typeahead.js');

    var $input = jQuery( selector );

    return $input.typeahead( {}, {
        display: 'description',
        ...options
    });
}