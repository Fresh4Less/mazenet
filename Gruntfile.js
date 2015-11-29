//Gruntfile

var serverTestFiles = ['test/server/e2e/**/*.js']

module.exports = function(grunt) {

	//Config
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		env : {
			dev: {
				NODE_ENV: 'development',
			},
			test: {
				NODE_ENV: 'test'
			}
		},
		jshint : {
			options: {
			},
			test: {
				src: ['server/**/*.js', 'client/**/*.js'].concat(serverTestFiles)
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
		mochaTest: {
			test: {
				options: {
					reporter: 'spec',
					require: 'test/server/coverage/blanket'
				},
				src: serverTestFiles
			},
			coverage: {
				options: {
					reporter: 'html-cov',
					quiet: true,
					captureFile: 'logs/server-coverage.html'
				},
				src: serverTestFiles
			}
		}
	});
	
	grunt.loadNpmTasks('grunt-env');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-express-server');
	grunt.loadNpmTasks('grunt-mocha-test');
//	grunt.loadNpmTasks('grunt-contrib-uglify');
//	grunt.loadNpmTasks('grunt-contrib-sass');
//	grunt.loadNpmTasks('grunt-contrib-cssmin');
	
//	grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'sass', 'cssmin']);
	grunt.registerTask('default', ['env:dev', 'jshint', 'concat']);
	grunt.registerTask('dev', ['default', 'express:dev', 'watch:js']);
	grunt.registerTask('test', ['env:test', 'jshint', 'mochaTest']);
};
