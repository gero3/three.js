/**
 * @author mrdoob / http://mrdoob.com/
 */

var Storage = function ( ) {


	var name = 'threejs-editor';
	var version = 1;

	var database;

	var initDatabase = function initDatabase( callback ) {

		var request = indexedDB.open( name, version );
		request.onupgradeneeded = function ( event ) {

			var db = event.target.result;

			if ( db.objectStoreNames.contains( 'states' ) === false ) {

				db.createObjectStore( 'states' );

			}

		};

		request.onsuccess = function ( event ) {

			database = event.target.result;

			callback();

		};

		request.onerror = function ( event ) {

			console.error( 'IndexedDB', event );

		};

	};

	var getDatabase = function ( callback ) {

		var transaction = database.transaction( [ 'states' ], 'readwrite' );
		var objectStore = transaction.objectStore( 'states' );
		var request = objectStore.get( 0 );
		request.onsuccess = function ( event ) {

			callback( event.target.result );

		};

	};

	var setDatabase = function ( data ) {

		var start = performance.now();

		var transaction = database.transaction( [ 'states' ], 'readwrite' );
		var objectStore = transaction.objectStore( 'states' );
		var request = objectStore.put( data, 0 );
		request.onsuccess = function () {

			console.log( '[' + /\d\d\:\d\d\:\d\d/.exec( new Date() )[ 0 ] + ']', 'Saved state to IndexedDB. ' + ( performance.now() - start ).toFixed( 2 ) + 'ms' );

		};

	};

	var clearDatabase = function () {

		if ( database === undefined ) return;

		var transaction = database.transaction( [ 'states' ], 'readwrite' );
		var objectStore = transaction.objectStore( 'states' );
		var request = objectStore.clear();
		request.onsuccess = function () {

			console.log( '[' + /\d\d\:\d\d\:\d\d/.exec( new Date() )[ 0 ] + ']', 'Cleared IndexedDB.' );

		};

	};


	var indexedDB = self.indexedDB || self.mozIndexedDB || self.webkitIndexedDB || self.msIndexedDB;

	if ( indexedDB === undefined ) {

		console.warn( 'Storage: IndexedDB not available.' );
		return { init: function () {}, get: function () {}, set: function () {}, clear: function () {} };

	} else {

		return { init: initDatabase, get: getDatabase, set: setDatabase, clear: clearDatabase };

	}

};

var storage;

onmessage = function ( e ) {

	if ( ! e.data ) {

		console.warn( "No data sent" );

	} else if ( e.data.function == "initDatabase" ) {

		storage = new Storage();
		storage.init( function () {

			postMessage( { "requestID": e.data.requestID, function: "initDatabase" } );

		} );

	} else if ( e.data.function == "getDatabase" ) {

		storage.get( function ( data ) {

			postMessage( { "requestID": e.data.requestID, function: "getDatabase", data: data } );

		} );

	} else if ( e.data.function == "setDatabase" ) {

		storage.set( e.data.data );

	} else if ( e.data.function == "clearDatabase" ) {

		storage.clear( );

	} else {

		console.error( "storage.worker has no function" );

	}



};


