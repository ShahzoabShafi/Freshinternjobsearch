export type RoleType = "internships" | "newgrad";
export type Category = "AI/ML/Data" | "All tech" | "Software" | "Data Science";
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
  includeRelatedRoles: boolean;
  keywords: string[];
}
