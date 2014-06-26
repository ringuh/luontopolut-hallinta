'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
var appService = angular.module('myApp.services', []);
appService.value('version', '0.1');

appService.service('siirto', function(){
	this.alue = 9;
	this.rajapinta = "http://ohjryhma1.projects.tamk.fi/maps/v2/luontopolut-hallinta/php/rajapinta.php";
});
