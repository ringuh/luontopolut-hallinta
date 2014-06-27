appCtrl.controller('MapCtrl', ['$scope', 'siirto', '$http' , function($scope, siirto, $http) {
  	
  	$scope.id = -1;
  	$scope.valittuSivu = -1;
	$scope.markerlkm = 0;
	$scope.siirto = siirto.alue;
	$scope.sivuVaihtoehdot = [];

	var henkilo = new Henkilo();
	var kartta = new Kartta(henkilo);
	
	
	function init()
	{
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
				
				self.addMerkki = false;
				var x = new Merkki(e);
				//alert(x.marker.getLatLng());
				x.marker.addTo(map);
			}
		};

		this.onLocationError = function(e) {
			alert(e.message);
		};

	}
	var icon = L.MakiMarkers.icon({icon: "rocket", color: "#b0b", size: "m"});
	
	function Merkki(e){

		var self = this;
		var location = e.latlng;
		alert(e.accuracy);
		
		this.marker = L.marker(location, { draggable:true, icon: icon});
		
		
	}
	
	
	$(document).ready(function(){
		init();
	});
  }]);