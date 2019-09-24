var esprima = require( "esprima" );
var esprimaWalker = require( "esprima-walk" );
var fs = require( "fs" );
var code = fs.readFileSync( "./src/Three.Legacy.js", "utf8" );
var ast = esprima.parseScript( code, { tolerant: true, range: true } );


var outputList = [];

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


var todo = body.filter( function ( s ) {

	return importstatements.indexOf( s ) === - 1;

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

		exportVariable = exportstatement.declaration.declarations[ 0 ].id.name;

	}
	if ( exportVariable !== "" ) {

		addToOuputList( exportVariable, exportstatement, exportVariable );

	} else {

		var code = CreateCodeFromStatement( exportstatement );
		console.log( code );

	}


} );



todo = todo.filter( function ( s ) {

	return exportstatements.indexOf( s ) === - 1;

} );


var assignmentstatements = body.filter( function ( statement ) {

	return statement.type === "ExpressionStatement" && statement.expression.type === "AssignmentExpression" && statement.expression.operator === "=";

} ).map( function ( statement ) {

	return statement.expression;

} );

assignmentstatements.forEach( function ( assignmentstatement ) {

	var assignmentvariable = "";
	if ( assignmentstatement.left.type === "MemberExpression" && assignmentstatement.left.object.type === "Identifier" ) {

		assignmentvariable = assignmentstatement.left.object.name;

	} else if (
		assignmentstatement.left.type === "MemberExpression" &&
		assignmentstatement.left.object.type === "MemberExpression" &&
		assignmentstatement.left.object.object.type === "Identifier" ) {

		assignmentvariable = assignmentstatement.left.object.object.name;

	}

	if ( assignmentvariable !== "" ) {

		addToOuputList( assignmentvariable, assignmentstatement );

	} else {

		var code = CreateCodeFromStatement( assignmentstatement );
		console.log( code );

	}

} );

todo = todo.filter( function ( s ) {

 	return assignmentstatements.indexOf( s.expression ) === - 1;

} );


var objectAssignstatements = body.filter( function ( statement ) {

	return statement.type === "ExpressionStatement" &&
	statement.expression.type === "CallExpression" &&
	statement.expression.callee.type === "MemberExpression" &&
	statement.expression.callee.object.name === "Object" &&
	statement.expression.callee.property.name === "assign";

} ).map( function ( statement ) {

	return statement.expression;

} );

objectAssignstatements.forEach( function ( objectAssignstatement ) {

	var assignmentvariable = "";
	if ( objectAssignstatement.arguments.length === 2 &&
		objectAssignstatement.arguments[ 0 ].type === "MemberExpression" &&
		objectAssignstatement.arguments[ 0 ].property.name === "prototype" ) {

		assignmentvariable = objectAssignstatement.arguments[ 0 ].object.name;

	} else if ( objectAssignstatement.arguments.length === 2 &&
		objectAssignstatement.arguments[ 0 ].type === "Identifier" ) {

		assignmentvariable = objectAssignstatement.arguments[ 0 ].name;

	}
	if ( assignmentvariable !== "" ) {

		addToOuputList( assignmentvariable, objectAssignstatement );

	} else {

		var code = CreateCodeFromStatement( objectAssignstatement );
		console.log( code );

	}

} );

todo = todo.filter( function ( s ) {

	return objectAssignstatements.indexOf( s.expression ) === - 1;

} );


var objectDefinePropertiesStatements = body.filter( function ( statement ) {

	return statement.type === "ExpressionStatement" &&
	statement.expression.type === "CallExpression" &&
	statement.expression.callee.type === "MemberExpression" &&
	statement.expression.callee.object.name === "Object" &&
	statement.expression.callee.property.name === "defineProperties";

} ).map( function ( statement ) {

	return statement.expression;

} );

objectDefinePropertiesStatements.forEach( function ( objectDefinePropertiesStatement ) {

	var assignmentvariable = "";
	if ( objectDefinePropertiesStatement.arguments.length === 2 &&
		objectDefinePropertiesStatement.arguments[ 0 ].type === "MemberExpression" &&
		objectDefinePropertiesStatement.arguments[ 0 ].property.name === "prototype" ) {

		assignmentvariable = objectDefinePropertiesStatement.arguments[ 0 ].object.name;

	} else if ( objectDefinePropertiesStatement.arguments.length === 2 &&
		objectDefinePropertiesStatement.arguments[ 0 ].type === "Identifier" ) {

		assignmentvariable = objectDefinePropertiesStatement.arguments[ 0 ].name;

	}
	if ( assignmentvariable !== "" ) {

		addToOuputList( assignmentvariable, objectDefinePropertiesStatement );

	} else {

		var code = CreateCodeFromStatement( objectDefinePropertiesStatement );
		console.log( code );

	}

} );

todo = todo.filter( function ( s ) {

	return objectDefinePropertiesStatements.indexOf( s.expression ) === - 1;

} );



var objectDefinePropertyStatements = body.filter( function ( statement ) {

	return statement.type === "ExpressionStatement" &&
	statement.expression.type === "CallExpression" &&
	statement.expression.callee.type === "MemberExpression" &&
	statement.expression.callee.object.name === "Object" &&
	statement.expression.callee.property.name === "defineProperty";

} ).map( function ( statement ) {

	return statement.expression;

} );

objectDefinePropertyStatements.forEach( function ( objectDefinePropertyStatement ) {

	var assignmentvariable = "";
	if ( objectDefinePropertyStatement.arguments.length === 3 &&
		objectDefinePropertyStatement.arguments[ 0 ].type === "MemberExpression" &&
		objectDefinePropertyStatement.arguments[ 0 ].property.name === "prototype" ) {

		assignmentvariable = objectDefinePropertyStatement.arguments[ 0 ].object.name;

	} else if ( objectDefinePropertyStatement.arguments.length === 3 &&
		objectDefinePropertyStatement.arguments[ 0 ].type === "Identifier" ) {

		assignmentvariable = objectDefinePropertyStatement.arguments[ 0 ].name;

	}
	if ( assignmentvariable !== "" ) {

		addToOuputList( assignmentvariable, objectDefinePropertyStatement );

	} else {

		var code = CreateCodeFromStatement( objectDefinePropertyStatement );
		console.log( code );

	}

} );

todo = todo.filter( function ( s ) {

	return objectDefinePropertyStatements.indexOf( s.expression ) === - 1;

} );





console.log( todo.length );
if ( todo.length > 0 ) {

	console.log( CreateCodeFromStatement( todo[ 0 ] ) );
	throw "";

}

var outputListObject = {};

outputList.forEach( function ( output ) {

	if ( outputListObject[ output.path ] ) {

		outputListObject[ output.path ].push( output );

	} else {

		outputListObject[ output.path ] = [ output ];

	}

} );

Object.keys( outputListObject ).forEach( function ( path ) {

	var list = outputListObject[ path ];
	var importStrings = [];
	list.forEach( function ( listItem ) {

		listItem.importStrings.forEach( function ( importString ) {

			importStrings.push( importString );

		} );

	} );

	importStrings = importStrings.filter( function ( value, index, self ) {

		return self.indexOf( value ) === index;

	} );

	var codes = list.sort( function ( a, b ) {

		return b.startIndex - a.startIndex;

	} ).map( function ( item ) {

		return item.code;

	} );

	fs.writeFileSync( path, importStrings.join( "" ) + "\n" + codes.join( "\n\n" ) + "\n" );


} );

var legacyFile = [];
Object.keys( outputListObject ).reverse().forEach( function ( path ) {

	var list = outputListObject[ path ];

	var exportItem = list.find( function ( item ) {

		return item.exportvariable !== undefined;

	} );

	if ( exportItem === undefined ) {

		legacyFile.push( "import \".\/" + list[ 0 ].variable + "\";\n" );

	} else {

		legacyFile.push( "export * from \".\/" + list[ 0 ].variable + "\";\n" );

	}

} );

fs.writeFileSync( "./src/_legacy/Legacy.js", legacyFile.join( "" ) );


function CreatePath( ObjectName ) {

	if ( ! fs.existsSync( "./src/_legacy/" ) ) {

		fs.mkdirSync( "./src/_legacy/" );

	}

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

function addToOuputList( variable, statement, exportvariable ) {

	var path = CreatePath( variable );
	var identifiers = getAllIdentifiers( statement );
	var importStrings = [];
	identifiers.forEach( function ( identifier ) {

		if ( imports[ identifier ] ) {

			importStrings.push( CreateImport( identifier ) );

		}

	} );
	var code = CreateCodeFromStatement( statement );

	outputList.push( {
		path: path,
		importStrings: importStrings,
		statement: statement,
		code: code,
		startIndex: statement.range[ 0 ],
		exportvariable: exportvariable,
		variable: variable
	} );

}
