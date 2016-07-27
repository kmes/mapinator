/*
 Dependencies:
 - jQuery
 - Google maps v3
 - MarkerClusterer

 */
import jQuery from 'jquery';

var $ = jQuery;

function EasyMaps( properties ) {
    var that = this;

    var config = properties || {};
    if( !config.center ) {
        config.center = {
            lat: 0,
            lng: 0
        };
    }

    if( !config.center.lat ) {
        config.center.lat = 0;
    }
    if( !config.center.lng ) {
        config.center.lng = 0;
    }

    that.mapObj = null;
    that.domElem = null;
    that.center = null;
    that.zoom = 8;

    that.bounds = null;

    that.eventListener = {
        onLoaded: function() {}
    };

    for( var evt in that.eventListener ) {
        if( config[ evt ] ) {
            that.addEventListener( evt, config[ evt ] );
        }
    }

    that.mapSettings = config.mapSettings || {
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
    if( !that.mapSettings.mapTypeId ) {
        that.mapSettings.mapTypeId = google.maps.MapTypeId.ROADMAP;
    }

    if( config.noControls ) {

        that.mapSettings['mapTypeControl'] = false;
        that.mapSettings['navigationControl'] = false;
        that.mapSettings['scrollwheel'] = false;
        that.mapSettings['streetViewControl'] = false;

        that.mapSettings['panControl'] = false;
        that.mapSettings['zoomControl'] = false;
        that.mapSettings['mapTypeControl'] = false;
        that.mapSettings['scaleControl'] = false;
        that.mapSettings['streetViewControl'] = false;
        that.mapSettings['overviewMapControl'] = false;

        that.mapSettings['disableDoubleClickZoom'] = true;
        that.mapSettings['draggable'] = false;

    }

    if( config.controls ) {

        if( typeof config.controls === 'object' ) {
            for( var name in config.controls ) {
                that.mapSettings[ name ] = config.controls[ name ];
            }
        }

    }

    that.markerSettings = {
        w: 32,
        h: 32,
        unit: 'px'
    };
    that.infoWindowSettings = {
        maxW: 400,
        maxH: 500,
        unit: 'px'
    };

    that.markerList = [];
    that.markerObjList = [];

    that.infoWindowObjList = [];

    that.clusterList = [];
    that.clusterObjList = [];
    that.clusterGridRule = {};
    for(var i=1; i<=22; i++) {
        that.clusterGridRule[ i ] = i * 2;
    }

    that.circleList = [];
    that.circleObjList = [];

    if( !config.elem && !config.map ) return;

    that.resetBounds();

    if( config.elem ) that.setDomElem( config.elem, false );
    that.setCenter( config.center.lat, config.center.lng, false );
    that.setZoom( config.zoom, false );

    that.initMap( config.map );
};

EasyMaps.prototype.addEventListener = function( event, fnHandler ) {
    var that = this;

    if( that.eventListener[ event ] && typeof fnHandler === 'function' ) {
        that.eventListener[ event ] = fnHandler;
        return true;
    }
    else {
        return false;
    }

};

EasyMaps.prototype.onLoaded = function( fnHandler ) {
    var that = this;

    var eventName = 'onLoaded';

    return that.addEventListener( eventName, fnHandler );

};

EasyMaps.prototype.resetBounds = function() {
    var that = this;

    that.bounds = new google.maps.LatLngBounds();

    return that.bounds;
};

EasyMaps.prototype.setDomElem = function( elem ) {

    return this.domElem = document.querySelector( elem );
};

EasyMaps.prototype.getCenter = function() {
    var that = this;

    return that.center;
};
EasyMaps.prototype.setCenter = function( lat, lng, render ) {
    var that = this;
    render = typeof render !== 'undefined' ? render : true;
    that.center = {
        lat: parseFloat( lat ),
        lng: parseFloat( lng )
    };

    if( render ) {
        //set center on map
        that.mapObj.setCenter( new google.maps.LatLng( that.center.lat, that.center.lng ) );
        return that.mapObj;
    }
    else {
        return that.center;
    }

};
EasyMaps.prototype.getZoom = function() {
    var that = this;

    return that.mapObj.getZoom();
};
EasyMaps.prototype.setZoom = function( zoomNumb, render ) {
    if( !zoomNumb ) return false;
    var that = this;
    render = typeof render !== 'undefined' ? render : true;
    that.zoom = parseInt( zoomNumb );

    if( render ) {
        //set zoom on map
        that.mapObj.setZoom( that.zoom );
        return that.mapObj;
    }
    else {
        return that.zoom;
    }
};
EasyMaps.prototype.fitCenterZoomToMarkers = function( render ) {
    var that = this;
    render = typeof render !== 'undefined' ? render : true;

    var area = null;

    var markers = that.markerObjList;
    for( var n in markers ) {
        var pos = markers[ n ].getPosition();
        var lat = pos.lat();
        var lng = pos.lng();

        if( !area ) {
            area = {
                'x1': lat,
                'x2': lat,
                'y1': lng,
                'y2': lng
            };
        }

        area['x1'] = lat < area['x1'] ? lat : area['x1'];
        area['x2'] = lat > area['x2'] ? lat : area['x2'];
        area['y1'] = lng < area['y1'] ? lng : area['y1'];
        area['y2'] = lng > area['y2'] ? lng : area['y2'];
    }

    if( !area ) {
        area = {
            'x1': that.center.lat,
            'x2': that.center.lat,
            'y1': that.center.lng,
            'y2': that.center.lng
        };
    }

    that.resetBounds();

    that.bounds.extend( new google.maps.LatLng( area['x1'], area['y1'] ) );
    //that.bounds.extend( new google.maps.LatLng( area['x2'], area['y1'] ) );
    //that.bounds.extend( new google.maps.LatLng( area['x1'], area['y2'] ) );
    that.bounds.extend( new google.maps.LatLng( area['x2'], area['y2'] ) );


    var oldCenter 	= that.center;
    var oldZoom 	= that.zoom;

    that.mapObj.fitBounds( that.bounds );

    var actualCenter = that.mapObj.getCenter();
    var newCenter = {
        'lat': actualCenter.k,
        'lng': actualCenter.B
    };
    var newZoom = that.mapObj.getZoom();

    if( render ) {
        that.center = newCenter;
        that.zoom = newZoom;
    }
    else {
        that.setCenter( oldCenter );
        that.setZoom( oldZoom );
    }
};
EasyMaps.prototype.initMap = function( map ) {
    var that = this;

    var options = that.mapSettings;

    options['center'] 	= new google.maps.LatLng( that.center.lat, that.center.lng );
    options['zoom'] 	= that.zoom;

    /*var options = {
     zoom: that.zoom,
     center: new google.maps.LatLng( that.center.lat, that.center.lng ),
     mapTypeId: google.maps.MapTypeId.ROADMAP
     };*/

    that.mapObj = map || new google.maps.Map( that.domElem, options );

    google.maps.event.addListenerOnce( that.mapObj, 'idle', function() {
        that.eventListener['onLoaded']();
    });

    return that.mapObj;
};


EasyMaps.prototype.addMarker = function( markerData, render, clusterData, callback ) {
    var that = this;

    if( !callback ) callback = function() {};

    render = typeof render !== "undefined" ? render : true;
    var markerList = typeof markerData.length !== 'undefined' ? markerData : [ markerData ];
    //var markerList = markerData[0] ? markerData : [ markerData ];

    //options - OK
    //icon - OK
    //info window - OK
    //cluster

    /*	google.maps.event.addDomListener( that.mapObj, 'bounds_changed', function() {
     //google.maps.event.clearListeners( that.mapObj, 'idle');
     console.log('idle');
     callback();
     });*/


    google.maps.event.addDomListener( that.mapObj, 'idle', function() {
        clearTimeout( that.markerTimer );
        that.markerTimer = setTimeout(function() {
            google.maps.event.clearListeners( that.mapObj, 'idle');

            setTimeout(function() {
                callback();
            }, 400);

        }, 400);
    });

    var markerGroup = [];

    for( var n in markerList ) {
        that.markerList.push( markerList[ n ] );
        var pos = {
            lat: parseFloat( markerList[ n ]['position']['lat'] ),
            lng: parseFloat( markerList[ n ]['position']['lng'] )
        };
        var posObj = new google.maps.LatLng( pos.lat, pos.lng );
        var markerConf = {
            position: posObj,
            map: that.mapObj
        };


        if( markerList[ n ]['icon'] ) {
            var iconData = markerList[ n ]['icon'];
            if( iconData['path'] ) {
                markerConf['icon'] = {
                    //anchor: new google.maps.Point( -16, -16 ),
                    scaledSize: new google.maps.Size(
                        iconData['w'] || that.markerSettings.w,
                        iconData['h'] || that.markerSettings.h,
                        iconData['unit'] || that.markerSettings.unit,
                        iconData['unit'] || that.markerSettings.unit
                    ),
                    url: iconData['path']
                };
            }
            if( iconData['shadow'] ) {
                markerConf['shadow'] = iconData['shadow'];
            }
            if( iconData['flat'] ) {
                markerConf['flat'] = !!iconData['flat'];
            }
        }

        if( markerList[ n ]['title'] ) {
            markerConf['title'] = markerList[ n ]['title'];
        }
        var marker = new google.maps.Marker( markerConf );

        that.markerObjList.push( marker );

        markerGroup.push( marker );

        /*(function( marker ) {
         google.maps.event.addListener( marker, 'mouseover', function(e) {
         var zIndex = marker.getZIndex();
         marker.setZIndex( zIndex+10000 );
         });
         google.maps.event.addListener( marker, 'mouseout', function(e) {
         var zIndex = marker.getZIndex();
         marker.setZIndex( zIndex-10000 );
         });
         })( marker );*/

        if( markerList[ n ]['infoWindow'] ) {
            var infoWindowData = markerList[ n ]['infoWindow'];

            var openHandler = infoWindowData['open'] || function() {};

            var infoWindowConf = {
                content: infoWindowData['content']
            };
            var infoWindow = new google.maps.InfoWindow( infoWindowConf );
            that.infoWindowObjList.push( infoWindow );

            (function( marker, infoWindow, openHandler ) {
                google.maps.event.addListener( marker, 'click', function() {

                    that.closeAllInfoWindow();

                    infoWindow.open( that.mapObj, marker );
                    openHandler( infoWindow, marker );
                    /*google.maps.event.addListener( marker, 'mouseout', function() {
                     infoWindow.close();
                     google.maps.event.clearListeners( marker, 'mouseout' );
                     });
                     google.maps.event.addListener( marker, 'click', function() {
                     google.maps.event.clearListeners( marker, 'mouseout' );
                     });*/
                });

            })( marker, infoWindow, openHandler );
        }

    }

    if( clusterData ) {
        that.addCluster( markerGroup, clusterData );
    }



};

EasyMaps.prototype.closeAllInfoWindow = function() {
    var that = this;

    for( var n in that.infoWindowObjList ) {
        var infoWindow = that.infoWindowObjList[ n ];
        infoWindow.close();
    }
};

EasyMaps.prototype.addCluster = function( markerGroup, conf ) {
    var that = this;

    conf = conf || {};

    var clusterConf = {
        maxZoom: conf.maxZoom || 18,
        gridSize: conf.size || 10
    };

    if( conf.icon ) {
        clusterConf['styles'] = [{
            url: 		conf.icon,
            width: 		conf.width || 50,
            height: 	conf.height || 50,
            anchor: 	conf.anchor || [3, 0],
            textSize: 	conf.textSize || 10,
            textColor:	conf.textColor || '#000'
        }];
    }

    var cluster = new MarkerClusterer( that.mapObj, markerGroup, clusterConf );

    var clusterData = {
        'conf': clusterConf,
        'markerGroup': markerGroup,
        //'gridRule': conf.gridRule || that.clusterGridRule
    };

    that.clusterList.push( clusterData );
    that.clusterObjList.push( cluster );

    /*(function( cluster, clusterData ) {
     google.maps.event.addListener( that.mapObj, 'zoom_changed', function() {
     var gridZoomMatch = clusterData.gridRule;

     var zoom = that.mapObj.getZoom();

     for( var maxZoom in gridZoomMatch ) {
     if( zoom <= maxZoom ) {
     zoom = maxZoom;
     }
     }
     var gridSize = gridZoomMatch[ zoom ] || false;
     if( gridSize ) {
     cluster.setGridSize( gridSize );
     cluster.resetViewport();
     }
     console.log( 'actualGridSize: ' + cluster.getGridSize() );
     });
     })( cluster, clusterData );*/
};

EasyMaps.prototype.removeAllCluster = function( render ) {
    var that = this;

    render = typeof render !== "undefined" ? render : true;

    that.clusterList = [];
    if( render ) {
        for (var n in that.clusterObjList) {
            //that.clusterObjList[ n ].setMap( null );
        }
        that.clusterObjList = [];
    }
};

EasyMaps.prototype.removeAllMarker = function( render ) {
    var that = this;

    render = typeof render !== "undefined" ? render : true;

    that.markerList = [];
    if( render ) {
        for( var n in that.markerObjList ) {
            that.markerObjList[ n ].setMap( null );
        }
        that.markerObjList = [];

        that.infoWindowObjList = [];
    }

    that.removeAllCluster( render );
};

EasyMaps.prototype.addCircle = function( circleData, render ) {
    var that = this;

    render = typeof render !== "undefined" ? render : true;

    var cirleStyleList = {
        'stroke': '',
        'fill': ''
    };

    var radiusAmp = 1;

    var circleList = typeof circleData.length !== 'undefined' ? circleData : [ circleData ];
    for( var n in circleList ) {
        that.circleList.push( circleList[ n ] );
        var pos = {
            lat: parseFloat( circleList[ n ]['position']['lat'] ),
            lng: parseFloat( circleList[ n ]['position']['lng'] )
        };
        var posObj = new google.maps.LatLng( pos.lat, pos.lng );
        var radius = parseInt( circleList[ n ]['radius'] ) * radiusAmp;

        var circleConf = {
            center: posObj,
            map: that.mapObj,
            radius: radius
        };

        for( var style in cirleStyleList ) {
            if( circleList[ n ][ style ] ) {
                var strokeData = circleList[ n ][ style ];
                for( var type in strokeData  ) {
                    var confName = style+type.substr(0, 1).toUpperCase()+type.substr(1);
                    circleConf[ confName ] = strokeData[ type ];
                }
            }
        }

        var circle = new google.maps.Circle( circleConf );
        that.circleObjList.push( circle );

    }

};

EasyMaps.prototype.removeAllCircle = function( render ) {
    var that = this;

    render = typeof render !== "undefined" ? render : true;

    that.circleList = [];
    if( render ) {
        for( var n in that.circleObjList ) {
            that.circleObjList[ n ].setMap( null );
        }
        that.circleObjList = [];
    }
};

EasyMaps.prototype.autocomplete = function( domElement, fnCallback ) {
    var that = this;

    if( !domElement ) {
        domElement = this;
    }
    else if( typeof domElement === 'function' ) {
        fnCallback = domElement;
        domElement = this;
    }
    else {
        fnCallback = fnCallback || function() {};
    }

    var pacContainer = '.pac-container';

    var fnFinal = function( place, el ) {
        //$( pacContainer ).remove();
        fnCallback( place, el );
    };

    //var defaultCenter = 'Italia';

    var $inputList = $( domElement );
    $inputList.each(function(i, el) {
        (function(el) {
            var inputCenter = el;

            var autocomplete = new google.maps.places.Autocomplete( inputCenter, {
                types: ["geocode"],
                componentRestrictions: {country: 'it'}
            });

            var setPacItem;

            $(el).click(function(e) {

                setTimeout(function() {
                    $(e.target).select();
                    autocomplete.pacContainer = autocomplete.pacContainer || $( pacContainer ).filter(':visible');

                }, 200);

                var isChanged = false;

                $(el).unbind('keypress blur').bind('keypress blur', function(e) {
                    var $this = $( this );

                    if( e.type == 'blur' ) {
                        if( !isChanged ) {
                            return true;
                        }
                        isChanged = false;
                    }
                    else {
                        isChanged = true;
                    }

                    var $pacContainer 	= autocomplete.pacContainer;
                    var $pacItem 		= $pacContainer.find(".pac-item");
                    var $firstMatch 	= $pacItem.filter(':first');

                    //console.log( $firstMatch.length );

                    var pacItemSelected = 'pac-item-selected';

                    setTimeout(function() {
                        $pacItem.removeClass( pacItemSelected );
                        $firstMatch.addClass( pacItemSelected );
                    }, 400);

                    if (e.which == 13 || e.type == 'blur') {
                        //google.maps.event.clearListeners( autocomplete, 'place_changed' );

                        var delay = e.type == 'blur' ? 400 : 400;

                        setPacItem = setTimeout(function() {

                            //$firstMatch = $pacItem.filter('.'+pacItemSelected).length ? $pacItem.filter('.'+pacItemSelected) : $firstMatch;
                            var allText = $firstMatch.text();
                            var lastText = $firstMatch.children('span:last').text();
                            var firstResult = allText.replace( lastText, ', '+lastText );

                            $this.val( firstResult );
                            $this.attr('value', firstResult );

                            if( e.type != 'blur' ) {
                                //$this.blur();
                            }

                            var t = setInterval(function() {
                                if( $this.val() != firstResult ) {
                                    $this.val( firstResult );
                                    clearInterval( t );
                                }
                            }, 200);

                            var geocoder = new google.maps.Geocoder();
                            geocoder.geocode({"address":firstResult }, function( results, status ) {
                                var place = false;

                                if ( status == google.maps.GeocoderStatus.OK ) {
                                    place = results[0];

                                    //$firstMatch.addClass( pacItemSelected );
                                    $pacContainer.css("display", "none");
                                }
                                //console.log('geocode');
                                fnFinal( place, el );
                            });

                        }, delay);

                    }
                });

            });

            google.maps.event.addListener( autocomplete, 'place_changed', function() {
                var place = autocomplete.getPlace();
                //console.log( place );
                if( place.geometry && place.geometry.location ) {
                    $(el).unbind('keypress blur');
                    clearInterval( setPacItem );
                    //console.log('listener');
                    fnFinal( place, el );
                }
            });

        })(el);
    });


};

$(function() {
    jQuery.fn.easyAutocomplete = EasyMaps.prototype.autocomplete;
});


function PlacesEngine() {
    this.predicted = [];
    this.predictionError = false;
}

PlacesEngine.prototype.predictionComplete = function(predictions, status) {
    this.predictionError = status != google.maps.places.PlacesServiceStatus.OK;
    if( this.predictionError ) return false;

    this.predicted = predictions;

    return this.predicted;
};


PlacesEngine.prototype.prediction = function( text, fnCallback ) {
    var self = this;
    fnCallback = fnCallback || function() {};

    var service = new google.maps.places.AutocompleteService();
    service.getQueryPredictions({ input: text }, function(predictions, status) {
        var result = self.predictionComplete(predictions, status);
        fnCallback( result );
    });
};

export default EasyMaps;