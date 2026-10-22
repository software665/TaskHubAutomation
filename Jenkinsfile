// TaskHub UI automation - Playwright pipeline
// The job parameters are written to .env, which playwright.config.ts loads before the tests run.

// Runs a command with sh on Linux/macOS agents and bat on Windows agents
def runCommand(String command, boolean returnStatus = false) {
    if (isUnix()) {
        return sh(script: command, returnStatus: returnStatus)
    }
    return bat(script: command, returnStatus: returnStatus)
}

pipeline {
    agent any

    options {
        timeout(time: 60, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20'))
        // Tests create and delete tasks on a shared server, so avoid overlapping runs
        disableConcurrentBuilds()
    }

    parameters {
        string(name: 'BASE_URL', defaultValue: 'https://taskhub.azcentrix.com:4453',
               description: 'TaskHub application URL the tests run against (no trailing slash)')
        string(name: 'LOGIN_URL', defaultValue: '/login',
               description: 'Login page path, appended to BASE_URL')
        string(name: 'TEST_TAG', defaultValue: '',
               description: 'Run only tests with this tag, e.g. @smoke or @regression. Leave empty to run all tests.')
        string(name: 'TEST_PATH', defaultValue: '',
               description: 'Optional spec file or folder, e.g. tests/taskhub/login. Leave empty to run everything under tests/.')
        booleanParam(name: 'HEADLESS', defaultValue: true,
                     description: 'Run the browser without a window (keep ticked on CI agents)')
    }

    environment {
        // playwright.config.ts uses CI for retries, a single worker and forbidOnly
        CI = 'true'
    }

    stages {
        stage('Install Dependencies') {
            steps {
                script {
                    runCommand('node -v')
                    runCommand('npm ci')
                    runCommand('npx playwright install chromium')
                }
            }
        }

        stage('Write .env') {
            steps {
                script {
                    def baseUrl = params.BASE_URL.trim().replaceAll('/+$', '')
                    def loginUrl = params.LOGIN_URL.trim()

                    writeFile file: '.env', text: """BASE_URL=${baseUrl}
LOGIN_URL=${loginUrl}
HEADLESS=${params.HEADLESS}
"""
                    echo "Tests will run against ${baseUrl}${loginUrl} (headless: ${params.HEADLESS})"
                }
            }
        }

        stage('Clean Old Results') {
            steps {
                dir('allure-results') { deleteDir() }
                dir('playwright-report') { deleteDir() }
                dir('custom-report') { deleteDir() }
                dir('test-results') { deleteDir() }
            }
        }

        stage('Run Playwright Tests') {
            steps {
                script {
                    def command = 'npx playwright test --project=chromium'
                    if (params.TEST_PATH?.trim()) {
                        command += " ${params.TEST_PATH.trim()}"
                    }
                    if (params.TEST_TAG?.trim()) {
                        command += " --grep \"${params.TEST_TAG.trim()}\""
                    }

                    def status = runCommand(command, true)
                    if (status != 0) {
                        // Keep the build going so the reports below still get published
                        unstable("Playwright exited with code ${status} - check the reports for failed tests")
                    }
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'playwright-report/**, custom-report/**, test-results/**',
                             allowEmptyArchive: true

            publishHTML(target: [
                reportName           : 'Playwright Report',
                reportDir            : 'playwright-report',
                reportFiles          : 'index.html',
                keepAll              : true,
                alwaysLinkToLastBuild: true,
                allowMissing         : true
            ])

            publishHTML(target: [
                reportName           : 'Custom QA Report',
                reportDir            : 'custom-report',
                reportFiles          : 'index.html',
                keepAll              : true,
                alwaysLinkToLastBuild: true,
                allowMissing         : true
            ])

            allure(includeProperties: false, results: [[path: 'allure-results']])
        }
    }
}
