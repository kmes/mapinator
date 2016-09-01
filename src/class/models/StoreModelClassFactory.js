import Backbone from 'backbone';

import backboneClassFactory from '../vendor/backboneClassFactory';


const storeModel = {
    /*initialize: function( options, classProps ) {
     console.log('initialize', arguments);
     }*/
};

export default backboneClassFactory( storeModel, Backbone.Model );