'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.jQuery = exports.EasyMaps = exports.Bloodhound = undefined;

var _backbone = require('backbone');

var _bind = function (jQuery) {
    this.jQuery = this.$ = jQuery;

    var Bloodhound = this.Bloodhound = require('typeahead.js/dist/bloodhound');
    require('typeahead.js/dist/typeahead.jquery');
    var EasyMaps = function (jQuery, Bloodhound) {
        require('typeahead-addresspicker/dist/typeahead-addresspicker.js');
        return require('./EasyMaps').default;
    }.bind(this)(jQuery, Bloodhound);

    return {
        jQuery: jQuery,
        Bloodhound: Bloodhound,
        EasyMaps: EasyMaps
    };
}.bind(window)(_backbone.$);

var Bloodhound = _bind.Bloodhound;
var EasyMaps = _bind.EasyMaps;
var jQuery = _bind.jQuery;
exports.Bloodhound = Bloodhound;
exports.EasyMaps = EasyMaps;
exports.jQuery = jQuery;