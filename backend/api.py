from fastapi import FastAPI
from typing import Literal
from argparse import Namespace
from core import get_jobs

app = FastAPI()

@app.get("/api/jobs")
def get_jobs_api(
    hours: float = 24.0,
    term: str | None = None,
    source: Literal["internships", "newgrad"] = "internships",
    year: int | None = None,
    source_url: str | None = None,
    province: str | None = None,
    include_ai : bool = False,
    all_tech : bool = False,
    rescue_adjacent : bool = False,
    roles: str | None = None,
):  
    search_parameters = Namespace(
        hours=hours,
        term=term,
        source=source,
        year=year,
        source_url=source_url,
        province=province,
        include_ai=include_ai,
        all_tech=all_tech,
        rescue_adjacent=rescue_adjacent,
        roles=roles,
    )

    jobs = get_jobs(search_parameters)

    return jobs
