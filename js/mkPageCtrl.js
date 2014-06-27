appCtrl.controller('mkPageCtrl', ['$scope', 'siirto', '$http', '$route', function($scope, siirto, $http, $route ) {
 	
 	var id = "";
 	var rajapinta_ = siirto.rajapinta;
 	$scope.rajapinta_ = siirto.rajapinta;
 	$scope.sivut = [];
 	$scope.select = -1;
 	$scope.kuvat = [];
 	$scope.php = "google.com";
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
 		$scope.select = $scope.sivuSpinner;
 		$scope.sivuNimi = "";
 		$scope.tekstiKentta = "";
 		$scope.textArea = "";
 		if( $scope.select == -1) // ei tehdä hakuja, mikäli ollaan lisäämässä uutta sivua
 			return;

 		for( var i in $scope.sivut) // haetaan oikea tunniste
 		{
 			if( $scope.sivut[i].id == $scope.select)
 				$scope.sivuNimi = $scope.sivut[i].nimi;
 		}
 		$http.post( siirto.php+"upload/"+$scope.select+"/index.html") // haetaan suomiteksti
			.success( function(data){
				$scope.tekstiKentta = data;
			})
			.error( function(){
				$('#noty').noty({text: "Virhe: tietojen lataus epäonnistui", type:"error", timeout:"2000", dismissQueue:false});
		});

		$http.post( siirto.php+"upload/"+$scope.select+"/index_eng.html") // haetaan english
			.success( function(data){
				$scope.textArea = data;
			})
			.error( function(){
				$('#noty').noty({text: "Virhe: tietojen lataus epäonnistui", type:"error", timeout:"2000", dismissQueue:false});
		});	

		haeTiedostot();	

 	};

 	function init(tru)
 	{
 		
 		
 		if( tru ){
 			$scope.select = -1;
 			$scope.sivuNimi = "";
	 		$scope.tekstiKentta = "";
	 		$scope.textArea = "";
	 	}

 		$http.post( rajapinta_, { 
 			cmd: "getPages"
 		})
		.success( function(data){
				//alert( data );
				$scope.sivut = data;
				haeTiedostot();
		})
		.error( function(){
			$('#noty').noty({text: "Virhe: sivujen lataus epäonnistui", type:"error", timeout:"2000", dismissQueue:false});
		});

 	}

 	function haeTiedostot()
 	{
 		$http.post( rajapinta_, { 
 			cmd: "getTiedostot",
 			id: $scope.select 
 		})
		.success( function(data){
				$scope.php = siirto.php+'upload/'+$scope.select;
				$scope.kuvat = data;
		})
		.error( function(){
			$('#noty').noty({text: "Virhe: sivun tiedostolistaus epäonnistui", type:"error", timeout:"2000", dismissQueue:false});
		});
 	}

 	$scope.poistaTiedosto = function(tiedosto)
 	{
 		
 		$http.post( rajapinta_, { 
 			cmd: "poistaTiedosto",
 			id: $scope.select,
 			value: tiedosto 
 		})
		.success( function(data){	
				
			if( data.indexOf("poistettiin") > -1) // poistettiin yksittäinen tiedosto
				haeTiedostot();
			else if( data.indexOf("success") > -1) // poistettiin koko sivu
				init(true);

		})
		.error( function(){
			$('#noty').noty({text: "Virhe: sivun tiedoston poisto epäonnistui", type:"error", timeout:"2000", dismissQueue:false});
		});
 	};

 	$scope.poistaSivu = function(){
 		var n = $('#noty').noty({text: 'Voit myös ylikirjoittaa sivun tiedot, joten oletko aivan varma että haluat poistaa koko sivun?', 
		type:"confirm", 
		dismissQueue: false,
		
		buttons: [
           {
               addClass: 'btn btn-primary', text: 'Ok', onClick: function ($noty) {
				
                   $noty.close();
                   
				   $scope.poistaTiedosto(null);
               }
           },
           {
               addClass: 'btn btn-danger', text: 'Cancel', onClick: function ($noty) {
                   $noty.close();
                   $('#noty').noty({ text: 'Sivua ei poistettu', type: 'warning', timeout:"1000" });
				   
               }
           }
		   ]
		});
 	}
}]);