import cli.py


def find_jobs(listings, args, now=None):
    now = now or time.time()
    cats = select_categories(args)
    roles = None
    if args.roles:
        roles = [r.strip().lower() for r in args.roles.split(",") if r.strip()]
    term = args.term.strip().lower() if args.term else None
    window = args.hours * 3600
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
        in_category = cats is None or job.get("category") in cats
        if not in_category:
            if args.rescue_adjacent and is_swe_adjacent(title):
                pass  # rescued by title
            else:
                continue

        if args.source != "newgrad" and not is_internship(title):
            continue
        # Optional narrowing to specific role keywords (e.g. --roles devops,backend)
        if roles and not any(r in title.lower() for r in roles):
            continue
        if not is_in_canada(job.get("locations"), args.province):
            continue
        posted = job.get("date_posted", 0)
        if (now - posted) > window:
            continue
        out.append(job)
    out.sort(key=lambda j: j.get("date_posted", 0), reverse=True)
    return out

def get_jobs(search_parameters):
    url = resolve_source_url(search_parameters)
    try:
        listings = fetch_listings(url)
    except Exception as e:
        print(f"ERROR: could not download the feed: {e}", file=sys.stderr)
        return 1

    now = time.time()
    jobs = core.find_jobs(listings,search_parameters)
    return jobs