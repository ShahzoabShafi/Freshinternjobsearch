from fastapi import FastAPI
from typing import Literal
from argparse import Namespace
import cli.py
import core.py

app = FastAPI()


@app.get("/api/jobs")
def get_jobs_api(
    hours: float = 24.0,
    term: str | None = None,
    source: Literal["internships", "newgrad"] = "internships",
    year: int | None = None,
    source_url: int | None = None,
    province: int | None = None,
    include_ai=False,
    all_tech=False,
    rescue_adjacent=False,
    roles: int | None = None,
    csv: int | None = None,
    xlsx: int | None = None,
    json: int | None = None,
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
        csv=csv,
        xlsx=xlsx,
        json=json,
    )

    jobs = get_jobs(search_parameters)

    return jobs
