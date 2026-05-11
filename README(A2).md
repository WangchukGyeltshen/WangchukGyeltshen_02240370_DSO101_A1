# Assignment 2 – CI/CD Pipeline with Jenkins (DSO101)

## Overview

This project extends the to-do list application from Assignment 1 by integrating a fully automated CI/CD pipeline using Jenkins. The pipeline automates code checkout, dependency installation, building, unit testing, and Docker deployment.

---

## Pipeline Configuration

### 1. Jenkins Setup

- Installed Jenkins and ran it locally on `localhost:8080`.
- Installed the following plugins via **Manage Jenkins > Plugins > Available**:
  - **NodeJS Plugin** – to run `npm` commands within the pipeline
  - **Pipeline** – to support `Jenkinsfile`-based declarative pipelines
  - **GitHub Integration** – to connect Jenkins with the GitHub repository
  - **Docker Pipeline** – to build and push Docker images
- Configured Node.js (LTS v20.x) under **Manage Jenkins > Tools > NodeJS**.

### 2. GitHub Repository Setup

- The Node.js to-do app from Assignment 1 was pushed to GitHub.
- A **Personal Access Token (PAT)** was generated with `repo` and `admin:repo_hook` permissions.
- The PAT was added to Jenkins under **Manage Jenkins > Credentials** as a Username & Password credential.

### 3. Jenkinsfile

A `Jenkinsfile` was created at the root of the repository defining the following stages:

| Stage | Description |
|---|---|
| **Checkout** | Pulls the latest code from the `main` branch on GitHub |
| **Install** | Runs `npm install` to install all dependencies |
| **Build** | Runs `npm run build` to compile the application |
| **Test** | Runs `npm test` using Jest and publishes JUnit test reports |
| **Deploy** | Builds a Docker image and pushes it to Docker Hub |

### 4. Pipeline Execution

- A new Pipeline item was created in Jenkins.
- Configured to use **Pipeline script from SCM** pointing to the GitHub repository.
- Credentials were set to the GitHub PAT.
- Script path was set to `Jenkinsfile`.
- Pipeline was triggered via **Build Now**.

---

## Challenges Faced

### npm test / Jest Configuration

The most significant challenge encountered was configuring Jest to work correctly within the Jenkins pipeline environment.

**Problem:** Running `npm test` locally worked fine, but inside the Jenkins pipeline, tests either failed to run or did not produce a JUnit-compatible report, which caused the `junit 'junit.xml'` post step to fail.

**Root Cause:** Jest by default does not generate JUnit XML reports. Jenkins requires JUnit-formatted output to display test results in the **Test Results** dashboard.

**Solution:** The `jest-junit` reporter was installed and configured:

```bash
npm install --save-dev jest jest-junit
```

The `package.json` test script was updated to:

```json
"scripts": {
  "test": "jest --ci --reporters=default --reporters=jest-junit"
}
```

This generated a `junit.xml` file that Jenkins could parse and display as a structured test report.

---

## Deliverables

- **GitHub Repository:**https://github.com/WangchukGyeltshen/WangchukGyeltshen_02240370_DSO101_A1.git
- **Screenshots:**
![jenkins pipline stage view](screenshots/jenkins-pipeline-stage-view.png)
![jenkins test results](screenshots/jenkins-test-results.png)
-**Docker Hub Image Link:**

FE: https://hub.docker.com/r/wangchu21/fe-todo

BE: https://hub.docker.com/r/wangchu21/be-todo


---

## Tools & Technologies Used

| Tool | Purpose |
|---|---|
| Jenkins | CI/CD automation |
| GitHub | Source code hosting |
| Node.js & npm | JavaScript runtime & package management |
| Jest + jest-junit | Unit testing & JUnit report generation |
| Docker | Containerization & deployment |