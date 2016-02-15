var DB = function(){

	window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
	window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
	window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

	if(!window.indexedDB){
		console.warn("Seu navegador não oferece supote ao IndexedDB");
	}

	var db = null,
		dbHandle;

	return {

		open: function(databaseName, version, callback){

			DB.start(window.indexedDB.open(databaseName, version), callback);

		},
		close: function(){

			db.close(); // Close indexed DB

		},
		start: function(request, callback){

			request.onblocked = function(event) {
				// Se existe outra aba com a versão antiga
				alert("Existe uma versão antiga da web app aberta em outra aba, feche-a por favor!");
			};
			request.onerror = function(event) {
				console.log("Error opening DB", event);
			};
			request.onupgradeneeded = function(event) {
				console.info("Upgrading DB");
				db = event.target.result;
				// Cria um objectStore para conter a informação sobre as rotas e coordenadas. Foi criado "id" como KeyPath pois é único;
				var objectStore = db.createObjectStore("rotas", { keyPath: "id", autoIncrement: true });
					objectStore.createIndex("id", "id", { unique: true });
					objectStore.createIndex("data", "data", { unique: false });

				var objectStore = db.createObjectStore("coordenadas", {keyPath: "id", autoIncrement: true});
					objectStore.createIndex("id", "id", { unique: true });
					objectStore.createIndex("rotaid", "rotaid", { unique: false });
					objectStore.createIndex("data", "data", { unique: false });
					objectStore.createIndex("lat", "long", { unique: false });
					objectStore.createIndex("arquivo", "arquivo", { unique: false });

				// Usando transação oncomplete para afirmar que a criação do objectStore é terminada antes de adicionar algum dado nele.
				objectStore.transaction.oncomplete = function(event) {
					// Armazenando valores no novo objectStore.
					console.log(event);

					if (callback && typeof(callback) === "function") {
					    callback(db); // Last ID of table
					}

				}
				objectStore.transaction.onerror = function(event) {
					console.log("onerror: "+event);
				}

			};
			request.onsuccess  = function(event){
			    console.info("Success opening DB");
			    
			    db = event.target.result;
    			dbHandle = event.target.result;

				db.onerror = function(event) {
					// Função genérica para tratar os erros de todos os requests desse banco!
					console.log("Database error: " + event.target.errorCode);
				};

				if (callback && typeof(callback) === "function") {
				    callback(db); // Last ID of table
				}

			};

		},
		drop: function(databaseName, callback){

			try{
				DB.close(); // Close database before delete
			}catch(e){
				console.warn(e);
			}

			var req = indexedDB.deleteDatabase(databaseName); // Delete database after being closed

			req.onsuccess = function () {
			    console.info("Deleted " + databaseName + " successfully");

				if (callback && typeof(callback) === "function") {
				    callback(); // Last ID of table
				}

			};
			req.onerror = function () {
			    console.log("Couldn't delete database");
			};
			req.onblocked = function () {
			    console.log("Couldn't delete database due to the operation being blocked");
			};

		},
		getLastInsertedRegister: function(tableName, callback){

			var transaction = db.transaction([tableName]),
				objectStore = transaction.objectStore(tableName),
				index = objectStore.index("id"),
				openCursorRequest = index.openCursor(null, 'prev'),
        		result = null;

				openCursorRequest.onsuccess = function (event) {
				    if (event.target.result) {
				        result = event.target.result.value; //the object with max revision
				        console.log(result);
				    }
				};
				transaction.oncomplete = function (event) {
					if (callback && typeof(callback) === "function") {
					    callback(result); // Last ID of table
					}
				};
		},
		insertRoute: function(callback){

			var transaction = db.transaction(["rotas"],"readwrite"),
				objectStore = transaction.objectStore("rotas"),
				request = objectStore.add({
					data: DB.getDatetime()
				});

			request.onsuccess = function (event) {

				rotaid = event.target.result;
				console.info("Rota inserida: " + rotaid);

				if (callback && typeof(callback) === "function") {
			        callback(rotaid);
			    }

			};
			request.onerror = function (event) {
				console.log("Error Adding: ", event);
			};

		},
		insertCoordinates: function(routeID, lat, long, arquivo, callback){

			var transaction = db.transaction(["coordenadas"],"readwrite");
			
			transaction.oncomplete = function(event) {
				console.info("Coordenadas inseridas");

				if (callback && typeof(callback) === "function") {
			        callback();
			    }
			};
			transaction.onerror = function(event) {
				console.error("Erro ao inserir Coordenadas");
			};  
			var objectStore = transaction.objectStore("coordenadas");

			objectStore.add({rotaid: parseInt(routeID), data: DB.getDatetime(), lat: lat, long: long, arquivo: arquivo});

		},
		removeRoute: function(id, callback){ // remove one row

			var request = db.transaction(["rotas"], "readwrite")
			                .objectStore("rotas")
			                .delete(parseInt(id));
			request.onsuccess = function(event) {
				console.info('Rota: ' + id + ' removida');

				if (callback && typeof(callback) === "function") {
			        callback();
			    }
			};

		},
		removeCoordinates: function(routeID, callback){ // remove multiples rows
			//http://stackoverflow.com/questions/18603993/deleting-multiple-records-in-indexeddb-based-on-index

			var transaction = db.transaction(["coordenadas"],"readwrite"),
				objectStore = transaction.objectStore("coordenadas"),
				index = objectStore.index("rotaid");


			index.openCursor(IDBKeyRange.only(parseInt(routeID))).onsuccess = function(event) {
				var cursor = event.target.result;
				if (cursor) {
				    cursor.delete(cursor.primaryKey);
				    cursor.continue();
				} else {
					console.info('Coordenadas da rota: ' + routeID + ' removidas');

					if (callback && typeof(callback) === "function") {
				        callback();
				    }
				}
			};

		},
		getCoordinates: function(routeID, callback){

			var transaction = db.transaction(["coordenadas"]),
				objectStore = transaction.objectStore("coordenadas"),
				request = objectStore.get(1),
				items = [];

			index = objectStore.index("rotaid");
			
			index.openCursor(parseInt(routeID)).onsuccess = function(event) {

				var cursor = event.target.result;
				if (cursor) {
					items.push(cursor.value);
					cursor.continue();
				}
				else {
					//console.dir(items);

					if (callback && typeof(callback) === "function") {
				        callback(items);
				    }

				}

			};

			request.onerror = function(event) {
				console.error("getRotas error: " + event.target.errorCode);
			};


		},
		getRoutes: function(callback){

			var transaction = db.transaction(["rotas"]),
				objectStore = transaction.objectStore("rotas"),
				request = objectStore.get(1),
				items = [];

			objectStore.openCursor().onsuccess = function(event) {
				var cursor = event.target.result;
				if (cursor) {
					items.push(cursor.value);
					cursor.continue();
				}
				else {
					console.table(items);

					if (callback && typeof(callback) === "function") {
				        callback(items);
				    }
				}
			};
			request.onerror = function(event) {
				console.error("getRotas error: " + event.target.errorCode);
			};

		},
		getRoute: function(routeID, callback){

			var transaction = db.transaction(["rotas"]),
				objectStore = transaction.objectStore("rotas"),
				index = objectStore.index("id");
			
			index.get(parseInt(routeID)).onsuccess = function(event) {
				//console.dir(event.target.result);
				if (callback && typeof(callback) === "function") {
			        callback(event.target.result);
			    }
			};

		},
		getDatetime: function(){

			var date 	= new Date(),
				year    = date.getFullYear(),
				month   = date.getMonth()+1,
				day     = date.getDate(),
				hour    = date.getHours(),
				minute  = date.getMinutes(),
				second  = date.getSeconds(),
				datetimeNow = year+"-"+month+"-"+day+" "+hour+":"+minute+":"+second;

			return datetimeNow;

		}

	}
}();