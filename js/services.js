'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
var appService = angular.module('myApp.services', []);
appService.value('version', '0.1');

appService.service('siirto', function(){
	this.alue = localStorage.getItem("valittuAlue");
	this.php = "http://ohjryhma1.projects.tamk.fi/maps/v2/luontopolut-hallinta/php/";
	this.rajapinta = this.php+"rajapinta.php";


	this.colors = ["b0b", 
					"0000FF", 
					"008B8B", 
					"DC143C", 
					"6495ED", 
					"9ACD32", 
					"FFFF00", 
					"4682B4" ];
});
