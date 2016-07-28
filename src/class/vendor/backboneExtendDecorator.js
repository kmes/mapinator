export default function( BackboneClass, proto ) {
    return function( TargetClass, key, descriptor ) {

        /*TargetClass = function( options, classProps ) {
            var NewClass = BackboneClass.extend( Object.assign( proto, classProps ) );
            TargetClass.prototype = NewClass.prototype;
            NewClass.call(this, options);
        };*/

        console.log('TargetClass', TargetClass);

    };
}