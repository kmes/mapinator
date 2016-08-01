export default function typeaheadFactory( jQuery, selector, options ) {
    require('typeahead');

    return jQuery( selector ).typeahead( null, options );
}