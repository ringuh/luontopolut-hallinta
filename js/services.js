'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
var appService = angular.module('myApp.services', []);
appService.value('version', '0.1');

appService.service('siirto', function(){
	this.alue = localStorage.getItem("valittuAlue");
	this.alueNimi = localStorage.getItem("valittuAlueNimi");
	this.php = "http://ohjryhma1.projects.tamk.fi/maps/v2/luontopolut-hallinta/php/";
	this.rajapinta = this.php+"rajapinta.php";


	this.colors = ["b0b", 
					"4169E1", 
					"008B8B", 
					"DC143C", 
					"00FFFF", 
					"9ACD32", 
					"FFFF00", 
					"A0522D",
					"FFFAFA",
					"FFA500" ];
});
