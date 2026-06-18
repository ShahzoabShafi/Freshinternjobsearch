import time, sys, urllib.request, json, urllib.error
from datetime import datetime, timezone

# Raw listings path within any SimplifyJobs repo
LISTINGS_PATH = "dev/.github/scripts/listings.json"
RAW_BASE = "https://raw.githubusercontent.com/SimplifyJobs/{repo}/" + LISTINGS_PATH
NEWGRAD_REPO = "New-Grad-Positions"
INTERN_REPO_TMPL = "Summer{year}-Internships"

# Fallback if auto-detection can't reach GitHub (kept current-ish; auto-detect
# normally overrides this anyway).
FALLBACK_INTERN_REPO = "Summer2026-Internships"

# Category labels as they appear in the feed
SOFTWARE_CATEGORIES = {"Software", "Software Engineering"}
AI_CATEGORIES = {"AI/ML/Data", "Data Science, AI & Machine Learning"}

# Canadian province / territory codes (used as a secondary location signal)
CA_PROVINCES = {
    "ON", "QC", "BC", "AB", "MB", "SK", "NS", "NB", "NL", "PE", "NT", "YT", "NU",
}

# Title must look like an internship or a (Canadian) co-op role
INTERN_KEYWORDS = ("intern", "co-op", "coop", "co op")

# Software-adjacent role types. Used by --rescue-adjacent to catch roles that
# the feed mis-categorised (e.g. a frontend role tagged "AI/ML/Data").
SWE_ADJACENT_KEYWORDS = (
    "software", "developer", "programmer", "swe",
    "front end", "front-end", "frontend",
    "back end", "back-end", "backend",
    "full stack", "full-stack", "fullstack",
    "devops", "dev ops", "sre", "site reliability",
    "web develop", "mobile", "ios", "android",
    "cloud engineer", "platform engineer", "infrastructure engineer",
    "sdet", "qa engineer", "automation engineer",
)

# When rescuing, skip these to avoid pulling in hardware/firmware roles.
HARDWARE_EXCLUDE = ("embedded", "firmware", "fpga", "circuit", "pcb", "rtl", "asic")


def get_jobs(search_parameters):
    url = resolve_source_url(search_parameters)
    try:
        listings = fetch_listings(url)
    except Exception as e:
        raise Exception(f"could not download the feed: {e}")
        # print(f"ERROR: could not download the feed: {e}", file=sys.stderr)
        # return 1

    now = time.time()
    jobs = find_jobs(listings,search_parameters)
    return jobs

def find_jobs(listings, search_parameters, now=None):
    now = now or time.time()
    categories = select_categories(search_parameters)
    roles = None
    if search_parameters.roles:
        roles = [r.strip().lower() for r in search_parameters.roles.split(",") if r.strip()]
    term = search_parameters.term.strip().lower() if search_parameters.term else None
    window = search_parameters.hours * 3600
    out = []
    for job in listings:
        if not job.get("active", False):
            continue
        if not job.get("is_visible", True):
            continue
        title = job.get("title", "")

        # Season / term filter (e.g. "fall", "winter 2027"). Feeds without a
        # terms field (e.g. New-Grad) simply skip this filter.
        if term:
            job_terms = " ".join(job.get("terms") or []).lower()
            if job_terms and term not in job_terms:
                continue
            if not job_terms:  # no term info but user asked for a season
                continue

        # Category gate, with optional rescue of mis-categorised SWE-adjacent roles
        in_category = categories is None or job.get("category") in categories
        if not in_category:
            if search_parameters.rescue_adjacent and is_swe_adjacent(title):
                pass  # rescued by title
            else:
                continue

        if search_parameters.source != "newgrad" and not is_internship(title):
            continue
        # Optional narrowing to specific role keywords (e.g. --roles devops,backend)
        if roles and not any(r in title.lower() for r in roles):
            continue
        if not is_in_canada(job.get("locations"), search_parameters.province):
            continue
        posted = job.get("date_posted", 0)
        if (now - posted) > window:
            continue
        out.append(job)
    out.sort(key=lambda j: j.get("date_posted", 0), reverse=True)
    return out

def select_categories(search_parameters):
    cats = set(SOFTWARE_CATEGORIES)
    if search_parameters.include_ai:
        cats |= AI_CATEGORIES
    if search_parameters.all_tech:
        return None  # None => accept every category
    return cats

def is_in_canada(locations, province=None):
    """True if any location string points to Canada (optionally one province)."""
    for loc in locations or []:
        low = loc.lower()
        canadian = ("canada" in low) or loc.strip().endswith(", CAN")
        if not canadian:
            # also catch bare 'City, ON' style with a province code + no country
            parts = [p.strip() for p in loc.split(",")]
            if any(p in CA_PROVINCES for p in parts):
                canadian = True
        if not canadian:
            continue
        if province:
            parts = [p.strip().upper() for p in loc.split(",")]
            if province.upper() not in parts:
                continue
        return True
    return False

def is_internship(title):
    t = (title or "").lower()
    return any(k in t for k in INTERN_KEYWORDS)

def is_swe_adjacent(title):
    """True if the title names a software-adjacent role (frontend, devops, ...)."""
    t = (title or "").lower()
    if any(h in t for h in HARDWARE_EXCLUDE):
        return False
    return any(k in t for k in SWE_ADJACENT_KEYWORDS)


def fetch_listings(url):
    """Download and parse a listings feed from a given URL."""
    req = urllib.request.Request(url, headers={"User-Agent": "intern-finder/1.0"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))


def resolve_source_url(search_parameters, verbose=True):
    """Decide which listings.json URL to pull from, based on search_parameters."""
    if search_parameters.source_url:
        return search_parameters.source_url
    if search_parameters.source == "newgrad":
        # if verbose:
        #     print(f"  Source: {NEWGRAD_REPO} (full-time new-grad roles)")
        return RAW_BASE.format(repo=NEWGRAD_REPO)
    # default: internships
    if search_parameters.year:
        repo = INTERN_REPO_TMPL.format(year=search_parameters.year)
    else:
        repo = detect_intern_repo(verbose=verbose)
    return RAW_BASE.format(repo=repo)

def detect_intern_repo(verbose=True):
    """Find the newest existing 'Summer{YEAR}-Internships' repo.

    SimplifyJobs launches a new repo for each upcoming cycle, so the highest
    year that exists is the active one. This makes the script self-updating
    across years. Falls back to a known repo if GitHub can't be reached.
    """
    this_year = datetime.now(timezone.utc).year
    # check next two years down to last year (covers early/late-cycle naming)
    candidates = [this_year + 1, this_year, this_year - 1]
    reachable_any = False
    for y in candidates:
        repo = INTERN_REPO_TMPL.format(year=y)
        exists = _listings_exists(repo)
        if exists is not None:
            reachable_any = True
        if exists:
            if verbose:
                print(f"  Active internship repo detected: {repo}")
            return repo
    if not reachable_any and verbose:
        print("  (Could not reach GitHub; using fallback repo.)")
    elif verbose:
        print(f"  Using fallback repo: {FALLBACK_INTERN_REPO}")
    return FALLBACK_INTERN_REPO

def _listings_exists(repo, timeout=15):
    """Cheap existence check: a 1-byte Range request to the raw listings file.

    Avoids the GitHub API's 60/hour unauthenticated rate limit, and checks the
    exact file we need rather than just the repo.
    """
    url = RAW_BASE.format(repo=repo)
    req = urllib.request.Request(
        url, headers={"User-Agent": "intern-finder/1.0", "Range": "bytes=0-0"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.status in (200, 206)
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return False
        return None  # other HTTP error -> uncertain
    except Exception:
        return None  # network/uncertain -> caller decides
