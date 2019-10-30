def mazenetTest
def mazenetRelease 

pipeline {
    agent any
    stages {
        stage('test: build image') {
            steps {
                git branch: 'master', url: 'https://github.com/fresh4less/mazenet'
                script {
                    mazenetTest = docker.build("mazenet-test:${env.BUILD_ID}", '--network=host --target builder .')
                }
            }
        }
        stage('test: run') {
            steps {
                script {
                    mazenetTest.inside('--network=host') {
                        withEnv([
                        /* Override the npm cache directory to avoid: EACCES: permission denied, mkdir '/.npm' */
                        'npm_config_cache=npm-cache',
                        /* set home to our current directory because other bower
                        * nonsense breaks with HOME=/, e.g.:
                        * EACCES: permission denied, mkdir '/.config'
                        */
                        'HOME=.',
                        ]) {
                            sh 'npm install'
                            dir('./server') {
                                sh 'npm install'
                                sh 'npm install jest@23'
                                sh 'npm install jest-junit'
                                sh 'npm test -- --ci --testResultsProcessor="jest-junit" --forceExit --detectOpenHandles'
                            }
                        }
                    }
                }
            }
            post {
                always {
                    junit 'server/junit.xml'
                    archiveArtifacts 'server/coverage/**/*'
                }
            }
        }
        stage('docs: build') {
            steps {
                script {
                    mazenetTest.inside('--network=host') {
                         withEnv([
                        /* Override the npm cache directory to avoid: EACCES: permission denied, mkdir '/.npm' */
                        'npm_config_cache=npm-cache',
                        /* set home to our current directory because other bower
                        * nonsense breaks with HOME=/, e.g.:
                        * EACCES: permission denied, mkdir '/.config'
                        */
                        'HOME=.',
                        ]) {
                            dir('./server') {
                                sh 'npm install'
                                sh 'npm install gulp-cli'
                                sh 'node ./node_modules/gulp-cli/bin/gulp.js docs'
                            }
                        }
                    }
                }
            }
            post {
                always {
                    archiveArtifacts 'server/docs/**/*'
                }
            }
        }
        stage('release: build') {
            steps {
                git branch: 'master', url: 'https://github.com/fresh4less/mazenet'
                script {
                    mazenetRelease = docker.build("mazenet:${env.BUILD_ID}", '--network=host .')
                }
            }
        }
    }
}
