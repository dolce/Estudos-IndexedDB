var latitude = "36.1038111",
	longitude = "-112.1253926";


DB.open('UTFPR', 1, function(){

	DB.getLastInsertedRegister('rotas', function(result){
		document.querySelector("#lastInsertedRouteID").innerHTML = result.id;
	});

});


document.querySelector("#startDatabase").addEventListener("click", function(){
	DB.open('UTFPR', 1);
});


document.querySelector("#dropDatabase").addEventListener("click", function(){
	DB.drop('UTFPR');
});


document.querySelector("#insertRoute").addEventListener("click", function(){

	DB.insertRoute(function(lastInsertedID){
		document.querySelector("#lastInsertedRouteID").innerHTML = lastInsertedID;
	});

});


document.querySelector("#insertCoordinates").addEventListener("click", function(){

	DB.getLastInsertedRegister('rotas', function(result){
		DB.insertCoordinates(result.id, latitude, longitude, "file.png");
	});

});


document.querySelector("#insertRouteCoordinates").addEventListener("click", function(){

	DB.insertRoute(function(lastInsertedID){
		alert("Rota inserida: "+ lastInsertedID);
		DB.insertCoordinates(lastInsertedID, latitude, longitude, "file.png");
		document.querySelector("#lastInsertedRouteID").innerHTML = lastInsertedID;
	});

});


document.querySelector("#removeRoute").addEventListener("click", function(){

	DB.getLastInsertedRegister('rotas', function(result){

		var lastID = prompt("Enter the ID of the route you want to remove", result.id);
		if(lastID != null){
			DB.removeRoute(lastID, function(){
				console.log("rota removida: "+lastID);

				DB.getLastInsertedRegister('rotas', function(result){
					document.querySelector("#lastInsertedRouteID").innerHTML = result.id;
				});

			});
		}
	});
});


document.querySelector("#removeCoordinates").addEventListener("click", function(){

	DB.getLastInsertedRegister('coordenadas', function(result){

		var lastID = prompt("Enter the ID of the route you want to remove the coordinates", result.rotaid);
		if(lastID != null){
			DB.removeCoordinates(lastID, function(){
				console.log("coordenadas removidas da rota: "+lastID)
			});
		}
	});
});


document.querySelector("#getLastInsertedRegister").addEventListener("click", function(){

	var tableName = prompt("Please enter table name ('rotas' or 'coordenadas')", "rotas");

	if(tableName != null){
		DB.getLastInsertedRegister(tableName, function(result){
			alert("Last inserted register ID for "+tableName+" is: " + result.id);
		});
	}


});


document.querySelector("#getCoordinates").addEventListener("click", function(){

	DB.getLastInsertedRegister('rotas', function(result){

		var routeID = prompt("Please enter Route ID", result.id);

		if(routeID != null){
			DB.getCoordinates(parseInt(routeID), function(result){
				console.table(result);

				document.querySelector("#result").innerHTML = "<p><b>id • data • latitude • longitude</b></p>";

				Array.prototype.forEach.call(result, function(el, i){
					document.querySelector("#result").innerHTML += "<p>" + el.id + " • " + el.data + " • " + el.lat + " • " + el.long +"</p>";
				});
			});
		}

	});

});



document.querySelector("#getRoute").addEventListener("click", function(){

	var routeID = prompt("Please enter Route ID", 1);
	if(routeID != null){
		DB.getRoute(routeID, function(result){
			console.info(result);
		});
	}

});


document.querySelector("#getRoutes").addEventListener("click", function(){

	DB.getRoutes(function(result){
		//console.table(result);
		document.querySelector("#result").innerHTML = "<p><b>id • data</b></p>";

		Array.prototype.forEach.call(result, function(el, i){
			document.querySelector("#result").innerHTML += "<p>" + el.id + " • " + el.data + "</p>";
		});
	});

});