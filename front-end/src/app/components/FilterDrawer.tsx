import React from "react";
import { X } from "lucide-react";
import FilterPanelContent from "./FilterPanelContent.tsx";
import { Filters } from "../types/filters.ts";

export default function FilterDrawer({
  open,
  onClose,
  filters,
  onChange,
  onApply,
  onReset,
  keywordInput,
  setKeywordInput,
  addKeyword,
  removeKeyword,
}: {
  open: boolean;
  onClose: () => void;
  filters: Filters;
  onChange: (next: Filters) => void;
  onApply: () => void;
  onReset: () => void;
  keywordInput: string;
  setKeywordInput: (v: string) => void;
  addKeyword: (kw: string) => void;
  removeKeyword: (kw: string) => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute inset-y-0 left-0 w-[85vw] max-w-[320px] bg-card border-r border-border flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-4 h-14 border-b border-border flex-shrink-0">
          <h3 className="text-sm font-semibold text-foreground">Filters</h3>
          <button
            onClick={onClose}
            aria-label="Close filters"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <FilterPanelContent
            filters={filters}
            onChange={onChange}
            onApply={onApply}
            onReset={onReset}
            keywordInput={keywordInput}
            setKeywordInput={setKeywordInput}
            addKeyword={addKeyword}
            removeKeyword={removeKeyword}
          />
        </div>
      </div>
    </div>
  );
}
