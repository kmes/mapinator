'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.jQuery = exports.EasyMaps = exports.Bloodhound = undefined;

var _backbone = require('backbone');

var _bind = function (jQuery, window) {

    this.jQuery = this.$ = jQuery;

    //let Bloodhound = this.Bloodhound = require('typeahead.js/dist/bloodhound');
    require('./typeahead.js/dist/bloodhound');

    require('./typeahead.js/dist/typeahead.jquery');
    //require('./typeahead.js/dist/typeahead.bundle');

    var EasyMaps = function (jQuery, Bloodhound, window) {
        require('./typeahead-addresspicker/dist/typeahead-addresspicker.js');
        return require('./EasyMaps').default;
    }.bind(this)(jQuery, this.Bloodhound, window);

    return {
        jQuery: jQuery,
        Bloodhound: Bloodhound,
        EasyMaps: EasyMaps
    };
}.bind(window)(_backbone.$, window);

var Bloodhound = _bind.Bloodhound;
var EasyMaps = _bind.EasyMaps;
var jQuery = _bind.jQuery;
exports.Bloodhound = Bloodhound;
exports.EasyMaps = EasyMaps;
exports.jQuery = jQuery;