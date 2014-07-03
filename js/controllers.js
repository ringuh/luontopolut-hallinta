'use strict';

/* Controllers */

var appCtrl = angular.module('myApp.controllers', []);
appCtrl.controller('FrontCtrl', ['$scope', '$http', '$location', 'siirto', function($scope, $http, $location, siirto){
	var rajapinta_ = siirto.rajapinta;
	


	var getPaikat = function(){ $http.post( rajapinta_, { cmd: "getRadat"})
	.success( function(data){ // haetaan lista kohteista
			
			$scope.alueet = data;
		})
		.error( function()
		{
			$('#noty').noty({text: data, type:"paikkojen haku kusi", timeout:"2000", dismissQueue:false});
		});
	}

	$scope.makeAlue = function(){	// luodaan uusi rata
		
		$http.post( rajapinta_, { cmd: "addRata", id: $scope.uusiAlue })
		.success( function(data){
			if( data.indexOf("success") != -1 )
			{	// reloadataan paikat, mikäli onnistuttiin
				$scope.uusiAlue = "";	
				getPaikat();
			}
			else
				$('#noty').noty({text: data, type:"error", timeout:"2000", dismissQueue:false});
				
				
		})
		.error( function(){
			alert( "error");
		});
	};

	$scope.valitse = function(alue){
		localStorage.setItem("valittuAlue", alue.id);
		localStorage.setItem("valittuAlueNimi", alue.nimi);
		siirto.alue = alue.id;
		siirto.alueNimi = alue.nimi;

		$location.path("/map");
	};
	
	$(document).ready(function(){
		getPaikat();
	});	
	
}]);
  

appCtrl.controller('naviCtrl', ['$scope', '$location', 
	function($scope, $location){
	


		$scope.goTo = function(url)
		{
			$location.path(url);
		};
}]);
