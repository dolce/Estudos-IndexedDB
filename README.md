# Estudos-IndexedDB
Foram utilizadas duas tabelas para os estudos relacionados a **API IndexedDB**, *Rotas* e *Coordenadas*.
Para inserir determinados registros de coordenadas obrigatóriamente deverá existir anteriormente um registro de rota.

_____
Simple library easy to use.

* DB.**open**(databaseName, version, *callback*);

* DB.**close**();

* DB.**drop**(databaseName, *callback*);

* DB.**getLastInsertedRegister**(tableName, *callback*);

* DB.**insertCoordinates**(routeID, lat, long, file, *callback*);

* DB.**insertRoute**(*callback*);

* DB.**removeRoute**(routeID, *callback*);

* DB.**removeCoordinates**(routeID, *callback*);

* DB.**getCoordinates**(routeID, *callback*);

* DB.**getRoute**(routeID, *callback*);

* DB.**getRoutes**(*callback*);