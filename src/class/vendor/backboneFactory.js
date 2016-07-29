function backboneFactory( customObj, BackboneClass ) {
    /*console.log( 'customObj', customObj );

    return function( classProps = {}, ...args ) {
        var proto = Object.assign({}, customObj, classProps);

        console.log('proto', proto);

        var NewClass = BackboneClass.extend( proto );

        console.log('NewClass', NewClass);

        return new NewClass( ...args );
    };*/

    return ( classProps = {}, ...args ) =>
        new (BackboneClass.extend( Object.assign({}, customObj, classProps) ))( ...args )
}

export default backboneFactory;