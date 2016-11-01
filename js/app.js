var locations = [
    {
        name : 'Top golf',
        lat:39.052506,
        lon:-77.446969
    },
    {
        name : 'Alamo Drafthouse',
        lat:39.051936,
        lon:-77.455113
    },
    {
        name : 'Fords Fish Shack',
        lat:39.020500,
        lon:-77.470270
    },
    {
        name : 'Nandos Peri-Peri',
        lat:39.052550,
        lon:-77.454252
    },
    {
        name : 'Passion Fin',
        lat:39.043247,
        lon:-77.522372
    }

];


var locationObj = function(data) {
    var self = this;
    this.name = data.name;
    this.lat = data.lat;
    this.lon = data.lon;
    this.street = "";
    this.city = "";
    this.visible = ko.observable(true);

    var fourSquareClientID= "PENG4VW3LZTMJB00Q5MD3ZVARKZDVJFK314TI4AZEJ1FYVUV";
    var fourSquareClientSecret= "PZMBYYJRGGVIZNZOWIIEBFQ0ZSUSUIJUGNW4XKFFEEMMRC11";

    var url = 'https://api.foursquare.com/v2/venues/search?ll='+ this.lat + ',' + this.lon + '&client_id=' + fourSquareClientID + '&client_secret=' + fourSquareClientSecret + '&v=20160118' + '&query=' + this.name;

    $.getJSON(url).done(function(data) {
        var results = data.response.venues[0];
        self.street = results.location.formattedAddress[0];
        self.city = results.location.formattedAddress[1];
        }).fail(function() {
        alert("Unable to load Foursquare API");
    });

    this.marker = new google.maps.Marker({
            position: new google.maps.LatLng(data.lat, data.lon),
            map: map,
            title: self.name
    });

    this.showMarker = ko.computed(function() {
        if(self.visible() === true) {
            self.marker.setMap(map);
        } else {
            self.marker.setMap(null);
        }
        return true;
    }, self);

    this.infoContent = '<div class="title"><b>' + self.name + "</b></div>" +
        '<div>' + self.street + "</div>" +
        '<div>' + self.city + "</div>";

    this.infoWindow = new google.maps.InfoWindow({content: self.infoContent});

    this.marker.addListener('click', function(){
        self.infoContent = '<div class="title"><b>' + self.name + "</b></div>" +
        '<div>' + self.street + "</div>" +
        '<div>' + self.city + "</div>";

        self.infoWindow.setContent(self.infoContent);

        self.infoWindow.open(map,this);

        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            self.marker.setAnimation(null);
        }, 750);
    });

    this.bounce = function(place) {
        google.maps.event.trigger(self.marker, 'click');
    };
};

var map;

var ViewModel=function() {
    var self = this;
    this.locationList = ko.observableArray([]);

    map = new google.maps.Map(document.getElementById('map'), {
            zoom: 13,
            center: {lat: 39.050, lng: -77.486}
    });


    locations.forEach(function(locationItem){
        self.locationList.push( new locationObj(locationItem));
    });
    this.searchTerm = ko.observable("");
    this.filteredList = ko.computed( function() {
        var filter = self.searchTerm().toLowerCase();
        if (!filter) {
            self.locationList().forEach(function(locationItem){
                locationItem.visible(true);
            });
            return self.locationList();
        } else {
            return ko.utils.arrayFilter(self.locationList(), function(locationItem) {
                var string = locationItem.name.toLowerCase();
                var result = (string.search(filter) >= 0);
                locationItem.visible(result);
                return result;
            });
        }
    }, self);

    this.mapElement = document.getElementById('map');
    this.mapElement.style.height = window.innerHeight - 50;
}

var init=function() {
    ko.applyBindings(new ViewModel());
}

function googleErrorHandling() {
    console.log("Failed to load Google Maps");
}