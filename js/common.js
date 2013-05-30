"use strict";

var common = {

	localizacionActual: function(cb,err) 
	{
		if(err===undefined) 
			err=this.locationError;
		if(navigator.geolocation){
			navigator.geolocation.getCurrentPosition(cb, err);
		} else {
			cb({
				coords: {
					latitude: 40.0,
					longitude: -3.0
				}});
		}
	},

	locationError: function(error) {
		switch (error.code) {
			case error.PERMISSION_DENIED:
				alert("Sin permisos de localización");
				break;
			
			case error.POSITION_UNAVAILABLE:
				alert("Localización no disponible");
				break;

			case error.TIMEOUT:
				alert("Finalizado el tiempo de espera");
				break;

			default:
				alert("Error desconocido");
				break;
		}
	}
};
