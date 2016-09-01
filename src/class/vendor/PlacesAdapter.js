export default class PlacesAdapter {
    constructor() {
        this.placeService = new google.maps.places.AutocompleteService();
        this.geocoder = new google.maps.Geocoder();
    }

    search( query, callback = () => {} ) {
        this.placeService.getPlacePredictions(
            {
                input: query,
                types: ['geocode'],
                componentRestrictions: {
                    country: 'it'
                }
            },
            function( suggestions, status ) {
                //console.log('suggestions', suggestions);

                callback( suggestions, status );
            }
        );
    }

    fetchLatLng( options, callback = () => {}) {
        this.geocoder.geocode( options, function( results, status ) {
            if( status !== 'OK' || !results.length ) {
                callback( false );
                return false;
            }

            callback( results.shift() );
        });
    }
}