import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  MapPin,
  Bookmark,
  BookmarkCheck,
  RefreshCw,
  Download,
  FileSpreadsheet,
  ChevronDown,
  X,
  Filter as FilterIcon,
  Calendar,
  AlertCircle,
  Search,
  ExternalLink,
  Leaf,
  Check,
  Clock,
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────────────────────── */

type PostedWithin = "24h" | "48h" | "3d" | "7d" | "30d";
type Season = "All" | "Fall" | "Winter" | "Spring" | "Summer";
type RoleType = "internship" | "newgrad";
type SortBy = "newest" | "company";
type Category = "Software" | "AI/ML/Data" | "All tech";
type View = "browse" | "saved";

interface Job {
  id: string;
  title: string;
  company: string;
  initials: string;
  color: string;
  location: string;
  province: string;
  category: Category;
  postedAt: Date;
  deadline?: Date;
  season: Season;
  roleType: RoleType;
  isRelated: boolean;
  applyUrl: string;
  description: string;
  sponsorship: string;
}

interface Filters {
  postedWithin: PostedWithin;
  season: Season;
  roleType: RoleType;
  province: string;
  categories: Category[];
  includeRelated: boolean;
  keywords: string[];
}

/* ─── Constants ──────────────────────────────────────────────────────────────── */

const NOW = Date.now();
const h = (n: number): Date => new Date(NOW - n * 3_600_000);
const d = (n: number): Date => h(n * 24);

const WITHIN_MS: Record<PostedWithin, number> = {
  "24h": 86_400_000,
  "48h": 172_800_000,
  "3d": 259_200_000,
  "7d": 604_800_000,
  "30d": 2_592_000_000,
};

const POSTED_OPTS: { label: string; value: PostedWithin }[] = [
  { label: "24h", value: "24h" },
  { label: "48h", value: "48h" },
  { label: "3 days", value: "3d" },
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
];

const SEASONS: Season[] = ["All", "Fall", "Winter", "Spring", "Summer"];
const PROVINCES = ["All","ON","QC","BC","AB","MB","SK","NS","NB","NL","PE","NT","YT","NU"];
const CATEGORIES: Category[] = ["Software", "AI/ML/Data", "All tech"];

const DEFAULT_FILTERS: Filters = {
  postedWithin: "24h",
  season: "All",
  roleType: "internship",
  province: "All",
  categories: ["Software"],
  includeRelated: false,
  keywords: [],
};

/* ─── Mock Data ──────────────────────────────────────────────────────────────── */

const ALL_JOBS: Job[] = [
  {
    id: "1", title: "Software Engineering Intern", company: "Shopify",
    initials: "SH", color: "#5c6ac4", location: "Ottawa, ON, Canada", province: "ON",
    category: "Software", postedAt: h(2), deadline: new Date("2026-07-20"),
    season: "Fall", roleType: "internship", isRelated: false, applyUrl: "#",
    description: "Join Shopify's Core team building commerce infrastructure for over 2 million merchants worldwide. You will ship real features to production in Ruby on Rails and TypeScript alongside senior engineers. Deep-dive into distributed systems, caching, and high-throughput data pipelines on systems that process millions of requests per day.",
    sponsorship: "Sponsorship available for eligible candidates enrolled at a Canadian post-secondary institution.",
  },
  {
    id: "2", title: "Backend Engineering Co-op", company: "Wealthsimple",
    initials: "WS", color: "#00a86b", location: "Toronto, ON, Canada", province: "ON",
    category: "Software", postedAt: h(5), deadline: undefined,
    season: "Fall", roleType: "internship", isRelated: false, applyUrl: "#",
    description: "Build financial infrastructure in Go and Python powering Wealthsimple's investing, banking, and tax products. Work on high-throughput services handling billions of dollars in transactions. Strong distributed systems fundamentals and curiosity about fintech regulation are assets.",
    sponsorship: "Open to Canadian citizens and permanent residents only.",
  },
  {
    id: "3", title: "Machine Learning Intern", company: "Coveo",
    initials: "CV", color: "#e8413e", location: "Québec, QC, Canada", province: "QC",
    category: "AI/ML/Data", postedAt: h(11), deadline: undefined,
    season: "Fall", roleType: "internship", isRelated: false, applyUrl: "#",
    description: "Work on NLP and recommendation models powering Coveo's AI-driven search and personalization platform. Customers include Salesforce, L'Oréal, and Tableau. You will research and productionize models using Python, PyTorch, and Coveo's proprietary relevance infrastructure.",
    sponsorship: "Work permit sponsorship considered on a case-by-case basis.",
  },
  {
    id: "4", title: "Software Developer Intern", company: "Clio",
    initials: "CL", color: "#2c6fb5", location: "Vancouver, BC, Canada", province: "BC",
    category: "Software", postedAt: h(18), deadline: new Date("2026-07-30"),
    season: "Fall", roleType: "internship", isRelated: false, applyUrl: "#",
    description: "Build the tools that modernize how 150,000 legal professionals work — from case management and billing to client intake and document automation. Clio is the world's leading legal technology company, headquartered in Vancouver with offices across North America and Europe.",
    sponsorship: "Sponsorship not available for this role.",
  },
  {
    id: "5", title: "Software Engineering Intern", company: "D2L",
    initials: "D2", color: "#d95f2b", location: "Kitchener, ON, Canada", province: "ON",
    category: "Software", postedAt: d(1), deadline: undefined,
    season: "Winter", roleType: "internship", isRelated: false, applyUrl: "#",
    description: "D2L builds Brightspace, a cloud-based learning platform used by universities and K–12 institutions in over 50 countries. Work on EdTech products in React, Node.js, and AWS that impact millions of learners every day.",
    sponsorship: "Sponsorship available for international students currently enrolled at a Canadian institution.",
  },
  {
    id: "6", title: "Full-Stack Developer Intern", company: "Lightspeed",
    initials: "LS", color: "#ff5a00", location: "Montréal, QC, Canada", province: "QC",
    category: "Software", postedAt: h(28), deadline: undefined,
    season: "Winter", roleType: "internship", isRelated: true, applyUrl: "#",
    description: "Lightspeed powers the world's best restaurants, retailers, and golf courses with its commerce platform — processing $100B+ in transactions annually. Build full-stack features in TypeScript and React, touching payments, inventory, reporting, and integrations.",
    sponsorship: "Must be eligible to work in Canada.",
  },
  {
    id: "7", title: "Platform Engineering Co-op", company: "Ecobee",
    initials: "EB", color: "#0c8346", location: "Toronto, ON, Canada", province: "ON",
    category: "Software", postedAt: d(2), deadline: undefined,
    season: "Spring", roleType: "internship", isRelated: true, applyUrl: "#",
    description: "Ecobee makes smart thermostats and home sensors that help Canadians cut energy use by up to 26%. Work on the AWS and Kubernetes infrastructure powering millions of connected devices, supporting over 2.5 billion data points processed per day.",
    sponsorship: "Canadian citizens and permanent residents preferred.",
  },
  {
    id: "8", title: "Software Engineering Intern", company: "Vidyard",
    initials: "VY", color: "#6b3fa0", location: "Kitchener, ON, Canada", province: "ON",
    category: "Software", postedAt: h(55), deadline: undefined,
    season: "Spring", roleType: "internship", isRelated: false, applyUrl: "#",
    description: "Vidyard is the video platform for businesses. Build features for video hosting, analytics, and AI-powered video creation tools used by sales and marketing teams at thousands of B2B companies. Stack: React, Ruby on Rails, PostgreSQL.",
    sponsorship: "Work permit holders welcome to apply.",
  },
  {
    id: "9", title: "ML / AI Research Intern", company: "Paladin AI",
    initials: "PA", color: "#1a56db", location: "Montréal, QC, Canada", province: "QC",
    category: "AI/ML/Data", postedAt: d(3), deadline: undefined,
    season: "Summer", roleType: "internship", isRelated: false, applyUrl: "#",
    description: "Paladin AI builds AI-powered training solutions for aviation and defense sectors. Research and deploy computer vision and deep learning models that help pilots train more safely and effectively. Strong background in PyTorch or JAX required.",
    sponsorship: "Security clearance required; Canadian citizenship strongly preferred.",
  },
  {
    id: "10", title: "Software Engineering Co-op", company: "Faire",
    initials: "FA", color: "#b77b1a", location: "Kitchener, ON, Canada", province: "ON",
    category: "Software", postedAt: h(80), deadline: undefined,
    season: "Summer", roleType: "internship", isRelated: false, applyUrl: "#",
    description: "Faire's wholesale marketplace connects over 700,000 independent retailers with brands worldwide. Build the marketplace infrastructure in Ruby on Rails and React that levels the playing field between small businesses and big-box retailers.",
    sponsorship: "Sponsorship available for eligible candidates.",
  },
  {
    id: "11", title: "Backend Software Developer Intern", company: "Miovision",
    initials: "MI", color: "#0097a7", location: "Kitchener, ON, Canada", province: "ON",
    category: "Software", postedAt: d(4), deadline: new Date("2026-08-18"),
    season: "Fall", roleType: "internship", isRelated: true, applyUrl: "#",
    description: "Miovision builds smart traffic technology making cities move better and more safely. Work on backend systems in Go and Kafka processing real-time intersection data from thousands of locations across North America and Europe.",
    sponsorship: "Must be eligible to work in Canada without restrictions.",
  },
  {
    id: "12", title: "Frontend Developer Intern", company: "Q4 Inc",
    initials: "Q4", color: "#1e4080", location: "Toronto, ON, Canada", province: "ON",
    category: "Software", postedAt: h(100), deadline: undefined,
    season: "Fall", roleType: "internship", isRelated: true, applyUrl: "#",
    description: "Q4 builds investor relations and capital markets software used by IR teams at hundreds of public companies. Develop React dashboards and data visualizations that help CFOs and investor relations professionals communicate with institutional investors at scale.",
    sponsorship: "Open to all candidates eligible to work in Canada.",
  },
  {
    id: "13", title: "Software Engineer — New Grad", company: "ApplyBoard",
    initials: "AB", color: "#c53030", location: "Kitchener, ON, Canada", province: "ON",
    category: "Software", postedAt: d(5), deadline: new Date("2026-08-25"),
    season: "All", roleType: "newgrad", isRelated: false, applyUrl: "#",
    description: "ApplyBoard has helped over 600,000 international students access higher education worldwide. As a new grad engineer, you will build the platform's core admissions and institution-management features in Python and React — direct impact on students and partner schools.",
    sponsorship: "Highly international team; sponsorship considered for the right candidate.",
  },
  {
    id: "14", title: "DevOps / Infrastructure Intern", company: "Top Hat",
    initials: "TH", color: "#6b46c1", location: "Toronto, ON, Canada", province: "ON",
    category: "All tech", postedAt: h(130), deadline: new Date("2026-08-29"),
    season: "Winter", roleType: "internship", isRelated: true, applyUrl: "#",
    description: "Top Hat makes active learning software for higher education. Help build and maintain the Kubernetes clusters, Terraform infrastructure, and CI/CD pipelines that keep Top Hat running reliably for thousands of classrooms across North America.",
    sponsorship: "Work permit holders considered.",
  },
  {
    id: "15", title: "Software Developer Co-op", company: "Certn",
    initials: "CN", color: "#2d6a4f", location: "Victoria, BC, Canada", province: "BC",
    category: "Software", postedAt: d(7), deadline: undefined,
    season: "Summer", roleType: "internship", isRelated: false, applyUrl: "#",
    description: "Certn's background screening platform is trusted by thousands of Canadian employers across retail, finance, and tech. Build REST APIs and third-party integrations in Python and TypeScript that help employers verify candidates quickly, accurately, and compliantly.",
    sponsorship: "Must be a Canadian citizen or permanent resident.",
  },
];

/* ─── Helpers ────────────────────────────────────────────────────────────────── */

function formatRelativeTime(date: Date): string {
  const diffMs = NOW - date.getTime();
  const diffH = Math.floor(diffMs / 3_600_000);
  const diffD = Math.floor(diffMs / 86_400_000);
  if (diffH < 1) return "just now";
  if (diffH < 24) return `${diffH}h ago`;
  if (diffD === 1) return "1 day ago";
  return `${diffD} days ago`;
}

function isRecent(date: Date): boolean {
  return NOW - date.getTime() < 86_400_000;
}

function formatDeadline(date?: Date): string {
  if (!date) return "check posting";
  return date.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
}

function filterJobs(jobs: Job[], filters: Filters): Job[] {
  const cutoff = NOW - WITHIN_MS[filters.postedWithin];
  return jobs.filter(job => {
    if (job.postedAt.getTime() < cutoff) return false;
    if (filters.season !== "All" && job.season !== "All" && job.season !== filters.season) return false;
    if (job.roleType !== filters.roleType) return false;
    if (filters.province !== "All" && job.province !== filters.province) return false;
    if (!filters.categories.includes(job.category)) return false;
    if (!filters.includeRelated && job.isRelated) return false;
    if (filters.keywords.length > 0) {
      const text = `${job.title} ${job.company}`.toLowerCase();
      if (!filters.keywords.some(kw => text.includes(kw.toLowerCase()))) return false;
    }
    return true;
  });
}

/* ─── Small Components ───────────────────────────────────────────────────────── */

function Logo() {
  return (
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
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
        checked ? "bg-primary" : "bg-muted-foreground/30"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-[18px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function CategoryBadge({ category }: { category: Category }) {
  const styles: Record<Category, string> = {
    "Software": "bg-blue-50 text-blue-700",
    "AI/ML/Data": "bg-violet-50 text-violet-700",
    "All tech": "bg-amber-50 text-amber-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium font-mono tracking-wide ${styles[category]}`}
    >
      {category}
    </span>
  );
}

function SeasonBadge({ season }: { season: Season }) {
  if (season === "All") return null;
  const styles: Record<string, string> = {
    Fall: "bg-orange-50 text-orange-700",
    Winter: "bg-sky-50 text-sky-700",
    Spring: "bg-green-50 text-green-700",
    Summer: "bg-yellow-50 text-yellow-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium font-mono capitalize ${styles[season] ?? "bg-muted text-muted-foreground"}`}
    >
      {season.toLowerCase()}
    </span>
  );
}

/* ─── Skeleton Card ──────────────────────────────────────────────────────────── */

function SkeletonCard() {
  return (
    <div className="bg-card rounded-xl border border-border p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted" />
          <div className="space-y-1.5">
            <div className="h-4 w-44 bg-muted rounded" />
            <div className="h-3 w-28 bg-muted rounded" />
          </div>
        </div>
        <div className="h-7 w-7 rounded-lg bg-muted" />
      </div>
      <div className="flex gap-2 mb-3">
        <div className="h-5 w-20 bg-muted rounded-md" />
        <div className="h-5 w-14 bg-muted rounded-full" />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="h-3 w-36 bg-muted rounded" />
        <div className="h-8 w-20 bg-muted rounded-lg" />
      </div>
    </div>
  );
}

/* ─── Empty State ────────────────────────────────────────────────────────────── */

function EmptyState({
  isSaved,
  onShowMore,
}: {
  isSaved: boolean;
  onShowMore: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-20 h-20 mb-6 text-muted-foreground/20">
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="34" cy="34" r="22" stroke="currentColor" strokeWidth="3.5" />
          <line x1="50.5" y1="50.5" x2="68" y2="68" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="26" y1="34" x2="42" y2="34" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <line x1="34" y1="26" x2="34" y2="42" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
      {isSaved ? (
        <>
          <h3 className="text-base font-semibold text-foreground mb-1.5">No saved roles yet</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Bookmark roles you like and they will appear here for easy access.
          </p>
        </>
      ) : (
        <>
          <h3 className="text-base font-semibold text-foreground mb-1.5">
            No roles in this window
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs mb-5">
            Try widening the time range or season to see more opportunities.
          </p>
          <button
            onClick={onShowMore}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Show last 7 days
          </button>
        </>
      )}
    </div>
  );
}

/* ─── Error Banner ───────────────────────────────────────────────────────────── */

function ErrorBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-red-50 border-b border-red-200 text-red-700 text-sm">
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1">Couldn&apos;t load listings — please check your connection and try again.</span>
      <button
        onClick={onDismiss}
        className="hover:text-red-900 transition-colors p-0.5 rounded"
        aria-label="Dismiss error"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ─── Job Card ───────────────────────────────────────────────────────────────── */

function JobCard({
  job,
  isSaved,
  onSave,
  onClick,
}: {
  job: Job;
  isSaved: boolean;
  onSave: (id: string) => void;
  onClick: (job: Job) => void;
}) {
  const recent = isRecent(job.postedAt);

  return (
    <div
      className="group bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 cursor-pointer flex gap-0"
      onClick={() => onClick(job)}
    >
      {/* Left content */}
      <div className="flex gap-3.5 flex-1 min-w-0 p-5">
        {/* Company avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm mt-0.5"
          style={{ backgroundColor: job.color }}
        >
          {job.initials}
        </div>

        {/* Text block */}
        <div className="flex-1 min-w-0">
          <h3 className="text-[0.9375rem] font-semibold text-foreground leading-snug mb-0.5">
            {job.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-2">{job.company}</p>

          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground mb-2.5">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            {job.location}
          </span>

          <div className="flex items-center gap-2 flex-wrap mb-3">
            <CategoryBadge category={job.category} />
            <SeasonBadge season={job.season} />
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium font-mono ${
                recent
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <Clock className="w-2.5 h-2.5" />
              {formatRelativeTime(job.postedAt)}
            </span>
          </div>

          {job.deadline ? (
            <span className="text-xs flex items-center gap-1 text-muted-foreground">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              Deadline: {formatDeadline(job.deadline)}
            </span>
          ) : (
            <span className="text-xs flex items-center gap-1 text-muted-foreground/45">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              Deadline: check posting
            </span>
          )}
        </div>
      </div>

      {/* Right actions column */}
      <div className="flex flex-col items-end justify-center gap-4 py-5 pr-5 pl-2 flex-shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); onSave(job.id); }}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            isSaved
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-primary hover:bg-primary/10"
          }`}
          aria-label={isSaved ? "Remove from saved" : "Save job"}
        >
          {isSaved ? (
            <BookmarkCheck className="w-4 h-4" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
        </button>

        <a
          href={job.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
        >
          Apply
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

/* ─── Job Detail Modal ───────────────────────────────────────────────────────── */

function JobDetailModal({
  job,
  isSaved,
  onSave,
  onClose,
}: {
  job: Job;
  isSaved: boolean;
  onSave: (id: string) => void;
  onClose: () => void;
}) {
  const recent = isRecent(job.postedAt);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full sm:max-w-lg bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-4 border-b border-border">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md"
              style={{ backgroundColor: job.color }}
            >
              {job.initials}
            </div>
            <div className="min-w-0">
              <h2 className="text-[1.05rem] font-bold text-foreground leading-snug">
                {job.title}
              </h2>
              <p className="text-sm text-muted-foreground font-medium">{job.company}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* Meta row */}
          <div className="flex flex-wrap gap-2">
            <CategoryBadge category={job.category} />
            <SeasonBadge season={job.season} />
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium font-mono ${
                recent ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              <Clock className="w-2.5 h-2.5" />
              {recent ? "Posted " : ""}{formatRelativeTime(job.postedAt)}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-start gap-2 text-sm text-foreground">
            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">{job.location}</p>
              <p className="text-muted-foreground text-xs mt-0.5">
                Remote / hybrid options may be available — confirm in posting.
              </p>
            </div>
          </div>

          {/* Exact timestamp */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>
              Posted:{" "}
              {job.postedAt.toLocaleString("en-CA", {
                month: "long", day: "numeric", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            </span>
          </div>

          {/* Deadline */}
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            {job.deadline ? (
              <span className="text-foreground font-medium">
                Deadline: {formatDeadline(job.deadline)}
              </span>
            ) : (
              <span className="text-muted-foreground italic">Deadline: check posting</span>
            )}
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              About the role
            </h4>
            <p className="text-sm text-foreground leading-relaxed">{job.description}</p>
          </div>

          {/* Sponsorship */}
          <div className="bg-muted rounded-xl p-3.5">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Work authorization
            </h4>
            <p className="text-sm text-foreground">{job.sponsorship}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-5 pt-4 border-t border-border bg-card">
          <button
            onClick={() => onSave(job.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isSaved
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
            }`}
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            {isSaved ? "Saved" : "Save"}
          </button>
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Apply now
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

/* ─── Filter Panel Content ───────────────────────────────────────────────────── */

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2.5">
        {title}
      </h4>
      {children}
    </div>
  );
}

function FilterPanelContent({
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
      ? draft.categories.filter(c => c !== cat)
      : [...draft.categories, cat];
    onChange({ ...draft, categories: cats });
  };

  return (
    <div className="p-5">
      {/* Posted within */}
      <FilterSection title="Posted within">
        <div className="flex flex-wrap gap-1.5">
          {POSTED_OPTS.map(opt => (
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
          {SEASONS.map(s => (
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
          {(["internship", "newgrad"] as RoleType[]).map(rt => (
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
            onChange={e => onChange({ ...draft, province: e.target.value })}
            className="w-full appearance-none bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground pr-8 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow cursor-pointer"
          >
            {PROVINCES.map(p => (
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
          {CATEGORIES.map(cat => (
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
          <Toggle
            checked={draft.includeRelated}
            onChange={v => onChange({ ...draft, includeRelated: v })}
            label="Include related roles"
          />
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
          {draft.keywords.map(kw => (
            <span
              key={kw}
              className="inline-flex items-center gap-1 bg-card border border-border rounded-md px-2 py-0.5 text-xs font-medium text-foreground"
            >
              {kw}
              <button
                onClick={(e) => { e.stopPropagation(); removeKeyword(kw); }}
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
            onChange={e => setKeywordInput(e.target.value)}
            onKeyDown={e => {
              if ((e.key === "Enter" || e.key === ",") && keywordInput.trim()) {
                e.preventDefault();
                addKeyword(keywordInput);
              }
              if (e.key === "Backspace" && !keywordInput && draft.keywords.length > 0) {
                removeKeyword(draft.keywords[draft.keywords.length - 1]);
              }
            }}
            placeholder={draft.keywords.length === 0 ? "e.g. devops, backend…" : ""}
            className="flex-1 min-w-[80px] bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 outline-none"
          />
        </div>
        <p className="text-[11px] text-muted-foreground mt-1.5">Press Enter to add a keyword</p>
      </FilterSection>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          onClick={onReset}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Reset
        </button>
        <button
          onClick={onApply}
          className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Apply filters
        </button>
      </div>
    </div>
  );
}

/* ─── Mobile Filter Drawer ───────────────────────────────────────────────────── */

function MobileFilterDrawer({
  open,
  onClose,
  ...filterProps
}: {
  open: boolean;
  onClose: () => void;
  draft: Filters;
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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border flex-shrink-0">
          <h3 className="text-base font-semibold text-foreground">Filters</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
          <FilterPanelContent {...filterProps} />
        </div>
      </div>
    </div>
  );
}

/* ─── Main App ───────────────────────────────────────────────────────────────── */

export default function App() {
  const [draftFilters, setDraftFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showError, setShowError] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [activeView, setActiveView] = useState<View>("browse");
  const [keywordInput, setKeywordInput] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(t);
  }, []);

  const browsedJobs = useMemo(
    () => filterJobs(ALL_JOBS, appliedFilters),
    [appliedFilters]
  );

  const savedJobs = useMemo(
    () => ALL_JOBS.filter(j => savedIds.has(j.id)),
    [savedIds]
  );

  const displayJobs = useMemo(() => {
    const base = activeView === "saved" ? savedJobs : browsedJobs;
    return [...base].sort((a, b) =>
      sortBy === "newest"
        ? b.postedAt.getTime() - a.postedAt.getTime()
        : a.company.localeCompare(b.company)
    );
  }, [activeView, browsedJobs, savedJobs, sortBy]);

  const handleApply = () => {
    setAppliedFilters(draftFilters);
    setFilterDrawerOpen(false);
  };

  const handleReset = () => {
    setDraftFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setFilterDrawerOpen(false);
  };

  const handleShowMore = () => {
    const next = { ...draftFilters, postedWithin: "7d" as PostedWithin };
    setDraftFilters(next);
    setAppliedFilters(next);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1200);
  };

  const toggleSave = (id: string) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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

  const handleExportCSV = () => {
    const rows = [
      ["Title", "Company", "Location", "Category", "Posted", "Deadline", "Season", "Role Type"],
      ...displayJobs.map(j => [
        j.title, j.company, j.location, j.category,
        j.postedAt.toISOString(), j.deadline?.toLocaleDateString("en-CA") ?? "N/A",
        j.season, j.roleType,
      ]),
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
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
      ["Title", "Company", "Location", "Category", "Posted", "Deadline", "Season", "Role Type"],
      ...displayJobs.map(j => [
        j.title, j.company, j.location, j.category,
        j.postedAt.toISOString(), j.deadline?.toLocaleDateString("en-CA") ?? "N/A",
        j.season, j.roleType,
      ]),
    ];
    const tsv = rows.map(r => r.join("\t")).join("\n");
    const blob = new Blob([tsv], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "freshintern-roles.xls";
    a.click();
    URL.revokeObjectURL(url);
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

  const resultCount = activeView === "saved" ? savedJobs.length : browsedJobs.length;

  return (
    <div
      className="flex flex-col h-screen overflow-hidden bg-background"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Error Banner */}
      {showError && <ErrorBanner onDismiss={() => setShowError(false)} />}

      {/* Header */}
      <header className="flex-shrink-0 h-14 bg-card border-b border-border flex items-center px-4 lg:px-5 gap-4 z-20">
        {/* Left zone: logo + tagline + nav tabs */}
        <div className="flex items-center gap-5 flex-1 min-w-0">
          <Logo />
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
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
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
            onClick={() => setActiveView(activeView === "saved" ? "browse" : "saved")}
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

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Filter Panel */}
        {activeView === "browse" && (
          <aside className="hidden lg:block w-[280px] flex-shrink-0 bg-card border-r border-border overflow-y-auto">
            <FilterPanelContent {...filterProps} />
          </aside>
        )}

        {/* Results */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[720px] mx-auto px-4 lg:px-6 py-5">
            {/* Feed controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {isLoading ? (
                    <span className="text-muted-foreground">Loading…</span>
                  ) : (
                    <>
                      {resultCount}{" "}
                      <span className="text-muted-foreground font-normal">
                        {activeView === "saved" ? "saved role" : "role"}
                        {resultCount !== 1 ? "s" : ""}
                      </span>
                    </>
                  )}
                </span>
                {!isLoading && activeView === "browse" && (
                  <span className="text-xs text-muted-foreground font-mono">
                    · within {draftFilters.postedWithin === appliedFilters.postedWithin ? appliedFilters.postedWithin : appliedFilters.postedWithin}
                  </span>
                )}
              </div>

              {/* Sort */}
              {!isLoading && resultCount > 0 && (
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as SortBy)}
                    className="appearance-none bg-card border border-border rounded-lg pl-3 pr-7 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer transition-shadow"
                  >
                    <option value="newest">Newest first</option>
                    <option value="company">Company A–Z</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                </div>
              )}
            </div>

            {/* Cards */}
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : displayJobs.length === 0 ? (
              <EmptyState isSaved={activeView === "saved"} onShowMore={handleShowMore} />
            ) : (
              <div className="space-y-3">
                {displayJobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isSaved={savedIds.has(job.id)}
                    onSave={toggleSave}
                    onClick={setSelectedJob}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        {...filterProps}
      />

      {/* Job Detail Modal */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          isSaved={savedIds.has(selectedJob.id)}
          onSave={toggleSave}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
}
