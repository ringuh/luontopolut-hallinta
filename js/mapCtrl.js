appCtrl.controller('MapCtrl', ['$scope', 'siirto', '$http', '$location', 
	function($scope, siirto, $http, $location) {
 
	$scope.siirto = siirto.alue;
	$scope.reitinNimi = siirto.alueNimi;
	$scope.sivuVaihtoehdot = [];
	$scope.merkit = L.MakiMarkers.icons;

	
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

	$scope.imgSwipeLeft = function(){
		var i = $scope.merkit.indexOf($scope.valittuMerkki.icon)-1; 
		var l = $scope.merkit.length - 1;

		if( l < 0)
			return;

		if( i < 0)
			i = l;

		$scope.valittuMerkki.icon = $scope.merkit[i];
	};
	$scope.imgSwipeRight = function(){
		var i = $scope.merkit.indexOf($scope.valittuMerkki.icon)+1; 
		var l = $scope.merkit.length - 1;

		if( l < 0)
			return;

		if( i > l)
			i = 0;
		
		$scope.valittuMerkki.icon = $scope.merkit[i];
	};
	$scope.$watch( 'vari', function(x,y){
		//alert(x +" "+ y);
	});
	
	$scope.internetExplorer = function(tt)
	{
		setTimeout(function(){
			$("."+tt).css("background-color", "#"+tt).css("color", "#"+tt );
		}, 1000);
		
		//return "{{background-color:#"+tt+"}}";

	};



	$scope.editTrail = function(){
		$http.post( siirto.rajapinta, { cmd: "getRadat", id: $scope.siirto })
			.success( function(data){ // haetaan lista kohteista
				
			console.log(JSON.stringify(data));
			$scope.reitinNimi = data[0].nimi;
			$scope.reitinOsoite = data[0].osoite;
			$scope.reitinKuvaus = data[0].kuvaus;
			$scope.reitinDesc = data[0].kuvaus_eng;
		})
		.error( function()
		{
			$('#noty').noty({text: data, type:"Paikan haku kusi", timeout:"2000", dismissQueue:false});
		});

		openVerho();
		$("#popup").hide();
		$("#reittiEdit").show();
/*
		$http.post( siirto.rajapinta, { cmd: "tallennaMerkit", id: $scope.siirto, value: merkit })
			.success( function(data){
				console.log( "Tallenna Merkit\n"+JSON.stringify(data) );
				
				var n = $('#noty').noty({text: 'Kohteet tallennettu!', type:"success", timeout:"2000", dismissQueue:false});
				
			})
			.error( function(){
				
				$('#noty').noty({text: 'Kohteiden tallennus epäonnistui', type:"error", timeout:"2000", dismissQueue:false});
				
			});
*/
	};

	$scope.editTrailPost = function()
	{
		$http.post( siirto.rajapinta, { cmd: "editRata", id: $scope.siirto, value: $scope.reitinNimi, 
			osoite: $scope.reitinOsoite, desc: $scope.reitinKuvaus, desc_eng: $scope.reitinDesc })
			.success( function(data){
				console.log( "Tallenna Merkit\n"+JSON.stringify(data) );
				
				var n = $('#noty').noty({text: 'Reitti tallennettu!', type:"success", timeout:"2000", dismissQueue:false});
				
			})
			.error( function(){
				
				$('#noty').noty({text: 'Reitin tallennus epäonnistui', type:"error", timeout:"2000", dismissQueue:false});
				
		});	
		$("#reittiEdit").hide();
		$scope.verhoHide();

		if( $scope.reitinNimi == -1)
		{
			$location.path("/etusivu");
			siirto.alue = -1;
			siirto.alueNimi = -1;
			localStorage.setItem("valittuAlue", siirto.alue);
			localStorage.setItem("valittuAlueNimi", siirto.alueNimi);
		}
	};	

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
			self.map.addControl( new L.Control.editReitti() );
		};
		
		
		this.addLayer = function(){
			console.log("Kartta: addLayer");
			this.tileLayer.addTo(this.map);
			this.reitti.Load();
			this.haeSivut();
			this.haeMerkit();
			
			
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
				try{
					$scope.$digest();
				}
				catch(e)
				{
					console.log(e.message);
				}
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

		this.haeSivut = function(){
			$http.post( siirto.rajapinta, { cmd: "getPages" })
			.success( function(data){
				console.log( "Sivuvaihtoehdot\n"+JSON.stringify(data) );
				$scope.sivuVaihtoehdot = data;
				var n = $('#noty').noty({text: 'Sivuvaihtoehdot haettu!', type:"success", timeout:"2000", dismissQueue:false});
				
			})
			.error( function(){
				
				$('#noty').noty({text: 'Sivujen haku epäonnistui', type:"error", timeout:"2000", dismissQueue:false});
				
			});
		};

		this.saveMerkit = function(){
			$http.post( siirto.rajapinta, { cmd: "tallennaMerkit", id: $scope.siirto, value: merkit })
			.success( function(data){
				console.log( "Tallenna Merkit\n"+JSON.stringify(data) );
				
				var n = $('#noty').noty({text: 'Kohteet tallennettu!', type:"success", timeout:"2000", dismissQueue:false});
				
			})
			.error( function(){
				
				$('#noty').noty({text: 'Kohteiden tallennus epäonnistui', type:"error", timeout:"2000", dismissQueue:false});
				
			});
		};

		this.haeMerkit = function(){
			$http.post( siirto.rajapinta, { cmd: "haeMerkit", id: $scope.siirto })
			.success( function(data){
				console.log( "Hae Merkit\n"+JSON.stringify(data) );
				for( var i in data)
				{
					self.AddMerkki( new Merkki({"latlng":L.latLng(data[i]["latitude"], data[i]["longitude"])}, self, data[i] ));

				}
				
				var n = $('#noty').noty({text: 'Kohteet haettu!', type:"success", timeout:"2000", dismissQueue:false});
				
			})
			.error( function(){
				
				$('#noty').noty({text: 'Kohteiden haku epäonnistui', type:"error", timeout:"2000", dismissQueue:false});
				
			});
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
						self.reitti.clear();
					});

				var controlUI = L.DomUtil.create('div', 'leaflet-control-deletereitti-interior', controlDiv);
				controlUI.title = 'Poista reitti';
				return controlDiv;
			}
		});

		L.control.DeleteReitti = function (options) {
			return new L.Control.DeleteReitti(options);
		};

		L.Control.editReitti = L.Control.extend({
			options: {
				position: 'bottomright',
			},

			onAdd: function (map) {
				var controlDiv = L.DomUtil.create('div', 'leaflet-control-editreitti');
				L.DomEvent
					.addListener(controlDiv, 'click', L.DomEvent.stopPropagation)
					.addListener(controlDiv, 'click', L.DomEvent.preventDefault)
				.addListener(controlDiv, 'click', function () { 
						$scope.editTrail();
					});

				var controlUI = L.DomUtil.create('div', 'leaflet-control-editreitti-interior', controlDiv);
				controlUI.title = 'Muokkaa reittiä';
				return controlDiv;
			}
		});

		L.control.EditReitti = function (options) {
			return new L.Control.editReitti(options);
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
						self.saveMerkit();
						
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

	function Merkki(e, kartta, init){
		console.log("Merkki: constructor");
		var self = this;
		var map = kartta.map;
		
		

		
		this.halytysraja = 10;

		this.id = -1;
		this.clickable = true;
		
		this.location = e.latlng;
		this.nimi = "defaultNimi";
		this.sivuID = -1;
		this.icon = "circle";
		this.size = "l";
		this.color ="b0b";

		


		
		this.Add = function(tyyppi)
		{
			
			var n = $('#noty').noty({text: 'Merkki lisätty sijaintiisi!', 
				type:"success", timeout:"1000", dismissQueue:true});
			marker.addTo(map);
		};

		this.Hide = function(){
			map.removeLayer(marker);
		};

		
		function onMarkerClick(e)
		{

			$scope.valittuMerkki = self;
			$scope.colors = siirto.colors;
			$scope.kuva = self.icon;
			$("#verho").fadeIn("slow");
			$scope.$digest();
		}

		this.onSave = function()
		{
			marker.setIcon(L.MakiMarkers.icon({icon: self.icon, color: self.color, size: self.size}));
			
		};

		function onDragEnd(e)
		{
			console.log("Merkki: onDragEnd - "+e.distance + " "+ marker.getLatLng());
			self.location = marker.getLatLng();
			// merkki poistetaan, mikäli sitä liikuttaa kerralla 200 pixeliä 
			// tai 1/3 näytön leveydestä pieninäyttöisillä laitteilla ( esim lumia 520 se on 100px) 
			if( e.distance > screen.width/3 || e.distance > 200 ) 
			{
				console.log("siirryttiin: "+e.distance);
				
				kartta.RemoveMerkki(self);
			}

		}


		if( init != null)
		{
			console.log( "jou\n" );
			//{"id":"1","tlp_rata_id":"4","tlp_sivu_id":"-1","nimi":"defaultNimi","latitude":"61.4982","longitude":"23.7611","clickable":"0","halytysraja":"10","icon":"circle","color":"b0b","size":"l"},
			this.id = init.id;
			this.sivuID = init.tlp_sivu_id;
			this.nimi = init.nimi;
			if(init.clickable == "false")
				this.clickable = false;
			this.icon = init.icon;
			this.color = init.color;
			this.size = init.size;
			this.halytysraja = init.halytysraja;


			
		}

		var iconi = L.MakiMarkers.icon({icon: self.icon, color: self.color, size: self.size});
		var marker = L.marker(e.latlng, { draggable:true, icon: iconi})
		.on('click', onMarkerClick)
		.on('dragend', onDragEnd);
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

		this.clear = function(){
			
			pisteet = [];
			drawPolyline();
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