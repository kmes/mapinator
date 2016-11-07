export default class PlacesAdapter {
    constructor( autocompletionRequest = {} ) {
        this.placeService = new google.maps.places.AutocompleteService();
        this.geocoder = new google.maps.Geocoder();

        this.defaultAutocompletionRequest = {
            input: 'italy',
            types: ['geocode'],
            componentRestrictions: {
                country: 'it'
            }
        };

        this.setAutocompletionRequest( autocompletionRequest );
    }

    setAutocompletionRequest( autocompletionRequest = {} ) {
        var defaultAutocompletionRequest = this.defaultAutocompletionRequest;

        return this.autocompletionRequest = {
            ...defaultAutocompletionRequest,
            ...autocompletionRequest
        };
    }
    getAutocompletionRequest( query = null ) {
        if( query ) {
            this.autocompletionRequest.query = query;
        }

        return this.autocompletionRequest;
    }

    search( query, callback = () => {} ) {
        this.placeService.getPlacePredictions(
            this.getAutocompletionRequest( query ),
            function( suggestions, status ) {
                //console.log('suggestions', suggestions);

                callback( suggestions, status );
            }
        );
    }

    fetchPlaceByLatLng( options, callback = () => {}) {
        this.geocoder.geocode( options, function( results, status ) {
            if( status !== 'OK' || !results.length ) {
                callback( false );
                return false;
            }

            callback( results.shift() );
        });
    }
}