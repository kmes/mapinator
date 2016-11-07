"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
function backboneClassFactory(customObj, BackboneClass) {

    return function () {
        var classProps = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        return BackboneClass.extend(Object.assign({}, customObj, classProps));
    };
}

exports.default = backboneClassFactory;