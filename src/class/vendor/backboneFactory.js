import backboneClassFactory from './backboneClassFactory';

function backboneFactory( customObj, BackboneClass ) {

    return ( classProps = {}, ...args ) =>
        new (BackboneClass.extend( Object.assign({}, customObj, classProps) ))( ...args )

    /*return ( classProps = {}, ...args ) =>
        new (backboneClassFactory( customObj, BackboneClass ))( ...args )*/

}

export default backboneFactory;