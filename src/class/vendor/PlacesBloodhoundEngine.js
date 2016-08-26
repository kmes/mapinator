import { Bloodhound } from "typeahead.js-browserify";

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

        this.setPlaceService( options.placeService );
    }
    onSearch( query, callback = () => {} ) {
        var self = this;

        this.searchPlace( query, function( suggestions, status ) {
            self.add( suggestions );

            //console.log('sug added', suggestions);

            callback( suggestions );
        });
    }
    setPlaceService( placeService) {
        return this.placeService = placeService;
    }
    getPlaceService() {
        return this.placeService || null;
    }
    searchPlace( query, callback = () => {} ) {
        var self = this;

        let placeService = this.getPlaceService();
        if( !placeService ) {
            callback( false );
            return false;
        }

        placeService.getPlacePredictions(
            {
                input: query,
                types: ['geocode'],
                componentRestrictions: {
                    country: 'it'
                }
            },
            function( suggestions, status ) {
                console.log('suggestions', suggestions);

                callback( suggestions, status );
            }
        );
    }
}