# Portfolio project

## Frontend

The React application lives in `frontend/` and uses Vite, React Router, Tailwind
CSS, Framer Motion, Axios, and Lucide icons. Its portfolio pages use the local,
reviewed project list in `frontend/src/data/projects.js`, so all project cards
and detail pages work without a deployed backend or database records. It does
not insert example content into the database.

Install dependencies and create local frontend environment configuration:

```sh
cd frontend
npm ci
cp .env.example .env
```

The default `VITE_API_BASE_URL=/api` sends browser requests through Vite's
same-origin proxy to Django at `http://127.0.0.1:8000`. If the backend uses a
different local address, set `VITE_DEV_API_PROXY_TARGET` in `frontend/.env`.
Vite variables are public browser configuration; never put database passwords,
Django secrets, or other credentials in a `VITE_*` variable.

Start Django from the repository root in one terminal after loading the root
`.env` as shown below, and start Vite in another terminal:

```sh
# Terminal 1 — repository root
set -a
source .env
set +a
backend/.venv/bin/python backend/manage.py runserver 127.0.0.1:8000

# Terminal 2 — repository root
cd frontend
npm run dev
```

Vite prints its local URL (normally `http://localhost:5173`). The frontend
development server proxies `/api/*` and `/health/` to Django. In a deployment,
prefer serving the frontend and API under one origin. If they must use separate
origins, configure `CORS_ALLOWED_ORIGINS` in Django's server-side environment as
a comma-separated list of exact trusted frontend origins. Django limits CORS
headers to `/api/`; wildcard origins are not enabled. The checked-in
`.env.example` lists the two local Vite origins as a starting point. Do not use
these local origins as a production allowlist.

The backend still provides these endpoints for future API integration:

| Method | Path | Frontend behavior |
| --- | --- | --- |
| `GET` | `/api/projects/` | Paginated Projects API. |
| `GET` | `/api/projects/featured/` | Featured Projects API. |
| `GET` | `/api/projects/<slug>/` | Project detail API. |
| `POST` | `/api/contact/` | Contact form submission, validation, and 429 feedback. |

Contact submissions are stored for Django Admin review. The form does not claim
to send email. Configure verified project and contact content through the
existing Django Admin/import workflow. The frontend displays only API-published
projects. Resume-provided profile links are labeled as supplied by the owner;
they have not been independently checked.

Run the frontend checks and create the production bundle with:

```sh
cd frontend
npm test
npm run lint
npm run build
npm run preview
```

`npm run preview` serves the built frontend locally. Production hosting must
serve the React app's `index.html` for client routes such as `/projects/slug/`
and route API requests to Django.

## Backend

The Django backend lives in `backend/`. Its first endpoint is `GET /health/`.

Copy `.env.example` to `.env` and replace the placeholder database values with
your local PostgreSQL settings. Django reads these variables from the process
environment; load them in your shell before running backend commands:

```sh
cp .env.example .env
# Edit .env with your local PostgreSQL database and user values.
set -a
source .env
set +a
```

Set `DB_ENGINE=sqlite` (or leave it unset) to use the SQLite development
fallback. PostgreSQL is selected with `DB_ENGINE=postgresql` and requires all
five `DB_*` connection variables.

```sh
cd backend
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python manage.py runserver
```

The endpoint returns `{"status":"ok"}` when the service is running.

## Projects API

The public Projects API is read-only and returns JSON. List endpoints use page
number pagination with a default page size of 10; `page_size` can be set up to
100.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/projects/` | List projects, newest first. |
| `GET` | `/api/projects/<slug>/` | Retrieve one project. |
| `GET` | `/api/projects/featured/` | List featured projects. |

Example requests:

```text
GET http://127.0.0.1:8000/api/projects/?page=1&page_size=10
GET http://127.0.0.1:8000/api/projects/featured/
GET http://127.0.0.1:8000/api/projects/portfolio-website/
```

Illustrative response only; this does not represent a current database row.

List response:

```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Portfolio Website",
      "slug": "portfolio-website",
      "short_description": "A React portfolio backed by a Django REST API and PostgreSQL.",
      "description": "A responsive portfolio with API-driven project pages and a contact form.",
      "tech_stack": ["React", "Django", "PostgreSQL"],
      "github_url": "",
      "live_url": "",
      "image_url": "",
      "featured": false,
      "created_at": "2026-10-20T10:00:00Z",
      "updated_at": "2026-10-20T10:00:00Z"
    }
  ]
}
```

The detail endpoint returns one project object with the same fields as each
`results` entry. Missing or invalid slugs return JSON with HTTP 404. Write
requests return HTTP 405.

## Contact API

The public contact endpoint accepts submissions only:

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/contact/` | Validate and save a contact message. |

Example request:

```json
{
  "name": "Example Visitor",
  "email": "visitor@example.invalid",
  "subject": "Portfolio enquiry",
  "message": "I would like to discuss a project."
}
```

Successful submissions return HTTP 201 without echoing personal information
or the saved message:

```json
{"detail": "Your message has been received."}
```

Invalid input returns HTTP 400 with field-level errors. For example:

```json
{"email": ["Enter a valid email address."], "message": ["This field is required."]}
```

Name is limited to 100 characters, email to 254, subject to 200, and message
to 5,000. Request bodies over 16 KiB receive HTTP 413. Public clients cannot
set message status or read/update/delete saved submissions. An optional blank
`website` honeypot field is accepted for forms; a non-empty value is rejected.

Anonymous submissions use a dedicated DRF throttle scope. Its default rate is
`5/hour`; set `CONTACT_SUBMISSION_RATE` in the local environment to change it.
Excess submissions receive HTTP 429. The throttle is applied only to this
endpoint. With Django's default
in-memory cache, counters are local to each process, and IP-based limits can
be inaccurate behind proxies. Application throttling is basic abuse friction,
not complete spam protection. A production deployment should use a shared
cache, configure trusted proxy behavior carefully, and add edge-level abuse
controls.

Review submissions after signing into Django Admin at
`http://127.0.0.1:8000/admin/`. The **Contact messages** section is available
to authorized staff and supports status/date filters and search. The endpoint
does not send email notifications; notifications can be considered as future
work.

## Django Admin and project content

Create an administrator interactively from the repository root after loading
the root `.env` as shown above. Django prompts for the username, email, and
password without putting a password in shell history:

```sh
backend/.venv/bin/python backend/manage.py createsuperuser
```

Start the backend locally and sign in at
`http://127.0.0.1:8000/admin/`:

```sh
backend/.venv/bin/python backend/manage.py runserver
```

The Projects section supports searching titles, descriptions, and technology
names, and filtering by featured status and creation date. The `tech_stack`
field is edited as JSON, for example `["Django", "PostgreSQL"]`.
Creation and update timestamps are read-only.

### Importing projects from JSON

The repeatable `import_portfolio_projects` command accepts a JSON object with
a `projects` array. Each record requires `title`, unique `slug`,
`short_description`, `description`, and a `tech_stack` array of strings.
`github_url`, `live_url`, `image_url`, and `featured` are optional. Existing
records are matched by slug and updated; identical records are skipped.
Validation failures are counted and printed by record number. The command
never deletes projects and rejects unknown fields.

The accepted JSON shape is:

```json
{
  "projects": [
    {
      "title": "Example project",
      "slug": "example-project",
      "short_description": "A verified short summary.",
      "description": "Verified project details.",
      "tech_stack": [],
      "github_url": "",
      "live_url": "",
      "image_url": "",
      "featured": false
    }
  ]
}
```

`backend/projects/data/sample_projects.json` contains seven unpublished draft
entries and is never loaded automatically. The confirmed lineup has Flock
Energy Meter & Transformer Platform, AI-Powered Task Management REST API,
Price Comparison Web App, Shoply Clone, Note-Taking App, and Point and Shoot —
Canvas Game, with Movie-X added as a non-featured entry. Flock remains the only
featured project; the AI Task API remains non-featured. Flock, PriceHunter, and
Movie-X have owner-supplied URLs; other missing repository/demo links and all
image fields are blank. Supplied URLs have not been independently checked for
availability. Do not import until the owner approves publication after
reviewing the content and remaining links/assets.

From the repository root, after loading `.env`, preview the sample import:

```sh
backend/.venv/bin/python backend/manage.py import_portfolio_projects \
  backend/projects/data/sample_projects.json --dry-run
```

After reviewing the dry-run counts and editing the file with verified
content, omit `--dry-run` to write those records to the configured database:

```sh
backend/.venv/bin/python backend/manage.py import_portfolio_projects \
  backend/projects/data/sample_projects.json
```

To test the Contact API, Projects API, and health check with Django's
disposable test database:

```sh
cd backend
.venv/bin/python manage.py test contact projects healthcheck
```

This test command does not create contact submissions or import sample projects
in the configured portfolio database.

## Prepared project content and owner review

No portfolio records were imported or published. The JSON is a content draft,
not a claim that projects are independently verified or production-ready. The
descriptions and features below use owner-supplied details. The existing
`Project` model has no status field, so assignment/data-source/payment caveats
are included in descriptions. Technologies and features are not independently
corroborated against the linked projects.

| Project | Slug | Prepared content and status | Repository | Demo | Image | Featured |
| --- | --- | --- | --- | --- | --- | --- |
| Flock Energy Meter & Transformer Platform | `flock-energy-meter-transformer-platform` | Take-home engineering assignment. Meter/transformer dashboards, search/filtering, details, authenticated CSV exports, responsive UI, themes. Project notes say fixture-backed data is the default; live portal retrieval/integration is not claimed. React, TypeScript, Vite, Fastify, Node.js, Zod, REST APIs. | Blank | [Owner-supplied login URL](https://flock-energy-frontend.onrender.com/login) (availability not independently checked) | Blank | `true` |
| AI-Powered Task Management REST API | `ai-powered-task-management-rest-api` | Task/user CRUD, JWT, three-role authorization, LangChain/RAG assistant. Python, Django REST Framework, PostgreSQL. | Blank | Blank | Blank | `false` |
| Price Comparison Web App | `price-comparison-web-app` | Search, category filters, INR prices, comparison, responsive grids, retailer links. Supplied details do not verify real-time pricing across every retailer. React, Node.js, Express, Tailwind CSS, Framer Motion, React Router, Axios, third-party product-data APIs. | [Owner-supplied repository](https://github.com/a7b0hishek/PriceHunter) (not independently checked) | Blank | Blank | `false` |
| Shoply Clone | `shoply-clone` | Authentication, listings, cart, wishlist, orders, and described Stripe integration; production payment readiness is not established. React, Node.js, Express, MongoDB, JWT, Stripe. | Blank | Blank | Blank | `false` |
| Note-Taking App | `note-taking-app` | Authentication, protected routes, note CRUD, responsive UI, themes. React, Redux Toolkit, Node.js, Express, MongoDB, JWT, bcryptjs. No demo credentials are included. | Blank | Blank | Blank | `false` |
| Point and Shoot — Canvas Game | `point-and-shoot-canvas-game` | Click flying ravens to score, collision detection, animated backgrounds, sound/visual effects, game-over state. HTML5 Canvas, JavaScript, CSS. | Blank | Blank | Blank | `false` |
| Movie-X | `movie-x` | Responsive movie/TV discovery, search, Trending/Popular/Top Rated browsing, categories, detail pages with cast, crew, ratings, related recommendations, and lazy-loaded images. React.js, Redux Toolkit, React Router, TMDB API, SCSS, JavaScript, Vercel. | [Owner-supplied GitHub repository](https://github.com/a7b0hishek/Movie-X) (not independently checked) | [Owner-supplied live demo](https://movie-x-orcin.vercel.app/) (not independently checked) | Homepage screenshot bundled locally at `frontend/public/movie-x-preview.jpeg`; card uses it as a local preview fallback while API `image_url` remains blank | `false` |

PriceHunter and Price Comparison Web App are one entry using the existing
`price-comparison-web-app` slug; the title is `Price Comparison Web App` and
the supplied PriceHunter repository is its GitHub link. Flock replaces the
older Meter & Transformer entry, and Shoply replaces the older E-Commerce
entry. Flock is the only featured project; the AI Task API and Movie-X are
non-featured. These are draft-file decisions only; no project rows were
imported or changed in the database. Movie-X will show in the API-backed
archive only after a separately approved import.

**Model limitation:** the schema represents descriptive content, a list of
technologies, three optional URLs, and a boolean featured flag. It does not
have structured status, source-verification, or screenshot-caption fields.
This draft records necessary context in the description and leaves unavailable
URLs/images empty; no schema change or migration was needed.

The frontend uses the resume-provided name Abhishek Kr Sharma and links to
`https://linkedin.com/in/a7b0hishek`, `https://github.com/a7b0hishek`, and
`mailto:a7b0hishek@gmail.com`. These values came from the resume content supplied
with the request and have not been independently verified. The profile test
checks the exact `https`/`mailto` targets; external links open in a new tab with
`noopener noreferrer`. The owner-supplied resume PDF is available from the
homepage hero and Resume section as a download or safe new-tab view at
`/Abhishek_Kr_Sharma_Resume.pdf`.

The site currently represents these resume-provided details:

- **Education:** B.Tech in Information Technology, Chandigarh Engineering
  College, Landran; IKG Punjab Technical University; 2026; CGPA 7.6/10.
- **Experience:** Python Full Stack Trainee at Future Finder (January–June
  2026); Full Stack Developer Intern at ThinkNext Technologies (May–November
  2025); Developer Intern at Devtown (August 2024–March 2025).
- **Skill groups:** Languages, Frontend, Backend, Databases, API & validation,
  Authentication, Testing & QA, Developer tools, Deployment, and Core concepts.
  Testing and QA are presented as supporting skills.

The owner has confirmed the profile and project decisions described above.
Resume-provided profile links and resume claims have not been independently
verified against the PDF or live external sites. Repository links, demo URLs,
and associated project screenshots remain to be supplied for projects without
owner-provided links/assets. Movie-X's supplied GitHub and Vercel links have not
been independently checked. Its homepage screenshot is bundled as a local
frontend preview; other project screenshots remain pending.

### Owner decisions and assets still needed

- The confirmed replacement decisions and featured choice are reflected in
  the draft; before public display, review all wording and confirm supplied
  links are still suitable and reachable. Flock data remains described as
  fixture-backed by default, not live portal data.
- Supply repository/live-demo links for AI Task API, Flock, Shoply,
  Note-Taking App, and Point and Shoot if they should be linked; supply a live
  demo for Price Comparison Web App. Movie-X's supplied links are recorded in
  its draft but still need owner review before public display.
- Supply screenshots or image URLs for other projects that should show imagery.
  All seven API `image_url` values remain blank; Movie-X uses its supplied
  screenshot as a frontend-only local preview fallback.
- Confirm the project descriptions and technology lists remain accurate before
  publication. Price comparison freshness and Shoply production payment
  readiness are not verified.

The homepage profile links remain resume-provided and have not been
independently checked. No supplied demo credentials are included in public
content. The resume download uses the PDF supplied for Milestone 14; the PDF
is a public frontend asset when the site is deployed, so review its contents
and public availability before deployment.

### Milestone 10 validation record

- The content JSON contains exactly four unique projects. Only the AI-Powered
  Task Management REST API is marked featured. The existing featured API
  filters `featured=true`, and the homepage renders the returned API project
  with a Featured badge; no project cards are hardcoded.
- The archive and detail pages retain their API-driven loading, empty, error,
  and not-found behavior. Project links are rendered only when nonempty; blank
  image URLs do not create image elements. Long project titles now allow
  wrapping in cards and detail headings.
- Source review covered the 1020px, 720px, and 390px responsive breakpoints,
  visible focus rules, reduced-motion handling, keyboard navigation tests,
  form labels/feedback semantics, and representative text contrast. At the
  time of Milestone 10, a browser viewport review had not been performed;
  Milestone 11 below records the later local Chrome review.
- `python3 -m json.tool backend/projects/data/sample_projects.json` and the
  structural content audit passed.
- Direct importer dry-run used a migrated, process-local SQLite `:memory:`
  database:

  ```sh
  cd backend
  DB_ENGINE=sqlite DB_SQLITE_PATH=:memory: .venv/bin/python manage.py shell -c \
    "from django.core.management import call_command; call_command('migrate', interactive=False, verbosity=0); call_command('import_portfolio_projects', 'projects/data/sample_projects.json', dry_run=True)"
  ```

  Result: `imported=4, updated=0, skipped=0, failed=0`. The in-memory
  database disappeared with the process. No write import was run against
  PostgreSQL.
- `npm test` — 18 passed across 6 files; `npm run lint` — passed;
  `npm run build` — passed with Vite 8.3.4.
- `DB_ENGINE=sqlite DB_SQLITE_PATH=:memory: .venv/bin/python manage.py check`
  — no issues; `manage.py test contact projects healthcheck --verbosity 1` —
  39 passed on Django's disposable test database.
- With the root `.env` loaded, `backend/.venv/bin/python
  backend/manage.py makemigrations --check --dry-run` — no changes detected.
  The first sandboxed connection attempt was blocked; the read-only retry
  completed successfully. No migrations were applied.

No project records were imported, and no deployment or production
configuration was changed.

## Production configuration audit

Local development remains the default (`DJANGO_DEBUG=true` in the example).
For a production process, set `DJANGO_DEBUG=false`; Django settings then require
a non-empty `DJANGO_SECRET_KEY` and explicit `DJANGO_ALLOWED_HOSTS` without
wildcards. Generate a unique secret in the chosen hosting secret manager and
never put it in the frontend environment. Use exact comma-separated origins
for `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS`; leave CORS empty when
frontend and backend share an origin. Use HTTPS, keep secure cookies enabled,
and set `DJANGO_SECURE_SSL_REDIRECT=true`. HSTS defaults to one year in
production; only enable subdomains or preload after confirming that every
affected hostname is permanently HTTPS. Set
`DJANGO_SECURE_PROXY_SSL_HEADER=true` only when a trusted proxy overwrites
`X-Forwarded-Proto` and prevents client-supplied values from reaching Django.
The root `.env` and frontend `.env` files are ignored by `.gitignore`; keep
real credentials in those local/server-side stores, never in example files.

The following shows the production environment shape. Replace every example
host and keep secret values in the host’s secret manager:

```dotenv
DJANGO_DEBUG=false
DJANGO_SECRET_KEY=<unique secret from secret manager>
DJANGO_ALLOWED_HOSTS=portfolio.example,api.portfolio.example
DJANGO_SECURE_SSL_REDIRECT=true
DB_ENGINE=postgresql
DB_NAME=<production database name>
DB_USER=<production database role>
DB_PASSWORD=<secret manager value>
DB_HOST=<provider database DNS name>
DB_PORT=5432
DB_SSLMODE=verify-full
DB_SSLROOTCERT=<provider CA certificate path>
CORS_ALLOWED_ORIGINS=https://portfolio.example
CSRF_TRUSTED_ORIGINS=https://portfolio.example
```

PostgreSQL remains configured through server-side `DB_*` variables. `DB_SSLMODE`
defaults to `prefer` in development and `verify-full` in production. Production
therefore requires a trusted server certificate and a database DNS hostname
that matches it; set `DB_SSLROOTCERT` to the provider CA file unless it is
installed in libpq’s default root-certificate location. Never place database
credentials in `frontend/.env` or `VITE_*` values.
`STATIC_ROOT=backend/staticfiles` is configured for `collectstatic`; run it
during release and serve collected files through the host’s static server or
CDN. Django Admin is available at `/admin/` and needs
its static assets served. The repository has no production WSGI/ASGI server,
static-serving adapter, or deployment configuration yet; select and configure
these for the hosting platform. Do not use Django `runserver` or `vite preview`
as production servers.

The contact API limits request bodies to 16 KiB when a `Content-Length` header
is present and returns a generic 503 on database storage failure. Set an
equivalent request-size limit at the reverse proxy for requests without that
header. Its `5/hour` DRF throttle uses Django’s default per-process in-memory
cache, which is not shared across workers or instances; production needs a
shared cache or edge-level rate limiting. The endpoint does not send email.

`frontend/.env.example` exposes only public routing configuration:
`VITE_API_BASE_URL` and the local Vite proxy target. The npm lockfile is
committed; backend `requirements.txt` pins Django and DRF but leaves psycopg
and CORS in version ranges, and there is no Python lockfile. The verified local
runtime is Python 3.14.7, Django 5.2.18, Node 24.14.0, and npm 11.9.0. Vite’s
lockfile declares Node `^20.19.0 || >=22.12.0`. Choose a supported runtime and
produce a backend dependency lock for the target platform before a repeatable
production release.

## Local checks

The commands used for release preparation are:

```sh
cd frontend
npm ci
npm test
npm run lint
npm run build

cd ../backend
.venv/bin/python manage.py check
.venv/bin/python manage.py test contact projects healthcheck
.venv/bin/python manage.py makemigrations --check --dry-run
```

The backend test command uses Django’s disposable test database. Migration
drift checks load the configured database settings but do not apply migrations.
Production readiness should also be checked with `manage.py check --deploy`
using the actual production environment values before release.

## Deployment prerequisites (not yet done)

- Owner approves project descriptions, featured flags, identity/name, and any
  real profile/project URLs.
- Choose a domain, frontend host, Django application host, and managed
  PostgreSQL provider; configure backups and a restore procedure.
- Configure production secrets, exact hosts/origins, database TLS, HTTPS,
  secure proxy headers, static collection/serving, and Admin access.
- Choose a production WSGI/ASGI server and shared cache or edge throttling;
  apply a proxy body-size limit and error monitoring.
- Run production checks, migrations via a reviewed release step, and smoke
  checks before making the application public.

Recommended shape: serve the Vite `dist/` bundle from a static CDN with SPA
fallback, and run Django on a managed application service next to managed
PostgreSQL. Route `/api/`, `/admin/`, `/health/`, and `/static/` through a
same-origin HTTPS reverse proxy where possible. This keeps database access
private and simplifies browser origin policy. Vite documents `dist` as the
static build output and says `vite preview` is for local preview; Django’s
deployment guide requires release-time static collection and production
security checks.

Official references: [Django deployment checklist](https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/), [Django static-file deployment](https://docs.djangoproject.com/en/5.2/howto/static-files/deployment/), [Vite static deployment](https://vite.dev/guide/static-deploy.html), and [PostgreSQL SSL support](https://www.postgresql.org/docs/current/libpq-ssl.html).

## Checks, migrations, and tests

Load the root `.env` before running backend commands, then use the existing
virtual environment:

```sh
set -a
source .env
set +a
cd backend
.venv/bin/python manage.py check
.venv/bin/python manage.py migrate --noinput
/Applications/Postgres.app/Contents/Versions/17/bin/psql -U postgres -d postgres \
  -c 'ALTER ROLE portfolio_app CREATEDB;'
.venv/bin/python manage.py test contact projects healthcheck
/Applications/Postgres.app/Contents/Versions/17/bin/psql -U postgres -d postgres \
  -c 'ALTER ROLE portfolio_app NOCREATEDB;'
```

Django creates and removes a separate PostgreSQL test database. The example
temporarily grants the app role `CREATEDB` for that test run and revokes it
afterward. Run the block from the repository root; the `cd backend` applies to
the remaining commands. The test runner does not use or delete `portfolio_db`.

## Milestone 11: Local run and responsive visual review

The 2026-10-20 local QA run kept the real PostgreSQL database out of the
application and used a separate SQLite file for Django's local server. From
the repository root, the backend setup and run command was:

```sh
DB_ENGINE=sqlite DB_SQLITE_PATH=/private/tmp/portfolio_m11.sqlite3 \
  backend/.venv/bin/python backend/manage.py migrate --noinput
DB_ENGINE=sqlite DB_SQLITE_PATH=/private/tmp/portfolio_m11.sqlite3 \
  backend/.venv/bin/python backend/manage.py runserver 127.0.0.1:8000 --noreload
```

In another terminal, start Vite with the existing local proxy:

```sh
cd frontend
VITE_API_BASE_URL=/api \
VITE_DEV_API_PROXY_TARGET=http://127.0.0.1:8000 \
  npm run dev -- --host 127.0.0.1 --strictPort
```

The captured run returned HTTP 200 from `/health/`, `/api/projects/`, and
`/api/projects/featured/` through both Django and Vite's proxy. The project
lists were empty, and a missing project detail returned JSON 404. No sample
projects were imported. The homepage, archive, missing-project page, skills,
experience/education, contact form, navigation, and footer were rendered at
375×812, 768×1024, and 1440×900. Archive loading, empty, and error states were
also rendered; the error and loading conditions used browser network
throttling/blocking. Document widths matched each viewport.

The mobile hero name and brand-mark period were corrected, and two section
heading line breaks were fixed during QA.
The contact form's required-field behavior was checked, and its success
feedback was exercised with a synthetic browser response intercepted before
it reached Django. This did not create a contact submission. Screenshots were
stored temporarily at `/private/tmp/portfolio-m11-*.png`; they are review
artifacts and are not checked into the project.

Results: `npm test` passed (18 tests/6 files), lint passed, and the production
build passed. Django system checks passed, and all 39 backend tests passed
using the disposable in-memory SQLite test database. The JSON file parsed and
the importer dry-run reported four planned imports and zero failures using
in-memory SQLite. PostgreSQL was listening locally; its migration drift check
reported no changes and did not apply migrations. `portfolio_db` was not
written to, reset, or migrated. The temporary `/private/tmp/portfolio_m11.sqlite3`
database contains only the QA schema and is separate from `portfolio_db`.

Project cards and successful project detail content were not visually populated
because there are no published rows; their rendering is covered by the
existing frontend tests. Project repository/demo URLs and actual images remain
pending owner input. This review did not deploy or publish the site.

## Milestone 12: Project content handoff

This section captures the draft status before the Milestone 13 owner decisions;
the lineup and featured choice documented in Milestone 13 are current.

The latest review draft at `backend/projects/data/sample_projects.json` has six
entries: the existing AI-Powered Task Management REST API plus the five
projects supplied for this handoff. The JSON is not published and no import was
run against PostgreSQL. The AI Task API remains the only project with
`featured: true`; this preserves the existing choice, not a new recommendation.
The five newly supplied projects are not featured pending owner review.

Price Comparison Web App (PriceHunter) is a single record using the existing
`price-comparison-web-app` slug. The supplied GitHub link is set on that
record. The Flock Energy Meter & Transformer Platform has the owner-supplied
login URL in `live_url`. Neither URL was independently checked. All other
missing project links and all six image URLs are empty. No demo credentials
are included.

The content mentions Flock is a take-home assignment with fixture-backed data
as its default; it does not claim live portal data or completed live
integration. PriceHunter wording does not promise real-time prices across all
retailers. Shoply wording describes Stripe integration without claiming
production payment readiness. The Project schema has no dedicated status or
verification fields, so these caveats are in each long description. No schema
change was made.

The featured recommendation is to review Flock (dashboard scope and supplied
demo link) or Price Comparison (repository link) as possible featured work.
This is a recommendation only; the current AI Task API featured flag remains
unchanged. Please confirm whether that older draft should remain in the
portfolio and approve any featured change before import.

Content validation commands were run from `backend/`:

```sh
python3 -m json.tool projects/data/sample_projects.json >/dev/null
DB_ENGINE=sqlite DB_SQLITE_PATH=:memory: .venv/bin/python manage.py check
DB_ENGINE=sqlite DB_SQLITE_PATH=:memory: .venv/bin/python manage.py test projects --verbosity 1
DB_ENGINE=sqlite DB_SQLITE_PATH=:memory: .venv/bin/python manage.py test contact projects healthcheck --verbosity 1
DB_ENGINE=sqlite DB_SQLITE_PATH=:memory: .venv/bin/python manage.py shell -c "from django.core.management import call_command; call_command('migrate', interactive=False, verbosity=0); call_command('import_portfolio_projects', 'projects/data/sample_projects.json', dry_run=True)"
```

Results: JSON parsing passed; Django system check reported no issues; the
Projects tests passed (**22 tests**) and the full backend suite passed (**39
tests**). The importer dry-run on process-local in-memory SQLite reported
`imported=6, updated=0, skipped=0, failed=0`. Those migration operations were
only against the disposable in-memory database. No production/PostgreSQL
migration check, frontend tests/lint/build, real import, deployment, or
external URL check was run for this content-only change.

Owner review still needed: whether the AI Task API belongs in the lineup;
final factual wording and featured selection; repositories for Flock, Shoply,
Note-Taking App, and Point and Shoot; demos for PriceHunter, Shoply,
Note-Taking App, and Point and Shoot; and real screenshots/images for any
project that should show imagery. The existing Flock URL also needs owner
confirmation that it should be publicly linked and is currently available.

## Milestone 13: Confirmed project draft

The owner confirmed the final six-project lineup and featured choice. The
current draft order is:

1. **Flock Energy Meter & Transformer Platform** — featured.
2. **AI-Powered Task Management REST API** — not featured.
3. **Price Comparison Web App** — not featured; the single PriceHunter entry.
4. **Shoply Clone** — not featured; replaces the old E-Commerce draft.
5. **Note-Taking App** — not featured.
6. **Point and Shoot — Canvas Game** — not featured.

Flock replaces the old Meter & Transformer entry. PriceHunter keeps the
existing `price-comparison-web-app` slug and the supplied repository URL; it
is not a separate record. Flock's supplied login URL is retained. Its
take-home-assignment and fixture-backed-default status remain explicit; no
live portal integration is claimed. Price data is not described as verified
in real time across all retailers. Shoply's Stripe integration is described
without claiming production payment verification. The only `featured: true`
value is Flock. No model or migration change was needed.

The final draft remains unpublished. Missing repository/demo links remain for
the AI Task API, Flock repository, Price Comparison demo, Shoply, Note-Taking
App, and Point and Shoot. All six image URLs are blank. Before public display,
the supplied Flock and PriceHunter URLs and project wording still need review;
availability and implementation claims were not independently verified.
The owner must separately approve any import to PostgreSQL.

Validation for this draft: JSON parsing and a structural audit passed (six
entries, unique slugs, required fields, expected order, and Flock as the only
featured project). `DB_ENGINE=sqlite DB_SQLITE_PATH=:memory:
.venv/bin/python manage.py check` reported no issues, and
`DB_ENGINE=sqlite DB_SQLITE_PATH=:memory: .venv/bin/python manage.py test
projects --verbosity 1` passed **22 tests**. The existing sample importer test
exercises `--dry-run` against the disposable test database and asserts
`imported=6, updated=0, skipped=0, failed=0`. No standalone import, explicit
migration command, PostgreSQL write, deployment, or frontend build was run for
this content-only update.

## Milestone 14: Resume download and animated cursor

Open the locally running frontend at `http://127.0.0.1:5173/`. The homepage
hero includes a **Download Resume** action. The Resume section also includes a
download with the filename `Abhishek_Kr_Sharma_Resume.pdf` and a **View Resume**
link that opens the supplied PDF in a new tab. The asset is stored at
`frontend/public/Abhishek_Kr_Sharma_Resume.pdf` and is copied into the Vite
production build. Review the PDF and confirm it should be publicly accessible
before deploying the site.

The custom cursor uses the existing Framer Motion dependency. It is enabled
only for a fine mouse pointer when reduced motion is not requested; it remains
non-interactive, preserves native text-entry/selection behavior, and hides on
touch/coarse pointers. Frontend tests (19 tests across 7 files), lint, and the
production build passed during Milestone 14. See `PROJECT_PROGRESS.md` for the
SHA-256 and exact verification results. The local development site is not a
production deployment.

## Milestone 15: Movie-X project draft

Movie-X is prepared as a non-featured record in
`backend/projects/data/sample_projects.json`. Its summary, description, stack,
and features use the current section of the Movie-X README supplied by the
owner. It lists Trending, Popular, and Top Rated browsing, categories,
responsive pages, cast, crew, ratings, recommendations, and lazy-loaded images.
The older second README section's author/Netlify attribution and unsupported
watchlist, personalized recommendation, analytics, and SEO claims were not
used. The draft includes the
owner-supplied [GitHub repository](https://github.com/a7b0hishek/Movie-X) and
[Vercel demo](https://movie-x-orcin.vercel.app/); neither link has been
independently checked. The card uses the existing API-driven Projects archive,
with GitHub and Live Demo actions opening safely in a new tab. Movie-X is not
hardcoded into the frontend, and it will not appear in the API until a
separately approved import. Flock remains the only featured project.

The screenshot shown in the request was not available as a local image file in
the workspace or Codex attachments, so the Movie-X image field is blank and
the existing abstract project-card artwork remains in use. Provide the image
file (or a direct image URL) to add a real preview.

Validation: JSON parsing and structure checks passed; the Projects suite passed
22 tests using disposable SQLite; frontend tests passed 20 tests across 7
files; lint and production build passed. No project records were imported, no
contact messages were created, and the site was not deployed.

## Milestone 16: Movie-X screenshot preview

The supplied `Movie-X-main.zip` contains the Movie-X homepage screenshot. It is
bundled at `frontend/public/movie-x-preview.jpeg` and shown as a local image
fallback on the API-driven Movie-X card. A future project `image_url` supplied
by the API takes precedence. The draft JSON keeps `image_url` blank; the
screenshot is a frontend asset, not a published URL or project record. The
uploaded README's current section informed the project draft; its appended
legacy attribution and unsupported claims were excluded.

The archive contains non-placeholder TMDB credentials in its app config. They
were not copied into this portfolio. Rotate/revoke the credentials and remove
them from the Movie-X source history before further distribution. The source
archive was not installed or run.

See `PROJECT_PROGRESS.md` for the exact frontend test, lint, build, and asset
verification results. The project remains an unpublished draft; no database
records, deployment, or production configuration were changed.
