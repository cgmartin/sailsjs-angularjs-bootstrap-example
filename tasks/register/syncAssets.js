module.exports = function (grunt) {
	grunt.registerTask('syncAssets', [
		'jst:dev',
		'less',
		'sync:dev',
		'coffee:dev'
	]);
};
