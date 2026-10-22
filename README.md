# TaskHub Automation

End-to-end UI tests for the **TaskHub** web application, written with [Playwright](https://playwright.dev) and TypeScript. The tests run locally or in a Jenkins pipeline, and the application URL is passed in through a `.env` file.

---

## Contents

1. [Tech stack](#tech-stack)
2. [Project structure: what is stored where](#project-structure-what-is-stored-where)
3. [Local setup](#local-setup)
4. [Environment configuration (.env)](#environment-configuration-env)
5. [Running tests](#running-tests)
6. [Reports and test output](#reports-and-test-output)
7. [Jenkins pipeline](#jenkins-pipeline)
8. [Troubleshooting](#troubleshooting)

---

## Tech stack

| Tool | Purpose |
|------|---------|
| `@playwright/test` | Test runner and browser automation |
| TypeScript | Test and page-object language |
| `dotenv` | Loads `.env` values (URL, headless mode) into the tests |
| `allure-playwright` | Allure report results |
| `@axe-core/playwright` | Accessibility checks |
| Custom reporter (`reporters/custom-reporter.ts`) | HTML/JSON QA summary report |
| Jenkins (`Jenkinsfile`) | CI pipeline |

---

## Project structure: what is stored where

```
TaskHub_Automation/
├── .env                      # Local environment values (NOT committed; Jenkins writes it on each build)
├── .env.example              # Template for .env (committed)
├── Jenkinsfile               # Jenkins pipeline definition
├── playwright.config.ts      # Playwright settings; reads .env and exports appUrls
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript settings; baseUrl "." enables imports like 'page-manager/Page-Manager'
│
├── tests/                    # Spec files: what Playwright actually runs
│   ├── taskhub/
│   │   ├── login/            # Login specs
│   │   └── task/             # Task specs (accept, create, due date, filter)
│   └── fixture/
│       ├── files/            # Upload files used by attachment tests (.jpeg, .docx)
│       └── test-data-management/
│           ├── Login.json    # Login details per user role (super admin, user one, user two)
│           └── tasks/        # Input data for each task scenario
│
├── testcases/                # Test-case flows: combine page-object steps into one business scenario
│   └── task-tc/
│
├── page-object/              # Page Object Model: locators and actions for each screen
│   ├── menu-screens/         # Login, Tasks, Edit Task, Task Reports screens
│   ├── navigate-page/        # Menu navigation
│   └── utils/                # Shared UI helpers (date picker)
│
├── page-manager/             # PageManagers: one entry point that creates all page objects
├── helpers/                  # @step decorator that names test steps in reports
├── reporters/                # Custom QA reporter
│
├── playwright-report/        # Generated: Playwright HTML report (not committed)
├── test-results/             # Generated: screenshots, videos, traces of failed tests (not committed)
├── allure-results/           # Generated: raw Allure results (not committed)
└── custom-report/            # Generated: custom QA report (index.html + results.json, not committed)
```

### How the layers fit together

```
spec (tests/)  →  test case (testcases/)  →  page manager  →  page objects (page-object/)
     ↑                    ↑
 appUrls from       test data from
 playwright.config  tests/fixture/test-data-management/*.json
```

- A **spec** opens the login page with `page.goto(appUrls.loginURL)` and calls a test-case class.
- A **test case** runs the business flow (for example, create, validate, edit and delete a task) using page objects.
- **Page objects** hold the locators and UI actions for one screen.
- **Test data** (inputs, user logins) lives in JSON under `tests/fixture/test-data-management/`, not in the code.

---

## Local setup

Prerequisites: **Node.js** (current LTS) and **Git**.

```bash
# 1. Install dependencies
npm ci

# 2. Install the Playwright browser
npx playwright install chromium

# 3. Create your local .env from the template
cp .env.example .env          # Windows PowerShell: Copy-Item .env.example .env
```

Edit `.env` if you need a different server.

---

## Environment configuration (.env)

The application URL and browser mode come from a `.env` file in the project root.

### Variables

| Variable | Example | Default if missing | What it controls |
|----------|---------|--------------------|------------------|
| `BASE_URL` | `https://taskhub.azcentrix.com:4453` | `https://taskhub.azcentrix.com:4453` | The TaskHub server under test. Becomes Playwright's `baseURL`. No trailing slash. |
| `LOGIN_URL` | `/login` | `/login` | Login page path. Specs call `page.goto(appUrls.loginURL)`, which resolves to `BASE_URL + LOGIN_URL`. |
| `HEADLESS` | `true` / `false` | `false` (headed) | `true` runs without a browser window (CI) at a fixed 1920×1080 viewport. `false` opens a maximized browser window (local debugging). |

### How it is loaded

In `playwright.config.ts`:

```ts
dotenv.config({ path: path.resolve(__dirname, '.env'), quiet: true });

export const appUrls = {
  baseURL: process.env.BASE_URL || 'https://taskhub.azcentrix.com:4453',
  loginURL: process.env.LOGIN_URL || '/login',
};
```

Every spec imports `appUrls` from `playwright.config`, so changing `.env` changes the URL for every test. No spec needs editing.

### Precedence

1. A real environment variable already set on the machine or by the shell (dotenv does not override these)
2. The value in `.env`
3. The default in `playwright.config.ts`

So you can override a value for a single run without editing the file:

```bash
BASE_URL=https://qa-server:4453 npx playwright test           # bash
$env:BASE_URL="https://qa-server:4453"; npx playwright test   # PowerShell
```

### Why `.env` is not committed

`.env` is listed in `.gitignore` so each person and each Jenkins build can use its own server without changing the repository. `.env.example` is the committed template; when you add a new variable, add it there too.

---

## Running tests

```bash
npx playwright test                                    # all tests
npx playwright test tests/taskhub/login                # one folder
npx playwright test tests/taskhub/login/login.spec.ts  # one file
npx playwright test --grep @smoke                      # by tag
npx playwright test --grep @regression
npx playwright test --headed                           # force a visible browser
npx playwright test --debug                            # step through with the inspector
npx playwright test --ui                               # Playwright UI mode
```

### Tags

Tags are written in the test title:

| Tag | Meaning |
|-----|---------|
| `@smoke` | Quick critical-path checks |
| `@regression` | Full regression suite |
| `@positive` | Happy-path scenarios |

### Retries and workers

When `CI` is set (Jenkins sets `CI=true`), failed tests retry twice, tests run on a single worker, and a stray `test.only` fails the run. Locally there are no retries and Playwright picks the worker count.

---

## Reports and test output

| Folder | Contents | How to open |
|--------|----------|-------------|
| `playwright-report/` | Playwright HTML report: every test, its steps, and attached screenshots, videos and traces | `npx playwright show-report` |
| `test-results/` | Raw files for failed tests: `screenshot` (on failure), `video` and `trace.zip` (kept on failure) | `npx playwright show-trace test-results/<test>/trace.zip` |
| `allure-results/` | Raw Allure data | `allure serve allure-results` (needs the Allure CLI installed) |
| `custom-report/` | Custom QA report: `index.html` summary and `results.json` | Open `custom-report/index.html` in a browser |

All four folders are generated on each run and are ignored by Git.

---

## Jenkins pipeline

The `Jenkinsfile` in the project root defines the CI job. It takes the URL as a build parameter, writes it to `.env`, runs the tests, and publishes the reports.

### Pipeline flow

```
Install Dependencies  →  Write .env  →  Clean Old Results  →  Run Playwright Tests  →  Publish reports (always)
   npm ci                BASE_URL       deletes the            npx playwright test     HTML reports, Allure,
   playwright install    LOGIN_URL      previous build's       (+ TEST_PATH / tag)     archived artifacts
   chromium              HEADLESS       report folders
```

### Build parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `BASE_URL` | `https://taskhub.azcentrix.com:4453` | Server to test. A trailing `/` is removed automatically. |
| `LOGIN_URL` | `/login` | Login page path |
| `TEST_TAG` | *(empty = all)* | Run only matching tests, e.g. `@smoke` or `@regression` |
| `TEST_PATH` | *(empty = all)* | Run one spec file or folder, e.g. `tests/taskhub/login` |
| `HEADLESS` | `true` | Run without a browser window. Keep this ticked on CI agents. |

### How the URL reaches the tests

1. The person starting the build fills in `BASE_URL` (or keeps the default).
2. The **Write .env** stage creates `.env` in the Jenkins workspace:
   ```
   BASE_URL=<value of the BASE_URL parameter>
   LOGIN_URL=<value of the LOGIN_URL parameter>
   HEADLESS=<true|false>
   ```
3. `playwright.config.ts` loads that `.env` when the tests start, so every spec uses the chosen server.

### Build result

| Outcome | Jenkins status |
|---------|----------------|
| All tests pass | **SUCCESS** (green) |
| One or more tests fail | **UNSTABLE** (yellow); reports are still published |
| Install or pipeline error | **FAILURE** (red) |

### One-time Jenkins setup

**1. Agent requirements**

- Node.js (current LTS) and npm available on the agent's `PATH`. If you manage Node through the NodeJS plugin, add `tools { nodejs '<your NodeJS installation name>' }` inside the `pipeline` block.
- Git.
- The pipeline works on Windows and Linux agents (it uses `bat` or `sh` automatically).
- On a Linux agent, install the browser's system libraries once as root: `npx playwright install-deps chromium`.

**2. Plugins** (Manage Jenkins → Plugins)

| Plugin | Used for |
|--------|----------|
| Pipeline | Running the `Jenkinsfile` |
| Git | Checking out the repository |
| HTML Publisher | The **Playwright Report** and **Custom QA Report** links on the build page |
| Allure Jenkins Plugin | The **Allure Report** link. Also add an Allure Commandline installation under Manage Jenkins → Tools. |

**3. Create the job**

1. New Item → **Pipeline** (or **Multibranch Pipeline**).
2. Pipeline → Definition: **Pipeline script from SCM** → SCM: **Git**.
3. Enter the repository URL, credentials and branch.
4. Script Path: `Jenkinsfile`.
5. Save, then run **Build Now** once. That first build registers the parameters, so later builds show **Build with Parameters**.

**4. Viewing the Playwright HTML report inside Jenkins**

Jenkins' default security policy (CSP) blocks the JavaScript that the Playwright report needs, so the report can open as a blank page. Either:

- download it from the build's **Build Artifacts** (`playwright-report/`) and open `index.html` locally, or
- ask your Jenkins admin to relax the CSP for HTML reports (Manage Jenkins → Script Console):
  ```groovy
  System.setProperty("hudson.model.DirectoryBrowserSupport.CSP", "")
  ```
  This resets when Jenkins restarts. To make it permanent, add `-Dhudson.model.DirectoryBrowserSupport.CSP=` to the Jenkins startup options. Agree this with your admin first, because it loosens Jenkins' security.

### What Jenkins stores for each build

| Item | Where in Jenkins |
|------|------------------|
| Playwright HTML report | Build page → **Playwright Report** |
| Custom QA report | Build page → **Custom QA Report** |
| Allure report and trend | Build page → **Allure Report** |
| `playwright-report/`, `custom-report/`, `test-results/` (screenshots, videos, traces) | Build page → **Build Artifacts** |

Jenkins keeps the last 20 builds. A build times out after 60 minutes, and only one build of the job runs at a time, because the tests create and delete tasks on a shared server.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Tests open the wrong server | Check `.env` in the project root (or the Jenkins `BASE_URL` parameter). A `BASE_URL` set in your shell or system environment overrides `.env`. |
| `Cannot find module 'page-manager/Page-Manager'` (or a similar import error) on a Linux agent | Linux file names are case-sensitive. The file name stored in Git must match the import exactly. See the note below. |
| Browser fails to launch on Jenkins | Make sure `HEADLESS` is ticked. On Linux, run `npx playwright install-deps chromium` once on the agent. |
| Playwright report is blank in Jenkins | See [Viewing the Playwright HTML report inside Jenkins](#one-time-jenkins-setup). |
| `npm ci` fails | `package-lock.json` must be committed and match `package.json`. Run `npm install` locally and commit the lock file. |

### File-name casing (important for Linux agents)

Windows ignores letter case in file names, but Linux does not. Git currently stores some files with lowercase names, while the code imports them with capital letters:

| Stored in Git | Imported as |
|---------------|-------------|
| `page-manager/page-manager.ts` | `page-manager/Page-Manager` |
| `helpers/test-steps-decorator.ts` | `helpers/Test-Steps-Decorator` |
| `page-object/menu-screens/login.ts` | `page-object/menu-screens/Login` |
| `tests/fixture/test-data-management/login.json` | `tests/fixture/test-data-management/Login.json` |

This works on Windows but fails on a Linux Jenkins agent. To fix it, rename the files in Git so they match the imports:

```bash
git mv page-manager/page-manager.ts page-manager/Page-Manager.ts
git mv helpers/test-steps-decorator.ts helpers/Test-Steps-Decorator.ts
git mv page-object/menu-screens/login.ts page-object/menu-screens/Login.ts
git mv tests/fixture/test-data-management/login.json tests/fixture/test-data-management/Login.json
```
