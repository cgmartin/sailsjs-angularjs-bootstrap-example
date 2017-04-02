module.exports = function (grunt) {
	grunt.registerTask('compileAssets', [
		'clean:dev',
		'jst:dev',
		'less',
		'copy:dev',
		'coffee:dev'
	]);
};
