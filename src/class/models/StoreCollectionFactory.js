//import Backbone from 'backbone';

import backboneFactory from '../vendor/backboneFactory';

const storeCollection =  {
    /*initialize: function( options, classProps ) {
        console.log('initialize', arguments);
    },*/

    fetchStores: function( options = {}, callback = () => {} ) {
        return this.fetch({
            ...options,

            success: function( data ) {
                callback( data );
            },
            error: function( error ) {
                callback( false, error );
            }
        });
    }
}

export default backboneFactory( storeCollection, Backbone.Collection );
