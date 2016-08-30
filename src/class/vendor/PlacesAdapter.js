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
    /*search( query, callback = () => {} ) {
        this.geocoder.geocode(
            {
                address: query,
                componentRestrictions: {
                    country: 'it'
                }
            },
            function( results, status ) {
                if( status !== 'OK' || !results.length ) {
                    callback( false );
                    return false;
                }

                var normalizedResults = results.map(function( result ) {
                    return {
                        ...result,
                        id: result['place_id'],
                        description: result['formatted_address'],
                        lat: result.geometry.location.lat(),
                        lng: result.geometry.location.lng()
                    };
                });

                callback( normalizedResults );
            }
        );
    }*/


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