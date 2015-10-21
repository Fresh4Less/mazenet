//Gruntfile

module.exports = function(grunt) {

	//Config
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint : {
			options: {
			},
			test: {
				src: ['server/**/*.js', 'client/**/*.js']
			}
		},
		concat : {
			options: {
				separator: ";\n",
				banner: "/*MAZENET - Fresh4Less [ Elliot Hatch, Samuel Davidson ]*/\n\n"
			},
			dist: {
				src: ['client/**/*.js'],
				dest: 'dist/mazenet.js',
			} 
		}
	});
	
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
//	grunt.loadNpmTasks('grunt-contrib-uglify');
//	grunt.loadNpmTasks('grunt-contrib-sass');
//	grunt.loadNpmTasks('grunt-contrib-cssmin');
	
//	grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'sass', 'cssmin']);
	grunt.registerTask('default', ['test']);
	grunt.registerTask('test', ['jshint']);
};
