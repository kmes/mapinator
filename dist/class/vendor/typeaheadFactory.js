'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = typeaheadFactory;
function typeaheadFactory(jQuery, selector, options) {
    require('typeahead');

    return jQuery(selector).typeahead(null, options);
}