
// Bart info
var BART_URL = "http://api.bart.gov/api/stn.aspx?cmd=stns&";
var BART_KEY = "ZI4M-5RS8-9TDT-DWE9";

// Foursquare info
var FS_URL = "https://api.foursquare.com/v2/venues/explore?"
var FS_CLIENT_ID = "RL4AI1OIKF5CVKPU12OWLL5YWSJ3SSIYZWP4FK2OQZKW0WRF";
var FS_CLIENT_SECRET = "EY4KIAQLBVI0QSZCIZCP35YREJ5WWWPR553EIQOMPF4ZZRSK";
var FS_LIMIT = 5;
var FS_VERSION = "20161101";


var YELLOW_MARKER = "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
var GREEN_MARKER = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
var DELAY_DROP_MS = 75;
var SHOW_ALL = "SHOW ALL";
var SHOW_FAVS_ONLY = "SHOW FAVS ONLY";

var map;
var markers = [];
var oRefStationListVM = null;


// Ensure the local storage variables are initialized correctly.
localStorage.searchTerm = localStorage.searchTerm || "";
localStorage.favorites = localStorage.favorites || "";
localStorage.showMode = localStorage.showMode || SHOW_ALL;

/**
 *
 * Method to load map.
 *
 */
function initMap() {
    var center = {lat: 37.792295, lng: -122.052747};
    map = new google.maps.Map(document.getElementById('map'), {
        center: center,
        zoom: 10
    });

    loadStations();
};

/**
 *
 * Method to compare two strings.
 *
 */
function compareStrings(sKey, sSubKey) {
    return sKey.toLowerCase().includes(sSubKey.toLowerCase());
};

/**
 *
 * Method to generate the HTML content of the marker.
 *
 */ 
function generateHtmlContent(oItem, aVenues) {
    var htmlContent = "<span class='station-title'>" + oItem.name + " Station</span><BR>";
    htmlContent += oItem.address + "<BR>";
    htmlContent += oItem.city + ", " + oItem.state + " " + oItem.zip + "<BR><BR>";
    htmlContent += "<span class='rec-venue-header'>Top 5 Recommended Places (within 1000 meters):</span><BR>";
    var nVenues = aVenues.length;
    if (nVenues === 0) {
        htmlContent += "Still loading ...";
    } else {
        htmlContent += "<table class='venues-table'>";
        for (var i = 0; i < nVenues; i++) {
            var oVenue = aVenues[i];

            htmlContent += "<tr>";
            htmlContent += "<td colspan='3' class='venues-title'>" + oVenue.name + "</td>";
            htmlContent += "</tr>";

            htmlContent += "<tr>";
            htmlContent += "<td>";
            if (oVenue.address !== undefined) {
                htmlContent += oVenue.address;
            } else {
                htmlContent += "<i>No address available</i>";
            }
            htmlContent += "</td>"
            
            htmlContent += "<td>";
            if (oVenue.phone !== undefined) {
                htmlContent += oVenue.phone;
            } else {
                htmlContent += "<i>No phone available</i>";
            }
            htmlContent += "</td>";
            
            htmlContent += "<td>";
            if (oVenue.url !== undefined) {
                htmlContent += "<a href='" + oVenue.url + "' target='_blank'>website</a>";
            } else {
                htmlContent += "<i>No website available</i>";
            }
            htmlContent += "</td>";
            htmlContent += "</tr>";
        }
        htmlContent += "</table>";
    }
    return htmlContent;
};

/**
 *
 * Method to load bart stations.
 *
 */
function loadStations() {    
    var bartURL = BART_URL + "&key=" + BART_KEY;
    

    var aStationList = [];
    $.ajax({
        url: bartURL,
        dataType: "xml",
        success: function (response) {
            var station = $(response).find("station");
            var stationIndex = 0;

            // Process each bart station
            $(station).each(function () {
                var oStation = {};
                oStation.name = $(this).find("name").text();
                oStation.lat = $(this).find("gtfs_latitude").text();
                oStation.long = $(this).find("gtfs_longitude").text();
                oStation.address = $(this).find("address").text();
                oStation.city = $(this).find("city").text();
                oStation.county = $(this).find("county").text(); 
                oStation.state = $(this).find("state").text(); 
                oStation.zip = $(this).find("zipcode").text();
                oStation.index = stationIndex++;

                var oStationItem = new StationItemViewModel(oStation); 
                aStationList.push(oStationItem);

                // Get more info from foursquare for each bart station
                var fsURL = FS_URL;
                fsURL += "ll=" + oStation.lat + "," + oStation.long;
                fsURL += "&limit=" + FS_LIMIT;
                fsURL += "&radius=1000";
                fsURL += "&section=topPicks";
                fsURL += "&client_id=" + FS_CLIENT_ID;
                fsURL += "&client_secret=" + FS_CLIENT_SECRET;
                fsURL += "&v=" + FS_VERSION;
                
                $.ajax({
                    url: fsURL,
                    success: function (response) {
                        var oGroup = response.response.groups[0];
                        var nItems = oGroup.items.length;
                        var nVenues = [];
                        for (var i = 0; i < nItems; i++) {
                            var oItemVenue = oGroup.items[i].venue;
                            var oVenue = {};
                            oVenue.name = oItemVenue.name;
                            oVenue.category = oItemVenue.categories[0].name;
                            oVenue.address = oItemVenue.location.address;
                            oVenue.phone = oItemVenue.contact.formattedPhone;
                            oVenue.lat = oItemVenue.location.lat;
                            oVenue.lng = oItemVenue.location.lng;
                            oVenue.url = oItemVenue.url;
                            nVenues.push(oVenue);
                        }
                        oStationItem.recVenues(nVenues);

                        // Check if station item has been tagged as favorite.
                        var sKey = "#" + oStationItem.name;
                        var sFavorites = localStorage.favorites;
                        if (compareStrings(sFavorites, sKey)) {
                            oStationItem.markAsFavorite();
                        }
                    },
                    error: function(xhr, status, error) {
                        console.log("Error encountered fetching data for each station:" + xhr.status);
                    }
                });
            });
        },
        complete: function() {
            var oStationListVM = new StationListViewModel(aStationList);
            // Save a reference to oStationListVM
            oRefStationListVM = oStationListVM;

            ko.applyBindings(oStationListVM);

            // Update search value in the search bar if there's any saved values in the localStorage.
            if (localStorage.searchTerm !== "") {
                 oStationListVM.searchTerm(localStorage.searchTerm);
            }
            
        },
        error: function(xhr, status, error) {
            console.log("Error encountered fetching stations:" + xhr.status);
        }
    });
};

/**
 *
 * View Model used for each station.
 *
 */
function StationItemViewModel (oItem) {
    var self = this;
    self.isFavorite = ko.observable(false);
    self.recVenues = ko.observableArray([]);

    self.name = oItem.name;
    self.lat = oItem.lat;
    self.long = oItem.long;
    self.address = oItem.address;
    self.city = oItem.city;
    self.state = oItem.state; 
    self.zip = oItem.zip;
    self.index = oItem.index;

    self.recVenues.subscribe(function (aVenues) {
        var htmlContent = generateHtmlContent(self, aVenues);
        self.marker().htmlContent = htmlContent;
    });

    self.marker = ko.computed(function() {
        // Create marker
        var oPosition = {lat: parseFloat(self.lat), lng: parseFloat(self.long)};
        var htmlContent = generateHtmlContent(self, []);
        var marker = new google.maps.Marker({
            position: oPosition,
            animation: google.maps.Animation.DROP,
            title: self.name,
            htmlContent: htmlContent
        });

        var oInfowindow = new google.maps.InfoWindow();
        marker.addListener('click', function() {
            oInfowindow.setContent(marker.htmlContent);
            oInfowindow.open(map, marker);
        });

        if (compareStrings(self.name, localStorage.searchTerm)) {
            setTimeout(function() {marker.setMap(map)}, self.index * DELAY_DROP_MS);
        } else {
            marker.setMap(null);
        }
        
        return marker;
    });

    self.markAsFavorite = function() {
        self.isFavorite(!self.isFavorite());
        var sKey = "#" + self.name;
        var sFavorites = localStorage.favorites;

        // Not Favorite -> Favorite
        if (self.isFavorite()) {
            // Ensure that a marker is drawn.
            self.marker().setMap(map);
            // Change marker to yellow.
            self.marker().setIcon(YELLOW_MARKER);

            // Add name to favorites, if not there already.
            if (compareStrings(sFavorites, sKey) === false) {
                sFavorites += sKey;    
            }
            localStorage.favorites = sFavorites;

        // Favorite -> Not Favorite
        } else {
            // If we are showing all the markers, turn yellow to red.
            if (localStorage.showMode === SHOW_ALL) {
                self.marker().setIcon(null);
            // Otherwise, change icon to red but don't draw marker.
            } else {
                self.marker().setIcon(null);
                self.removeMarker();
            }
            
            // Remove name from favorites.
            sFavorites = sFavorites.replace(sKey, '');
            localStorage.favorites = sFavorites;
        }
    };

    self.setMap = function (oMap) {
        self.marker().setMap(oMap);
    }

    self.removeMarker = function () {
        self.setMap(null);
    }

    self.addMarker = function () {
        self.setMap(map);
    }

    /**
     * Click listener attached to station item.
     */
    self.clickHandler = function() {
        self.marker().setIcon(GREEN_MARKER);
        self.marker().setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function(){ 
            if (!self.isFavorite()) {
                self.marker().setIcon(null);
            } else {
                self.marker().setIcon(YELLOW_MARKER);
            }
            self.marker().setAnimation(null); 
        }, 
        4000);
    };
};

/**
 *
 * View Model used for Station List and Search Term
 *
 */
function  StationListViewModel (aFullList) {
    var self = this;

    self.searchTerm = ko.observable("");
    self.items = ko.observableArray(aFullList);
    
    self._fulllist = aFullList;
    self._previtems = self.items()

    self.items.subscribe(function (newValue) {
        // Remove marker for current displayed stations
        var nCount = self._previtems.length;
        for (var i = 0; i < nCount; i++) {
            var oItem = self._previtems[i];
            oItem.removeMarker();
        }
        
        // Add marker for searched stations
        nCount = newValue.length;
        for (i = 0; i < nCount; i++) {
            oItem = newValue[i];
            oItem.addMarker();
        }

        self._previtems = newValue;
    });

    self.searchTerm.subscribe(function (newValue) {
        var aNewList = [];
        for (var i = 0; i < self._fulllist.length; i++) {
            var oItem = aFullList[i];
            if (compareStrings(oItem.name, self.searchTerm())) {
                aNewList.push(oItem)
            }
        }
        self.items(aNewList);
    });

    /**
     * Listener attached to the "Filter" button.
     */
    self.filterButtonListener = function() {
        localStorage.searchTerm = self.searchTerm();
        if (self.searchTerm() === "") {
            self.items(self._fulllist)
        } else {
            var aNewList = [];
            for (var i = 0; i < self._fulllist.length; i++) {
                var oItem = aFullList[i];
                if (compareStrings(oItem.name, self.searchTerm())) {
                    aNewList.push(oItem)
                }
            }
            self.items(aNewList);
        }
    };

    self.showMarkers = function(bFavoritesOnly) {
        var nItemCount = self._fulllist.length;
        for (var i = 0; i < nItemCount; i++) {
            var oItem = aFullList[i];
            if (oItem.isFavorite()) {
                // Do nothing
            } else {
                if (bFavoritesOnly) {
                    oItem.removeMarker();
                } else {
                    oItem.addMarker();
                }
            }
        }
    };
};

/**
 *
 * Handler used for toggling the panel.
 *
 */
function toggleHandler() {
    var $siteWrapper = $('#site-wrapper');

    if ($siteWrapper.hasClass('show-nav')) {
      // Do things on Nav Close
      $siteWrapper.removeClass('show-nav');
    } else {
      // Do things on Nav Open
      $siteWrapper.addClass('show-nav');
    }
    // Update the size of the google map
    google.maps.event.trigger(map, 'resize')
};

/**
 *
 * Handler used for toggling the display of favorites.
 *
 */
function toggleFavHandler() {
    var $favButton = $('#toggle-favorites');

    if ($favButton.hasClass('show-favs')) {
      // Show all markers
      $favButton.removeClass('show-favs');
      // Save state
      localStorage.showMode = SHOW_ALL;
    } else {
      // Show only favorites
      $favButton.addClass('show-favs');
      // Save state
      localStorage.showMode = SHOW_FAVS_ONLY;
    }

    oRefStationListVM.showMarkers(localStorage.showMode === SHOW_FAVS_ONLY);
};

/**
 *
 * Method used to attach handlers to buttons.
 *
 */
function attachClickHandler() {
    $("#toggle-panel").on("click", toggleHandler);
    $("#toggle-favorites").on("click", toggleFavHandler)
};

attachClickHandler();