'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = typeaheadFactory;
function typeaheadFactory(selector) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    require('typeahead.js');

    var $input = jQuery(selector);

    return $input.typeahead({}, _extends({
        display: 'description'
    }, options));
}