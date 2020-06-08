/**
 * @author mrdoob / http://mrdoob.com/
 */

var Storage = function ( useWebWorker ) {


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

	if ( window.Worker ) {

		var worker;
		var requestID = 0;
		var callbacks = {};

		var onmessageWebWorker = function ( e ) {

			if ( e.data && callbacks[ e.data.requestID ] ) {

				callbacks[ e.data.requestID ]( e.data.data );
				delete callbacks[ e.data.requestID ];

			}

		};

		var initWebWorker = function ( callback ) {

			worker = new Worker( "js/Storage.Worker.js" );
			worker.onmessage = onmessageWebWorker;
			callbacks[ ++ requestID ] = callback;
			worker.postMessage( { "requestID": requestID, function: "initDatabase" } );

		};

		var getWebWorker = function ( callback ) {

			callbacks[ ++ requestID ] = callback;
			worker.postMessage( { "requestID": requestID, "function": "getDatabase" } );

		};

		var setWebWorker = function ( data ) {

			worker.postMessage( { "requestID": ++ requestID, "function": "setDatabase", "data": data } );

		};

		var clearWebWorker = function ( ) {

			worker.postMessage( { "requestID": ++ requestID, "function": "clearDatabase" } );

		};

	}

	var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

	if ( indexedDB === undefined ) {

		console.warn( 'Storage: IndexedDB not available.' );
		return { init: function () {}, get: function () {}, set: function () {}, clear: function () {} };

	} else if ( useWebWorker ) {

		return { init: initWebWorker, get: getWebWorker, set: setWebWorker, clear: clearWebWorker };

	} else {

		return { init: initDatabase, get: getDatabase, set: setDatabase, clear: clearDatabase };

	}

};

export { Storage };

