//import Backbone from 'backbone';

import backboneFactory from '../vendor/backboneFactory';


const storeModel = {
    /*initialize: function( options, classProps ) {
     console.log('initialize', arguments);
     }*/
};

export default backboneFactory( storeModel, Backbone.Model );