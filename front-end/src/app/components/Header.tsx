import {
  Leaf,
  Bookmark,
  FilterIcon,
  RefreshCw,
  FileSpreadsheet,
  Download,
} from "lucide-react";
import { Job } from "../types/job"; 
import React, { useState, useMemo, useEffect, useRef } from "react";
import { SortBy, View, Filters } from "../types/filters";
import { ALL_JOBS, DEFAULT_FILTERS } from "../constants/index.ts";

export default function Header() {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [showError, setShowError] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [activeView, setActiveView] = useState<View>("browse");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [appliedFilters, setAppliedFilters] =
    useState<Filters>(DEFAULT_FILTERS);

  const browsedJobs = useMemo(
    // () => filterJobs(ALL_JOBS, appliedFilters),
    () => ALL_JOBS.filter((j: Job) => savedIds.has(j.id)), // to be changed
    [appliedFilters]
  );
  const savedJobs = useMemo(
    () => ALL_JOBS.filter((j: Job) => savedIds.has(j.id)),
    // () => DEFAULT_FILTERS, // to be changed
    [savedIds]
  );

  const displayJobs = useMemo(() => {
    const base : Job[] = activeView === "saved" ? savedJobs : browsedJobs;
    return [...base].sort((a, b) =>
      sortBy === "newest"
        ? b.postedAt.getTime() - a.postedAt.getTime()
        : a.company.localeCompare(b.company)
    );
  }, [activeView, browsedJobs, savedJobs, sortBy]);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1200);
  };

  const handleExportCSV = () => {
    const rows = [
      [
        "Title",
        "Company",
        "Location",
        "Category",
        "Posted",
        "Deadline",
        "Season",
        "Role Type",
      ],
      ...displayJobs.map((j) => [
        j.title,
        j.company,
        j.location,
        j.category,
        j.postedAt.toISOString(),
        j.deadline?.toLocaleDateString("en-CA") ?? "N/A",
        j.season,
        j.roleType,
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "freshintern-roles.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    const rows = [
      [
        "Title",
        "Company",
        "Location",
        "Category",
        "Posted",
        "Deadline",
        "Season",
        "Role Type",
      ],
      ...displayJobs.map((j) => [
        j.title,
        j.company,
        j.location,
        j.category,
        j.postedAt.toISOString(),
        j.deadline?.toLocaleDateString("en-CA") ?? "N/A",
        j.season,
        j.roleType,
      ]),
    ];
    const tsv = rows.map((r) => r.join("\t")).join("\n");
    const blob = new Blob([tsv], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "freshintern-roles.xls";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <header className="flex-shrink-0 h-14 bg-card border-b border-border flex items-center px-4 lg:px-5 gap-4 z-20">
        {/* Left zone: logo + tagline + nav tabs */}
        <div className="flex items-center gap-5 flex-1 min-w-0">
          {/* Logo and byline */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <Leaf className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span
              className="text-[1.05rem] font-bold tracking-tight text-foreground"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Fresh<span className="text-primary">Intern</span>
            </span>
          </div>

          <span className="hidden xl:block text-[0.8125rem] text-muted-foreground leading-none">
            Fresh Canadian SWE internships, the moment they post
          </span>

          {/* Nav tabs — desktop */}
          <div className="hidden sm:flex items-center gap-0.5 bg-muted rounded-lg p-0.5">
            <button
              onClick={() => setActiveView("browse")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                activeView === "browse"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Browse jobs
            </button>
            <button
              onClick={() => setActiveView("saved")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeView === "saved"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Saved
              {savedIds.size > 0 && (
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                  {savedIds.size}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Right zone: Export cluster + Refresh */}
        <div className="flex items-center gap-2">
          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            disabled={isLoading || displayJobs.length === 0}
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-card text-xs font-medium text-muted-foreground hover:text-foreground hover:border-border/70 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>
          {/* Export Excel */}
          <button
            onClick={handleExportExcel}
            disabled={isLoading || displayJobs.length === 0}
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-card text-xs font-medium text-muted-foreground hover:text-foreground hover:border-border/70 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Excel
          </button>
          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="w-8 h-8 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border/70 transition-colors disabled:opacity-40"
            aria-label="Refresh listings"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
          {/* Mobile: Filters button */}
          {activeView === "browse" && (
            <button
              onClick={() => setFilterDrawerOpen(true)}
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold"
            >
              <FilterIcon className="w-3.5 h-3.5" />
              Filters
            </button>
          )}
          {/* Mobile: saved tab */}
          <button
            onClick={() =>
              setActiveView(activeView === "saved" ? "browse" : "saved")
            }
            className={`sm:hidden w-8 h-8 rounded-lg flex items-center justify-center transition-colors border ${
              activeView === "saved"
                ? "bg-primary border-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>
    </>
  );
}
