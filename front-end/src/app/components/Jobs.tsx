import React from "react";
import { Loader2 } from "lucide-react";
import JobCard from "./JobCard";
import { JobListing } from "../types/job";

function EmptyState({ onShowMore }: { onShowMore: () => void }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
      <div className="w-full max-w-sm mx-auto bg-card border border-border rounded-2xl p-10 flex flex-col items-center text-center shadow-sm">
        {/* Illustration */}
        <div className="relative mb-7">
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
            <svg
              viewBox="0 0 48 48"
              fill="none"
              className="w-10 h-10"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="22"
                cy="22"
                r="12"
                stroke="currentColor"
                strokeWidth="2.5"
                className="text-muted-foreground/40"
              />
              <path
                d="M31 31l8 8"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="text-muted-foreground/40"
              />
              <path
                d="M17 22h10M22 17v10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="text-primary/50"
              />
            </svg>
          </div>
          {/* Small decorative dot */}
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-background border-2 border-border flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
          </div>
        </div>

        <h3 className="text-[1.0625rem] font-semibold text-foreground mb-2 tracking-tight">
          No roles found
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px] mb-6">
          No postings match your current filters. Try widening the time range or
          adjusting the season.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <button
            onClick={onShowMore}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Show last 7 days
          </button>
        </div>
        {/* Hint row */}
        <p className="text-[11px] text-muted-foreground/60 mt-4 font-mono font-bold">
          Tip: check "Include related roles" in filters
        </p>
      </div>
    </div>
  );
}

export default function Jobs({
  jobs,
  onShowMore,
  isLoading,
}: {
  jobs: JobListing[];
  onShowMore: () => void;
  isLoading?: boolean;
}) {
  return (
    <div className="relative min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {jobs.length > 0
          ? jobs.map((job) => <JobCard key={job.id} job={job} />)
          : !isLoading && <EmptyState onShowMore={onShowMore} />}
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-50/80 backdrop-blur-sm">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm font-medium text-muted-foreground">
            Loading roles…
          </p>
        </div>
      )}
    </div>
  );
}
