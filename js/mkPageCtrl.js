appCtrl.controller('mkPageCtrl', ['$scope', 'siirto', '$http', '$route', function($scope, siirto, $http, $route ) {
 	$scope.moi = "jou mkpage";
 	var id = "";
 	var rajapinta_ = siirto.rajapinta;
 	$scope.rajapinta_ = siirto.rajapinta;
 	$scope.sivut = [];
 	$scope.select = -1;
 	$scope.kuvat = [];
 	init();

 	$scope.savePage = function(){
 		//alert("save"+rajapinta_);
 		$http.post( rajapinta_, { 
 			cmd: "savePage", value: $scope.tekstiKentta, 
 			id: $scope.sivuSpinner, tunniste: $scope.sivuNimi 
 		})
		.success( function(data){
				alert( data );
				
				init();

				if( !isNaN(data) )
					$scope.select = data;
				else
					alert( data );

		})
		.error( function(){
			alert( "error");
		});
 	};

 	$scope.sivuValittu = function(){
 		var nro = $scope.sivuSpinner;
 		$scope.sivuNimi = "";
 		$scope.tekstiKentta = "";
 		if( nro != -1)
 			$http.post( rajapinta_, { 
	 			cmd: "getPage", id: nro
	 		})
			.success( function(data){
				$scope.select = nro;
				
				
				$scope.sivuNimi = data["stuff"][0].tunniste;
				$scope.tekstiKentta = data["html"];
				$scope.kuvat = data['dir'];
				alert( JSON.stringify(data['dir']));
			})
			.error( function(){
				alert( "error");
			});
		

 	};

 	function init()
 	{
 		$http.post( rajapinta_, { 
 			cmd: "getPages"
 		})
		.success( function(data){
				//alert( data );
				$scope.sivut = data;
		})
		.error( function(){
			alert( "error");
		});
 	}
}]);