import React from "react";
import { Bookmark, MapPin, ExternalLink, Clock } from "lucide-react";
import { JobListing } from "../types/job";

export const formatRelativeTime = (timestamp: number): string => {
  const now = Math.floor(Date.now() / 1000);
  const diffInSeconds = Math.max(0, now - timestamp);

  if (diffInSeconds < 3600) {
    const mins = Math.floor(diffInSeconds / 60);
    return `${mins}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  }
};

export default function JobCard({ job }: { job: JobListing }) {
  return (
    <div className="relative flex flex-col justify-between p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      {/* Top Header Section */}
      <div>
        <div className="flex justify-between items-start pr-6">
          <h3 className="text-lg font-bold text-slate-900 leading-snug">
            {job.title || "NA"}
          </h3>
          {false && (
            <button
              aria-label="Save job"
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <Bookmark className="w-5 h-5" />
            </button>
          )}
        </div>

        <p className="text-base text-slate-500 font-medium mt-1 hover:text-[#2b8da8]">
          <a
            href={job.company_url || "NA"}
            target="_blank"
            rel="noopener noreferrer"
          >
            {job.company_name || "NA"}
          </a>
        </p>

        {/* Location */}
        <div className="flex flex-col content-center items-start">
          {job.locations &&
            job.locations.map((location) => (
              <div className="flex items-center gap-1 text-slate-500 text-sm mt-3">
                <>
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{location || "NA"}</span>
                </>
              </div>
            ))}
        </div>
      </div>

      {/* Footer Section */}
      <div
        className="flex items-end justify-between"
        style={{ marginTop: "1.25rem" }}
      >
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Tag */}
          <span className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50/80 rounded-full">
            {job.category}
          </span>
          {/* Term Tag */}
          {job.terms &&
            job.terms.map((term) => (
              <span
                key={term || "NA"}
                className="px-3 py-1 text-xs font-medium text-orange-600 bg-orange-50/80 rounded-full"
              >
                {term || "NA"}
              </span>
            ))}
          {/* Time Tag */}
          <span className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full">
            <Clock className="w-3 h-3 text-emerald-600" />
            {formatRelativeTime(job.date_posted || 0)}
          </span>
        </div>

        {/* Apply Button */}
        <a
          href={job.url || "NA"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#2b8da8] hover:bg-[#23758c] rounded-xl transition-colors shrink-0"
        >
          Apply
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
