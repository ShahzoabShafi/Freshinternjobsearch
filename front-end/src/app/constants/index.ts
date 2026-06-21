import { Category, Filters, PostedWithin, Season } from "../types/filters";

/* ─── Constants ──────────────────────────────────────────────────────────────── */
const ALL_JOBS = []
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

export { WITHIN_MS, POSTED_OPTS, SEASONS, PROVINCES, CATEGORIES, DEFAULT_FILTERS, ALL_JOBS };