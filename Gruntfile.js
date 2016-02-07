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
		},
		express: {
			dev: {
				options: {
					script: 'server/index.js'
				}
			}
		},
		watch: {
			options: {
				livereload: true	
			},
			js: {
				files: ['client/**/*.js', 'server/**/*.js'],
				tasks: ['concat', 'express:dev']
			}
		},
		typescript: {
			base: {
				src: ['client/**/*.ts'],
				dest: 'client/',
				options: {
					module: 'amd', //or commonjs
					target: 'es5', //or es3
					basePath: 'path/to/typescript/files',
					sourceMap: true,
					declaration: true
				}
			}
		}
	});
	
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-express-server');
	grunt.loadNpmTasks('grunt-typescript');
//	grunt.loadNpmTasks('grunt-contrib-uglify');
//	grunt.loadNpmTasks('grunt-contrib-sass');
//	grunt.loadNpmTasks('grunt-contrib-cssmin');
	
//	grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'sass', 'cssmin']);
	grunt.registerTask('default', ['jshint', 'concat']);
	grunt.registerTask('dev', ['concat', 'express:dev', 'watch:js']);
};
