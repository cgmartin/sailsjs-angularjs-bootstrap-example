/**
 * Compiles LESS files into CSS.
 *
 * ---------------------------------------------------------------
 *
 * Only the `assets/styles/importer.less` is compiled.
 * This allows you to control the ordering yourself, i.e. import your
 * dependencies, mixins, variables, resets, etc. before other stylesheets)
 *
 * For usage docs see:
 * 		https://github.com/gruntjs/grunt-contrib-less
 */
module.exports = function(grunt) {

	grunt.config.set('less', {
    bootstrap: {
      options: {
        paths: ['assets/linker/styles', 'bower_components/bootstrap/less']
      },
      files: [
        { '.tmp/public/linker/styles/bootstrap.css': 'assets/linker/styles/bootstrap.less' }
      ]
    },
    fontawesome: {
      options: {
        paths: ['assets/linker/styles', 'bower_components/font-awesome/less']
      },
      files: [
        { '.tmp/public/linker/styles/font-awesome.css': 'assets/linker/styles/font-awesome.less' }
      ]
    }
  });

	grunt.loadNpmTasks('grunt-contrib-less');
};
