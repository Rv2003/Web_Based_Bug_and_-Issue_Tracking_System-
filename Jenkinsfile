// builds the images, starts the stack and checks that it answers
pipeline {
    // the uni pc agent runs as a normal user because docker is rootless there
    agent { label 'rootless-user-agent' }

    options {
        timeout(time: 25, unit: 'MINUTES')
    }

    // no checkout stage, jenkins already checks the repo out to read this file
    stages {
        stage('Build images') {
            steps {
                sh 'docker compose build'
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker compose up -d'
            }
        }

        stage('Smoke test') {
            steps {
                // the api and the frontend need a few seconds to come up
                sh '''
                    for i in 1 2 3 4 5 6 7 8 9 10 11 12; do
                        if curl -sf http://localhost:5000/api/issues > /dev/null && curl -sf http://localhost:3000 > /dev/null; then
                            echo "app is up"
                            exit 0
                        fi
                        sleep 5
                    done
                    echo "app did not come up"
                    exit 1
                '''
            }
        }

        stage('Seed demo data') {
            steps {
                sh 'docker compose exec -T backend npm run seed'
            }
        }
    }

    post {
        failure {
            sh 'docker compose logs --tail 50 || true'
        }
    }
}
