import React from "react";
import Header from "./components/Header.js";
import FilterPanelContent from "./components/FilterPanelContent.js";
import { useState, useEffect } from "react";
import { View, Filters } from "./types/filters.ts";
import { DEFAULT_FILTERS } from "./constants/index.ts";

function App() {
  const [draftFilters, setDraftFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(DEFAULT_FILTERS);
  // const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  // const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showError, setShowError] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  // const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [activeView, setActiveView] = useState<View>("browse");
  const [keywordInput, setKeywordInput] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(t);
  }, []);

  const handleApply = () => {
    setAppliedFilters(draftFilters);
    setFilterDrawerOpen(false);
  };

  const handleReset = () => {
    setDraftFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setFilterDrawerOpen(false);
  };

  const addKeyword = (kw: string) => {
    const trimmed = kw.trim().toLowerCase().replace(/,$/, "");
    if (trimmed && !draftFilters.keywords.includes(trimmed)) {
      setDraftFilters(f => ({ ...f, keywords: [...f.keywords, trimmed] }));
    }
    setKeywordInput("");
  };

  const removeKeyword = (kw: string) => {
    setDraftFilters(f => ({ ...f, keywords: f.keywords.filter(k => k !== kw) }));
  };

  const filterProps = {
    draft: draftFilters,
    onChange: setDraftFilters,
    onApply: handleApply,
    onReset: handleReset,
    keywordInput,
    setKeywordInput,
    addKeyword,
    removeKeyword,
  };

  return (
    <>
      <div
        className="flex flex-col h-screen overflow-hidden bg-background"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {/* Error Banner */}
        {/* {showError && <ErrorBanner onDismiss={() => setShowError(false)} />} */}

        {/* Header */}
        <Header></Header>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Desktop Filter Panel */}
          {activeView === "browse" && (
            <aside className="hidden lg:block w-[280px] flex-shrink-0 bg-card border-r border-border overflow-y-auto">
              <FilterPanelContent {...filterProps} />
            </aside>
          )}

          <main className="flex-1 overflow-y-auto"></main>
        </div>
      </div>
    </>
  );
}

export default App;
