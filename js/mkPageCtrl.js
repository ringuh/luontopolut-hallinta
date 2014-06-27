appCtrl.controller('mkPageCtrl', ['$scope', 'siirto', '$http', '$route', function($scope, siirto, $http, $route ) {
 	
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
 			cmd: "savePage", value: $scope.tekstiKentta, eng: $scope.textArea,
 			id: $scope.sivuSpinner, tunniste: $scope.sivuNimi 
 		})
		.success( function(data){
			//alert( data );
			
			//init();

			if( !isNaN(data) )
			{
				$scope.select = data;
				$('#noty').noty({text: "Sivu tallennettiin", type:"success", timeout:"2000", dismissQueue:false});

			}
			else
				$('#noty').noty({text: data, type:"error", timeout:"2000", dismissQueue:false});

			init();
		})
		.error( function(){
			$('#noty').noty({text: "Virhe: sivua ei tallennettu", type:"error", timeout:"2000", dismissQueue:false});
		});
 	};

 	$scope.sivuValittu = function(){
 		var nro = $scope.sivuSpinner;
 		$scope.sivuNimi = "";
 		$scope.tekstiKentta = "";
 		$scope.textArea = "";
 		if( nro == -1) // ei tehdä hakuja, mikäli ollaan lisäämässä uutta sivua
 			return;

 		for( var i in $scope.sivut) // haetaan oikea tunniste
 		{
 			if( $scope.sivut[i].id == nro)
 				$scope.sivuNimi = $scope.sivut[i].nimi;
 		}
 		$http.post( siirto.php+"upload/"+nro+"/index.html") // haetaan suomiteksti
			.success( function(data){
				$scope.tekstiKentta = data;
			})
			.error( function(){
				$('#noty').noty({text: "Virhe: tietojen lataus epäonnistui", type:"error", timeout:"2000", dismissQueue:false});
		});

		$http.post( siirto.php+"upload/"+nro+"/index_eng.html") // haetaan english
			.success( function(data){
				$scope.textArea = data;
			})
			.error( function(){
				$('#noty').noty({text: "Virhe: tietojen lataus epäonnistui", type:"error", timeout:"2000", dismissQueue:false});
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