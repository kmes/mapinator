'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = typeaheadFactory;
function typeaheadFactory(jQuery, selector, options) {
    require('typeahead.js/dist/typeahead.jquery.js');

    return function () {

        return jQuery(selector).typeahead(null, options);
    }.bind(window)();
}