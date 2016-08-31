import { Collection } from 'backbone';

import backboneFactory from '../vendor/backboneFactory';

const storeCollection =  {
    /*initialize: function( options, classProps ) {
        console.log('initialize', arguments);
    },*/

    fetchStores: function( {lat, lng}, callback = () => {} ) {
        return this.fetch({
            data: {
                lat,
                lng
            },
            success: function( data ) {
                callback( data );
            },
            error: function( error ) {
                callback( false, error );
            }
        });
    }
}

export default backboneFactory( storeCollection, Collection );
