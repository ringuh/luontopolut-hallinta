'use strict';

/* Controllers */

var appCtrl = angular.module('myApp.controllers', []);
appCtrl.controller('FrontCtrl', ['$scope', '$http', '$location', 'siirto', function($scope, $http, $location, siirto){
	var rajapinta_ = siirto.rajapinta;
	

	$http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";

		var getPaikat = function(){ $http.post( rajapinta_, { cmd: "getPaikat"})
		.success( function(data){
			//alert( data );
			$scope.alueet = data;
		})
		.error( function()
		{
			alert("error");
		});
	}

	$scope.makeAlue = function(){
		
		$http.post( rajapinta_, { cmd: "addPaikka", paikka: $scope.uusiAlue })
		.success( function(data){
			if( data.indexOf("success") != -1 )
			{
				
				$location.path("/asd");
			}
			else
				alert( data );
		})
		.error( function(){
			alert( "error");
		});
	};

	$scope.valitse = function(alue){
		siirto.alue = alue.ID;
		$location.path("/map");
	};
		
	getPaikat();
}]);
  

appCtrl.controller('naviCtrl', ['$scope', '$location', 
	function($scope, $location){
	


		$scope.goTo = function(url)
		{
			$location.path(url);
		};
}]);
