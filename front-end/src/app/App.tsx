import React from "react";
import Header from "./components/Header.js";
import FilterPanelContent from "./components/FilterPanelContent.js";
import { useState, useEffect } from "react";
import { View, Filters } from "./types/filters.ts";
import { DEFAULT_FILTERS } from "./constants/index.ts";
import { fetchInternships } from "./utils/api.ts";
import Jobs from "./components/Jobs.tsx";
import { JobListing } from "./types/job.ts";

function App() {
  const [draftFilters, setDraftFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<Filters>(DEFAULT_FILTERS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [activeView, setActiveView] = useState<View>("browse");
  const [keywordInput, setKeywordInput] = useState(""); 
  const [jobs, setJobs] = useState<JobListing[]>([]);
  // const [sortBy, setSortBy] = useState<SortBy>("newest");

  useEffect(() => {
    fetchData(draftFilters);
  }, []);

  const handleApply = () => {
    setAppliedFilters(draftFilters);
    setFilterDrawerOpen(false);
    fetchData(appliedFilters);
  };

  const handleReset = () => {
    setDraftFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setFilterDrawerOpen(false);
    fetchData(DEFAULT_FILTERS);
  };

  const addKeyword = (kw: string) => {
    const trimmed = kw.trim().toLowerCase().replace(/,$/, "");
    if (trimmed && !draftFilters.keywords.includes(trimmed)) {
      setDraftFilters((f) => ({ ...f, keywords: [...f.keywords, trimmed] }));
    }
    setKeywordInput("");
  };

  const removeKeyword = (kw: string) => {
    setDraftFilters((f) => ({
      ...f,
      keywords: f.keywords.filter((k) => k !== kw),
    }));
  };

  const handleOnChange = (next: Filters) => {
    setDraftFilters(next);
    // console.log("Filters changed:", draftFilters);
  }

  const calculateFilterHours = (postedWithin: string): number => {
    switch (postedWithin) {
      case "24h":
        return 24;
      case "48h":
        return 48;
      case "3d":
        return 72;
      case "7d":
        return 168;
      case "30d":
        return 720;
      default:
        return 0; // Default to 0 if no match
    }    
  }

  const fetchData = async (filters: Filters) => {
    try {
      setIsLoading(true);
      // console.log("Fetching data with filters:", filters);
      const payload = {
        hours: calculateFilterHours(filters.postedWithin),
        term: filters.season.toLowerCase() != "all" ? filters.season : null,
        source: filters.roleType || null,
        year: null,
        source_url: null,
        province:
          filters.province.toLowerCase() != "all" ? filters.province : null,
        include_ai: filters.categories.includes("AI/ML/Data") || false,
        all_tech: filters.categories.includes("All tech") || false,
        rescue_adjacent: filters.includeRelatedRoles || false,
        roles:
          filters.keywords.length > 0 ? String(filters.keywords.join(",")) : "",
      };
      const response = await fetchInternships(payload);
      // console.log("API Response:", response.data);
      setJobs(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProps = {
    filters: draftFilters,
    onChange: handleOnChange,
    onApply: handleApply,
    onReset: handleReset,
    keywordInput,
    setKeywordInput,
    addKeyword,
    removeKeyword,
  };

  const headerProps = {
    jobs : jobs,
    isApiLoading : isLoading,
    onRefresh: () => fetchData(appliedFilters),
  }

  return (
    <>
      <div
        className="flex flex-col h-screen overflow-hidden bg-background"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {/* Header */}
        <Header {...headerProps}></Header>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Desktop Filter Panel */}
          {activeView === "browse" && (
            <aside className="hidden lg:block w-[280px] flex-shrink-0 bg-card border-r border-border overflow-y-auto">
              <FilterPanelContent {...filterProps} />
            </aside>
          )}

          <main className="flex-1 overflow-y-auto">
            <Jobs jobs={jobs}/>
          </main>
        </div>
      </div>
    </>
  );
}

export default App;
