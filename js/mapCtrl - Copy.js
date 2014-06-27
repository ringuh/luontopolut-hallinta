appCtrl.controller('MapCtrl', ['$scope', 'siirto', '$http' , function($scope, siirto, $http) {
  	
  	$scope.id = -1;
  	$scope.valittuSivu = -1;
	$scope.markerlkm = 0;
	$scope.siirto = siirto.alue;
	$scope.sivuVaihtoehdot = [];
	
	var line_points = [];
	var polyline;


	var alarm = true;
	
	
	var rajapinta_ = siirto.rajapinta;
	$scope.markers = [];
	var markersID = [];
	var map;
	$scope.gps = false;
	var getSpot = false;
	$scope.reittiPiirto = false;
	var gpsSpot = L.circle([0,0], 2000);

		
	$scope.lisaaMerkki = function(){
		getSpot = true;
		map.stopLocate();
		map.locate( {
					watch:true,setView: false, 
					maxZoom:19, maximumAge:500, 
					enableHighAccuracy: true 
				} );
	};
		
	$scope.tallennaMerkit = function(){
		if( !$scope.markers.length > 0)
			return;

		$.post( rajapinta_, { cmd: "resetPaikka", id: $scope.siirto })
		.done( function(data){
			console.log(data);
			var count = 0;
			for( var i in $scope.markers)
			{
				if( i == "remove" )
				{
					continue;
				}
				
				
				var tmp = $scope.markers[i].getLatLng();
				//alert( tmp.getLatLng().lat);
				$.post(rajapinta_,{ cmd: "addSpot", id : $scope.siirto, latitude: tmp.lat, longitude: tmp.lng })
				.done( function(data){
					console.log(data);
					++count;
					//var n = $('#noty').noty({text: 'Merkki '+count+' tallennettu!', type:"success", timeout:"1000", dismissQueue:false});
					
					if( count == $scope.markers.length )
						var n = $('#noty').noty({text: 'Merkkien sijainnit tallennettu!', type:"success", timeout:"2000", dismissQueue:false});
				
					
				})
				.fail( function(){
					alert("fail");
					var n = $('#noty').noty({text: 'Virhe tallennuksessa!', type:"error", timeout:"2000", dismissQueue:false});
				
				});
			}
			
		})
		.fail( function(){
			alert("reset fail");
		});
		
	};	

	$scope.track = function(){
		$scope.gps = !$scope.gps;
		map.stopLocate();
		
		if( $scope.gps )
		{
			map.locate( {
						watch:true,setView: false, 
						maxZoom:19, maximumAge:500, 
						enableHighAccuracy: true 
					} );
			
		}
		else
			map.removeLayer(gpsSpot);	
		
		
	}	
		

		
		
	Array.prototype.remove = function( syote ){
		for( var i in this )
		{
			if( this[i] == syote )
			{
				this.splice(i, 1);
				return;
			}
		}
		return;
	}

	$(document).ready( function(){
		start();
	});

	function init()
	{
		
		map = L.map('map', 
		{
			center: [61.497649,23.784156],
			zoom:10 
		});
		var southWest = L.latLng(60.0, 22.73);
    	var northEast = L.latLng(62.48, 24.83);
		L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		//L.tileLayer('http://ohjryhma1.projects.tamk.fi/maps/G2/{z}/{x}/{y}.png', {
			minZoom: 10,
			maxZoom: 19,
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
				'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
				'Imagery © <a href="http://mapbox.com">Mapbox</a>',
			id: 'testisetti',//,
			bounds: L.latLngBounds(southWest, northEast)

		}).addTo(map);
		
		map.on('locationfound', onLocationFound);
		map.on('locationerror', onLocationError);
		map.on('zoomend', onZoomend);
		
		/*
			CONTROLLERIT
		*/
		
		map.addControl( new L.Control.Track() );
		map.addControl( new L.Control.Marker() );
		map.addControl( new L.Control.Reitti() );
		map.addControl( new L.Control.SaveReitti() );
		map.addControl( new L.Control.SaveMap() );
		map.addControl( new L.Control.DeleteReitti() );
		haeReitti();
		
		$scope.track();
		
	}

	function onMapClick(e) {

		var index = $scope.markers.length;

        $scope.markers[index] = L.marker(e.latlng, { draggable:true}).addTo(map);
        $scope.markers[index].bindPopup("im at:"+$scope.markers[index].getLatLng());  
        $scope.markers[index].on('click', onMarkerClick);

        var alku = $scope.markers[index].getLatLng();

        
        $scope.markers[index].on('dragend', function(event) {
        	
		    var mark = event.target;  // you could also simply access the marker through the closure
		    var result = mark.getLatLng();  // but using the passed event is cleaner
		    
		    var vrt = this.getLatLng();
		    this.setLatLng(result);

		    
		    var distance = vrt.distanceTo( alku );
		    if( distance > 2000)
		    {
		    	map.removeLayer(this);
		    	$scope.markers.remove(this);
		    	markersID.remove(markersID[index]);

		    	console.log( markersID.length + " vs "+$scope.markers.length);
				var n = $('#noty').noty({text: 'Merkki poistettu!', type:"error", timeout:"1000", dismissQueue:false});
		    }
		    
		    else
		    {
		    	this.bindPopup("distance:"+vrt);
		    	alku = vrt;
		    }

			
		    $("#marksCount").text("Merkkejä: "+$scope.markers.length);
		});
	

		$("#marksCount").text("Merkkejä: "+$scope.markers.length);
	}

	function onLocationFound(e) {
		if( getSpot )
			onMapClick(e);	
		getSpot = false;
		
		gpsSpot.setLatLng(e.latlng);
		gpsSpot.addTo(map);	
		
		//alert( $scope.reittiPiirto );
		if( $scope.reittiPiirto )
		{
			piirraReitti(e);
		}
			
		etaisyysHalytys(e);
	}

	function onLocationError(e) {
		alert(e.message);
	}


	function onZoomend(){

	     var radius = 2;
	     if( map.getZoom() < 11)
	     	radius = 30;
	     else if( map.getZoom() < 13)
	     	radius = 20;
	     else if( map.getZoom() < 15)
	     	radius = 10;
	     else if( map.getZoom() < 17)
	     	radius = 5;
	     
	     radius = radius * (20 - map.getZoom())*4;
	     gpsSpot.setRadius(radius);
	}

	function start(){
		$.post( rajapinta_, { cmd: "getSpots", id: $scope.siirto })
			.done( function(data){
				console.log( data );

				var arr = JSON.parse(data);
				
				init();
				for( var i = 0; i < arr.length; ++i)
				{
					var latlng = L.latLng(arr[i]["latitude"], arr[i]["longitude"]);
					var e = new Array();
					e.latlng = latlng;
					
					onMapClick(e);
					markersID.push(arr[i]["ID"]);
					
				}
			})
			.fail( function(){
				init();
			});

	}

	function etaisyysHalytys(e)
	{
		var halytysRaja = 20;
		if( alarm )
		{
			for( var i = 0; i < $scope.markers.length; ++i)
			{

				if( e.latlng.distanceTo($scope.markers[i].getLatLng()) < halytysRaja )
				{
					
					var n = $('#noty').noty({
					text: "Olit etäisyydellä "+e.latlng.distanceTo($scope.markers[i].getLatLng())+" merkistä "+i, 
					type:"success", timeout:"3000", dismissQueue:false});
					alarm = false;
				}
			}
		}
		else
		{
			var all_far = false;
			for( var i = 0; i < $scope.markers.length; ++i)
			{

				if( e.latlng.distanceTo($scope.markers[i].getLatLng()) < halytysRaja )
				{
					all_far = true;
				}
			}

			if( !all_far )
				alarm = true;
		}
	}

	function onMarkerClick(e)
	{
		var index = 0;
		var kaikkiSivut = [];
		for( var i = 0; i < $scope.markers.length; ++i)
		{
			if( $scope.markers[i] == this)
			{
				console.log(this.getLatLng() + "!" + i);
				index = i;
				i = $scope.markers.length;
				
			}
		}

		$http.post( rajapinta_, { cmd: "getPages" })
		.success( function(data){

			kaikkiSivut = data;
			$scope.sivuVaihtoehdot = data;
		})
		.error( function(){
			alert( "error");
		});
		$scope.id = markersID[index];
		
		$http.post( rajapinta_, { cmd: "getPageLinked", id: $scope.id })
		.success( function(data){
			
			if( data == "not linked")
				$scope.valittuSivu = -1;
			else
				$scope.valittuSivu = data[0]["kp_sivut_id"];
			$("#verho").fadeIn("slow");

		})
		.error( function(){
			alert( "error");
		});
		
	}

	$scope.selectForMarker = function( sivu )
	{
		console.log($scope.id + " " +sivu.tunniste);

		$http.post( rajapinta_, { cmd: "linkPages", id: $scope.id, value: sivu.id })
		.success( function(data){
			
			console.log( "LinkPages"+data );
			$("#verho").fadeOut("slow");

		})
		.error( function(){
			alert( "error");
		});
	};

	$scope.verhoHide = function(){
		$("#verho").fadeOut("slow");
	};
	
	function piirraReitti(e){
		var tmp = [e.latitude,e.longitude];
		if( line_points.length > 0 )
		{
			var old = L.latLng( line_points[ line_points.length -1][0], line_points[ line_points.length -1][1] );
			var d = e.latlng.distanceTo( old );
			// PIIRTO RAJA 
			if( d > 5 )
				line_points.push( tmp );
			
			
		}
		else
			line_points.push( tmp );
			
		console.log( line_points );
		piirraLinja();
	}
	
	function piirraLinja()
	{
			
		var polyline_options = {
			  color: '#000'
		  };
		  if( polyline != null )
			map.removeLayer(polyline);
		  polyline = L.polyline(line_points, polyline_options).addTo(map);
		  //map.fitBounds(polyline.getBounds());
		  
	}
	
	$scope.tallennaReitti = function()
	{
		var yes = true;
		if( yes )
		{
			$http.post( rajapinta_, { cmd: "addReitti", id: $scope.siirto, value: line_points })
			.success( function(data){
				console.log( "Tallenna reitti\n"+data );
				var n = $('#noty').noty({text: 'Reitti tallennettu!', type:"success", timeout:"2000", dismissQueue:false});
				
			})
			.error( function(){
				alert( "error");
			});
		}
	}
	
	function haeReitti(){
		$http.post( rajapinta_, { cmd: "getReitti", id: $scope.siirto })
		.success( function(data){
			//line_points = data;
			//console.log( "hae reitti\n"+JSON.stringify(data) );
			for( var i = 0; i < data.length; ++i)
			{
				var tmp = [ parseFloat(data[i]["latitude"]), parseFloat(data[i]["longitude"]) ];
				line_points.push( tmp );
			}
			console.log( JSON.stringify(line_points) );
			piirraLinja();
		})
		.error( function(){
			alert( "error");
		});
	}
	$scope.tyhjennaReitti = function(){
		var y = false;
		var n = $('#noty').noty({text: 'Oletko varma että haluat tyhjentää reitin?', 
		type:"confirm", 
		dismissQueue: false,
		
		buttons: [
           {
               addClass: 'btn btn-primary', text: 'Ok', onClick: function ($noty) {
				
                   $noty.close();
                   
				   
				   $http.post( rajapinta_, { cmd: "addReitti", id: $scope.siirto, value: 0 })
					.success( function(data){
						$('#noty').noty({ text: 'Reitti poistettiin', type: 'success', timeout:"2000" });
						line_points = [];
						console.log( "poista reitti\n"+data );
						
					})
					.error( function(){
						$('#noty').noty({ text: 'Reitin poisto epäonnistui', type: 'error',timeout:"4000" });
						alert( "error");
					});
				   
               }
           },
           {
               addClass: 'btn btn-danger', text: 'Cancel', onClick: function ($noty) {
                   $noty.close();
                   $('#noty').noty({ text: 'Reittiä ei poistettu', type: 'error', timeout:"1000" });
				   
               }
           }
		   ]
		});

	};
	
	// CONTROLLIT
	
	// GPS TRACK
	L.Control.Track = L.Control.extend({
		options: {
			position: 'topleft',
		},

		onAdd: function (map) {
			var controlDiv = L.DomUtil.create('div', 'leaflet-control-track');
			L.DomEvent
				.addListener(controlDiv, 'click', L.DomEvent.stopPropagation)
				.addListener(controlDiv, 'click', L.DomEvent.preventDefault)
			.addListener(controlDiv, 'click', function () { $scope.track();
				
				if( $scope.gps )
					$(".leaflet-control-track-interior").css("background-color", "lightblue" );
				else
					$(".leaflet-control-track-interior").css("background-color", "#FFFFFF" );
					
			});

			var controlUI = L.DomUtil.create('div', 'leaflet-control-track-interior', controlDiv);
			controlUI.title = 'GPS päälle';
			return controlDiv;
		}
	});

	L.control.Track = function (options) {
		return new L.Control.Track(options);
	};
	
	L.Control.Marker = L.Control.extend({
		options: {
			position: 'topleft',
		},

		onAdd: function (map) {
			var controlDiv = L.DomUtil.create('div', 'leaflet-control-marker');
			L.DomEvent
				.addListener(controlDiv, 'click', L.DomEvent.stopPropagation)
				.addListener(controlDiv, 'click', L.DomEvent.preventDefault)
			.addListener(controlDiv, 'click', function () { $scope.lisaaMerkki();
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
				$scope.reittiPiirto = !$scope.reittiPiirto; 
				if( $scope.reittiPiirto )
					$(".leaflet-control-reitti-interior").css("background-color", "lightblue" );
				else
					$(".leaflet-control-reitti-interior").css("background-color", "#FFFFFF" );
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
					$scope.tyhjennaReitti();
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
					$scope.tallennaMerkit();
					
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
					$scope.tallennaReitti();
				});

			var controlUI = L.DomUtil.create('div', 'leaflet-control-savereitti-interior', controlDiv);
			controlUI.title = 'Tallenna reitti';
			return controlDiv;
		}
	});

	L.control.SaveReitti = function (options) {
		return new L.Control.SaveReitti(options);
	};
	

	function Reitti( route )
	{
		this.pisteet = route;
	}

  }]);