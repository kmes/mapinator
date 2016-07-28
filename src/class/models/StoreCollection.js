import { Collection } from 'backbone';

import backboneExtend from '../vendor/backboneExtendDecorator';

export default @backboneExtend( Collection, {
/*    constructor( options, classProps ) {

    }*/

    initialize: function( options, classProps ) {
        console.log('initialize', arguments);
    },

    fetchStores: function( location, callback = () => {} ) {
        return this.fetch({
            data: {
                lat: location.lat,
                lng: location.lng
            },
            success: function( data ) {
                callback( data );
            },
            error: function( error ) {
                callback( false, error );
            }
        });
    }

})
