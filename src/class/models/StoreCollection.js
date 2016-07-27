import { Collection } from 'backbone';

export default class StoreCollection extends Collection {
    constructor({ url, parseResponse }) {
        super({
            url,
            parse: parseResponse
        });
    }

    fetchStores( location, callback = () => {} ) {
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
}