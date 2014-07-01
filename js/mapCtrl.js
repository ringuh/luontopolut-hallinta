appCtrl.controller('MapCtrl', ['$scope', 'siirto', '$http', function($scope, siirto, $http) {
 
	$scope.siirto = siirto.alue;
	
	var kartta = new Kartta();	
	
	function init()
	{
		
		kartta.addLayer();
		kartta.controllerit();
		$scope.lkm = kartta.MerkitLkm();
		

	}

	$scope.verhoHide = function(){
		$("#verho").fadeOut("slow");
	};

	function openVerho(){
		$("#verho").fadeIn("slow");

	}
	
		

	//luokat

	function Kartta()
	{
		console.log( "Kartta constructor");
		var self = this;
		var henkilo = new Henkilo(self);
		this.reitti = new Reitti(self);
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
		.on('click', henkilo.setLocation)
		.on('zoomend', onZoomend);
		
		this.controllerit = function()
		{
			console.log("Kartta: controllerit");
			self.map.addControl( new L.Control.Track() );
			self.map.addControl( new L.Control.Marker() );
			self.map.addControl( new L.Control.Reitti() );
			self.map.addControl( new L.Control.SaveReitti() );
			self.map.addControl( new L.Control.SaveMap() );
			self.map.addControl( new L.Control.DeleteReitti() );
		};
		
		
		this.addLayer = function(){
			console.log("Kartta: addLayer");
			this.tileLayer.addTo(this.map);
			this.reitti.Load();
			
			
		};

		this.removeLayer = function()
		{
			console.log("Kartta: removeLayer");
			this.map.removeLayer(this.tileLayer);
		};

		this.locate = function(bool)
		{	// mikäli syötetään true kartta siirtyy gps mukana
			console.log("Kartta: locate zlvl: "+self.map.getZoom());
			if( henkilo.getGps() == 0)
				return;

			self.map.stopLocate(); // tapetaan edellinen haku
			
			var seuranta = false;
			if( bool == 2)
				seuranta = true;

			self.map.locate( {
						watch:true,setView: seuranta, 
						maxZoom:self.map.getZoom(), maximumAge:500, 
						enableHighAccuracy: true 
					} ); // avataan uusi haku
			
			
		};
		
		this.lisaaMerkki = function()
		{
			console.log("Kartta:lisaaMerkki");
			henkilo.addMerkki = true;
			henkilo.setGps(2);

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


		     setTimeout(function(){
		     	$(".leaflet-user-marker").css("z-index", "300 !important");
		     }, 100);
		     setTimeout(function(){
		     	$(".leaflet-user-marker").css("z-index", "300 !important");
		     }, 200);
		     setTimeout(function(){
		     	$(".leaflet-user-marker").css("z-index", "300 !important");
		     }, 300);
		     setTimeout(function(){
		     	$(".leaflet-user-marker").css("z-index", "300 !important");
		     }, 1000);
		     //henkilo.gpsSpot.setRadius(radius);
		}
		
		this.MerkitLkm = function()
		{
			return merkit.length;
		};

		this.AddMerkki = function(e)
		{
			if( merkit.indexOf(e) == -1)
			{
				e.Add("null");
				merkit.push(e);
				$scope.lkm = self.MerkitLkm();
				$scope.$digest();
			}
			else
				alert("merkki oli jo");
		};

		this.RemoveMerkki = function(e)
		{
			console.log("Kartta:removeMerkki "+merkit.length);
			for( var i in merkit )
			{
				if( merkit[i] == e )
				{
					console.log("poistettava löytyi "+i);
					e.Hide();
					e = null;

					merkit.splice(i, 1);	
					$scope.lkm = self.MerkitLkm();
					$scope.$digest();				
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
						henkilo.setGps();						
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

		L.Control.Reitti = L.Control.extend({
			options: {
				position: 'topright',
			},

			onAdd: function (map) {
				var controlDiv = L.DomUtil.create('div', 'leaflet-control-reitti');
				L.DomEvent
					.addListener(controlDiv, 'click', L.DomEvent.stopPropagation)
					.addListener(controlDiv, 'click', L.DomEvent.preventDefault)
				.addListener(controlDiv, 'click', function () { 
					self.reitti.ToggleTrack();
					henkilo.setGps(2);					
					
					});

				var controlUI = L.DomUtil.create('div', 'leaflet-control-reitti-interior', controlDiv);
				controlUI.title = 'Piirrä reitti';
				return controlDiv;
			}
		});
		L.control.Reitti = function (options) {
		return new L.Control.Reitti(options);
		};
		
		L.Control.DeleteReitti = L.Control.extend({
			options: {
				position: 'topright',
			},

			onAdd: function (map) {
				var controlDiv = L.DomUtil.create('div', 'leaflet-control-deletereitti');
				L.DomEvent
					.addListener(controlDiv, 'click', L.DomEvent.stopPropagation)
					.addListener(controlDiv, 'click', L.DomEvent.preventDefault)
				.addListener(controlDiv, 'click', function () { 
						//$scope.tyhjennaReitti();
					});

				var controlUI = L.DomUtil.create('div', 'leaflet-control-deletereitti-interior', controlDiv);
				controlUI.title = 'Poista reitti';
				return controlDiv;
			}
		});

		L.control.DeleteReitti = function (options) {
			return new L.Control.DeleteReitti(options);
		};
		
		L.Control.SaveMap = L.Control.extend({
			options: {
				position: 'topleft',
			},

			onAdd: function (map) {
				var controlDiv = L.DomUtil.create('div', 'leaflet-control-savemap');
				L.DomEvent
					.addListener(controlDiv, 'click', L.DomEvent.stopPropagation)
					.addListener(controlDiv, 'click', L.DomEvent.preventDefault)
				.addListener(controlDiv, 'click', function () { 
						//$scope.tallennaMerkit();
						
					});

				var controlUI = L.DomUtil.create('div', 'leaflet-control-savemap-interior', controlDiv);
				controlUI.title = 'Tallenna merkit';
				return controlDiv;
			}
		});

		L.control.SaveMap = function (options) {
			return new L.Control.SaveMap(options);
		};
		
		L.Control.SaveReitti = L.Control.extend({
			options: {
				position: 'topright',
			},

			onAdd: function (map) {
				var controlDiv = L.DomUtil.create('div', 'leaflet-control-savereitti');
				L.DomEvent
					.addListener(controlDiv, 'click', L.DomEvent.stopPropagation)
					.addListener(controlDiv, 'click', L.DomEvent.preventDefault)
				.addListener(controlDiv, 'click', function () { 
						self.reitti.Save();
					});

				var controlUI = L.DomUtil.create('div', 'leaflet-control-savereitti-interior', controlDiv);
				controlUI.title = 'Tallenna reitti';
				return controlDiv;
			}
		});

		L.control.SaveReitti = function (options) {
			return new L.Control.SaveReitti(options);
		};

	} /// END OF KARTTA

	function Henkilo(kartta)
	{
		var self = this;
		
		
		var gps = 0;
		this.addMerkki = false;

		var location = [61.497649,23.784156];
		//this.gpsSpot =	L.circle(location, 2000);
		var gpsSpot = L.userMarker(location,{pulsing:true, accuracy:100, smallIcon:true});


		this.setGps = function(bool)
		{
			console.log("Henkilo:setGps");
			kartta.map.stopLocate(); //lopetetaan sijainnin trackaus

			if(bool != null)
				gps = bool;
			else
				++gps;
			if(gps == 3)
				gps = 0;

			if( gps > 0 ) // poistetaan sijaintirinkula tarvittaessa
			{
				kartta.locate(gps); // paikallistetaan
			}
			else
			{
				kartta.map.removeLayer(gpsSpot);
				
						
				$(".leaflet-control-track-interior")
					.removeClass("toggle_two");
						// poistetaan efektit kontrollerista
			}
			

			console.log("Henkilo:return gps "+gps);
			return gps;
		};

		this.getGps = function()
		{
			console.log("Henkilo:getGps");
			return gps;
		}

		this.setLocation = function(e)
		{
			try{
				gpsSpot.setAccuracy(e.accuracy);
				//$scope.lkm = e.altitude + " "+ e.altitudeAccuracy; 
				// riippuu selaimesta? toimii lumia520, ei nexus7
				
				
			}
			catch(e)
			{
				console.log(e);
				gpsSpot.setAccuracy((20-kartta.map.getZoom())*15 );
			}
			console.log("Henkilo:setLocation ");
			console.log(e.latlng);
			location = [ e.latlng.lat, e.latlng.lng ];
			

			console.log(kartta.map);
			
			try{


				kartta.map.removeLayer(gpsSpot); 
			}
			catch(e)
			{
				console.log(e);
			}
			kartta.map.addLayer(gpsSpot); // lisätään sijaintirinkula
			gpsSpot.setLatLng(e.latlng); // siirretään GPS positiota
			

			
					
			if(gps == 1){
				console.log(gps);
				$(".leaflet-control-track-interior").addClass("toggle_one");
			}
			else{
				console.log("e"+gps);
				$(".leaflet-control-track-interior").removeClass("toggle_one").addClass("toggle_two");
			}

			if(self.addMerkki)
			{
				self.addMerkki = false;
				
				kartta.AddMerkki( new Merkki(e, kartta) );
				
			}
			if( kartta.reitti.GetTrack())
			{
				kartta.reitti.AddPiste(e);
			}
		};

		this.onLocationError = function(e) {
			
			var n = $('#noty').noty({text: e.message, type:"warning", timeout:"2000", dismissQueue:false});
			
		};

	}

	function Merkki(e, kartta){
		console.log("Merkki: constructor");
		var self = this;
		var map = kartta.map;
		
		var iconi = L.MakiMarkers.icon({icon: "rocket", color: "#b0b", size: "l"});
		var marker = L.marker(e.latlng, { draggable:true, icon: iconi})
		.on('click', onMarkerClick)
		.on('dragend', onDragEnd);

		var tyyppi = "kohde";
		var halytysRaja = 10;

		this.clickable = true;
		this.order = -1;
		this.location = e.latlng;

		
		this.Add = function(tyyppi)
		{
			
			var n = $('#noty').noty({text: 'Merkki lisätty sijaintiisi!', type:"success", timeout:"2000", dismissQueue:false});
			marker.addTo(map);
		};

		this.Hide = function(){
			map.removeLayer(marker);
		};

		
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
				
				kartta.RemoveMerkki(self);
			}

		}
	}
	
	function Reitti(kartta)
	{
		
		var self = this;
		var lisaysRaja = 5; // raja, jota kauempaa saadut tulokset otetaan talteen
		var pisteet = [];
		var track = false;

		var polyline_options = {
			  color: '#000'
		  };
		var polyline;

		this.ToggleTrack = function(){
			track = !track;

			if( track )
				$(".leaflet-control-reitti-interior").addClass("toggle_one");
			else
				$(".leaflet-control-reitti-interior").removeClass("toggle_one");
		};
		this.GetTrack = function()
		{
			return track;
		};
		this.AddPiste = function(e)
		{
			console.log("AddPiste"+e.latlng);
			if( pisteet.length > 0)
			{
				var dist = pisteet[pisteet.length-1].distanceTo(e.latlng, lisaysRaja);
				if( dist > lisaysRaja )
				{ // otetaan ylös 
					pisteet.push( new Piste( e ));
					drawPolyline();
					
				}

				
			}
			else{
				pisteet.push( new Piste( e ));
				
			}
			
		};

		function drawPolyline()
		{
			try{
				kartta.map.removeLayer(polyline); // koitetaan poistaa edellinen
			}
			catch(e)
			{
				console.log(e);
			}

			polyline = null;
			var piirtopisteet = []; // nollataan
			for( var i in pisteet) // koska pisteet oliot on erilaisia, kuin mitä polyline ehkä haluaa
				piirtopisteet.push( pisteet[i] );

			polyline = L.polyline(piirtopisteet, polyline_options).addTo(kartta.map);
			$scope.etaisyys = self.Pituus();
			try{
				$scope.$digest();
			}
			catch(e)
			{
				console.log(e);
			}
		}
		
		this.Pituus = function(){
			var ret = 0;
			for( var i in pisteet )
				ret += pisteet[i].distance;

			
			return ret.toFixed(0);
		};

		this.Save = function()
		{
			var pp = [];
			for( var i in pisteet )
				pp.push(pisteet[i].toArray());
			
			$http.post( siirto.rajapinta, { cmd: "tallennaReitti", id: $scope.siirto, value: pisteet })
			.success( function(data){
				console.log( "Tallenna reitti\n"+data );
				var n = $('#noty').noty({text: 'Reitti tallennettu!', type:"success", timeout:"2000", dismissQueue:false});
				
			})
			.error( function(){
				
				$('#noty').noty({text: 'Reitin tallennus epäonnistui', type:"error", timeout:"2000", dismissQueue:false});
				
			});
		};

		this.Load = function()
		{
			$http.post( siirto.rajapinta, { cmd: "haeReitti", id: $scope.siirto })
			.success( function(data){
				console.log( "lataa reitti\n"+JSON.stringify(data) );

				for( var i in data )
				{
					var leikkiPiste = {"latlng":L.latLng(data[i]["latitude"], data[i]["longitude"]), "altitude": parseInt(data[i]["altitude"]), "distance": parseInt(data[i]["distance"])};
					
					var x = new Piste(leikkiPiste);
					pisteet.push(x);
				}
				drawPolyline();
				
				
			})
			.error( function(){
				$('#noty').noty({text: 'Reitin lataus epäonnistui', type:"error", timeout:"2000", dismissQueue:false});
				
			});
		};
	}

	function Piste(e)
	{
		this.latlng = e.latlng;
		this.lat = e.latlng.lat;
		this.lng = e.latlng.lng;
		this.altitude = 0;
		this.distance = 0;

		try{

			this.distance = e.distance;
		}
		catch(e)
		{
			console.log(e);
		}
		
		try{
			if( e.altitude != null)
				this.altitude = e.altitude;
		}
		catch(e)
		{
			console.log(e);
			
		}
		this.distanceTo = function(x, raja){
			var n = this.latlng.distanceTo(x);
			if( n > raja )
				this.distance = n;
			return n;
		};

		this.toArray = function()
		{
			var ret = [];
			ret["latlng"] = this.latlng;
			ret["latitude"] = this.lat;
			ret["longitude"] = this.lng;
			ret["altitude"] = this.altitude;
			ret["distance"] = this.distance;

			return ret;
		};
	}

	
	$(document).ready(function(){
		init();
	});


  }]);