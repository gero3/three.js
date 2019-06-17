
import istanbul from 'rollup-plugin-istanbul';

function glsl() {

	return {

		transform( code, id ) {

			if ( /\.glsl$/.test( id ) === false ) return;

			var transformedCode = 'export default ' + JSON.stringify(
				code
					.replace( /[ \t]*\/\/.*\n/g, '' )
					.replace( /[ \t]*\/\*[\s\S]*?\*\//g, '' )
					.replace( /\n{2,}/g, '\n' )
			) + ';';
			return {
				code: transformedCode,
				map: { mappings: '' }
			};

		}

	};

}

export default [
	// editor unit conf
	{
		input: 'test/three.editor.unit.js',
		plugins: [
			glsl(),
			istanbul({
				include: ['editor/**/*.js'],
				exclude: ['test/**/*.js']
			})
		],
		// sourceMap: true,
		output: [
			{
				format: 'umd',
				name: 'THREE',
				file: 'test/unit/three.editor.unit.js',
				intro: 'QUnit.module( "Editor", () => {',
				outro: '} );',
				indent: '\t',
			}
		]
	},
	// example unit conf
	{
		input: 'test/three.example.unit.js',
		plugins: [
			glsl(),
			istanbul({
				include: ['examples/**/*.js'],
				exclude: ['test/**/*.js']
			})
		],
		// sourceMap: true,
		output: [
			{
				format: 'umd',
				name: 'THREE',
				file: 'test/unit/three.example.unit.js',
				intro: 'QUnit.module( "Example", () => {',
				outro: '} );',
				indent: '\t',
			}
		]
	},
	// source unit conf
	{
		input: 'test/three.source.unit.js',
		plugins: [
			glsl(),
			istanbul({
				include: ['src/**/*.js'],
				exclude: ['test/**/*.js']
			})
		],
		// sourceMap: true,
		output: [
			{
				format: 'umd',
				name: 'THREE',
				file: 'test/unit/three.source.unit.js',
				intro: 'QUnit.module( "Source", () => {',
				outro: '} );',
				indent: '\t',
			}
		]
	},
];
