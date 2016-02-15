//Gruntfile

module.exports = function(grunt) {

	//Config
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint : {
			options: {
			},
			test: {
				src: ['server/**/*.js']
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
			},
			sass: {
				files: ['client/styles/**/*.scss'],
				tasks: ['sass']
			}
		},
		typescript: {
			base: {
				src: ['client/**/*.ts'],
				options: {
					module: 'amd', //or commonjs
					target: 'es5', //or es3
					sourceMap: true,
					declaration: true
				}
			}
		},
		sass: {
			options: {
				sourceMap: true
			},
			dist: {
				files: {
					'client/MazenetStyles.css': 'client/styles/mazenet.scss'
				}
			}
		}
	});
	
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-express-server');
	grunt.loadNpmTasks('grunt-sass');
//	grunt.loadNpmTasks('grunt-typescript');
//	grunt.loadNpmTasks('grunt-contrib-uglify');
//	grunt.loadNpmTasks('grunt-contrib-cssmin');
	
//	grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'sass', 'cssmin']);
	grunt.registerTask('default', ['jshint']);
//	grunt.registerTask('client', ['sass']);
//	grunt.registerTask('dev', ['concat', 'express:dev', 'watch:js']);
};
