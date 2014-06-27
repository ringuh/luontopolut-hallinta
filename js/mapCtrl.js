appCtrl.controller('MapCtrl', ['$scope', 'siirto', '$http', function($scope, siirto, $http) {
  	
  	$scope.id = -1;
  	$scope.valittuSivu = -1;
	$scope.markerlkm = 0;
	$scope.siirto = siirto.alue;
	$scope.sivuVaihtoehdot = [];

	var henkilo = new Henkilo();
	var kartta = new Kartta(henkilo);
	
	var iconi;
	var plus = 0;
	
	
	function init()
	{
		iconi = L.MakiMarkers.icon({icon: "rocket", color: "#b0b", size: "m"});
		kartta.addLayer();
		kartta.controllerit();

		
		
	}
	
	

	

	function Kartta(henkilo)
	{
		var self = this;
		this.tiilit = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
		this.southWest = L.latLng(60.0, 22.73);
    	this.northEast = L.latLng(62.48, 24.83);
    	this.minZoom = 10;
    	this.maxZoom = 19;
    	this.gps = false;
    	

    	this.tileLayer = L.tileLayer( this.tiilit, { 
				minZoom: this.minZoom,
				maxZoom: this.maxZoom,
				attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
					'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
					'Imagery © <a href="http://mapbox.com">Mapbox</a>',
				id: 'HallintaMap',//,
				bounds: L.latLngBounds(this.southWest, this.northEast)

			});

		this.map = L.map('map', 
		{
			center: [61.497649,23.784156],
			zoom:10 
		})
		.on('locationfound', henkilo.setLocation)
		.on('locationerror', henkilo.onLocationError)
		.on('zoomend', onZoomend);
		
		this.controllerit = function()
		{
			self.map.addControl( new L.Control.Track() );
			self.map.addControl( new L.Control.Marker() );
			//map.addControl( new L.Control.Reitti() );
			//map.addControl( new L.Control.SaveReitti() );
			//map.addControl( new L.Control.SaveMap() );
			//map.addControl( new L.Control.DeleteReitti() );
		};
		
		this.addLayer = function(){
			henkilo.setKartta(this.map);
			this.tileLayer.addTo(this.map);
			

			setTimeout( function(){
				
				//henkilo.gpsSpot.setRadius(20000);
				
			}, 2000);
		};

		this.removeLayer = function()
		{
			this.map.removeLayer(this.tileLayer);
		};

		this.locate = function(bool)
		{	// mikäli syötetään true kartta siirtyy gps mukana
			this.map.stopLocate(); // tapetaan edellinen haku
			this.map.locate( {
						watch:true,setView: bool, 
						maxZoom:kartta.map.getZoom(), maximumAge:500, 
						enableHighAccuracy: true 
					} ); // avataan uusi haku
		};
		
		this.lisaaMerkki = function()
		{
			henkilo.addMerkki = true;
			self.map.addLayer(henkilo.gpsSpot);
			self.locate();
		}

		function onZoomend(){
			// tapahtuu, kun zoomaus päättyy
			// currently: säätää "omalokaatio-ympyrän" piirtosädettä METREISSÄ
			
			self.locate(true); // for now avataan aina uusi tracki, jotta maxZoom lvl olisi haluttu
	     	var radius = 2;
	     	if( kartta.map.getZoom() < 11)
	     		radius = 30;
	     	else if( kartta.map.getZoom() < 13)
	     		radius = 20;
	     	else if( kartta.map.getZoom() < 15)
	     		radius = 10;
	     	else if( kartta.map.getZoom() < 17)
		     	radius = 5;
		     
		     radius = radius * (20 - kartta.map.getZoom())*4;
		     henkilo.gpsSpot.setRadius(radius);
		}
		


		/*
		 	KONTROLLERIT, eli ZOOM yms ikonit kartassa.
		 */


		L.Control.Track = L.Control.extend({ // Kontrolleri gps trackerin käynnistykseen
			options: {
				position: 'topleft',
			},

			onAdd: function (map) {
				var controlDiv = L.DomUtil.create('div', 'leaflet-control-track');
				L.DomEvent
					.addListener(controlDiv, 'click', L.DomEvent.stopPropagation)
					.addListener(controlDiv, 'click', L.DomEvent.preventDefault)
				.addListener(controlDiv, 'click', function () { 
					

					if( henkilo.setGps() ) // tarkistetaan onko GPS käynnistetty
					{
						
						self.locate(); // paikallistetaan
						self.map.addLayer(henkilo.gpsSpot); // lisätään sijaintirinkula
						
					}
					else
					{	// gps oli poissa päältä
						
						self.map.stopLocate(); //lopetetaan sijainnin trackaus
						self.map.removeLayer(henkilo.gpsSpot); // poistetaan sijaintirinkula
						$(".leaflet-control-track-interior")
							.css("background-color", "#FFFFFF" )
							.css("border", "none");
						// poistetaan efektit kontrollerista
					}
						
				});

				var controlUI = L.DomUtil.create('div', 'leaflet-control-track-interior', controlDiv);
				controlUI.title = 'GPS päälle';
				return controlDiv;
			}
		});

		L.control.Track = function (options) {
			return new L.Control.Track(options);
		};

		L.Control.Marker = L.Control.extend({ // Mahdollistaa uuden kohteen lisäyksen
			options: {
				position: 'topleft',
			},

			onAdd: function (map) {
				var controlDiv = L.DomUtil.create('div', 'leaflet-control-marker');
				L.DomEvent
					.addListener(controlDiv, 'click', L.DomEvent.stopPropagation)
					.addListener(controlDiv, 'click', L.DomEvent.preventDefault)
				.addListener(controlDiv, 'click', function () { 
					self.lisaaMerkki();
					var n = $('#noty').noty({text: 'Merkki lisätty sijaintiisi!', type:"success", timeout:"2000", dismissQueue:false});
					
				});

				var controlUI = L.DomUtil.create('div', 'leaflet-control-marker-interior', controlDiv);
				controlUI.title = 'Lisää merkki kartalle';
				return controlDiv;
			}
		});

		L.control.Marker = function (options) {
			return new L.Control.Marker(options);
		};


	} /// END OF KARTTA

	function Henkilo()
	{
		var self = this;
		var map;
		var gps = false;
		this.addMerkki = false;

		var location = [61.497649,23.784156];
		this.gpsSpot =	L.circle(location, 2000);


		this.setGps = function(bool)
		{
			if(bool)
				gps = true;
			else
				gps = !gps;

			return gps;
		};

		this.getGps = function()
		{
			return gps;
		}

		this.setKartta = function(m){
			map = m;
		}

		this.setLocation = function(e)
		{
			
			location = [ e.latlng.lat, e.latlng.lng ];
			
			self.gpsSpot.setLatLng(e.latlng); // siirretään GPS positiota
			
			$(".leaflet-control-track-interior").css("background-color", "lightblue" )
			.css("border", "2px solid black");

			if(self.addMerkki)
			{
				$("#noty").html($scope.uber);
				self.addMerkki = false;
				L.marker(e.latlng, { draggable:true, icon: iconi}).addTo(map);
				//var x = new Merkki(e);
				//alert(x.marker.getLatLng());
				//x.marker.addTo(map);
			}
		};

		this.onLocationError = function(e) {
			alert(e.message);
		};

	}

	function Merkki(e){

		var self = this;
		var location = e.latlng;
		alert(e.accuracy);
		
		this.marker = L.marker(location, { draggable:true});
		
		
	}
	

	/*
		MakiMarkers, täällä, koska ulkoisessa filussa angular ei tunnista
	*/

		(function () {
  "use strict";

  L.MakiMarkers = {
    // Available Maki Icons
    icons: ["airfield","airport","alcohol-shop","america-football","art-gallery","bakery","bank","bar",
      "baseball","basketball","beer","bicycle","building","bus","cafe","camera","campsite","car",
      "cemetery","chemist","cinema","circle-stroked","circle","city","clothing-store","college",
      "commercial","cricket","cross","dam","danger","disability","dog-park","embassy",
      "emergency-telephone","entrance","farm","fast-food","ferry","fire-station","fuel","garden",
      "golf","grocery","hairdresser","harbor","heart","heliport","hospital","industrial",
      "land-use","laundry","library","lighthouse","lodging","logging","london-underground",
      "marker-stroked","marker","minefield","mobilephone","monument","museum","music","oil-well",
      "park2","park","parking-garage","parking","pharmacy","pitch","place-of-worship",
      "playground","police","polling-place","post","prison","rail-above","rail-light",
      "rail-metro","rail-underground","rail","religious-christian","religious-jewish",
      "religious-muslim","restaurant","roadblock","rocket","school","scooter","shop","skiing",
      "slaughterhouse","soccer","square-stroked","square","star-stroked","star","suitcase",
      "swimming","telephone","tennis","theatre","toilets","town-hall","town","triangle-stroked",
      "triangle","village","warehouse","waste-basket","water","wetland","zoo"
    ],
    defaultColor: "#0a0",
    defaultIcon: "circle-stroked",
    defaultSize: "m",
    apiUrl: "https://api.tiles.mapbox.com/v3/marker/",
    smallOptions: {
      iconSize: [20, 50],
      popupAnchor: [0,-20]
    },
    mediumOptions: {
      iconSize: [30,70],
      popupAnchor: [0,-30]
    },
    largeOptions: {
      iconSize: [36,90],
      popupAnchor: [0,-40]
    }
  };

  L.MakiMarkers.Icon = L.Icon.extend({
    options: {
      //Maki icon: any from https://www.mapbox.com/maki/ (ref: L.MakiMarkers.icons)
      icon: L.MakiMarkers.defaultIcon,
      //Marker color: short or long form hex color code
      color: L.MakiMarkers.defaultColor,
      //Marker size: "s" (small), "m" (medium), or "l" (large)
      size: L.MakiMarkers.defaultSize,
      shadowAnchor: null,
      shadowSize: null,
      shadowUrl: null,
      className: "maki-marker"
    },

    initialize: function(options) {
      var pin;

      options = L.setOptions(this, options);

      switch (options.size) {
        case "s":
          L.extend(options, L.MakiMarkers.smallOptions);
          break;
        case "l":
          L.extend(options, L.MakiMarkers.largeOptions);
          break;
        default:
          options.size = "m";
          L.extend(options, L.MakiMarkers.mediumOptions);
          break;
      }


      pin = "pin-" + options.size;

      if (options.icon !== null) {
        pin += "-" + options.icon;
      }

      if (options.color !== null) {
        if (options.color.charAt(0) === "#") {
          options.color = options.color.substr(1);
        }

        pin += "+" + options.color;
      }

      options.iconUrl = "" + L.MakiMarkers.apiUrl + pin +  ".png";
      options.iconRetinaUrl = L.MakiMarkers.apiUrl + pin + "@2x.png";
    }
  });
	
  L.MakiMarkers.icon = function(options) {
   
    	return new L.MakiMarkers.Icon(options);
    	
  };
})();

	$(document).ready(function(){
		init();
	});


  }]);