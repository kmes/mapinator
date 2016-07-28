'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Backbone = require('Backbone');

var _Backbone2 = _interopRequireDefault(_Backbone);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BackboneClassesContainer = function (_Backbone$Collection) {
    _inherits(BackboneClassesContainer, _Backbone$Collection);

    function BackboneClassesContainer() {
        _classCallCheck(this, BackboneClassesContainer);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(BackboneClassesContainer).apply(this, arguments));
    }

    _createClass(BackboneClassesContainer, [{
        key: 'getClassByName',
        value: function getClassByName(className) {
            return this.find(function (singleClass) {
                return singleClass.name == className;
            });
        }
    }]);

    return BackboneClassesContainer;
}(_Backbone2.default.Collection);

var BackboneServiceFactory = function () {
    function BackboneServiceFactory(classList, BackboneClassRef) {
        _classCallCheck(this, BackboneServiceFactory);

        this.setBackbone(BackboneClassRef || _Backbone2.default);

        this.container = new BackboneClassesContainer();
        if (Array.isArray(classList)) {
            this.container.set(classList);
        }
    }

    _createClass(BackboneServiceFactory, [{
        key: 'getBackbone',
        value: function getBackbone() {
            return this.Backbone;
        }
    }, {
        key: 'setBackbone',
        value: function setBackbone(Backbone) {
            this.Backbone = Backbone;
        }
    }, {
        key: 'getSubClass',
        value: function getSubClass(className) {
            try {
                return this.getBackbone()[className];
            } catch (e) {
                return false;
            }
        }

        /*makeClass( SuperClass, classProps ) {
         if( typeof SuperClass === 'string' ) {
         SuperClass = this.container.getClassByName( SuperClass ) || this.getSubClass( SuperClass );
         }
          return SuperClass.extend( classProps );
         }*/

    }, {
        key: 'makeClass',
        value: function makeClass() {}
    }, {
        key: 'makeInstance',
        value: function makeInstance(SuperClass) {
            var classProps = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
            var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

            if (typeof SuperClass === 'undefined' ? 'undefined' : _typeof(SuperClass)) return new this.makeClass(SuperClass, classProps)(options);
        }
    }]);

    return BackboneServiceFactory;
}();

exports.default = BackboneServiceFactory;