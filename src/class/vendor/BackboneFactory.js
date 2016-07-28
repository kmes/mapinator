import Backbone from 'Backbone';

class BackboneClassesContainer extends Backbone.Collection {

    getClassByName( className ) {
        return this.find( ( singleClass ) => singleClass.name == className );
    }
}

export default class BackboneServiceFactory {
    constructor( classList, BackboneClassRef ) {
        this.setBackbone( BackboneClassRef || Backbone );

        this.container = new BackboneClassesContainer();
        if( Array.isArray( classList ) ) {
            this.container.set( classList );
        }
    }

    getBackbone() {
        return this.Backbone;
    }
    setBackbone( Backbone ) {
        this.Backbone = Backbone;
    }
    getSubClass( className ) {
        try {
            return this.getBackbone()[ className ];
        }
        catch( e ) {
            return false;
        }
    }

    /*makeClass( SuperClass, classProps ) {
     if( typeof SuperClass === 'string' ) {
     SuperClass = this.container.getClassByName( SuperClass ) || this.getSubClass( SuperClass );
     }

     return SuperClass.extend( classProps );
     }*/

    makeClass(  ) {

    }

    makeInstance( SuperClass, classProps = {}, options = {} ) {
        if( typeof SuperClass )
        return new this.makeClass( SuperClass, classProps )( options );
    }
}