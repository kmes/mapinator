function backboneClassFactory( customObj, BackboneClass ) {

    return ( classProps = {}, ...args ) =>
        BackboneClass.extend( Object.assign({}, customObj, classProps) )
}

export default backboneClassFactory;