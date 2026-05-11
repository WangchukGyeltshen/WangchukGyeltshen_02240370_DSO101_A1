def runNpm(String dirPath, String args) {
    dir(dirPath) {
        if (isUnix()) {
            sh "npm ${args}"
        } else {
            bat "npm ${args}"
        }
    }
}

pipeline {
    agent any
    tools {
        nodejs 'NodeJS'
    }
    stages {

        // Stage 1: Checkout Code
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/WangchukGyeltshen/WangchukGyeltshen_02240370_DSO101_A1.git',
                    credentialsId: 'github-creds'
            }
        }

        // Stage 2: Install BE Dependencies
        stage('Install BE') {
            steps {
                runNpm('BE', 'install')
            }
        }

        // Stage 3: Install FE Dependencies
        stage('Install FE') {
            steps {
                runNpm('FE', 'install')
            }
        }

        // Stage 4: Build BE
        stage('Build BE') {
            steps {
                runNpm('BE', 'run build')
            }
        }

        // Stage 5: Build FE
        stage('Build FE') {
            steps {
                runNpm('FE', 'run build')
            }
        }

        // Stage 6: Test BE
        stage('Test BE') {
            steps {
                runNpm('BE', 'test')
            }
            post {
                always {
                    junit 'BE/junit.xml'
                }
            }
        }

        // Stage 7: Test FE
        stage('Test FE') {
            steps {
                runNpm('FE', 'test')
            }
            post {
                always {
                    junit 'FE/junit.xml'
                }
            }
        }
    }

    post {
        success {
            echo 'All stages passed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check the logs above.'
        }
    }
}