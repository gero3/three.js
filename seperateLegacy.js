var esprima = require( "esprima" );
var esprimaWalker = require( "esprima-walk" );
var fs = require( "fs" );
var code = fs.readFileSync( "./src/Three.Legacy.js", "utf8" );
var ast = esprima.parseScript( code, { tolerant: true, range: true } );


var body = ast.body;
/*
{
            "type": "ImportDeclaration",
            "specifiers": [
                {
                    "type": "ImportSpecifier",
                    "local": {
                        "type": "Identifier",
                        "name": "Audio"
                    },
                    "imported": {
                        "type": "Identifier",
                        "name": "Audio"
                    }
                }
            ],
            "source": {
                "type": "Literal",
                "value": "./audio/Audio.js",
                "raw": "'./audio/Audio.js'"
            }
		}
	*/
var importstatements = body.filter( function ( statement ) {

	return statement.type === "ImportDeclaration";

} );

var imports = {};
importstatements.forEach( function ( importstatement ) {

	importstatement.specifiers.forEach( function ( specifier ) {

		imports[ specifier.imported.name ] = {
			specifier: specifier.imported.name,
			source: importstatement.source.value,
		};

	} );

} );

var exportstatements = body.filter( function ( statement ) {

	return statement.type === "ExportNamedDeclaration";

} );
/*{
	"type": "ExportNamedDeclaration",
	"declaration": null,
	"specifiers": [
		{
			"type": "ExportSpecifier",
			"exported": {
				"type": "Identifier",
				"name": "CubeGeometry"
			},
			"local": {
				"type": "Identifier",
				"name": "BoxGeometry"
			}
		}
	],
	"source": null
}
*/
/*
{
            "type": "ExportNamedDeclaration",
            "declaration": {
                "type": "FunctionDeclaration",
                "id": {
                    "type": "Identifier",
                    "name": "MeshFaceMaterial"
                },
                "params": [
                    {
                        "type": "Identifier",
                        "name": "materials"
                    }
                ],
                "body": {
                    "type": "BlockStatement",
                    "body": ...
                },
                "generator": false,
                "expression": false,
                "async": false
            },
            "specifiers": [],
            "source": null
        },
*/


exportstatements.forEach( function ( exportstatement ) {

	var exportVariable = "";
	if ( exportstatement.declaration && exportstatement.declaration.type === "FunctionDeclaration" ) {

		exportVariable = exportstatement.declaration.id.name;

	} else if ( exportstatement.specifiers && exportstatement.specifiers[ 0 ] ) {

		exportVariable = exportstatement.specifiers[ 0 ].exported.name;

	} else if (
		exportstatement.declaration &&
		exportstatement.declaration.type === "VariableDeclaration" &&
		exportstatement.declaration.declarations[ 0 ].init.type === "ObjectExpression"
	) {

		exportVariable = exportstatement.declaration.declarations[ 0 ].id.Name;

	}
	if ( exportVariable !== "" ) {

		var path = CreatePath( exportVariable );
		var identifiers = getAllIdentifiers( exportstatement );
		var importString = "";
		identifiers.forEach( function ( identifier ) {

			if ( imports[ identifier ] ) {

				importString += CreateImport( identifier );

			}

		} );
		var code = CreateCodeFromStatement( exportstatement );

		fs.writeFileSync( path, importString + "\n\n" + code + "\n" );


	} else {

		var code = CreateCodeFromStatement( exportstatement );
		console.log( code );

	}


} );



console.log( body.length );




function CreatePath( ObjectName ) {

	return "./src/_legacy/" + ObjectName + ".js";

}

function CreateImport( ImportName ) {

	return "import { " + ImportName + " } from \"." + imports[ ImportName ].source + "\";\n";

}

function CreateCodeFromStatement( statement ) {

	return code.substring( statement.range[ 0 ], statement.range[ 1 ] );

}

function getAllIdentifiers( statement ) {

	var identifiers = [];
	esprimaWalker( statement, function ( s ) {

		if ( s.type === "Identifier" ) {

			identifiers.push( s.name );

		}

	} );
	return identifiers;

}
