# Project progress

Milestones 1–6 remain complete at **62/62 tasks**. Milestone 7 remains at
**13/16 tasks complete**, Milestone 8 at **10/12**, Milestone 9 at **8/10**,
Milestone 10 at **11/13**, Milestone 11 at **11/11**, and Milestone 12 is
**9/12** as recorded at its close. Milestone 13 is **8/10**, with missing
assets and pre-publication verification pending. Milestone 14 is **10/10**.
Milestone 15 is **8/8**. Milestone 16 is **6/6**. Milestone 17 is **4/4**.
Milestone 18 is **6/6**. Overall tracked progress is **166/180 tasks (92.2%)**.
No project records were published and no production deployment has been made.

## Milestone 1: Django backend and health check

- [x] Create initial project structure and Django backend.
- [x] Add `GET /health/`, returning `{"status":"ok"}`.
- [x] Run and verify the endpoint over HTTP.

**Status:** Complete (2026-10-20).

**Verification:** `manage.py check` reported no issues. A request to
`http://127.0.0.1:8000/health/` returned HTTP 200 with
`{"status": "ok"}`.

## Milestone 2: PostgreSQL database configuration

- [x] Inspect existing Django project (`config`) and app (`healthcheck`).
- [x] Configure PostgreSQL through `DB_ENGINE` and the five `DB_*` variables;
  retain SQLite as the local fallback.
- [x] Add `.env.example`; `.env` is covered by `.gitignore` and the local file
  has owner-only permissions.
- [x] Add and install the psycopg 3 binary driver.
- [x] Install PostgreSQL 17.11 for macOS and start the local server on port 5432.
- [x] Create the dedicated `portfolio_db` database and `portfolio_app` role.
- [x] Run Django checks and verify there are no project model changes to create.
- [x] Apply Django migrations to PostgreSQL.
- [x] Verify a live Django ORM connection reports the PostgreSQL engine.
- [x] Verify `GET /health/` still returns HTTP 200 and `{"status": "ok"}`
  with PostgreSQL selected.
- [x] Run the existing test command during setup; Django found 0 tests.
- [x] Preserve and verify the SQLite fallback and its migrations.
- [x] Inspect the final migration state; all built-in migrations are applied.

**Status:** Complete (13/13 milestone tasks).

**PostgreSQL status:** Postgres.app 2.9.6 with PostgreSQL 17.11 is installed at
`/Applications/Postgres.app`. Its data cluster is in the user's standard
Postgres.app data directory and the local server is running at
`127.0.0.1:5432`. The `portfolio_db` database is owned by the dedicated
`portfolio_app` role. A generated password is stored only in the ignored root
`.env` file, which has mode `0600`; no credential value is recorded here.

**Files and dependencies:** `.env.example` now uses `127.0.0.1`. The existing
`backend/config/settings.py`, `backend/requirements.txt`, and `.gitignore` were
inspected and already contain the required PostgreSQL configuration, psycopg
dependency (`psycopg[binary]>=3.2,<4`, installed version 3.3.6), and `.env`
ignore rule. No Django settings or health endpoint changes were needed in this
milestone. The actual local `.env` was created with a generated password.

**Commands and verification results:**

- `hdiutil verify /private/tmp/Postgres-2.9.6-17.dmg` — installer checksum
  valid; Postgres.app installed under `/Applications`.
- `initdb --username=postgres --auth-local=trust --auth-host=scram-sha-256`
  — initialized the PostgreSQL 17 cluster successfully.
- `pg_ctl ... start` — PostgreSQL server started.
- `pg_isready --host=127.0.0.1 --port=5432` — accepting connections.
- Created the role/database with psycopg and generated a password in-process;
  saved `.env` with mode `0600` without printing the secret.
- `manage.py check` with `.env` loaded — no issues.
- `manage.py migrate --noinput` with `.env` loaded — all built-in migrations
  applied successfully to PostgreSQL.
- `manage.py showmigrations` with `.env` loaded — all admin, auth,
  contenttypes, and sessions migrations show `[X]`; `healthcheck` has no
  migrations.
- Direct Django `connection.ensure_connection()` and SQL query — confirmed
  `engine=postgresql`, database `portfolio_db`, role `portfolio_app`, port
  `5432`, PostgreSQL 17.11.
- `manage.py runserver` with `.env` loaded, followed by
  `curl http://127.0.0.1:8000/health/` — HTTP 200 and
  `{"status": "ok"}`.
- SQLite fallback `check`, `makemigrations --check --dry-run`, and
  `migrate --noinput` — passed in the prior setup pass.
- The first unprivileged PostgreSQL migration attempt was blocked by the
  sandbox's local TCP restriction (`Operation not permitted`); retrying with
  permitted local network access succeeded. No remaining database blocker.

**Repository note:** This workspace has no `.git` metadata, so Git's
`check-ignore` could not be run. The existing `.gitignore` contains `.env`,
and the local credential file is mode `0600`.

**Next milestone at that time:** Define and implement the Projects API in its
own milestone. This work is recorded as Milestone 3 below.

## Milestone 3: Build the Projects API

### Completed

- [x] Inspect the existing Django project, settings, dependencies, routes,
  health app, and PostgreSQL configuration.
- [x] Install Django REST Framework 3.18.3 and register it in Django.
- [x] Add the `projects` app and `Project` model with the requested fields,
  validation, database constraints, and newest-first ordering.
- [x] Generate unique URL-safe slugs, including collision suffixes.
- [x] Add a JSON serializer and public, read-only list, detail, and featured
  endpoints.
- [x] Add page-number pagination (default 10, maximum 100) and JSON 404
  responses for invalid or missing slugs.
- [x] Generate and apply the Projects migration to PostgreSQL.
- [x] Add API/model tests for list, detail, featured, empty results, invalid
  and missing slugs, pagination, serialization, read-only behavior, slug
  generation, and validation.
- [x] Run Django checks, verify migration state, and confirm no migration drift.
- [x] Verify the existing health endpoint still works with PostgreSQL selected.
- [x] Document endpoints, example JSON, setup, migration, and test commands in
  `README.md`.

### Incomplete

- None.

**Status:** Complete (11/11 milestone tasks).

**Files created or modified:** `backend/config/settings.py`,
`backend/config/urls.py`, `backend/requirements.txt`, the new `backend/projects/`
app (model, serializer, views, URLs, tests, and migration), `README.md`, and
this progress file. The `healthcheck` app and PostgreSQL environment settings
were preserved.

**Dependency added:** `djangorestframework==3.18.3` (installed in the existing
backend virtual environment).

**Commands and verification results:**

- `pip install -r backend/requirements.txt` — DRF 3.18.3 installed; existing
  Django and psycopg dependencies remained installed.
- `manage.py check` with root `.env` loaded — no issues.
- `manage.py makemigrations projects --noinput` — created
  `projects/migrations/0001_initial.py`.
- `manage.py migrate --noinput` with PostgreSQL selected —
  `projects.0001_initial` applied successfully; no database reset or existing
  data deletion was performed.
- `manage.py test projects --verbosity 2` — **11 tests passed** against
  Django's separate PostgreSQL `test_portfolio_db`; the test database was
  destroyed afterward. The app role's `CREATEDB` permission was granted only
  for the run, then revoked; verification showed the test DB absent and
  `CREATEDB` disabled again.
- `manage.py check` — no issues; `manage.py makemigrations --check --dry-run` —
  no changes detected; `manage.py showmigrations` — all built-in migrations
  and `projects.0001_initial` show `[X]` on PostgreSQL.
- Development server started with `.env` loaded. HTTP checks returned:
  `/health/` — 200 and `{"status": "ok"}`; `/api/projects/` — 200 with an
  empty paginated JSON response; `/api/projects/featured/` — 200 with an
  empty paginated JSON response; missing project detail — 404 with JSON.
- No project rows were inserted into the real `portfolio_db`; API data fixtures
  existed only in the disposable test database.

**Blockers:** None. The list endpoints are currently empty because no portfolio
projects have been added to the real database.

**Follow-up:** The safe project content workflow and Contact API recommended
here are implemented in Milestones 4 and 5 below.

## Milestone 4: Django Admin and portfolio project content

### Completed

- [x] Read this progress file and inspect the Projects model, API, settings,
  URL configuration, dependencies, environment example, and ignore rules.
- [x] Register `Project` in Django Admin with the requested list columns,
  filters, fieldsets, read-only timestamps, slug prepopulation, ordering, and
  page size.
- [x] Add Admin search across project text and JSON technology values on both
  PostgreSQL and the SQLite fallback.
- [x] Document safe local superuser creation and access to Django Admin; no
  admin account or password was created.
- [x] Add the `import_portfolio_projects` command with strict input checks,
  required fields, normalized unique slug upserts, per-record validation,
  and clear imported/updated/skipped/failed totals.
- [x] Add a non-writing `--dry-run` option; updates are transactional and the
  command never deletes existing project records.
- [x] Add the four requested sample entries, with placeholder descriptions,
  no unverified URLs, and only the explicitly specified React technology.
- [x] Add tests for Admin registration/search, importer create/update,
  malformed and incomplete input, dry run, idempotence, data preservation,
  and sample-file validation while retaining Projects API tests.
- [x] Allow an empty `tech_stack` JSON list when no technologies are verified
  and apply the resulting migration without resetting the database.
- [x] Run Django checks, migration checks, all Projects tests, and HTTP checks
  for the health endpoint and Projects API using PostgreSQL.
- [x] Document Admin and importer usage in `README.md` and record actual
  verification results here.

### Incomplete

- None for this milestone. The example project descriptions still need to be
  replaced with verified portfolio details before public use; no sample
  records have been imported into the real database.

**Status:** Complete (11/11 milestone tasks; 38/38 tracked tasks overall,
100%).

**Files created or modified:** `README.md`, `PROJECT_PROGRESS.md`,
`backend/projects/admin.py`, `backend/projects/models.py`,
`backend/projects/tests.py`, new migration
`backend/projects/migrations/0002_alter_project_tech_stack.py`, new importer
package files under `backend/projects/management/`, and
`backend/projects/data/sample_projects.json`. No dependency or settings change
was needed. Existing API routes, PostgreSQL configuration, SQLite fallback,
and the health endpoint were preserved.

**Database and dependency status:** PostgreSQL was already installed and
running locally; no dependency was added. `Project.tech_stack` now has
`blank=True`, allowing a valid empty list in Admin and in input data. The
generated `projects.0002_alter_project_tech_stack` migration was applied to
the existing PostgreSQL database. No database was reset and no sample rows
were inserted into `portfolio_db`.

**Commands and actual verification results:**

- `manage.py check` — no issues.
- `manage.py makemigrations projects --noinput` — created
  `0002_alter_project_tech_stack.py`.
- `manage.py migrate --noinput` with PostgreSQL selected — applied
  `projects.0002_alter_project_tech_stack` successfully.
- `manage.py makemigrations --check --dry-run` — no model changes detected.
- `manage.py showmigrations projects` — both `0001_initial` and
  `0002_alter_project_tech_stack` show `[X]`.
- Django ORM connection check — `connection.vendor` reported `postgresql`;
  `portfolio_db` contained 0 project rows after verification.
- `manage.py test projects --verbosity 2` — **21 tests passed** against
  PostgreSQL's separate `test_portfolio_db`. The temporary database was
  removed after the run, and the app role's temporary `CREATEDB` privilege
  was revoked (`rolcreatedb=false`).
- Brief PostgreSQL-backed `runserver` smoke test with `curl` — `GET /health/`
  returned HTTP 200 and `{"status": "ok"}`; `GET /api/projects/` and
  `GET /api/projects/featured/` each returned HTTP 200 with an empty paginated
  JSON response; a nonexistent `GET /api/projects/<slug>/` returned HTTP 404
  with JSON. Successful project detail serialization is covered by the API
  test suite.
- The supplied sample file passed the importer's test-database dry-run
  validation: 4 planned imports, 0 updates, 0 skips, 0 failures. This was not
  run as a write against the real database.

**Failed attempts and blockers:** The first non-escalated database test
attempt could not reach local PostgreSQL due to the execution sandbox's
`Operation not permitted` restriction. The first permitted test run exposed
that an empty JSON technology list failed model blank validation; setting
`blank=True`, generating/applying the migration, and rerunning resolved this.
The final PostgreSQL-backed suite and live HTTP checks passed. No remaining
environment blocker.

**Follow-up:** The Contact API suggested here is implemented in Milestone 5.
Review and replace placeholder project content with verified details before
importing the sample file into the real database.

## Milestone 5: Contact API

### Completed

- [x] Inspect progress history, Django settings and routes, existing apps,
  dependencies, README, PostgreSQL configuration, and current CORS setup.
- [x] Create the `contact` app and `ContactMessage` model with required
  validated fields, status choices/default, timestamps, newest-first ordering,
  and a database status constraint.
- [x] Generate and apply `contact.0001_initial` to the existing PostgreSQL
  database without resetting it.
- [x] Add JSON-only `POST /api/contact/` with field-level serializer errors,
  field/request size limits, and a generic 201 response that does not echo
  submitted information.
- [x] Reject unexpected fields, including client-supplied `status`; add an
  optional blank honeypot and dedicated configurable anonymous throttle scope.
- [x] Keep public message listing/retrieval/update/delete unavailable and
  return JSON errors without exposing stored content or database details.
- [x] Register submissions in Django Admin with search, status/date filters,
  readonly creation time, and review fieldsets.
- [x] Add contact validation, rate-limit, privacy, error, Admin, and health
  tests while retaining all Projects API tests.
- [x] Run PostgreSQL migrations, Django checks, migration checks, automated
  tests, and HTTP smoke tests against disposable PostgreSQL data.
- [x] Document the API, response formats, throttle behavior and limitations,
  Admin review, local tests, and future email-notification work.

### Incomplete

- None. Email notifications are intentionally future work; submissions can be
  reviewed through Django Admin.

**Status:** Complete (10/10 milestone tasks; 48/48 tracked tasks overall,
100%).

**Files created or modified:** `.env.example`, `README.md`,
`PROJECT_PROGRESS.md`, `backend/config/settings.py`, `backend/config/urls.py`,
`backend/healthcheck/tests.py`, and the new `backend/contact/` app, including
`models.py`, `serializers.py`, `views.py`, `throttles.py`, `urls.py`,
`admin.py`, tests, and migration `0001_initial.py`. No dependency or CORS
configuration change was needed.

**Database status:** Applied `contact.0001_initial` to the existing PostgreSQL
database. Django reported `database_engine=postgresql`, and the real database
contained 0 contact messages after verification. No real contact message was
created. The separate `portfolio_contact_smoke` database used for live POST
verification was dropped afterward; Django's test database was also removed.
The app role's temporary `CREATEDB` privilege was revoked and verified false.

**Commands and actual verification results:**

- `manage.py check` — no issues.
- `manage.py makemigrations contact --noinput` — created
  `contact/migrations/0001_initial.py`.
- `manage.py migrate --noinput` with PostgreSQL selected — applied
  `contact.0001_initial` successfully.
- `manage.py showmigrations contact` — `0001_initial` shows `[X]`;
  `manage.py makemigrations --check --dry-run` — no changes detected.
- `manage.py test contact projects healthcheck --verbosity 2` — **35 tests
  passed** against Django's separate PostgreSQL `test_portfolio_db`. The test
  database was destroyed afterward.
- PostgreSQL-backed `runserver` and local HTTP checks, with the separate
  disposable smoke database selected: `/health/` returned HTTP 200 and
  `{"status": "ok"}`; `/api/projects/` and `/api/projects/featured/` returned
  HTTP 200 paginated JSON; valid `POST /api/contact/` returned HTTP 201 with
  only a generic confirmation; malformed-email POST returned HTTP 400 with a
  field error; `GET /api/contact/` returned HTTP 405; and
  `GET /api/contact/1/` returned HTTP 404 with generic JSON.
- Automated tests also confirmed anonymous throttling returns HTTP 429 after
  the configured scope limit, public status assignment is rejected, no public
  message listing/retrieval or mutation is available, and Admin superusers can
  review records.

**Failed attempts and blockers:** The initial throttle test attempted to
override DRF's rate after its throttle class had cached the setting; this made
the test setup ineffective. The test now patches only the throttle rate for
its isolated case, and the final suite passed. No remaining migration,
database, or test blocker.

**Next recommended milestone:** Plan the next portfolio backend or frontend
milestone after reviewing this work. Email notifications remain future work;
do not implement them as part of this completed Contact API milestone.

## Milestone 6: React portfolio frontend

### Completed

- [x] Read the existing progress history and README; inspect the Django apps,
  API response shapes, settings, dependencies, and ignore rules. Confirm no
  frontend existed and preserve existing backend routes and database data.
- [x] Create a dedicated JavaScript React/Vite frontend with a committed npm
  lockfile, Tailwind CSS v4 integration, React Router, Framer Motion, Axios,
  Lucide React, Vitest, React Testing Library, and ESLint.
- [x] Add a responsive shared layout, accessible navigation, keyboard skip
  link, and footer without unverified GitHub, LinkedIn, or email links.
- [x] Build a home page with portfolio introduction, skill groups, an approach
  section, API-backed featured work, and contact form.
- [x] Build the paginated Projects archive with loading, empty, and retryable
  error states; never fabricate projects when the API is empty.
- [x] Build project detail routes using API slugs, displaying API descriptions,
  technology tags, and only API-provided repository/demo links; handle 404s.
- [x] Connect the contact form to the existing JSON endpoint with native
  required-field validation, field errors, disabled/in-flight duplicate
  protection, success feedback, network errors, and rate-limit handling. The
  confirmation does not claim to send email.
- [x] Configure Axios from `VITE_API_BASE_URL`, default to `/api`, and add a
  Vite proxy for Django API and health-check requests.
- [x] Add subtle Motion animations, reduced-motion support, responsive layouts,
  semantic structure, visible focus styles, and accessible form feedback.
- [x] Configure Django CORS for explicit origins and `/api/` only; keep
  wildcard CORS disabled and allow production origins to be configured through
  the server-side environment.
- [x] Add component tests for navigation, featured and archive loading/empty/
  error states, pagination, project detail success/404, and contact validation,
  field errors, success, rate limits, and in-flight submission behavior.
- [x] Run frontend unit tests, lint, and a production build; run Django system
  and migration checks plus all existing contact, projects, and health tests.
- [x] Verify PostgreSQL connection and existing migrations, health and API
  routes, Vite's API/health proxy, SPA deep-route fallback, and the allowlisted
  versus unlisted CORS response behavior over local HTTP.
- [x] Document frontend setup, environment variables, local startup, API
  routing, CORS, testing, production build, and deployment routing in
  `README.md`; record actual commands and results here.

### Incomplete

- None of the tracked Milestone 6 implementation or verification tasks.

**Status:** Complete (14/14 milestone tasks; 62/62 tracked tasks overall,
100%).

**Files created or modified:** New `frontend/` app including `index.html`,
`package.json`, `package-lock.json`, Vite and ESLint configuration, frontend
environment example, API client, shared components, page routes, styles, and
Vitest/React Testing Library tests. Updated root `.gitignore`, `.env.example`,
`README.md`, and this progress file. Updated `backend/config/settings.py`,
`backend/requirements.txt`, and `backend/healthcheck/tests.py` for strict CORS
configuration and policy tests. No backend API behavior, project content, or
contact records were changed.

**Dependencies:** Added React 19.3.1, React DOM 19.3.1, React Router DOM 7.18.4,
Framer Motion 14.4.0, Axios 1.20.0, and Lucide React 1.60.0. Frontend tooling
includes Vite 8.3.4, Tailwind CSS and its Vite plugin 4.3.3, Vitest 5.0.5,
React Testing Library 16.3.3, jsdom 26.1.0, and ESLint 10.13.0. Added
`django-cors-headers` (`>=4.7,<5`; installed 4.9.0) to the backend dependency
file. `npm audit` reported 0 vulnerabilities.

**Database and integration status:** The final Django ORM connection reported
`engine=postgresql`, `database_name=portfolio_db`, host `127.0.0.1`, port
`5432`. All existing migrations are applied and `makemigrations --check
--dry-run` reported no model changes. The existing database still contains 0
projects and 0 contact messages; no sample projects or test contact messages
were inserted there. The Vite dev server served the frontend with HTTP 200 and
successfully proxied `/api/projects/` and `/api/projects/featured/` (both HTTP
200, empty paginated JSON), `/health/` (HTTP 200, `{"status":"ok"}`), and an
unknown project detail (HTTP 404 JSON). A nested React route received the SPA
HTML shell with HTTP 200. Direct Django checks confirmed an allowlisted local
origin receives `Access-Control-Allow-Origin`; an unlisted origin does not.
`GET /api/contact/` remained HTTP 405; no contact POST was made to the real
database.

**Commands and actual verification results:**

- `npm test` — **15 tests passed across 5 files**.
- `npm run lint` — passed with no findings.
- `npm run build` — passed; Vite 8.3.4 generated the production bundle.
- `npm audit` — 0 vulnerabilities.
- `backend/.venv/bin/python -m pip install 'django-cors-headers>=4.7,<5'` —
  installed 4.9.0 in the existing backend virtual environment.
- `backend/.venv/bin/python backend/manage.py check` with root `.env` loaded —
  no issues.
- `backend/.venv/bin/python backend/manage.py makemigrations --check --dry-run`
  with PostgreSQL selected — no changes detected.
- `backend/.venv/bin/python backend/manage.py showmigrations` — built-in,
  Projects, and Contact migrations all show `[X]` on PostgreSQL.
- Django ORM `connection.ensure_connection()` — confirmed PostgreSQL and
  `portfolio_db`; read-only counts confirmed 0 project rows and 0 contact rows.
- `DB_ENGINE=sqlite DB_SQLITE_PATH=:memory: ... manage.py test contact
  projects healthcheck --verbosity 1` — **38 tests passed** against Django's
  disposable in-memory SQLite test database, including strict CORS policy,
  existing Projects and Contact behavior, Admin/import workflow, and health.
- `runserver` plus `curl` through Django and the Vite proxy — verified
  `/health/`, project list, featured list, missing detail, contact GET method,
  local CORS allow/deny behavior, Vite frontend response, API proxy, health
  proxy, and React deep-route fallback. Project API responses remain empty as
  no content has been imported.

**Resolved verification issues:** The sandbox initially denied local TCP
connections/listening and an npm cache permission issue blocked early setup;
approved local networking and a workspace-safe npm cache allowed the checks to
complete. The initial Vite config, test DOM setup, required-field handling, and
Lucide icon mismatch were corrected before the final successful test, lint, and
build runs. The in-app browser automation execution tool was not available in
this session, so no screenshot-based visual review was performed; responsive
and reduced-motion behavior is implemented in CSS/Motion and covered by the
production build and component checks.

**Next recommended milestone:** Review and replace the existing placeholder
project descriptions with verified content, optionally add verified profile
links through configuration, and import only the reviewed project data through
the existing safe Django command. After content review, plan production hosting
and deployment configuration. Do not begin that work automatically.

## Milestone 7: Finalize portfolio content and production preparation

### Completed

- [x] Read this progress history and inspect the backend, frontend, project
  sample JSON, environment examples, dependencies, URLs, and documentation.
- [x] Audit the four requested project entries against files in this
  repository. Keep PriceHunter, Note_TakingApp, and Movie App details limited
  to the supplied names/categories, and mark missing facts for owner review.
- [x] Prepare a Portfolio Website draft from verified frontend/backend
  behavior and repository dependencies. Keep all unverified repository, demo,
  image, and social/profile URLs blank.
- [x] Do not import sample entries or change PostgreSQL data. Existing API
  empty states continue to explain that no projects are published.
- [x] Remove the unverified owner name from public frontend branding and
  metadata. Use the owner-supplied Full-Stack Developer / React / Python /
  Django description and remove unsupported first-person experience claims.
- [x] Review project archive/detail and contact flow; preserve API-driven
  content, useful empty/error states, and the existing Contact API connection.
- [x] Review responsive breakpoints and visible focus styles; add keyboard
  coverage for the mobile navigation, improve low-contrast supporting text,
  and make custom Motion behavior honor reduced-motion preferences.
- [x] Require a production secret and explicit non-wildcard hosts when
  `DJANGO_DEBUG=false`; configure secure redirects/cookies, HSTS, exact
  CSRF/CORS origins, optional trusted proxy header handling, and production
  PostgreSQL TLS defaults while retaining local behavior.
- [x] Add `STATIC_ROOT` for release-time static collection and update safe
  environment placeholders for production settings without reading or changing
  the local `.env` file.
- [x] Document contact throttling/cache and request-size limitations, static
  Admin asset serving, dependency/runtime lock status, production prerequisites,
  and a recommended hosting shape.
- [x] Update README with exact pending owner content, local commands, secure
  production configuration, and verified-versus-pending project information.
- [x] Run the frontend tests, lint, and production build; run Django system
  checks and the existing backend test suite on a disposable in-memory SQLite
  test database.
- [x] Run PostgreSQL migration drift check without applying migrations.

### Incomplete / pending

- [ ] Visual responsive viewport review in the in-app browser. The browser
  automation tool was not available in this session; responsive breakpoints
  were reviewed in source and component tests cover keyboard menu behavior.
- [ ] Owner confirmation of project implementation details, technologies,
  descriptions, featured status, preferred public name, and verified profile,
  repository, demo, or image URLs.
- [ ] Select production domain and hosting providers, then configure real
  secret-manager values, service runtime, static serving, database backups,
  shared cache or edge throttling, and deployment checks. No infrastructure
  was changed and the application is not deployed.

**Status:** Implementation and automated verification complete; awaiting the
three items above before the portfolio is ready for production. Milestone 7
has 13 completed and 3 incomplete tracked tasks. Overall: **75/78 complete
(96.2%)**.

**Files modified:** `.env.example`, `README.md`, `PROJECT_PROGRESS.md`,
`backend/config/settings.py`, `backend/projects/data/sample_projects.json`,
`frontend/index.html`, `frontend/src/components/Footer.jsx`,
`frontend/src/components/Navbar.jsx`, `frontend/src/components/Navbar.test.jsx`,
`frontend/src/components/Reveal.jsx`, `frontend/src/components/SkillsSection.jsx`,
`frontend/src/pages/HomePage.jsx`, `frontend/src/pages/ProjectsPage.jsx`,
`frontend/src/styles.css`, and `frontend/src/test/setup.js`. The frontend build
regenerated ignored `frontend/dist/` output. Updated `backend/contact/tests.py`
to use a neutral, reserved example identity rather than an unverified owner
name. No dependencies or migrations were added; no database rows were
inserted, updated, or deleted.

**Content audit:** The sample JSON has four parseable entries and blank
GitHub, live-demo, and image URLs. The three projects whose source code is not
in this repository have descriptions that explicitly call for owner input.
The portfolio entry reflects the present React/Vite UI, Django REST API,
contact form, and PostgreSQL configuration. Its feature flag remains false
pending owner choice. Existing test fixtures still contain test-only example
values; these are not published project data or frontend links.

**Production audit:** Local development remains the default. Production mode
now fails configuration without `DJANGO_SECRET_KEY` and explicit
`DJANGO_ALLOWED_HOSTS`; wildcard hosts are rejected. HTTPS redirect and secure
cookies default on, HSTS defaults to one year without enabling subdomains or
preload, CORS has no production default origins, and PostgreSQL defaults to
`verify-full` TLS certificate and hostname verification. `CSRF_TRUSTED_ORIGINS` and proxy HTTPS handling
are explicit settings. Static files need `collectstatic` and a separate
production static server/CDN. No production WSGI/ASGI server, static storage
adapter, Python dependency lock, shared cache, or hosting deployment config is
present. The contact throttle is process-local unless a shared cache or edge
rate limit is selected. The release check reported Django warnings `W005`
and `W021` because HSTS subdomain inclusion and preload are intentionally not
enabled before the domain and its subdomains are confirmed.

**Commands and actual verification results:**

- `npm test` (working directory `frontend/`) — **16 tests passed across 5
  files**. The first call from the repository root reported missing scripts;
  rerun from `frontend/` passed. The test setup stubs jsdom's unsupported
  `window.scrollTo`, removing the prior test-only warning.
- `npm run lint` (working directory `frontend/`) — passed with no findings.
- `npm run build` (working directory `frontend/`) — passed; Vite 8.3.4
  generated the production bundle. Build output is ignored and is not a source
  dependency.
- `DB_ENGINE=sqlite DB_SQLITE_PATH=:memory: backend/.venv/bin/python
  backend/manage.py test contact projects healthcheck --verbosity 1` —
  **38 tests passed**; Django created and destroyed its separate in-memory
  test database.
- `DB_ENGINE=sqlite DB_SQLITE_PATH=:memory: backend/.venv/bin/python
  backend/manage.py check` — no issues.
- `set -a; source .env; set +a; backend/.venv/bin/python
  backend/manage.py makemigrations --check --dry-run` — with PostgreSQL
  selected, **No changes detected**; no migrations were applied.
- `manage.py check --deploy` under synthetic production settings —
  `security.W005` (HSTS subdomains) and `security.W021` (HSTS preload) were
  reported. Both remain off until the real domain and all subdomains are
  confirmed HTTPS-only. An initial check with a deliberately short synthetic
  key also reported `security.W009`; a second run with a sufficiently long
  synthetic test key removed that warning.
- An initial sandbox-restricted migration drift attempt emitted a local TCP
  permission warning; retrying the read-only command connected and completed.
- Production settings checks without a secret and with wildcard hosts both
  failed at startup as intended. A read-only settings inspection confirmed
  production PostgreSQL's default `sslmode` is `verify-full`.
- Python JSON parse/link audit — four entries found; all GitHub, live-demo,
  and image URL fields are empty.
- A contrast calculation for updated supporting text found `#949a8c` at
  approximately 6.5:1 against `#101210`; the review was source-level, not a
  full automated accessibility audit.

**Next recommended milestone:** Collect the exact owner confirmations listed
in README, finish viewport QA once browser tooling is available, then select a
hosting target and prepare a deployment plan. Do not import these draft entries
or publish the application before review.

## Milestone 8: Personalize portfolio using resume details

### Completed

- [x] Read this progress record and README; inspect the React pages/components,
  Django Project model, serializer, tests, and project import JSON structure.
- [x] Use the resume details included in the request to identify Abhishek Kr
  Sharma as a Full Stack Developer and personalize the home page, navigation,
  footer, and page metadata.
- [x] Organize the listed technical skills into ten categories, keeping Testing
  and QA as supporting skills.
- [x] Add the three supplied trainee/intern roles with their dates and resume-
  based descriptions.
- [x] Add B.Tech education, institution, university affiliation, completion
  year, and CGPA.
- [x] Replace the previous sample project drafts with four resume-listed
  projects, polished summaries, resume-supported details, and confirmed
  technologies; keep all repository, demo, and image URL fields blank and all
  featured flags false pending review.
- [x] Add the resume-provided LinkedIn, GitHub, and email links with safe
  external-link attributes; document that they have not been independently
  verified.
- [x] Preserve the API-backed project archive/detail and featured states, the
  Contact API form, and existing backend settings. No database records were
  imported or changed.
- [x] Extend frontend and backend tests for resume content, safe links,
  API-project rendering, and the four-project JSON draft.
- [x] Update README and this progress record with content provenance, project
  mapping, import/publish status, and outstanding owner review.

### Incomplete / pending

- [ ] Owner review of resume-derived wording and links, project featured
  choices, project repository/demo/image URLs, and whether PriceHunter maps to
  Price Comparison Web App. The resume PDF itself was not available as a
  separate file in the workspace; the full profile and project details pasted
  into the request were used.
- [ ] Visual responsive viewport review in the in-app browser remains pending
  because browser automation is unavailable in this session. Source breakpoints
  and existing keyboard/reduced-motion behavior were preserved.

**Status:** Draft profile and project content are implemented and automated
checks pass; public project records remain unpublished pending owner review.
Milestone 8 has **10/12 tasks complete**. Milestone 7's prior hosting decision
and deployment prerequisites remain open. Overall tracked progress: **85/90
tasks (94.4%)**.

**Files created or modified:** `README.md`, `PROJECT_PROGRESS.md`,
`backend/projects/data/sample_projects.json`, `backend/projects/tests.py`, `frontend/index.html`,
`frontend/src/data/profile.js`, `frontend/src/components/SkillsSection.jsx`,
`frontend/src/components/ResumeSection.jsx`, new
`frontend/src/components/Footer.test.jsx`, `frontend/src/components/Footer.jsx`,
`frontend/src/components/Navbar.jsx`, `frontend/src/components/Navbar.test.jsx`,
`frontend/src/pages/HomePage.jsx`, `frontend/src/pages/HomePage.test.jsx`,
`frontend/src/pages/ProjectDetailPage.test.jsx`, and `frontend/src/styles.css`.
No dependency, migration, environment, or production infrastructure changes
were made.

**Commands and actual verification results:**

- `npm test` (`frontend/`) — **18 tests passed across 6 files**. The first run
  exposed two new assertion issues; assertions were corrected and the rerun
  passed.
- `npm run lint` (`frontend/`) — passed with no findings.
- `npm run build` (`frontend/`) — passed; Vite generated the production bundle.
- `DB_ENGINE=sqlite DB_SQLITE_PATH=:memory: .venv/bin/python manage.py check`
  (`backend/`) — no issues.
- `DB_ENGINE=sqlite DB_SQLITE_PATH=:memory: .venv/bin/python manage.py test
  contact projects healthcheck --verbosity 1` (`backend/`) — **39 tests
  passed** using the disposable in-memory SQLite test database. The configured
  PostgreSQL portfolio database was not used or changed by the test run.
- Initial PostgreSQL migration drift check was blocked from connecting to
  localhost by the sandbox and emitted a connection warning. Retried with
  permitted read-only local database access:
  `makemigrations --check --dry-run` — **No changes detected**.
- The JSON importer test dry-runs the four sample records in the disposable
  test database; 4 planned, 0 updated, 0 skipped, and 0 failed. No import was
  run against the portfolio database.
- `python3 -m json.tool backend/projects/data/sample_projects.json` — JSON
  parsed successfully. A source/build scan found only `VITE_API_BASE_URL` and
  `VITE_DEV_API_PROXY_TARGET` frontend environment settings, and no backend
  secret/config markers in `frontend/dist`.

**Content provenance and blockers:** Resume details and project features were
supplied in the request and have not been independently verified against the
resume PDF or project repositories; the named PDF was not separately available
in the attachment directory. The existing `PriceHunter` draft may map to the
resume's Price Comparison Web App, but no mapping was assumed. The API-backed
project archive remains empty until the owner reviews and imports records.
External profile URLs are owner-provided and not independently verified.

**Next recommended step:** Review and approve the resume wording, links,
featured-project choices, and PriceHunter mapping. Only then preview the JSON
import and explicitly decide whether to publish those records to PostgreSQL.
Complete browser viewport review when the in-app browser tool is available.

## Milestone 9: Final content review and safe import preparation

### Completed

- [x] Read the progress record and README; inspect the four JSON entries,
  importer, Project model, serializer, API views/routes, and frontend project
  archive/detail/card components.
- [x] Confirm the JSON contains the four requested resume project titles and
  normalized unique slugs.
- [x] Audit each description and technology stack against the resume-derived
  details supplied by the owner; find no schema mismatch or unsupported links.
- [x] Confirm every repository, live-demo, and image URL is blank and every
  `featured` value is `false` pending owner selection.
- [x] Preserve the unresolved PriceHunter mapping in README: no merge, rename,
  duplicate, or assumption was made.
- [x] Check profile identity, education, graduation year, CGPA, three roles and
  dates, ten skill groups, and resume-provided links in the frontend. QA/testing
  remains a supporting skill group; external links use safe target attributes.
- [x] Run the actual importer `--dry-run` after applying migrations to a
  process-local SQLite `:memory:` database; four valid records were planned,
  with no writes to PostgreSQL.
- [x] Run frontend/backend checks, tests, build, JSON parse, and a read-only
  PostgreSQL migration drift check; update README with the audit and results.

### Incomplete / pending

- [ ] Owner decisions: confirm resume-derived wording and links, featured
  choices, project repository/demo/image URLs, whether the Render deployment
  should be mentioned, and whether PriceHunter maps to Price Comparison Web App.
- [ ] Visual responsive viewport review remains pending because browser
  automation is unavailable in this session.

**Status:** All four drafts passed importer validation and automated checks.
They remain unpublished; no write import was run against `portfolio_db`.
Milestone 9 has **8/10 tasks complete**. Overall tracked progress is **93/100
tasks (93.0%)**.

**Files modified:** `README.md` and `PROJECT_PROGRESS.md`. No JSON content,
frontend/backend application code, dependency, migration, environment setting,
database record, or production infrastructure was changed.

**Commands and actual results:**

- `python3 -m json.tool backend/projects/data/sample_projects.json` — passed.
- From `frontend/`, `npm test` — **18 tests passed across 6 files**;
  `npm run lint` — passed with no findings; `npm run build` — passed with Vite
  8.3.4.
- From `backend/`,
  `DB_ENGINE=sqlite DB_SQLITE_PATH=:memory: .venv/bin/python manage.py check` —
  no issues.
- From `backend/`,
  `DB_ENGINE=sqlite DB_SQLITE_PATH=:memory: .venv/bin/python manage.py test
  contact projects healthcheck --verbosity 1` — **39 tests passed**. Django
  created and destroyed its disposable test database.
- From `backend/`,
  `DB_ENGINE=sqlite DB_SQLITE_PATH=:memory: .venv/bin/python manage.py shell -c
  "from django.core.management import call_command; call_command('migrate',
  interactive=False, verbosity=0); call_command('import_portfolio_projects',
  'projects/data/sample_projects.json', dry_run=True)"` — **imported=4,
  updated=0, skipped=0, failed=0**. The SQLite database existed only for this
  process and disappeared when it exited.
- With the root `.env` loaded,
  `backend/.venv/bin/python backend/manage.py makemigrations --check --dry-run`
  — **No changes detected** against PostgreSQL. The initial sandboxed attempt
  could not access localhost; the read-only retry with local database access
  succeeded. No migrations were applied.

**Review findings:** All entries satisfy importer required fields, normalized
slug format, technology-list validation, URL field types, and boolean featured
values. The three project URL fields are intentionally empty for all four
entries. Resume-provided profile links are formatted as `https` URLs or a
`mailto:` link; the UI tests the exact targets and uses `noopener noreferrer`
for new-tab links. The resume PDF was not separately available, so the
request-pasted details remain the source; links and resume claims have not been
independently verified. The live project archive remains empty until explicit
owner approval and a later import decision.

**Next recommended step:** Owner reviews project and profile content and
resolves the PriceHunter mapping. After approval, run a separate reviewed
import decision; do not import or publish automatically.

## Milestone 10: Finalize content and prepare for visual review

### Completed

- [x] Read the current progress and README, then inspect the project JSON,
  Django importer/model/serializer/API, frontend project views/cards, profile,
  responsive styles, and existing tests.
- [x] Keep exactly four unique resume project entries with the requested
  public titles and normalized slugs; use the owner-confirmed PriceHunter alias
  as the single `Price Comparison Web App` entry.
- [x] Set only `AI-Powered Task Management REST API` to `featured: true`; keep
  the other three entries false.
- [x] Keep technology arrays to the owner's listed stacks. Preserve LangChain
  and RAG as task-assistant details in the description, and OpenAPI as a
  Meter & Transformer documentation feature.
- [x] State that the resume reports a Render deployment for the Meter &
  Transformer platform without claiming current availability or adding a URL.
- [x] Search workspace application files for project images/screenshots/logos;
  none were found. Keep all repository, demo, and image URLs blank.
- [x] Check profile identity, role, education, affiliation, year, CGPA,
  experience dates, grouped skills, and resume-provided external links. No
  unsupported personal details or downloadable resume link were added.
- [x] Verify the existing featured endpoint filters `featured=True` and the
  homepage renders API-returned projects with its featured badge. Preserve the
  API architecture and loading/empty/error/not-found states.
- [x] Review mobile/tablet/desktop source breakpoints, focus styles, semantic
  form/navigation markup, keyboard tests, reduced-motion behavior, and
  representative text contrast. Add safe wrapping for long project titles.
- [x] Run frontend/backend checks, tests/build, JSON audit, in-memory SQLite
  importer dry-run, and read-only migration drift check; document results.
- [x] Update README and this file with the confirmed owner decisions, missing
  assets, results, and remaining review items.

### Incomplete / pending

- [ ] Supply project repository URLs, live-demo URLs, and/or actual screenshots
  for each project if they should appear as links or images. The Meter &
  Transformer Render URL was not supplied, so current availability remains
  unknown.
- [ ] Perform real browser viewport review at narrow mobile, tablet, and
  desktop widths. Browser automation was not available in this session; no
  screenshots were captured or visually reviewed.

**Status:** The content draft reflects all owner decisions and passes the
automated checks. Records remain unpublished. Milestone 10 has **11/13 tasks
complete**. Overall tracked progress is **104/113 tasks (92.0%)**.

**Files modified:** `README.md`, `PROJECT_PROGRESS.md`,
`backend/projects/data/sample_projects.json`, `backend/projects/tests.py`,
`frontend/src/pages/HomePage.test.jsx`, and `frontend/src/styles.css`. No model,
API, migration, dependency, environment, or production configuration changes
were made.

**Commands and actual results:**

- From `frontend/`, `npm test` — **18 tests passed across 6 files**;
  `npm run lint` — passed with no findings; `npm run build` — passed with
  Vite 8.3.4.
- From `backend/`,
  `DB_ENGINE=sqlite DB_SQLITE_PATH=:memory: .venv/bin/python manage.py check` —
  no issues.
- From `backend/`,
  `DB_ENGINE=sqlite DB_SQLITE_PATH=:memory: .venv/bin/python manage.py test
  contact projects healthcheck --verbosity 1` — **39 tests passed** against
  Django's disposable SQLite test database.
- From `backend/`,
  `DB_ENGINE=sqlite DB_SQLITE_PATH=:memory: .venv/bin/python manage.py shell -c
  "from django.core.management import call_command; call_command('migrate',
  interactive=False, verbosity=0); call_command('import_portfolio_projects',
  'projects/data/sample_projects.json', dry_run=True)"` — **imported=4,
  updated=0, skipped=0, failed=0**. This used only a process-local in-memory
  database.
- `python3 -m json.tool backend/projects/data/sample_projects.json` plus a
  structural audit — passed; exactly four unique slugs, one approved featured
  project, and blank repository/demo/image URLs.
- With root `.env` loaded,
  `backend/.venv/bin/python backend/manage.py makemigrations --check --dry-run`
  — **No changes detected**. The sandbox blocked the first local connection;
  the read-only retry completed. No migrations were applied.
- Representative text contrast samples from the source palette ranged from
  **6.51:1 to 9.27:1** for the checked combinations. This was not a complete
  accessibility audit or browser review.

**Database and deployment status:** The real `portfolio_db` was not used for
the importer or tests. The only PostgreSQL operation was the read-only
migration drift check; no records were written, deleted, or reset. No site was
published, deployed, or connected to production infrastructure.

**Next recommended step:** The owner supplies any project links/screenshots
they want included, then completes a visual viewport review and approves the
content. Only after a separate explicit approval should records be imported
into PostgreSQL.

## Milestone 11: Run and visually review the portfolio

### Completed

- [x] Read the current progress and README, inspect the documented setup,
  project settings, dependencies, frontend scripts, and local service status.
- [x] Confirm PostgreSQL was listening on `127.0.0.1:5432`; keep it out of
  the site run and all write-capable verification. Run the read-only
  PostgreSQL migration drift check successfully.
- [x] Apply the existing migrations to a separate QA SQLite database at
  `/private/tmp/portfolio_m11.sqlite3` and start Django against that database.
- [x] Start Vite with its existing `/api` and `/health` development proxy.
- [x] Verify the backend health response, empty project and featured APIs,
  missing-project API 404, Vite homepage and client routes, and proxied health
  and projects requests.
- [x] Capture and inspect homepage, featured area, skills, experience and
  education, contact form, project archive, and missing-project detail views
  at 375×812, 768×1024, and 1440×900 using local headless Chrome/CDP.
- [x] Inspect the mobile navigation, footer, archive loading/empty/error
  states, missing-project state, reduced-motion preference, and contact-form
  validation and success feedback. Contact success used a browser-intercepted
  synthetic response; it did not reach Django or create a submission.
- [x] Check document widths against all requested viewport widths; no
  horizontal overflow was measured. Existing keyboard navigation tests pass,
  and the global visible-focus style remains in place.
- [x] Fix narrow-screen clipping of the hero name, keep the brand-mark period
  inside its circle, and replace two literal `\n` title sequences with actual
  line breaks in the Skills and Experience headings.
- [x] Run frontend tests, lint, production build; Django checks and backend
  tests with in-memory SQLite; JSON parsing and importer dry-run with
  in-memory SQLite; and PostgreSQL migration drift check.
- [x] Update this file and README with commands, evidence, and limitations.

### Incomplete / pending

- None for this milestone. The successful project detail/card states are
  covered by the existing automated tests; the live database intentionally
  contains no published projects, so browser review showed the empty archive
  and missing-project state. Project records and owner-supplied links/images
  remain unpublished and pending owner input.

**Status:** Complete (11/11 milestone tasks). Overall tracked progress is
**115/124 tasks (92.7%)**. Existing Milestone 7–10 owner decisions and
deployment requirements remain open.

**Files modified:** `PROJECT_PROGRESS.md`, `README.md`,
`frontend/src/styles.css`, `frontend/src/components/SkillsSection.jsx`, and
`frontend/src/components/ResumeSection.jsx`. No backend code, model, migration,
dependency, environment file, production setting, or real project content was
changed.

**Local services and safety:** PostgreSQL was present and listening on
`127.0.0.1:5432`; it was not used for the application run or any write
operation. The backend used `DB_ENGINE=sqlite` and the separate QA database
`/private/tmp/portfolio_m11.sqlite3`; only schema migrations were applied to
that file. Vite proxied requests to this isolated Django process. The actual
root `.env` was loaded only for a read-only PostgreSQL
`makemigrations --check --dry-run`; no credentials were printed. The
PostgreSQL database `portfolio_db` was not reset, migrated, or written to.
The separate QA SQLite database had 0 project rows and 0 contact messages
after verification. No contact request reached Django, no admin account was
created, and no deployment occurred.

**Visual QA evidence:** Local Chrome/CDP screenshots were written under
`/private/tmp/portfolio-m11-*.png` and inspected. At all three requested
viewport sizes, the document width equaled the viewport (375, 768, and 1440
pixels). The mobile menu exposed all four links with `aria-expanded=true`;
reduced motion was emulated and reported active. The contact form returned
the success status from an intercepted synthetic API response. The live
project API remained empty, as expected.

**Commands and actual results:**

- `DB_ENGINE=sqlite DB_SQLITE_PATH=/private/tmp/portfolio_m11.sqlite3 backend/.venv/bin/python backend/manage.py migrate --noinput` — all built-in, Contact, and Projects migrations applied to the separate QA SQLite database.
- `DB_ENGINE=sqlite DB_SQLITE_PATH=/private/tmp/portfolio_m11.sqlite3 backend/.venv/bin/python backend/manage.py check` — no issues; Django reported the active database vendor as SQLite and the separate QA path.
- `DB_ENGINE=sqlite DB_SQLITE_PATH=/private/tmp/portfolio_m11.sqlite3 backend/.venv/bin/python backend/manage.py runserver 127.0.0.1:8000 --noreload` — started successfully after the sandbox's initial local bind attempt returned `Operation not permitted`.
- `VITE_API_BASE_URL=/api VITE_DEV_API_PROXY_TARGET=http://127.0.0.1:8000 npm run dev -- --host 127.0.0.1 --strictPort` — Vite 8.3.4 started at `http://127.0.0.1:5173/` after the same sandbox bind restriction was permitted.
- HTTP smoke checks: `/health/` returned 200 and `{"status":"ok"}`; `/api/projects/` and `/api/projects/featured/` returned 200 with empty paginated results; unknown project detail returned JSON 404; the Vite homepage and SPA project routes returned 200; Vite's `/health/` and `/api/projects/` proxies returned the backend responses.
- Chrome/CDP rendered the actual archive loading state under network throttling and the API-error state with browser requests blocked. The empty archive and missing-project page were also visually reviewed at the requested widths. Existing component tests cover successful project serialization and successful project detail rendering.
- Browser contact validation remained client-side. A synthetic success response was fulfilled in Chrome before it could reach the API; Django's request log showed only GET requests and no contact POST.
- From `frontend/`, `npm test` — **18 tests passed across 6 files**; `npm run lint` — passed with no findings; `npm run build` — passed (2,421 modules transformed).
- From `backend/`, `DB_ENGINE=sqlite DB_SQLITE_PATH=:memory: .venv/bin/python manage.py check` — no issues; `DB_ENGINE=sqlite DB_SQLITE_PATH=:memory: .venv/bin/python manage.py test contact projects healthcheck --verbosity 1` — **39 tests passed**, using Django's disposable in-memory test database.
- From `backend/`, `python3 -m json.tool projects/data/sample_projects.json` — passed; after a first invocation used an incorrect root-relative path from the backend directory, the corrected in-memory command `DB_ENGINE=sqlite DB_SQLITE_PATH=:memory: .venv/bin/python manage.py shell -c "from django.core.management import call_command; call_command('migrate', interactive=False, verbosity=0); call_command('import_portfolio_projects', 'projects/data/sample_projects.json', dry_run=True)"` reported **imported=4, updated=0, skipped=0, failed=0**. This was a dry-run on in-memory SQLite only.
- With root `.env` loaded, `backend/.venv/bin/python backend/manage.py makemigrations --check --dry-run` — **No changes detected** against configured PostgreSQL. This was read-only; migrations were not applied.

**Issues fixed:** The mobile hero name no longer clips outside its text column.
The brand-mark period now stays within its circle. The Skills and Experience
headings now render intended line breaks instead of displaying a literal
backslash-n. Frontend tests, lint, and build passed after these changes.

**Repository note:** `git diff --check` could not run because this workspace
does not contain Git metadata. This did not affect the test, lint, build, or
runtime checks. Chrome's reduced-motion emulation also produced Framer Motion's
informational reduced-motion console warning; no browser JavaScript exceptions
were observed.

**Remaining work:** Owner project URLs and screenshots remain pending. No
project content was imported; the successful project card/detail display was
verified by automated tests rather than by adding records to the live site.
No production hosting or deployment was configured.

**Next recommended step:** Review the captured layout and approved project
content with the owner once they provide any desired project links and images;
then handle any separate content-import decision explicitly.

## Milestone 12: Prepare project content for owner review

### Completed

- [x] Read the project status and inspect the Project schema, importer,
  projects tests, API-backed cards/detail views, featured selection, and
  current content documentation.
- [x] Prepare the five projects supplied in the handoff: Flock Energy Meter &
  Transformer Platform, Price Comparison Web App (PriceHunter), Shoply Clone,
  Note-Taking App, and Point and Shoot — Canvas Game.
- [x] Keep PriceHunter as one entry under the existing
  `price-comparison-web-app` slug; do not create a second alias record.
- [x] Preserve the existing AI-Powered Task Management REST API draft and its
  `featured: true` choice. Add no new featured selections.
- [x] Use the supplied Flock login and PriceHunter repository URLs only; keep
  all missing repository/demo/image URLs empty and omit demo credentials.
- [x] Include the Flock take-home/fixture-backed status and caveats against
  claiming live portal data; qualify PriceHunter pricing and Shoply payment
  claims as unverified.
- [x] Confirm the existing schema can represent the content without a model
  or migration change; document that status/source-verification data has no
  dedicated field and is described in text.
- [x] Update README project content, links, featured recommendation, and
  outstanding owner decisions.
- [x] Run JSON parsing, Django checks, the full backend test suite, and a
  standalone importer dry-run against disposable in-memory SQLite.

### Pending

- [ ] Owner confirms whether the retained AI-Powered Task Management API
  remains in the lineup and approves the final project wording/status notes.
- [ ] Owner confirms whether Flock supersedes the old Meter & Transformer
  entry and Shoply supersedes the old E-Commerce entry; their slugs differ and
  the importer does not remove older rows.
- [ ] Owner reviews featured selection and supplies any missing project
  repositories, demo URLs, and screenshots/images.

**Status:** Draft preparation and validation complete; owner content review is
pending. The work remains unpublished. Overall tracked progress is
**124/136 tasks (91.2%)**.

**Files modified:** `backend/projects/data/sample_projects.json`,
`backend/projects/tests.py`, `README.md`, and `PROJECT_PROGRESS.md`. No model,
migration, frontend source, dependency, environment configuration, database,
or hosting configuration was changed.

**Content decisions:** The existing AI Task API draft's title, slug, content,
and featured flag remain as a sixth entry; it remains the sole `featured: true`
record until the owner says otherwise.
The five newly supplied entries have `featured: false`. PriceHunter and Price
Comparison Web App use one entry and preserve the previous
`price-comparison-web-app` slug. The model has no structured project-status
field, so the fixture-data, take-home assignment, pricing, and payment caveats
are included in descriptions. The supplied Flock login URL and PriceHunter
repository URL are present but were not independently visited or verified.
Project URLs and image links not supplied remain blank.

**Commands and actual results:**

- `python3 -m json.tool backend/projects/data/sample_projects.json` — passed.
- From `backend/`, `DB_ENGINE=sqlite DB_SQLITE_PATH=:memory:
  .venv/bin/python manage.py check` — no issues.
- From `backend/`, `DB_ENGINE=sqlite DB_SQLITE_PATH=:memory:
  .venv/bin/python manage.py test projects --verbosity 1` — **22 tests passed**.
- From `backend/`,
  `DB_ENGINE=sqlite DB_SQLITE_PATH=:memory: .venv/bin/python manage.py test
  contact projects healthcheck --verbosity 1` — **39 tests passed**. The
  contact API storage-failure test intentionally logs its mocked database
  exception; the suite completed successfully.
- From `backend/`,
  `DB_ENGINE=sqlite DB_SQLITE_PATH=:memory: .venv/bin/python manage.py shell
  -c "from django.core.management import call_command;
  call_command('migrate', interactive=False, verbosity=0);
  call_command('import_portfolio_projects',
  'projects/data/sample_projects.json', dry_run=True)"` — dry-run reported
  **imported=6, updated=0, skipped=0, failed=0**. The migrations in this
  command were applied only to process-local in-memory SQLite to prepare the
  disposable validation database.

No PostgreSQL operation, migration drift check, frontend test/lint/build, live
URL check, write import, deployment, or production configuration change was
performed for this content-only milestone. No real database data was changed.

**Next recommended step:** Review the six-entry draft and decide whether the
existing AI Task API stays, which projects to feature, and which missing
repositories, demos, and screenshots to provide. Import remains a separate
action requiring explicit approval.

## Milestone 13: Finalize portfolio project drafts

### Completed

- [x] Read the project history and inspect the current JSON draft, Project
  model, importer, content tests, and README project-content guidance.
- [x] Apply the confirmed six-project lineup and order: Flock, AI Task API,
  Price Comparison Web App, Shoply Clone, Note-Taking App, and Point and Shoot.
- [x] Replace the old Meter & Transformer draft with Flock and the old
  E-Commerce draft with Shoply; each replacement is represented once.
- [x] Keep PriceHunter as the single `Price Comparison Web App` entry under
  its existing `price-comparison-web-app` slug.
- [x] Set Flock as the only featured project and retain the AI Task API as
  non-featured; all other entries are non-featured.
- [x] Preserve the Flock take-home/fixture-backed caveat, avoid claiming
  real-time retailer pricing, and avoid claiming production payment readiness.
  Retain only the previously supplied Flock and PriceHunter URLs; leave other
  missing links and all image URLs blank.
- [x] Update sample-content test assertions and current README documentation.
- [x] Run JSON/schema-shape/uniqueness/lineup checks, Django checks, and the
  existing Projects test suite using disposable in-memory SQLite.

### Pending

- [ ] Owner supplies any desired missing repository links, demo URLs, and
  screenshots/image URLs.
- [ ] Review external URL availability and final project wording before
  public display; separately approve any real-database import.

**Status:** The confirmed draft and local validation are complete. Projects
remain unpublished. Milestone 13 is **8/10**; overall tracked progress is
**132/146 tasks (90.4%)**.

The confirmed lineup, replacements, and featured choice in this milestone
resolve the corresponding decisions pending at the end of Milestone 12. Its
historical record above is preserved as written.

**Files modified:** `backend/projects/data/sample_projects.json`,
`backend/projects/tests.py`, `README.md`, and `PROJECT_PROGRESS.md`. No model,
migration file, frontend source, dependency, environment value, production
database, or hosting configuration was changed.

**Final lineup and flags:**

1. Flock Energy Meter & Transformer Platform — `featured: true`.
2. AI-Powered Task Management REST API — `featured: false`.
3. Price Comparison Web App (PriceHunter alias) — `featured: false`.
4. Shoply Clone — `featured: false`.
5. Note-Taking App — `featured: false`.
6. Point and Shoot — Canvas Game — `featured: false`.

**Commands and actual results:**

- `python3 -m json.tool backend/projects/data/sample_projects.json` — passed.
- A structural Python audit confirmed six records in the requested order,
  six unique slugs, required fields on every entry, one featured Flock record,
  a non-featured AI Task API, and absence of the superseded meter and
  e-commerce slugs — passed.
- From `backend/`,
  `DB_ENGINE=sqlite DB_SQLITE_PATH=:memory: .venv/bin/python manage.py check`
  — no issues.
- From `backend/`,
  `DB_ENGINE=sqlite DB_SQLITE_PATH=:memory: .venv/bin/python manage.py test
  projects --verbosity 1` — **22 tests passed**. The suite includes the
  importer's `--dry-run` validation against the sample JSON and asserts
  `imported=6, updated=0, skipped=0, failed=0`; Django removed the disposable
  test database after the run.
- The first JSON parse and test run failed because the editing patch left an
  extra opening brace at the beginning of the JSON array. That syntax error
  was fixed; the subsequent JSON audit and all 22 Projects tests passed.

No standalone importer command, explicit migration command, PostgreSQL
connection, real-database write, frontend build, or deployment was performed
for this content-only milestone. Django's test runner used only its disposable
in-memory SQLite test database. The missing links/assets and URL/content
review remain outstanding before public display.

## Milestone 14: Animated cursor and downloadable resume

### Completed

- [x] Read `PROJECT_PROGRESS.md`, `README.md`, and inspect the frontend app,
  shared layout, home page, resume section, styles, and existing tests.
- [x] Locate and verify the supplied PDF. The available source was
  `/Users/abhishek/Downloads/Abhishek_Software Engineer_20Oct26.pdf`; the
  `(1)`-suffixed variant named in the request was not present.
- [x] Copy the original PDF bytes to
  `frontend/public/Abhishek_Kr_Sharma_Resume.pdf`; the source and copy SHA-256
  matched, so the document was not rewritten.
- [x] Add a subtle dot and spring-following ring using existing Framer Motion
  dependencies and MotionValues, without pointer-movement React state updates.
- [x] Keep the custom cursor non-interactive with `pointer-events: none`,
  preserve native cursor behavior for text entry/selection and touch/coarse
  pointers, respect reduced motion, and clean up event and preference
  listeners on unmount.
- [x] Add a restrained interactive-target hover response for links, buttons,
  and project cards; retain existing keyboard focus styling.
- [x] Add the hero Download Resume action, a dedicated Resume PDF panel, a
  named download action, and a safe new-tab View Resume link.
- [x] Add homepage and dedicated Resume-section assertions for the resume URL,
  downloaded filename, download actions, and safe new-tab attributes.
- [x] Run frontend tests, lint, and production build; verify the public PDF and
  the built PDF are valid and byte-identical.
- [x] Verify the already-running local Vite server returns HTTP 200 for the
  homepage and PDF asset; update current README guidance and this milestone.

### Verification results

- `cd frontend && npm test` — **passed: 19 tests in 7 files**. The first run
  of the newly added Resume-section test failed because Vitest globals are
  not enabled; explicit imports were added and the rerun passed.
- `cd frontend && npm run lint` — **passed** (exit code 0).
- `cd frontend && npm run build` — **passed**; Vite generated the production
  bundle and copied the PDF to `frontend/dist/Abhishek_Kr_Sharma_Resume.pdf`.
- `file frontend/public/Abhishek_Kr_Sharma_Resume.pdf` — PDF document,
  version 1.5. The PDF is 95,487 bytes. The source, public file, and build
  artifact have the same SHA-256:
  `c6bfa42d8f61a10474e4924b692e8b20025cba4f2c530455c4b16bca7194ef28`.
- Local HTTP requests to `http://127.0.0.1:5173/` and
  `http://127.0.0.1:5173/Abhishek_Kr_Sharma_Resume.pdf` each returned HTTP 200;
  the asset response contained 95,487 bytes.
- The local Vite proxy returned HTTP 200 for `/health/` and `/api/projects/`.
- The local Django and Vite ports were already occupied by the running review
  services; those processes were left untouched. An isolated SQLite migration
  preparation command was also run against the scratch file
  `/private/tmp/portfolio-resume-ui.FggLjf`; Django applied the existing
  migrations successfully. That scratch database was not used by the already
  running server, and no portfolio records were added.

**Files changed:** `frontend/public/Abhishek_Kr_Sharma_Resume.pdf`,
`frontend/src/components/AnimatedCursor.jsx`,
`frontend/src/components/PageLayout.jsx`,
`frontend/src/components/ResumeSection.jsx`, `frontend/src/data/resume.js`,
`frontend/src/components/ResumeSection.test.jsx`,
`frontend/src/pages/HomePage.jsx`, `frontend/src/pages/HomePage.test.jsx`,
`frontend/src/styles.css`, `README.md`, and `PROJECT_PROGRESS.md`.

**Status:** Complete (10/10 milestone tasks). The frontend is available at
`http://127.0.0.1:5173/` for local review. Confirm the resume content and
approve its public availability before any deployment. Cross-device manual
visual review remains advisable; this milestone did not run a new browser
visual QA pass. No PostgreSQL data, contact messages, production settings, or
hosting configuration were changed, and nothing was deployed.

## Milestone 15: Add Movie-X project draft and card links

### Completed

- [x] Read the current README and progress history and inspect the Projects
  API, project model/serializer, JSON importer, sample draft, and API-backed
  project card/archive implementation.
- [x] Add Movie-X as one non-featured draft record with the owner-supplied
  summary, details, technology stack, GitHub URL, and Vercel demo URL.
- [x] Keep all prior six projects and their flags/links intact; Flock remains
  the only featured project.
- [x] Keep the Projects API architecture. Do not add a duplicate frontend-only
  project or write the draft to PostgreSQL.
- [x] Update shared project-card external actions to show GitHub and Live Demo
  with existing Lucide icons, visible link styling, and explicit safe new-tab
  attributes.
- [x] Add frontend coverage for API-returned Movie-X details, technology tag,
  internal detail route, and both safe external links.
- [x] Search the project, Downloads, and Codex attachment files for the
  supplied Movie-X screenshot. No local image file was available, so leave
  Movie-X's `image_url` blank and do not fabricate a preview.
- [x] Validate the seven-record draft, run Projects and frontend tests, lint,
  and production build, and update current README guidance.

### Verification results

- `python3 -m json.tool backend/projects/data/sample_projects.json` — passed.
- A structural audit confirmed seven unique slugs, exactly one featured
  project (Flock), Movie-X non-featured with the two supplied URLs, and a blank
  image field — passed.
- `cd backend && DB_ENGINE=sqlite DB_SQLITE_PATH=:memory: .venv/bin/python
  manage.py test projects --verbosity 1` — **22 tests passed**; Django system
  checks reported no issues. The sample-data test ran the existing importer
  dry-run against the disposable test database and verified seven planned
  imports with zero failures.
- `cd frontend && npm test` — **20 tests passed across 7 files**.
- `cd frontend && npm run lint` — passed.
- `cd frontend && npm run build` — passed.
- The first frontend test/build run exposed an unsupported `Github` export in
  the installed Lucide package and its resulting component render error. The
  card now uses the already-used `Code2` icon with Lucide `ExternalLink`; the
  final test, lint, and build reruns all passed.

**Files changed:** `backend/projects/data/sample_projects.json`,
`backend/projects/tests.py`, `frontend/src/components/ProjectCard.jsx`,
`frontend/src/pages/ProjectsPage.test.jsx`, `frontend/src/styles.css`,
`README.md`, and `PROJECT_PROGRESS.md`.

**Current draft lineup:** Flock Energy Meter & Transformer Platform remains
the sole featured entry. AI Task API, Price Comparison Web App, Shoply Clone,
Note-Taking App, Point and Shoot — Canvas Game, and Movie-X are non-featured.
Movie-X's supplied URLs have not been independently checked. Its screenshot
is still pending a local file or direct image URL from the owner.

**Owner README follow-up:** The current first README section was supplied and
used to refine Movie-X's summary and description to include Trending, Popular,
and Top Rated browsing, categories, cast, crew, ratings, related
recommendations, responsive design, and lazy-loaded images. The later legacy
section's Pushpraj Paroha / `prp0076` attribution, Netlify URL, watchlist,
personalized recommendation, analytics, and SEO claims were excluded. The
inline screenshot was visible in the conversation but no image file was
available in the workspace or Codex attachments to copy.

**Status:** Complete (8/8 tasks). Movie-X remains an unpublished JSON draft;
the Projects API will display it only after an explicitly approved import.
No PostgreSQL records were created or changed, no contact message was
submitted, and no deployment or production infrastructure change occurred.

## Milestone 16: Bundle Movie-X preview from the supplied ZIP

### Completed

- [x] Inspect the supplied `Movie-X-main.zip` README and relevant app files;
  use only its current README section and exclude the appended legacy content.
- [x] Verify the homepage screenshot exists at
  `src/assets/ss/home page.jpeg` in the archive and is a valid 1234 × 2316
  JPEG.
- [x] Copy the screenshot to `frontend/public/movie-x-preview.jpeg` without
  modifying or extracting over the source archive.
- [x] Show that image as the local preview fallback on the API-driven Movie-X
  project card; any API `image_url` takes precedence, and no project content is
  hardcoded into the frontend.
- [x] Add frontend test coverage for the accessible preview image and its URL.
- [x] Update README and progress notes, then run frontend tests, lint, build,
  and confirm Vite bundles the screenshot.

### Verification results

- `frontend`: `npm test` — **20 tests passed across 7 files**.
- `frontend`: `npm run lint` — passed.
- `frontend`: `npm run build` — passed; the preview image is present in the
  production output.
- Screenshot file check — JPEG signature verified; image dimensions are
  1234 × 2316. The screenshot was visually inspected.
- No backend test or migration was needed: the draft JSON, Django model,
  importer, API, and database were not changed.

### Owner follow-up and safety

The supplied ZIP includes a non-placeholder TMDB API key and read token in its
source configuration. They were not copied into this portfolio or repeated in
logs. Rotate/revoke them in TMDB and remove the credentials from the Movie-X
repository history; use environment configuration before distributing the
source further.

The screenshot now ships as a frontend asset. The API draft's `image_url`
remains blank because no public image URL was provided. Movie-X is still an
unpublished draft and will appear from the API only after an explicitly
approved import. No database import, contact submission, deployment, or
production configuration change occurred.

**Files changed:** `frontend/public/movie-x-preview.jpeg`,
`frontend/src/components/ProjectCard.jsx`,
`frontend/src/pages/ProjectsPage.test.jsx`, `frontend/src/styles.css`,
`README.md`, and `PROJECT_PROGRESS.md`.

**Status:** Complete (6/6 tasks). Overall tracked progress is 156/170 tasks
(91.8%).

## Milestone 17: Cyber neon visual theme

### Completed

- [x] Rework the existing frontend palette toward the supplied reference:
  deep navy surfaces with electric cyan, magenta, and violet accents.
- [x] Apply the theme consistently to the header, hero, calls to action,
  cards, form controls, project pages, cursor, and footer while preserving the
  existing layout, responsive rules, content, and application behavior.
- [x] Retain visible focus indicators, form contrast, reduced-motion support,
  and existing external-link behavior.
- [x] Run frontend tests, lint, and the production build.

### Verification results

- `cd frontend && npm test` — **20 tests passed across 7 files**.
- `cd frontend && npm run lint` — passed.
- `cd frontend && npm run build` — passed.

**Files changed:** `frontend/src/styles.css` and `PROJECT_PROGRESS.md`.

**Status:** Complete (4/4 tasks). No project records, backend settings,
dependencies, database data, deployment, or hosting configuration changed.

## Milestone 18: Cyber hero and local project catalogue

### Completed

- [x] Add an original, generated neon developer illustration to the hero. It
  uses the supplied screenshot only for cyber-neon mood and composition; it is
  not a copy of the screenshot or an image of the owner.
- [x] Rebuild the hero's visual hierarchy around the reference style: large
  cyan/magenta headline, neon character treatment, outlined action, and an
  evidence-based four-item portfolio summary.
- [x] Add all requested navigation labels: Home, About, Skills, Projects,
  Experience, Resume, and Contact, with matching page anchors.
- [x] Add a reviewed local catalogue containing all seven projects and their
  descriptions, technology stacks, and only supplied repository links.
- [x] Use the local catalogue for the home featured card, project archive, and
  project details so visitors do not need a deployed backend to view them.
- [x] Hide live deployment links from the local portfolio display; the Django
  API remains available for later integration and no database records changed.

### Verification results

- `cd frontend && npm test` — **15 tests passed across 7 files**.
- `cd frontend && npm run lint` — passed.
- `cd frontend && npm run build` — passed.

**Files changed:** `frontend/public/neon-developer-hero.png`,
`frontend/src/data/projects.js`, `frontend/src/pages/HomePage.jsx`,
`frontend/src/pages/ProjectsPage.jsx`,
`frontend/src/pages/ProjectDetailPage.jsx`, related frontend tests,
`frontend/src/components/Navbar.jsx`, `frontend/src/components/SkillsSection.jsx`,
`frontend/src/components/ResumeSection.jsx`, `frontend/src/styles.css`,
`README.md`, and `PROJECT_PROGRESS.md`.

**Status:** Complete (6/6 tasks). No database import, contact submission,
deployment, hosting change, or production credential change occurred.
