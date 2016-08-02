"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
function backboneFactory(customObj, BackboneClass) {
    /*console.log( 'customObj', customObj );
     return function( classProps = {}, ...args ) {
        var proto = Object.assign({}, customObj, classProps);
         console.log('proto', proto);
         var NewClass = BackboneClass.extend( proto );
         console.log('NewClass', NewClass);
         return new NewClass( ...args );
    };*/

    return function () {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
        }

        var classProps = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
        return new (Function.prototype.bind.apply(BackboneClass.extend(Object.assign({}, customObj, classProps)), [null].concat(args)))();
    };
}

exports.default = backboneFactory;