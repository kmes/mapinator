import Bloodhound from "typeahead.js/dist/bloodhound";

export default class PlacesBloodhoundEngine extends Bloodhound {
    constructor( options = {} ) {
        super({
            ...options,
            datumTokenizer: (obj) => Bloodhound.tokenizers.whitespace(obj.description),
            queryTokenizer: ( query ) => {
                this.onSearch( query );

                return Bloodhound.tokenizers.whitespace( query );
            },
            identify: (obj) => obj.id
        });

        this.setServiceAdapter( options.serviceAdapter );
    }
    onSearch( query, callback = () => {} ) {
        var self = this;

        this.getServiceAdapter().search( query, function( suggestions, status ) {
            self.add( suggestions );

            callback( suggestions );
        });

    }

    setServiceAdapter( serviceAdapter ) {
        return this.serviceAdapter = serviceAdapter;
    }
    getServiceAdapter() {
        return this.serviceAdapter || null;
    }

}