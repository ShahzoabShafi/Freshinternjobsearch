# FreshIntern

**Fresh Canadian SWE internships, the moment they post.**

A full-stack web app that surfaces software engineering internship and co-op
postings across Canada, filtered by how recently they were posted. A FastAPI
backend fetches and filters a live, hourly-updated job feed; a React + TypeScript
frontend lets you narrow results by recency, season, province, role type, and
category.

[![CI](https://github.com/ShahzoabShafi/Freshinternjobsearch/actions/workflows/ci.yml/badge.svg)](https://github.com/ShahzoabShafi/Freshinternjobsearch/actions/workflows/ci.yml)

> **Live app:** <https://freshinternjobsearch.vercel.app> · **API:** <https://freshinternjobsearch.onrender.com>

---

## Features

- **Recency-first search** — find roles posted in the last 24 hours, 48 hours, or up to 30 days.
- **Rich filtering** — by season (Fall/Winter/Spring/Summer), province, role type (internship vs. new-grad), and category (Software, AI/ML/Data, all tech).
- **Smart role matching** — catches frontend/backend/DevOps/cloud roles even when the upstream feed mis-categorises them, while excluding hardware/firmware roles.
- **Canada-aware** — parses location strings so Californian (`, CA`) roles aren't confused with Canadian ones.
- **Always current** — auto-detects the active job-feed source each year, so it keeps working across hiring cycles without code changes.
- **Fast** — a two-layer cache means the ~1.8 MB feed is downloaded at most once every five minutes, not on every request.

---

## Tech stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React, TypeScript, Vite, Tailwind CSS, Axios |
| Backend | Python, FastAPI, Uvicorn |
| Testing | pytest, Ruff (lint) |
| CI/CD | GitHub Actions, branch protection |
| Hosting | Vercel (frontend), Render (backend) |
| Data source | SimplifyJobs × Pitt CSC public internship feed |

---

## Project structure

```
Freshinternjobsearch/
├── .github/
│   └── workflows/
│       └── ci.yml          # CI pipeline: tests, build, lint
├── backend/
│   ├── core.py             # feed fetching, caching, and all filtering logic
│   ├── api.py              # FastAPI app (endpoints, CORS)
│   ├── test_core.py        # pytest unit tests for the filtering logic
│   └── requirements.txt
├── frontend/
│   ├── src/                # React components, API client, adapters
│   ├── .env                # local env vars (not committed)
│   └── package.json
└── README.md
```

---

## How it works

The backend reads a public `listings.json` published by the **SimplifyJobs ×
Pitt CSC** internship project — a community + automated feed that scrapes the
career pages of hundreds of companies and normalises them into one file, updated
hourly.

Rather than scraping LinkedIn or Indeed (which block automated access and forbid
it in their terms), this feed is public, structured, refreshed hourly, and legal
to consume. Although its source repo is named after a summer cycle, the feed
carries every term — Fall, Winter, Spring, and future summers — which is why the
app works year-round.

The request flow: the React app calls `GET /api/jobs` with the active filters →
FastAPI serves the filtered results from its cached copy of the feed → results
render as job cards. All filtering happens server-side in reusable functions
shared with a companion CLI tool.

### Two-layer caching

1. **Feed cache** (5-minute TTL) — the parsed ~1.8 MB feed is kept in memory and reused across requests, so different filter combinations share a single download.
2. **Source-resolution cache** (1-hour TTL) — the "which repo is active this cycle" lookup is cached separately, since it changes at most once a year.

---

## Getting started (local development)

You'll run two processes: the API and the frontend dev server.

### Prerequisites

- Python 3.10+
- Node.js 20+

### 1. Backend

```bash
cd backend
python -m venv .venv

# macOS / Linux:
source .venv/bin/activate
# Windows (PowerShell):
.venv\Scripts\Activate.ps1

pip install -r requirements.txt
uvicorn api:app --reload
```

The API runs at `http://127.0.0.1:8000`. Visit `http://127.0.0.1:8000/docs`
for interactive API documentation.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install

# create a .env file with the API URL (see below)
npm run dev
```

The app runs at `http://localhost:5173`.

---

## Environment variables

### Frontend (`frontend/.env`)

```
VITE_API_BASE_URL=http://127.0.0.1:8000
```

In production, set `VITE_API_BASE_URL` in Vercel's dashboard to your deployed
Render URL. Vite inlines env vars at **build time**, so redeploy after changing
it. Do not commit `.env` — commit a `.env.example` with an empty value instead.

### Backend (CORS)

`api.py` restricts which origins may call the API. Add your deployed frontend URL
(no trailing slash) to the `allow_origins` list alongside `http://localhost:5173`.

---

## API reference

### `GET /api/health`

Health check. Returns `{"status": "ok"}`.

### `GET /api/jobs`

Returns the filtered list of jobs as JSON. All query parameters are optional.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `hours` | number | `24` | Only roles posted within this many hours. |
| `term` | string | — | Season filter: `fall`, `winter`, `spring`, `summer`, or e.g. `winter 2027`. |
| `source` | string | `internships` | `internships` or `newgrad` (full-time roles). |
| `province` | string | — | Province code, e.g. `ON`, `QC`, `BC`. |
| `include_ai` | bool | `false` | Also include AI/ML/Data roles. |
| `all_tech` | bool | `false` | Include every tech category. |
| `rescue_adjacent` | bool | `false` | Catch mis-categorised frontend/backend/DevOps roles. |
| `roles` | string | — | Comma-separated title keywords, e.g. `backend,devops`. |

**Note:** an "All" selection in the UI means the parameter is omitted, not sent
as the literal string `All`.

Each job object includes: `title`, `company_name`, `locations` (array),
`category`, `terms`, `date_posted` (Unix epoch seconds), `url`, and `sponsorship`.
The feed does **not** provide application deadlines or job descriptions — see
limitations below.

---

## Testing

The filtering logic is pure functions, making it straightforward to test. Time is
injected into `find_jobs` so recency filters are deterministic.

```bash
cd backend
pytest
```

The suite covers Canada detection, the recency window, the category gate,
mis-categorised-role rescue, and the new-grad title exception.

---

## CI/CD

Every push and pull request to `main` triggers a GitHub Actions pipeline
(`.github/workflows/ci.yml`) with two parallel jobs:

- **Backend** — installs dependencies, runs `pytest` and `ruff`.
- **Frontend** — runs `npm ci`, `npm run build`, and lint (a build failure catches TypeScript errors).

`main` is protected: both checks are **required to pass** before a pull request
can merge, and merges must go through a PR. A failing check blocks the merge,
which blocks the deploy. On merge, Render and Vercel auto-deploy the backend and
frontend respectively.

---

## Deployment

- **Backend → Render.** Root directory `backend`, build `pip install -r requirements.txt`, start `uvicorn api:app --host 0.0.0.0 --port $PORT`. (`$PORT` is required — Render assigns the port via that variable.)
- **Frontend → Vercel.** Root directory `frontend`; Vite is auto-detected. Set `VITE_API_BASE_URL` to the Render URL in Vercel's environment variables.

---

## Known limitations

- **No application deadlines.** The feed doesn't publish them, so the UI shows "check posting." Many internships are rolling and have no fixed deadline anyway.
- **No job descriptions.** Not in the feed; the app links out to each company's posting for full details.
- **Cold starts.** Render's free tier sleeps after ~15 minutes idle, so the first request after a quiet spell takes 30–60 seconds to wake.
- **Coverage.** Results reflect what the upstream feed has logged — broad and hourly, but not every posting everywhere.

---

## Roadmap

- Saved jobs and email alerts for new matches (requires a database).
- Additional job sources (company ATS boards such as Greenhouse, Lever, Ashby).
- Server-side filtering so the frontend requests only what it needs.

---

## Acknowledgments

Job data from the [SimplifyJobs × Pitt CSC](https://github.com/SimplifyJobs)
internship listings project.

## License

Released under the [MIT License](LICENSE). Copyright (c) 2026 Shahzoab Shafi.