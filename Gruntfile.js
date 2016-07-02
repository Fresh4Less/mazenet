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
				src: ['server/**/*.js'].concat(serverTestFiles)
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
		sass: {
			options: {
				sourceMap: false
			},
			dist: {
				files: {
					'client/MazenetStyles.css': 'client/styles/mazenet.scss'
				}
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
		},
		exec: {
			installTSD: 'typings install',
			compileTypescript: 'node node_modules/typescript/bin/tsc client/main.ts client/module.ts --m amd -t es5 --sourceMap',
			concatRequireFiles: 'node node_modules/requirejs/bin/r.js -o ' +
			'baseUrl=./client ' +
			'name=main ' +
			'out=./client/main-prod.js ' +
			'generateSourceMaps=true ' +
			'preserveLicenseComments=false ' +
			'paths.mazenet=module '
		}
	});
	grunt.loadNpmTasks('grunt-env');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-express-server');
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-exec');

	grunt.registerTask('build', ['sass', 'exec:installTSD', 'exec:compileTypescript']);
	grunt.registerTask('build-prod', ['sass', 'exec:installTSD', 'exec:compileTypescript', 'exec:concatRequireFiles']);

	grunt.registerTask('default', ['env:dev', 'jshint', 'concat']);
	grunt.registerTask('dev', ['default', 'express:dev', 'watch:js']);
	grunt.registerTask('test', ['env:test', 'jshint', 'mochaTest']);
//	grunt.registerTask('dev', ['concat', 'express:dev', 'watch:js']);

};
