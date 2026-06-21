export type RoleType = "internship" | "newgrad";
export type Category = "Software" | "AI/ML/Data" | "All tech";
export type Season = "All" | "Fall" | "Winter" | "Spring" | "Summer";
export type SortBy = "newest" | "company";
export type View = "browse" | "saved";
export type PostedWithin = "24h" | "48h" | "3d" | "7d" | "30d";

export interface Filters {
  postedWithin: PostedWithin;
  season: Season;
  roleType: RoleType;
  province: string;
  categories: Category[];
  includeRelated: boolean;
  keywords: string[];
}
