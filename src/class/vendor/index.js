import { $ } from 'backbone';

export const { Bloodhound, EasyMaps, jQuery } = (function( jQuery ) {
    this.jQuery = this.$ = jQuery;

    let Bloodhound = this.Bloodhound = require('typeahead.js/dist/bloodhound');
    require('typeahead.js/dist/typeahead.jquery');
    let EasyMaps = (function( jQuery, Bloodhound ) {
        require('typeahead-addresspicker/dist/typeahead-addresspicker.js');
        return require('./EasyMaps').default;
    }.bind(this))( jQuery, Bloodhound );

    return {
        jQuery,
        Bloodhound,
        EasyMaps
    };
}.bind(window))( $ );