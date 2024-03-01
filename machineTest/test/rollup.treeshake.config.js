import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import filesize from 'rollup-plugin-filesize';
import terser from '@rollup/plugin-terser';
import { visualizer } from 'rollup-plugin-visualizer';
import { glsl } from '../utils/build/rollup.config.js';
import chalk from 'chalk';

const statsFile = path.resolve( 'machineRandomLine/treeshake/stats.html' );

function logStatsFile() {

	return {
		writeBundle() {

			console.log();
			console.log( 'Open the following url in a browser to analyze the tree-shaken bundle.' );
			console.log( chalk.blue.bold.underline( statsFile ) );
			console.log();

		}
	};

}

export default [
	{
		input: 'machineRandomLine/treeshake/index.js',
		plugins: [
			resolve(),
		],
		output: [
			{
				format: 'esm',
				file: 'machineRandomLine/treeshake/index.bundle.js'
			}
		]
	},
	{
		input: 'machineRandomLine/treeshake/index.js',
		plugins: [
			resolve(),
			terser(),
			filesize( {
				showMinifiedSize: false,
			} ),
		],
		output: [
			{
				format: 'esm',
				file: 'machineRandomLine/treeshake/index.bundle.min.js'
			}
		]
	},
	{
		input: 'machineRandomLine/treeshake/index-src.js',
		plugins: [
			glsl(),
			terser(),
			visualizer( {
				filename: statsFile,
			} ),
			logStatsFile(),
		],
		output: [
			{
				format: 'esm',
				file: 'machineRandomLine/treeshake/index-src.bundle.min.js'
			}
		]
	},
];
