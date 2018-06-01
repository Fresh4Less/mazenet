def mazenetTest
def mazenetRelease 

pipeline {
    agent any
    stages {
        stage('test: build image') {
            steps {
                git branch: 'master', credentialsId: 'b79cf254-3342-4819-b613-78ae72cb8f08', url: 'https://github.com/fresh4less/mazenet'
                script {
                    mazenetTest = docker.build("mazenet-test:${env.BUILD_ID}", '--target builder .')
                }
            }
        }
        stage('test: run') {
            steps {
                script {
                    mazenetTest.inside {
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
            post {
                always {
                    junit 'server/junit.xml'
                    archiveArtifacts 'server/coverage/**/*'
                }
            }
        }
        stage('release: build') {
            steps {
                git branch: 'master', credentialsId: 'b79cf254-3342-4819-b613-78ae72cb8f08', url: 'https://github.com/fresh4less/mazenet'
                script {
                    mazenetRelease = docker.build("mazenet:${env.BUILD_ID}")
                }
            }
        }
    }
}
