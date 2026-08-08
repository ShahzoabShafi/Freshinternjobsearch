from types import SimpleNamespace

from core import find_jobs

NOW = 1_000_000_000  # fixed reference time so recency is deterministic

def make_job(**overrides):
    job = {
        "active": True, "is_visible": True,
        "title": "Software Engineering Intern",
        "category": "Software", "terms": ["Fall 2026"],
        "locations": ["Toronto, ON, Canada"],
        "date_posted": NOW - 3600,  # 1h ago
    }
    job.update(overrides)
    return job

def make_args(**overrides):
    base = {"hours": 24.0, "term": None, "source": "internships", "province": None,
             "include_ai": False, "all_tech": False, "rescue_adjacent": False,
             "roles": None, "year": None, "source_url": None}
    base.update(overrides)
    return SimpleNamespace(**base)

def run(jobs, **arg_overrides):
    return {j["id"] for j in find_jobs(jobs, make_args(**arg_overrides), now=NOW)}

def test_excludes_non_canadian_roles():
    jobs = [make_job(id="ca", locations=["Toronto, ON, Canada"]),
            make_job(id="us", locations=["San Francisco, CA"])]
    assert run(jobs) == {"ca"}

def test_recency_window():
    jobs = [make_job(id="fresh", date_posted=NOW - 2*3600),
            make_job(id="stale", date_posted=NOW - 30*3600)]
    assert run(jobs, hours=24) == {"fresh"}

def test_ai_excluded_by_default_included_with_flag():
    jobs = [make_job(id="ai", category="AI/ML/Data", title="Machine Learning Intern")]
    assert run(jobs) == set()
    assert run(jobs, include_ai=True) == {"ai"}

def test_rescue_adjacent_catches_mistagged_role():
    jobs = [make_job(id="be", category="AI/ML/Data", title="Backend Developer Intern")]
    assert run(jobs) == set()
    assert run(jobs, rescue_adjacent=True) == {"be"}

def test_newgrad_source_skips_intern_title_gate():
    jobs = [make_job(id="ng", title="Software Engineer, New Grad")]
    assert run(jobs) == set()
    assert run(jobs, source="newgrad") == {"ng"}