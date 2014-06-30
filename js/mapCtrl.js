appCtrl.controller('MapCtrl', ['$scope', 'siirto', '$http', function($scope, siirto, $http) {
  	
  	$scope.id = -1;
  	$scope.valittuSivu = -1;
	$scope.markerlkm = 0;
	$scope.siirto = siirto.alue;
	$scope.sivuVaihtoehdot = [];

	var henkilo = new Henkilo();
	var kartta = new Kartta(henkilo);
	
	
	var plus = 0;
	
	
	function init()
	{
		
		kartta.addLayer();
		kartta.controllerit();

		
		
	}

	$scope.verhoHide = function(){
		$("#verho").fadeOut("slow");
	};

	function openVerho(){
		$("#verho").fadeIn("slow");

	}
	
	

	

	function Kartta(henkilo)
	{
		console.log( "Kartta constructor");
		var self = this;
		this.tiilit = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
		this.southWest = L.latLng(60.0, 22.73);
    	this.northEast = L.latLng(62.48, 24.83);
    	this.minZoom = 10;
    	this.maxZoom = 19;
    	
    	this.gps = false;
    	var merkit = [];
    	

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
			console.log("Kartta: controllerit");
			self.map.addControl( new L.Control.Track() );
			self.map.addControl( new L.Control.Marker() );
			//map.addControl( new L.Control.Reitti() );
			//map.addControl( new L.Control.SaveReitti() );
			//map.addControl( new L.Control.SaveMap() );
			//map.addControl( new L.Control.DeleteReitti() );
		};
		
		
		this.addLayer = function(){
			console.log("Kartta: addLayer");
			henkilo.setKartta(this.map);
			this.tileLayer.addTo(this.map);
			
			
		};

		this.removeLayer = function()
		{
			console.log("Kartta: removeLayer");
			this.map.removeLayer(this.tileLayer);
		};

		this.locate = function(bool)
		{	// mikäli syötetään true kartta siirtyy gps mukana
			console.log("Kartta: locate zlvl: "+self.map.getZoom());
			if( !henkilo.getGps())
				return;

			self.map.stopLocate(); // tapetaan edellinen haku
			
			self.map.locate( {
						watch:true,setView: bool, 
						maxZoom:self.map.getZoom(), maximumAge:500, 
						enableHighAccuracy: true 
					} ); // avataan uusi haku
			
			
		};
		
		this.lisaaMerkki = function()
		{
			console.log("Kartta:lisaaMerkki");
			henkilo.addMerkki = true;
			henkilo.setGps(true);
			self.locate();
		}
		
		function onZoomend(){
			// tapahtuu, kun zoomaus päättyy
			// currently: säätää "omalokaatio-ympyrän" piirtosädettä METREISSÄ
			console.log("Kartta: onZoomend "+self.map.getZoom());
			
			self.locate(true); // for now avataan aina uusi tracki, jotta maxZoom lvl olisi haluttu
	     	var radius = 2;
	     	if( self.map.getZoom() < 11)
	     		radius = 30;
	     	else if( self.map.getZoom() < 13)
	     		radius = 20;
	     	else if( self.map.getZoom() < 15)
	     		radius = 10;
	     	else if( self.map.getZoom() < 17)
		     	radius = 5;
		     
		     radius = radius * (20 - self.map.getZoom())*4;
		     //henkilo.gpsSpot.setRadius(radius);
		}
		
		this.MerkitLkm = function()
		{
			return merkit.length;
		};

		this.AddMerkki = function(e)
		{
			if( merkit.indexOf(e) == -1)
				merkit.push(e);
			else
				alert("merkki oli jo");
		};

		this.RemoveMerkki = function(e)
		{
			for( var i in merkit )
			{
				if( merkit[i] == e )
				{
					merkit.splice(i, 1);					
				}
			}
		};


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
		//this.gpsSpot =	L.circle(location, 2000);
		this.gpsSpot = L.userMarker(location,{pulsing:true, accuracy:100, smallIcon:true});


		this.setGps = function(bool)
		{
			console.log("Henkilo:setGps");
			if(bool)
				gps = true;
			else
				gps = !gps;

			console.log("Henkilo:return gps "+gps);
			return gps;
		};

		this.getGps = function()
		{
			console.log("Henkilo:getGps");
			return gps;
		}

		this.setKartta = function(m){
			console.log("Henkilo:setKartta");
			map = m;
		}

		this.setLocation = function(e)
		{
			self.gpsSpot.setAccuracy(e.accuracy);
			
			console.log("Henkilo:setLocation");
			location = [ e.latlng.lat, e.latlng.lng ];
			
			map.removeLayer(henkilo.gpsSpot); 
			map.addLayer(henkilo.gpsSpot); // lisätään sijaintirinkula
			self.gpsSpot.setLatLng(e.latlng); // siirretään GPS positiota
			
			$(".leaflet-control-track-interior").css("background-color", "lightblue" )
			.css("border", "2px solid black");

			if(self.addMerkki)
			{
				$("#noty").html($scope.uber);
				self.addMerkki = false;
				
				var x = new Merkki(e, map);
				x.Add(null);
				map.AddMerkki( x );

				
			}
		};

		this.onLocationError = function(e) {
			alert(e.message);
		};

	}

	function Merkki(e, kartta){
		console.log("Merkki: constructor");
		var self = this;
		var map = kartta;
		var location = e.latlng;
		var iconi = L.MakiMarkers.icon({icon: "rocket", color: "#b0b", size: "m"});
		var marker = L.marker(e.latlng, { draggable:true, icon: iconi})
		.on('click', onMarkerClick)
		.on('dragend', onDragEnd);

		var tyyppi = "kohde";

		
		this.Add = function(tyyppi)
		{
			
			var n = $('#noty').noty({text: 'Merkki lisätty sijaintiisi!', type:"success", timeout:"2000", dismissQueue:false});
			marker.addTo(map);
		};

		this.Hide = function(){
			map.removeLayer(marker);
		};

		this.Remove = function(){

		}
		
		function onMarkerClick(e)
		{
			$("#verho").fadeIn("slow");
		}

		function onDragEnd(e)
		{
			console.log("Merkki: onDragEnd - "+e.distance + " "+ screen.width);
			// merkki poistetaan, mikäli sitä liikuttaa kerralla 200 pixeliä 
			// tai 1/3 näytön leveydestä pieninäyttöisillä laitteilla ( esim lumia 520 se on 100px) 
			if( e.distance > screen.width/3 || e.distance > 200 ) 
			{
				console.log("siirryttiin: "+e.distance);
				
				map.RemoveMerkki(self);
			}

		}
	}
	

	
	$(document).ready(function(){
		init();
	});


  }]);