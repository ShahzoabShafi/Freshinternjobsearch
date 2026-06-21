import React, { useState, useMemo, useEffect, useRef } from "react";
import { ChevronDown, Check, X } from "lucide-react";
import FilterSection from "./FilterSection.tsx";
import { RoleType, Category, Filters } from "../types/filters.ts";
import { POSTED_OPTS, SEASONS, PROVINCES, CATEGORIES} from "../constants/index.ts";

export default function FilterPanelContent({
  draft,
  onChange,
  onApply,
  onReset,
  keywordInput,
  setKeywordInput,
  addKeyword,
  removeKeyword,
}: {
  draft: Filters;
  onChange: (next: Filters) => void;
  onApply: () => void;
  onReset: () => void;
  keywordInput: string;
  setKeywordInput: (v: string) => void;
  addKeyword: (kw: string) => void;
  removeKeyword: (kw: string) => void;
}) {
  const kwRef = useRef<HTMLInputElement>(null);

  const toggleCategory = (cat: Category) => {
    const cats = draft.categories.includes(cat)
      ? draft.categories.filter((c) => c !== cat)
      : [...draft.categories, cat];
    onChange({ ...draft, categories: cats });
  };

  return (
    <div className="p-5">
      {/* Posted within */}
      <FilterSection title="Posted within">
        <div className="flex flex-wrap gap-1.5">
          {POSTED_OPTS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange({ ...draft, postedWithin: opt.value })}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                draft.postedWithin === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Season */}
      <FilterSection title="Season">
        <div className="flex flex-wrap gap-1.5">
          {SEASONS.map((s) => (
            <button
              key={s}
              onClick={() => onChange({ ...draft, season: s })}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                draft.season === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Role type */}
      <FilterSection title="Role type">
        <div className="flex rounded-lg overflow-hidden border border-border bg-muted p-0.5 gap-0.5">
          {(["internship", "newgrad"] as RoleType[]).map((rt) => (
            <button
              key={rt}
              onClick={() => onChange({ ...draft, roleType: rt })}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                draft.roleType === rt
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {rt === "internship" ? "Internships" : "New grad"}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Province */}
      <FilterSection title="Province">
        <div className="relative">
          <select
            value={draft.province}
            onChange={(e) => onChange({ ...draft, province: e.target.value })}
            className="w-full appearance-none bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground pr-8 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow cursor-pointer"
          >
            {PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p === "All" ? "All Canada" : p}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        </div>
      </FilterSection>

      {/* Categories */}
      <FilterSection title="Categories">
        <div className="space-y-2">
          {CATEGORIES.map((cat) => (
            <label
              key={cat}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div
                onClick={() => toggleCategory(cat)}
                className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${
                  draft.categories.includes(cat)
                    ? "bg-primary border-primary"
                    : "border-muted-foreground/40 bg-card group-hover:border-primary/60"
                }`}
              >
                {draft.categories.includes(cat) && (
                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                )}
              </div>
              <span
                onClick={() => toggleCategory(cat)}
                className="text-sm text-foreground select-none"
              >
                {cat}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Include related roles */}
      <FilterSection title="Include related roles">
        <div className="flex items-center gap-3">
          {/* <Toggle
            checked={draft.includeRelated}
            onChange={(v) => onChange({ ...draft, includeRelated: v })}
            label="Include related roles"
          /> */}
          <span className="text-xs text-muted-foreground leading-snug">
            frontend, backend, DevOps, cloud, SRE&hellip;
          </span>
        </div>
      </FilterSection>

      {/* Keywords */}
      <FilterSection title="Role keywords">
        <div
          className="flex flex-wrap gap-1.5 min-h-[36px] bg-muted border border-border rounded-lg px-2.5 py-1.5 cursor-text focus-within:ring-2 focus-within:ring-primary/50 transition-shadow"
          onClick={() => kwRef.current?.focus()}
        >
          {draft.keywords.map((kw) => (
            <span
              key={kw}
              className="inline-flex items-center gap-1 bg-card border border-border rounded-md px-2 py-0.5 text-xs font-medium text-foreground"
            >
              {kw}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeKeyword(kw);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={`Remove keyword ${kw}`}
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
          <input
            ref={kwRef}
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === ",") && keywordInput.trim()) {
                e.preventDefault();
                addKeyword(keywordInput);
              }
              if (
                e.key === "Backspace" &&
                !keywordInput &&
                draft.keywords.length > 0
              ) {
                removeKeyword(draft.keywords[draft.keywords.length - 1]);
              }
            }}
            placeholder={
              draft.keywords.length === 0 ? "e.g. devops, backend…" : ""
            }
            className="flex-1 min-w-[80px] bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 outline-none"
          />
        </div>
        <p className="text-[11px] text-muted-foreground mt-1.5">
          Press Enter to add a keyword
        </p>
      </FilterSection>

      {/* Actions */}
      <div className="flex flex-col items-center justify-between gap-3">
        <button
          onClick={onApply}
          className="flex-1 w-full py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Apply filters
        </button>
        <button
          onClick={onReset}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
